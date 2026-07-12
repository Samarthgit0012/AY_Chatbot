import type { EligibleState, InsuranceLine, LeadTag } from "@revas/flows";

export type ConversationPhase =
  | "awaitingState"
  | "mainMenu"
  | "lineEntry"
  | "qualification"
  | "leadCapture"
  | "cta"
  | "humanHandoff"
  | "closed";

export interface ConversationState {
  readonly phase: ConversationPhase;
  readonly userState?: EligibleState;
  readonly selectedLine?: InsuranceLine;
  readonly qualificationIndex: number;
  readonly leadFieldIndex: number;
  readonly answers: Readonly<Record<string, string>>;
  readonly escalated: boolean;
}

export const INITIAL_STATE: ConversationState = {
  phase: "awaitingState",
  qualificationIndex: 0,
  leadFieldIndex: 0,
  answers: {},
  escalated: false,
};

export interface BotMessage {
  readonly text: string;
  readonly buttons?: readonly string[] | undefined;
}

export interface ButtonInput {
  readonly type: "button";
  readonly value: string;
}

export interface TextInput {
  readonly type: "text";
  readonly value: string;
}

export type UserInput = ButtonInput | TextInput;

export interface LeadPayload {
  readonly line?: InsuranceLine | undefined;
  readonly answers: Readonly<Record<string, string>>;
  readonly tags: readonly LeadTag[];
  readonly submittedAt: string;
}

export interface TransitionResult {
  readonly state: ConversationState;
  readonly messages: readonly BotMessage[];
  readonly leadCompleted?: LeadPayload | undefined;
}

/** Returned by the pure engine when it has no deterministic handling for the input (free text that isn't a recognized button/state/etc). The orchestrator is responsible for escalating this to the LLM layer. */
export interface UnhandledOutcome {
  readonly kind: "unhandled";
}

export interface HandledOutcome {
  readonly kind: "handled";
  readonly result: TransitionResult;
}

export type EngineOutcome = HandledOutcome | UnhandledOutcome;
