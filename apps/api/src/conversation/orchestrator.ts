import { FLOWS_BY_LINE, GENERAL_FAQS, PROVOCATIVE_QUESTION_FAQS, type FaqEntry } from "@revas/flows";
import { enforceGuardrails } from "../guardrails/output-filter.js";
import type { Logger } from "../leads/types.js";
import { matchFaq, routeIntent } from "../llm/index.js";
import type { LlmClient } from "../llm/types.js";
import { MAIN_MENU_ROUTES } from "./main-menu.js";
import { CALLBACK_FORM_BUTTON, transition } from "./engine.js";
import type { BotMessage, ConversationState, LeadPayload, UserInput } from "./types.js";

export interface LeadSubmitter {
  submit(payload: LeadPayload): Promise<unknown>;
}

export interface OrchestratorDeps {
  readonly llm: LlmClient;
  readonly leadSubmitter: LeadSubmitter;
  readonly logger: Logger;
}

export interface OrchestratorResult {
  readonly state: ConversationState;
  readonly messages: readonly BotMessage[];
}

function candidateButtonsForState(state: ConversationState): readonly string[] {
  switch (state.phase) {
    case "mainMenu":
      return Object.keys(MAIN_MENU_ROUTES);
    case "humanHandoff":
      return [CALLBACK_FORM_BUTTON];
    case "lineEntry":
      return state.selectedLine ? (FLOWS_BY_LINE[state.selectedLine].entry.buttons ?? []) : [];
    default:
      return [];
  }
}

function faqCandidatesForState(state: ConversationState): readonly FaqEntry[] {
  const lineFaqs = state.selectedLine ? FLOWS_BY_LINE[state.selectedLine].faqs : [];
  return [...lineFaqs, ...GENERAL_FAQS, ...PROVOCATIVE_QUESTION_FAQS];
}

const REPROMPT_MESSAGE: BotMessage = {
  text: "Sorry, I didn't quite catch that — could you rephrase, or click one of the options above?",
};

async function resolveUnhandledText(
  deps: OrchestratorDeps,
  state: ConversationState,
  userText: string,
): Promise<OrchestratorResult> {
  // Closed conversations get gently reopened into the main menu rather than dead-ending.
  if (state.phase === "closed") {
    const reopened: ConversationState = { ...state, phase: "mainMenu" };
    return {
      state: reopened,
      messages: [{ text: "Welcome back! What can I help you with?", buttons: Object.keys(MAIN_MENU_ROUTES) }],
    };
  }

  const buttonCandidates = candidateButtonsForState(state);
  if (buttonCandidates.length > 0) {
    const matchedButton = await routeIntent(deps.llm, userText, buttonCandidates);
    if (matchedButton) {
      const outcome = transition(state, { type: "button", value: matchedButton });
      if (outcome.kind === "handled") {
        return { state: outcome.result.state, messages: outcome.result.messages };
      }
    }
  }

  const faqCandidates = faqCandidatesForState(state);
  const matchedFaq = await matchFaq(deps.llm, userText, faqCandidates);
  if (matchedFaq) {
    const continuePrompt = candidateButtonsForState(state);
    return {
      state,
      messages: [
        { text: matchedFaq.answer },
        {
          text: "Does that answer your question, or would you like to continue?",
          ...(continuePrompt.length > 0 ? { buttons: continuePrompt } : {}),
        },
      ],
    };
  }

  return { state, messages: [REPROMPT_MESSAGE] };
}

/**
 * The async layer around the pure engine (PLAN.md §5.1). Tries the
 * deterministic transition first; only escalates to the LLM for free text
 * the engine couldn't handle deterministically. Every outbound message —
 * scripted or LLM-touched — passes through the guardrail filter before
 * being returned, and a completed lead is handed to the lead pipeline
 * before the response goes out.
 */
export async function handleUserMessage(
  deps: OrchestratorDeps,
  state: ConversationState,
  input: UserInput,
): Promise<OrchestratorResult> {
  const outcome = transition(state, input);

  let resolved: OrchestratorResult;
  if (outcome.kind === "handled") {
    resolved = { state: outcome.result.state, messages: outcome.result.messages };
  } else if (input.type === "text") {
    resolved = await resolveUnhandledText(deps, state, input.value);
  } else {
    resolved = { state, messages: [REPROMPT_MESSAGE] };
  }

  const safeMessages = resolved.messages.map((message) => {
    const enforced = enforceGuardrails(message.text);
    if (enforced.wasBlocked) {
      deps.logger.warn("Guardrail blocked an outbound message before it reached the user", {
        matchedPhrase: enforced.matchedPhrase,
      });
    }
    return enforced.wasBlocked ? { ...message, text: enforced.text } : message;
  });

  if (outcome.kind === "handled" && outcome.result.leadCompleted) {
    try {
      await deps.leadSubmitter.submit(outcome.result.leadCompleted);
    } catch (error) {
      deps.logger.error("Lead submission threw unexpectedly", {
        error: error instanceof Error ? error.message : String(error),
      });
    }
  }

  return { state: resolved.state, messages: safeMessages };
}
