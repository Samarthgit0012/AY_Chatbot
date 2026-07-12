/**
 * Riva chat widget — single-file, dependency-free, Shadow DOM isolated.
 *
 * No bundler: this file is compiled directly by tsc into one plain script
 * (see tsconfig.json: module "none", no import/export). That's a deliberate
 * choice for an embeddable widget, not a shortcut — a single vanilla file
 * has zero risk of colliding with the host WordPress page's own scripts
 * (Bootstrap, jQuery, Elementor) and needs no build-time bundling step to
 * stay a single <script> tag drop-in.
 *
 * Config is read from the embedding <script> tag's data attributes:
 *   <script src=".../widget.js"
 *           data-api-base="https://chat.revasins.com"
 *           data-turnstile-site-key="0x4AAAAAAA..."
 *           defer></script>
 */
(function () {
  "use strict";

  interface BotMessage {
    text: string;
    buttons?: string[];
  }

  interface StartResponse {
    sessionId: string;
    messages: BotMessage[];
    state: string;
  }

  interface MessageResponse {
    messages: BotMessage[];
    phase: string;
  }

  interface WidgetConfig {
    apiBase: string;
    turnstileSiteKey: string;
  }

  function readConfig(): WidgetConfig | null {
    const script =
      (document.currentScript as HTMLScriptElement | null) ??
      document.querySelector<HTMLScriptElement>("script[data-api-base]");
    if (!script) return null;
    const apiBase = script.getAttribute("data-api-base");
    const turnstileSiteKey = script.getAttribute("data-turnstile-site-key");
    if (!apiBase || !turnstileSiteKey) return null;
    return { apiBase, turnstileSiteKey };
  }

  const STYLES = `
    :host, * { box-sizing: border-box; }
    .riva-launcher {
      position: fixed;
      right: 20px;
      bottom: 96px;
      width: 60px;
      height: 60px;
      border-radius: 50%;
      background: #1a56db;
      color: #fff;
      border: none;
      cursor: pointer;
      box-shadow: 0 6px 20px rgba(26, 86, 219, 0.4);
      display: flex;
      align-items: center;
      justify-content: center;
      font-size: 26px;
      z-index: 999999;
      transition: transform 0.15s ease;
    }
    .riva-launcher:hover { transform: scale(1.06); }
    .riva-panel {
      position: fixed;
      right: 20px;
      bottom: 168px;
      width: 360px;
      max-width: calc(100vw - 32px);
      height: 520px;
      max-height: calc(100vh - 200px);
      background: #fff;
      border-radius: 16px;
      box-shadow: 0 12px 40px rgba(15, 23, 42, 0.25);
      display: none;
      flex-direction: column;
      overflow: hidden;
      font-family: "DM Sans", -apple-system, BlinkMacSystemFont, "Segoe UI", Roboto, sans-serif;
      z-index: 999999;
      border: 1px solid rgba(15, 23, 42, 0.08);
    }
    .riva-panel.open { display: flex; }
    .riva-header {
      background: #0b2a4a;
      color: #fff;
      padding: 14px 16px;
      display: flex;
      align-items: center;
      justify-content: space-between;
    }
    .riva-header-title { font-weight: 700; font-size: 15px; }
    .riva-header-sub { font-size: 12px; opacity: 0.75; margin-top: 2px; }
    .riva-close {
      background: transparent;
      border: none;
      color: #fff;
      font-size: 18px;
      cursor: pointer;
      opacity: 0.85;
      line-height: 1;
      padding: 4px;
    }
    .riva-close:hover { opacity: 1; }
    .riva-messages {
      flex: 1;
      overflow-y: auto;
      padding: 14px;
      display: flex;
      flex-direction: column;
      gap: 10px;
      background: #f6f8fb;
    }
    .riva-bubble {
      background: #fff;
      border: 1px solid rgba(15, 23, 42, 0.08);
      border-radius: 12px;
      padding: 10px 12px;
      font-size: 13.5px;
      line-height: 1.45;
      color: #1a2233;
      max-width: 90%;
      align-self: flex-start;
      white-space: pre-wrap;
    }
    .riva-bubble.user {
      background: #1a56db;
      color: #fff;
      align-self: flex-end;
      border-color: transparent;
    }
    .riva-buttons {
      display: flex;
      flex-wrap: wrap;
      gap: 6px;
      margin-top: 2px;
    }
    .riva-button {
      background: #fff;
      border: 1px solid #1a56db;
      color: #1a56db;
      border-radius: 999px;
      padding: 7px 12px;
      font-size: 12.5px;
      cursor: pointer;
      transition: background 0.12s ease, color 0.12s ease;
    }
    .riva-button:hover { background: #1a56db; color: #fff; }
    .riva-input-row {
      display: flex;
      gap: 8px;
      padding: 10px;
      border-top: 1px solid rgba(15, 23, 42, 0.08);
      background: #fff;
    }
    .riva-input {
      flex: 1;
      border: 1px solid rgba(15, 23, 42, 0.15);
      border-radius: 10px;
      padding: 9px 11px;
      font-size: 13.5px;
      font-family: inherit;
      outline: none;
    }
    .riva-input:focus { border-color: #1a56db; }
    .riva-send {
      background: #1a56db;
      color: #fff;
      border: none;
      border-radius: 10px;
      padding: 0 16px;
      cursor: pointer;
      font-weight: 600;
      font-size: 13px;
    }
    .riva-send:disabled { opacity: 0.5; cursor: not-allowed; }
    .riva-typing { font-size: 12px; color: #64748b; padding: 0 14px 10px; }
    #riva-turnstile-container { position: absolute; width: 0; height: 0; overflow: hidden; }
  `;

  class RivaWidget {
    private readonly config: WidgetConfig;
    private readonly host: HTMLDivElement;
    private readonly shadow: ShadowRoot;
    private panel!: HTMLDivElement;
    private messagesEl!: HTMLDivElement;
    private inputEl!: HTMLInputElement;
    private sendButton!: HTMLButtonElement;
    private sessionId: string | null = null;
    private turnstileToken: string | null = null;
    private turnstileWidgetId: string | null = null;
    private started = false;
    private busy = false;

    constructor(config: WidgetConfig) {
      this.config = config;
      this.host = document.createElement("div");
      this.host.id = "riva-chat-widget-host";
      document.body.appendChild(this.host);
      this.shadow = this.host.attachShadow({ mode: "open" });
      this.render();
    }

    private render(): void {
      const style = document.createElement("style");
      style.textContent = STYLES;
      this.shadow.appendChild(style);

      const launcher = document.createElement("button");
      launcher.className = "riva-launcher";
      launcher.setAttribute("aria-label", "Chat with Riva, Revas Insurance's assistant");
      launcher.textContent = "\u{1F4AC}";
      launcher.addEventListener("click", () => this.toggle());
      this.shadow.appendChild(launcher);

      const panel = document.createElement("div");
      panel.className = "riva-panel";
      panel.setAttribute("role", "dialog");
      panel.setAttribute("aria-label", "Chat with Riva");

      const header = document.createElement("div");
      header.className = "riva-header";
      const headerText = document.createElement("div");
      const headerTitle = document.createElement("div");
      headerTitle.className = "riva-header-title";
      headerTitle.textContent = "Riva — Revas Insurance";
      const headerSub = document.createElement("div");
      headerSub.className = "riva-header-sub";
      headerSub.textContent = "Usually replies in a few minutes";
      headerText.appendChild(headerTitle);
      headerText.appendChild(headerSub);
      header.appendChild(headerText);
      const closeButton = document.createElement("button");
      closeButton.className = "riva-close";
      closeButton.setAttribute("aria-label", "Close chat");
      closeButton.textContent = "✕";
      closeButton.addEventListener("click", () => this.toggle());
      header.appendChild(closeButton);
      panel.appendChild(header);

      const messages = document.createElement("div");
      messages.className = "riva-messages";
      messages.setAttribute("role", "log");
      messages.setAttribute("aria-live", "polite");
      panel.appendChild(messages);

      const inputRow = document.createElement("div");
      inputRow.className = "riva-input-row";
      const input = document.createElement("input");
      input.className = "riva-input";
      input.type = "text";
      input.placeholder = "Type a message…";
      input.setAttribute("aria-label", "Message");
      input.addEventListener("keydown", (event) => {
        if (event.key === "Enter") this.sendText();
      });
      const sendButton = document.createElement("button");
      sendButton.className = "riva-send";
      sendButton.textContent = "Send";
      sendButton.addEventListener("click", () => this.sendText());
      inputRow.appendChild(input);
      inputRow.appendChild(sendButton);
      panel.appendChild(inputRow);

      const turnstileContainer = document.createElement("div");
      turnstileContainer.id = "riva-turnstile-container";
      panel.appendChild(turnstileContainer);

      this.shadow.appendChild(panel);

      this.panel = panel;
      this.messagesEl = messages;
      this.inputEl = input;
      this.sendButton = sendButton;
    }

    private toggle(): void {
      const isOpen = this.panel.classList.toggle("open");
      if (isOpen && !this.started) {
        this.started = true;
        void this.start();
      }
    }

    private setBusy(busy: boolean): void {
      this.busy = busy;
      this.inputEl.disabled = busy;
      this.sendButton.disabled = busy;
    }

    private addBubble(text: string, sender: "bot" | "user"): void {
      const bubble = document.createElement("div");
      bubble.className = sender === "user" ? "riva-bubble user" : "riva-bubble";
      bubble.textContent = text;
      this.messagesEl.appendChild(bubble);
      this.scrollToBottom();
    }

    private addButtons(labels: string[]): void {
      const row = document.createElement("div");
      row.className = "riva-buttons";
      for (const label of labels) {
        const button = document.createElement("button");
        button.className = "riva-button";
        button.type = "button";
        button.textContent = label;
        button.addEventListener("click", () => this.sendButtonValue(label));
        row.appendChild(button);
      }
      this.messagesEl.appendChild(row);
      this.scrollToBottom();
    }

    private renderBotMessages(messages: BotMessage[]): void {
      for (const message of messages) {
        this.addBubble(message.text, "bot");
        if (message.buttons && message.buttons.length > 0) {
          this.addButtons(message.buttons);
        }
      }
    }

    private scrollToBottom(): void {
      this.messagesEl.scrollTop = this.messagesEl.scrollHeight;
    }

    private async ensureTurnstileToken(): Promise<string> {
      if (this.turnstileToken) return this.turnstileToken;
      await loadTurnstileScript();

      return new Promise((resolve, reject) => {
        const container = this.shadow.getElementById("riva-turnstile-container");
        if (!container || !window.turnstile) {
          reject(new Error("Turnstile failed to load"));
          return;
        }
        this.turnstileWidgetId = window.turnstile.render(container, {
          sitekey: this.config.turnstileSiteKey,
          size: "invisible",
          callback: (token: string) => {
            this.turnstileToken = token;
            resolve(token);
          },
          "error-callback": () => reject(new Error("Turnstile verification failed")),
        });
      });
    }

    private async start(): Promise<void> {
      this.setBusy(true);
      this.addBubble("Connecting you with Riva…", "bot");
      try {
        const token = await this.ensureTurnstileToken();
        const response = await fetch(`${this.config.apiBase}/api/chat/start`, {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({ turnstileToken: token }),
        });
        this.messagesEl.replaceChildren();
        if (!response.ok) {
          this.addBubble("Sorry, I'm having trouble connecting right now. Please try again in a moment.", "bot");
          return;
        }
        const data = (await response.json()) as StartResponse;
        this.sessionId = data.sessionId;
        this.renderBotMessages(data.messages);
      } catch {
        this.messagesEl.replaceChildren();
        this.addBubble("Sorry, I'm having trouble connecting right now. Please try again in a moment.", "bot");
      } finally {
        this.setBusy(false);
      }
    }

    private async sendButtonValue(value: string): Promise<void> {
      await this.sendInput({ type: "button", value });
    }

    private async sendText(): Promise<void> {
      const value = this.inputEl.value.trim();
      if (!value || this.busy) return;
      this.inputEl.value = "";
      await this.sendInput({ type: "text", value });
    }

    private async sendInput(input: { type: "button" | "text"; value: string }): Promise<void> {
      if (this.busy || !this.sessionId) return;
      this.addBubble(input.value, "user");
      this.setBusy(true);
      try {
        const response = await fetch(`${this.config.apiBase}/api/chat/message`, {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({ sessionId: this.sessionId, input }),
        });
        if (!response.ok) {
          this.addBubble("Sorry, something went wrong on our end. Please try again.", "bot");
          return;
        }
        const data = (await response.json()) as MessageResponse;
        this.renderBotMessages(data.messages);
      } catch {
        this.addBubble("Sorry, something went wrong on our end. Please try again.", "bot");
      } finally {
        this.setBusy(false);
      }
    }
  }

  function loadTurnstileScript(): Promise<void> {
    if (window.turnstile) return Promise.resolve();
    return new Promise((resolve, reject) => {
      const existing = document.querySelector('script[data-riva-turnstile="1"]');
      if (existing) {
        existing.addEventListener("load", () => resolve());
        return;
      }
      const script = document.createElement("script");
      script.src = "https://challenges.cloudflare.com/turnstile/v0/api.js";
      script.async = true;
      script.defer = true;
      script.setAttribute("data-riva-turnstile", "1");
      script.addEventListener("load", () => resolve());
      script.addEventListener("error", () => reject(new Error("Failed to load Turnstile")));
      document.head.appendChild(script);
    });
  }

  function init(): void {
    const config = readConfig();
    if (!config) {
      console.error("Riva widget: missing data-api-base or data-turnstile-site-key on the script tag.");
      return;
    }
    new RivaWidget(config);
  }

  if (document.readyState === "loading") {
    document.addEventListener("DOMContentLoaded", init);
  } else {
    init();
  }
})();

interface TurnstileRenderOptions {
  sitekey: string;
  size?: "invisible" | "normal" | "compact";
  callback?: (token: string) => void;
  "error-callback"?: () => void;
}

interface TurnstileApi {
  render(container: HTMLElement, options: TurnstileRenderOptions): string;
  reset(widgetId?: string): void;
}

// This file has no import/export, so it's a global script as far as
// TypeScript is concerned — this interface merges directly into the
// built-in Window type without needing a `declare global` wrapper (which
// only works inside modules). ESLint can't see that merge, so it looks
// unused even though `window.turnstile` above depends on it.
// eslint-disable-next-line @typescript-eslint/no-unused-vars
interface Window {
  turnstile?: TurnstileApi;
}
