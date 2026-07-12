import {
  ESCALATION_RESPONSE,
  ESCALATION_TRIGGER_PHRASES,
  FINAL_SUBMISSION_MESSAGE,
  FLOWS_BY_LINE,
  LEAD_CAPTURE_INTRO,
  MAIN_MENU_BUTTONS,
  OUT_OF_APPETITE_DOT_EXCEPTION,
  OUT_OF_APPETITE_MESSAGE,
  UNIVERSAL_LEAD_FIELDS,
  CLOSING_MESSAGE,
  HUMAN_HANDOFF_INTRO,
  CLAIMS_SAFETY_RESPONSE,
  type FlowDefinition,
} from "@revas/flows";
import { MAIN_MENU_ROUTES } from "./main-menu.js";
import { isRecognizableUsState, parseEligibleState } from "./state-lookup.js";
import {
  type BotMessage,
  type ConversationState,
  type EngineOutcome,
  type LeadPayload,
  type UserInput,
} from "./types.js";

export const CALLBACK_FORM_BUTTON = "Fill out callback form";

function handled(state: ConversationState, messages: BotMessage[], leadCompleted?: LeadPayload): EngineOutcome {
  return { kind: "handled", result: { state, messages, leadCompleted } };
}

function unhandled(): EngineOutcome {
  return { kind: "unhandled" };
}

function detectEscalationTrigger(text: string): boolean {
  const normalized = text.toLowerCase();
  return ESCALATION_TRIGGER_PHRASES.some((phrase) => normalized.includes(phrase));
}

function mainMenuMessage(): BotMessage {
  return {
    text: "I can help you with trucking insurance, commercial insurance, personal insurance, home insurance, contractor insurance, DOT compliance services, and more. What can I help you with?",
    buttons: MAIN_MENU_BUTTONS,
  };
}

function qualificationMessage(flow: FlowDefinition, index: number): BotMessage {
  const question = flow.qualificationQuestions[index];
  if (!question) {
    throw new Error(`Flow ${flow.line} has no qualification question at index ${index}`);
  }
  return { text: question.prompt, buttons: question.options };
}

function leadFieldMessage(index: number): BotMessage {
  const field = UNIVERSAL_LEAD_FIELDS[index];
  if (!field) {
    throw new Error(`No universal lead field at index ${index}`);
  }
  return { text: `What's your ${field.label.toLowerCase()}?` };
}

function startQualification(state: ConversationState, flow: FlowDefinition): EngineOutcome {
  if (flow.qualificationQuestions.length === 0) {
    return startLeadCapture({ ...state, phase: "qualification", qualificationIndex: 0 });
  }
  return handled({ ...state, phase: "qualification", qualificationIndex: 0 }, [
    { text: "A few quick questions will help us understand what you need." },
    qualificationMessage(flow, 0),
  ]);
}

function startLeadCapture(state: ConversationState): EngineOutcome {
  return handled({ ...state, phase: "leadCapture", leadFieldIndex: 0 }, [
    { text: LEAD_CAPTURE_INTRO },
    leadFieldMessage(0),
  ]);
}

function handleAwaitingState(state: ConversationState, input: UserInput): EngineOutcome {
  if (input.type !== "text") return unhandled();

  const eligible = parseEligibleState(input.value);
  if (eligible) {
    return handled({ ...state, userState: eligible, phase: "mainMenu" }, [mainMenuMessage()]);
  }

  if (isRecognizableUsState(input.value)) {
    return handled({ ...state, phase: "mainMenu" }, [
      { text: OUT_OF_APPETITE_MESSAGE },
      { text: OUT_OF_APPETITE_DOT_EXCEPTION, buttons: ["DOT Compliance Services"] },
    ]);
  }

  return handled(state, [
    { text: "Sorry, I didn't quite catch that — what state are you in? (e.g. Oregon, OR)" },
  ]);
}

function handleMainMenu(state: ConversationState, input: UserInput): EngineOutcome {
  const route = MAIN_MENU_ROUTES[input.value];
  if (!route) return unhandled();

  switch (route.kind) {
    case "subMenu":
      return handled(state, [{ text: route.prompt, buttons: route.buttons }]);
    case "question":
      return handled(state, [{ text: "Sure — what's your question?" }]);
    case "humanHandoff":
      return handled({ ...state, phase: "humanHandoff" }, [
        { text: HUMAN_HANDOFF_INTRO, buttons: [CALLBACK_FORM_BUTTON] },
      ]);
    case "line": {
      const flow = FLOWS_BY_LINE[route.line];
      const entryMessages: BotMessage[] =
        route.line === "claims"
          ? [{ text: CLAIMS_SAFETY_RESPONSE }, { text: flow.entry.prompt, buttons: flow.entry.buttons }]
          : [{ text: flow.entry.prompt, buttons: flow.entry.buttons }];
      return handled({ ...state, selectedLine: route.line, phase: "lineEntry" }, entryMessages);
    }
  }
}

