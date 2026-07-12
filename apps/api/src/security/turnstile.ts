const VERIFY_URL = "https://challenges.cloudflare.com/turnstile/v0/siteverify";

export interface TurnstileVerifier {
  verify(token: string, remoteIp?: string): Promise<boolean>;
}

/** Real Cloudflare Turnstile verification — see PLAN.md §8 (bot/spam protection on lead submission). */
export class CloudflareTurnstileVerifier implements TurnstileVerifier {
  constructor(private readonly secretKey: string) {}

  async verify(token: string, remoteIp?: string): Promise<boolean> {
    if (!token) return false;

    const body = new URLSearchParams({ secret: this.secretKey, response: token });
    if (remoteIp) body.set("remoteip", remoteIp);

    const response = await fetch(VERIFY_URL, { method: "POST", body });
    if (!response.ok) return false;

    const result = (await response.json()) as { success: boolean };
    return result.success === true;
  }
}

/** Always-pass verifier for local/dev use only — never wired in production config. */
export class NoopTurnstileVerifier implements TurnstileVerifier {
  async verify(): Promise<boolean> {
    return true;
  }
}
