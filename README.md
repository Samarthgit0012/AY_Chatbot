# Revas Insurance Agency Chatbot ("Riva")

See [PLAN.md](PLAN.md) for the full architecture and design decisions. This file covers local development.

## Prerequisites

- Node.js ≥ 20 (developed against 22/24)
- npm (ships with Node)

## Install

```
npm install
```

If this fails partway through with an error mentioning a blocked `.node` file (`ERR_DLOPEN_FAILED`, "Application Control policy has blocked this file"), that's a Windows policy on this machine blocking a native binary in one of `tsx`'s dependencies during its postinstall step — not a problem with the project. Work around it with:

```
npm install --ignore-scripts
```

## Build

```
npm run build
```

Builds `packages/flows` → `apps/api` → `apps/widget` in dependency order (plain `tsc`, no bundler — see [apps/widget/src/widget.ts](apps/widget/src/widget.ts) for why the widget specifically avoids one).

## Run the API locally

The server needs several env vars (see [infra/.env.example](infra/.env.example) for the full list with explanations). For **local testing without real credentials**, everything except `LLM_API_KEY` can be a dummy value as long as you don't exercise that specific integration — button-driven conversation flows never touch the LLM, Sheets, or SMTP at all.

`TURNSTILE_SECRET_KEY` below is Cloudflare's official "always passes" **test** secret key — safe to use locally, does not require a real Cloudflare account:

```powershell
$env:LLM_PROVIDER = "gemini"
$env:LLM_API_KEY = "dummy-key"              # replace with a real key to test free-text/FAQ matching
$env:GOOGLE_SHEETS_SPREADSHEET_ID = "dummy"
$env:GOOGLE_SERVICE_ACCOUNT_EMAIL = "dummy@example.iam.gserviceaccount.com"
$env:GOOGLE_SERVICE_ACCOUNT_PRIVATE_KEY = "dummy"
$env:SMTP_HOST = "localhost"
$env:SMTP_USER = "dummy"
$env:SMTP_PASS = "dummy"
$env:TURNSTILE_SECRET_KEY = "1x0000000000000000000000000000000AA"
$env:CORS_ORIGINS = "http://localhost:8091"
$env:PORT = "8080"
node apps/api/dist/server.js
```

Verify it's up:

```
curl http://localhost:8080/health
```

## Test the widget in a real browser

In a second terminal:

```
npm run dev:serve --workspace=@revas/widget
```

This starts a zero-dependency static server at `http://localhost:8091` serving [apps/widget/dev/index.html](apps/widget/dev/index.html), which loads the widget pointed at `http://localhost:8080` (the API server from the step above) using Cloudflare's matching "always passes" **test** site key — so Turnstile verification actually runs, just against test keys instead of real ones.

Open `http://localhost:8091` in a browser, click the chat launcher bottom-right, and walk through it:

1. Type a state (e.g. `Oregon`) → should show the main menu buttons
2. Click a product line (e.g. `Commercial Trucking`) → should show that line's entry buttons
3. Click through qualification questions → should eventually reach the lead-capture questions (name, phone, email, etc.)
4. Complete lead capture → should show a closing CTA

Free-text messages that don't match a button (e.g. typing an FAQ question) will hit the LLM layer — that needs a real `LLM_API_KEY` to work; with a dummy key you'll see a "having trouble connecting" fallback, which is the correct, safe failure mode, not a bug.

## Automated tests

```
npm test
```

**This will very likely fail on this machine** with the same native-binary Application Control Policy error mentioned above — Vitest depends on Rollup/esbuild, both of which ship native binaries that this policy blocks. This is a local machine restriction, not a project problem: the same test suite runs cleanly in CI (GitHub Actions, Linux runners — see [.github/workflows/ci.yml](.github/workflows/ci.yml)), which is the authoritative test run for this repo.

To verify logic locally anyway without Vitest, build and run compiled output directly with plain Node — e.g.:

```
npm run build
node -e "
import('./apps/api/dist/conversation/engine.js').then(({ transition }) => {
  const { INITIAL_STATE } = require('./apps/api/dist/conversation/types.js');
  console.log(transition(INITIAL_STATE, { type: 'text', value: 'Oregon' }));
});
"
```

or write a throwaway `.mjs` script that imports the compiled modules and asserts on their behavior — this is exactly how every module in this repo was verified during development (no bundler, no Vitest, just `tsc` + `node`).

## Lint & typecheck

Neither of these touches Rollup/esbuild, so both work normally on this machine:

```
npm run lint
npm run typecheck
```