function handleLineEntry(state: ConversationState, input: UserInput): EngineOutcome {
  if (!state.selectedLine) return unhandled();
  const flow = FLOWS_BY_LINE[state.selectedLine];
  const answers = { ...state.answers, entrySelection: input.value };
  return startQualification({ ...state, answers }, flow);
}

function handleQualification(state: ConversationState, input: UserInput): EngineOutcome {
  if (!state.selectedLine) return unhandled();
  const flow = FLOWS_BY_LINE[state.selectedLine];
  const currentQuestion = flow.qualificationQuestions[state.qualificationIndex];
  if (!currentQuestion) return unhandled();

  const answers = { ...state.answers, [currentQuestion.id]: input.value };
  const nextIndex = state.qualificationIndex + 1;

  if (nextIndex < flow.qualificationQuestions.length) {
    return handled({ ...state, answers, qualificationIndex: nextIndex }, [
      qualificationMessage(flow, nextIndex),
    ]);
  }
  return startLeadCapture({ ...state, answers, qualificationIndex: nextIndex });
}

function handleLeadCapture(state: ConversationState, input: UserInput): EngineOutcome {
  const field = UNIVERSAL_LEAD_FIELDS[state.leadFieldIndex];
  if (!field) return unhandled();

  const answers = { ...state.answers, [field.id]: input.value };
  const nextIndex = state.leadFieldIndex + 1;

  if (nextIndex < UNIVERSAL_LEAD_FIELDS.length) {
    return handled({ ...state, answers, leadFieldIndex: nextIndex }, [leadFieldMessage(nextIndex)]);
  }

  const leadPayload: LeadPayload = {
    line: state.selectedLine,
    answers,
    tags: state.escalated ? ["Needs Human"] : [],
    submittedAt: new Date().toISOString(),
  };

  const flow = state.selectedLine ? FLOWS_BY_LINE[state.selectedLine] : undefined;
  const messages: BotMessage[] = [{ text: FINAL_SUBMISSION_MESSAGE }];
  if (flow) {
    messages.push({ text: flow.cta.prompt, buttons: flow.cta.buttons });
  } else {
    messages.push({ text: CLOSING_MESSAGE });
  }

  return handled(
    { ...state, answers, phase: flow ? "cta" : "closed" },
    messages,
    leadPayload,
  );
}

function handleCta(state: ConversationState, _input: UserInput): EngineOutcome {
  return handled({ ...state, phase: "closed" }, [{ text: CLOSING_MESSAGE }]);
}

function handleHumanHandoff(state: ConversationState, input: UserInput): EngineOutcome {
  if (input.type === "button" && input.value === CALLBACK_FORM_BUTTON) {
    return startLeadCapture(state);
  }
  return unhandled();
}

/**
 * The deterministic core of the conversation. Handles every button-driven
 * transition and the small set of free-text inputs that have an exact,
 * unambiguous meaning (state name, escalation trigger phrase). Anything
 * else — free text that doesn't match a button, an FAQ question, rude/
 * frustrated language — comes back as `{ kind: "unhandled" }` for the
 * orchestrator (src/conversation/orchestrator.ts) to resolve via the LLM
 * layer. This function never calls an LLM and needs no network access,
 * which is what makes it fully unit-testable.
 */
export function transition(state: ConversationState, input: UserInput): EngineOutcome {
  if (
    input.type === "text" &&
    state.phase !== "humanHandoff" &&
    state.phase !== "closed" &&
    detectEscalationTrigger(input.value)
  ) {
    return handled({ ...state, phase: "humanHandoff", escalated: true }, [
      { text: ESCALATION_RESPONSE },
      { text: HUMAN_HANDOFF_INTRO, buttons: [CALLBACK_FORM_BUTTON] },
    ]);
  }

  switch (state.phase) {
    case "awaitingState":
      return handleAwaitingState(state, input);
    case "mainMenu":
      return handleMainMenu(state, input);
    case "lineEntry":
      return handleLineEntry(state, input);
    case "qualification":
      return handleQualification(state, input);
    case "leadCapture":
      return handleLeadCapture(state, input);
    case "cta":
      return handleCta(state, input);
    case "humanHandoff":
      return handleHumanHandoff(state, input);
    case "closed":
      return unhandled();
  }
}
