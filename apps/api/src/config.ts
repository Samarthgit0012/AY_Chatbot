function required(env: NodeJS.ProcessEnv, key: string): string {
  const value = env[key];
  if (!value) {
    throw new Error(`Missing required environment variable: ${key}`);
  }
  return value;
}

/**
 * Treats an empty string the same as "unset" — env files commonly have
 * blank-but-present keys (e.g. `LLM_MODEL=`), and `??` alone doesn't catch
 * that since an empty string isn't nullish. Missing this caused a real bug:
 * an empty LLM_MODEL was passed straight to the Gemini SDK instead of
 * falling back to the client's default, crashing every LLM call.
 */
function optional(env: NodeJS.ProcessEnv, key: string): string | undefined {
  const value = env[key];
  return value === "" ? undefined : value;
}

export interface AppConfig {
  readonly port: number;
  readonly corsOrigins: readonly string[];
  readonly llm: {
    readonly provider: "gemini" | "anthropic";
    readonly apiKey: string;
    readonly model?: string | undefined;
  };
  readonly sheets: {
    readonly spreadsheetId: string;
    readonly sheetName: string;
    readonly serviceAccountEmail: string;
    readonly privateKey: string;
  };
  readonly smtp: {
    readonly host: string;
    readonly port: number;
    readonly secure: boolean;
    readonly user: string;
    readonly pass: string;
    readonly fromAddress: string;
    readonly toAddress: string;
  };
  readonly turnstile: {
    readonly secretKey: string;
  };
  readonly walFilePath: string;
  readonly widgetDistPath: string;
}

/** Loaded once at process startup — fails fast on missing config rather than at first request. */
export function loadConfig(env: NodeJS.ProcessEnv = process.env): AppConfig {
  const provider = (optional(env, "LLM_PROVIDER") ?? "gemini") as "gemini" | "anthropic";

  return {
    port: Number(optional(env, "PORT") ?? 8080),
    corsOrigins: (optional(env, "CORS_ORIGINS") ?? "https://revasins.com").split(",").map((o) => o.trim()),
    llm: {
      provider,
      apiKey: required(env, "LLM_API_KEY"),
      model: optional(env, "LLM_MODEL"),
    },
    sheets: {
      spreadsheetId: required(env, "GOOGLE_SHEETS_SPREADSHEET_ID"),
      sheetName: optional(env, "GOOGLE_SHEETS_SHEET_NAME") ?? "Leads",
      serviceAccountEmail: required(env, "GOOGLE_SERVICE_ACCOUNT_EMAIL"),
      privateKey: required(env, "GOOGLE_SERVICE_ACCOUNT_PRIVATE_KEY").replace(/\\n/g, "\n"),
    },
    smtp: {
      host: required(env, "SMTP_HOST"),
      port: Number(optional(env, "SMTP_PORT") ?? 587),
      secure: optional(env, "SMTP_SECURE") === "true",
      user: required(env, "SMTP_USER"),
      pass: required(env, "SMTP_PASS"),
      fromAddress: optional(env, "SMTP_FROM") ?? required(env, "SMTP_USER"),
      toAddress: optional(env, "SMTP_TO") ?? "info@revasins.com",
    },
    turnstile: {
      secretKey: required(env, "TURNSTILE_SECRET_KEY"),
    },
    walFilePath: optional(env, "WAL_FILE_PATH") ?? "/var/log/riva/leads.jsonl",
    widgetDistPath: optional(env, "WIDGET_DIST_PATH") ?? "/app/widget-dist/widget.js",
  };
}
