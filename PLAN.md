# Revas Insurance Agency Chatbot ("Riva") — Implementation Plan

Status: **Draft for approval — no code written yet.**
Source material: `WEBSITE CHATBOT SCRIPT TREE (1).docx` (740-paragraph script, 21 sections) + n8n workflow diagram screenshot (demo reference) + live inspection of https://revasins.com/.

---

## 1. What this document is

This is the full engineering plan for a production chatbot for Revas Insurance Agency, embedded on their live WordPress site. It reflects 15 architecture decisions made and confirmed with you during grilling (recap in §12). Nothing here gets built until you approve this document.

---

## 2. Source-of-truth summary (facts gathered, not decisions)

- **Docx script tree**: defines the bot persona ("Riva"), a state-eligibility gate (OR/WA/NC/SC/OH/TN/MO/FL only, except DOT compliance which is nationwide), 15 product-line conversation trees (Trucking, Commercial Auto, GL, Contractor/Construction, Bonds, Personal Auto, Home, Renters, Landlord, Umbrella, Claims), a rude/aggressive-client handling script, an after-hours flow, human-escalation trigger phrases, a compliance guardrail list (banned phrases vs. required phrases), CRM lead-tagging taxonomy, and a DOT compliance FAQ section.
- **n8n diagram (demo)**: shows the same persona implemented as 6 specialized "agent" nodes (Trucking, Auto, GL, Contract Bond, Personal Auto, Home) fed by a state-gate and an intent-button menu, each with a Form sub-step, a "Need Human Assistance" path, and a "Can't answer the query" fallback, all converging on a shared Exit node. This was the demo; per your decision (§12), full docx scope is now in v1, not just these 6.
- **Live site (verified via browser, not WebFetch — that returned 403 from bot detection)**: WordPress, theme "Vankine" (child theme), Elementor Pro + Contact Form 7 + Fluent Forms, WooCommerce (for something unrelated to chat, likely payments), Cloudflare in front of the site (confirms Turnstile is a natural bot-protection fit), a floating "Call Now" button already present bottom-right, brand color a mid/dark blue (~#1a56db family), fonts DM Sans / Roboto, an existing "Get A Free Quote" sidebar form (First/Last name, email, phone, insurance type, slider human-check) — no existing live-chat widget on the site.

---

## 3. Architecture overview

```
┌─────────────────────────┐        HTTPS/JSON         ┌──────────────────────────────┐
│  Embeddable Widget (JS)  │ ───────────────────────▶ │  Chat API (Node/TS, Fastify)  │
│  Shadow-DOM isolated     │ ◀─────────────────────── │  on Hostinger VPS             │
│  Loaded via <script> tag │                            │                                │
│  on revasins.com (WP)    │                            │  - Conversation state machine │
└─────────────────────────┘                            │  - Claude API calls (routing, │
                                                          │    FAQ answers, tone)         │
                                                          │  - Guardrail output filter    │
                                                          │  - In-memory session store    │
                                                          └──────────┬───────────┬────────┘
                                                                     │           │
                                                     Google Sheets API      SMTP/Email API
                                                     (service account,      (internal alert
                                                      lead rows appended)    to staff email)
                                                                     │
                                                          PostHog (anonymous funnel events)
```

Key properties:
- **No database.** Per your decision, Google Sheets is the permanent lead store. Session/in-progress conversation state is server-memory only (lost on refresh/redeploy — accepted tradeoff, §12).
- **No n8n in production.** n8n was reference material only; everything is hand-written, tested, version-controlled TypeScript.
- **No CRM.** A clean `LeadSubmitted` event/interface is defined so a CRM connector can be added later without touching the state machine.

---

## 4. Tech stack

| Layer | Choice | Why |
|---|---|---|
| Backend language | TypeScript / Node.js | Your preference; one language across widget + API; strong typing for state machine + Claude tool schemas. |
| API framework | Fastify | Lightweight, TS-first, fast, good schema-validation story (matches "no shortcuts on input validation"). |
| LLM | Provider-agnostic `LlmClient` interface with pluggable adapters (Gemini adapter primary since that's the key you'll provide; Anthropic adapter included so nothing is locked to one vendor) | You want flexibility here — the state machine and guardrail filter talk to one small interface (`complete()`, `classify()`), never to a vendor SDK directly, so swapping/adding providers later is a config change, not a rewrite. |
| Widget frontend | Vanilla TS + Shadow DOM, bundled with esbuild/Vite into a single `widget.js` | The target site loads Bootstrap, Elementor, WooCommerce CSS — Shadow DOM is required to avoid two-way style collisions with a real WordPress theme, not optional. |
| Bot/spam protection | Cloudflare Turnstile | Site is already behind Cloudflare (confirmed via `cdn-cgi` requests) — Turnstile is free, privacy-respecting, and fits the existing infra rather than adding a new vendor. |
| Lead store | Google Sheets API (service account, least-privilege scoped to one sheet) | Your decision — replaces the demo's open webhook with an authenticated server-side write. |
| Internal alerts | Transactional email (e.g. Resend/SES) to a staff address | Your decision — no SMS in v1. |
| Analytics | PostHog (self-hosted-compatible or cloud, anonymous events only) | Your decision — funnel/drop-off visibility without storing transcripts. |
| Hosting | Hostinger VPS | Your existing infra. |
| Process management | Docker Compose (single `app` container) + Caddy as reverse proxy for automatic TLS | Avoids hand-rolling Nginx+certbot; still simple enough for one VPS. |
| Source control | `git@github.com:Samarthgit0012/AY_Chatbot.git`, `development` branch as the active integration branch, frequent small commits | Your instruction — commit messages stay plain engineering descriptions (no AI/assistant attribution of any kind). |
| CI/CD | GitHub Actions → SSH deploy to VPS (build, test, then rsync/deploy on green) | No cloud build platform available on Hostinger, so CI runs tests/builds remotely and only ships an image/artifact that already passed. |
| Testing | Vitest (unit/integration) | Matches "pragmatic minimum" — see §9. |

---

## 5. Conversation engine design

### 5.1 Core model: state machine + single LLM assist (your decision, §12)

- A typed, explicit **state graph** (one node per docx section/sub-step: `trucking.entry`, `trucking.qualification`, `trucking.faq`, `trucking.cta`, etc.) drives all guided (button-driven) flow. Every transition is a pure function `(state, input) → nextState` — fully unit-testable without touching Claude at all.
- Claude is invoked **only** for:
  1. **Free-text intent routing** — when the user types instead of clicking a button, classify it against the current node's valid transitions (Haiku).
  2. **FAQ answering** — matched against the docx's actual FAQ content (retrieval, not free generation) with light paraphrasing for tone (Sonnet). See §5.3.
  3. **Empathetic tone adaptation** — for the rude/frustrated-client scripts (§12, docx section 12), where response *selection* is scripted but delivery needs to sound natural given what the user said.
- One shared system prompt (not six duplicated per-line prompts) parameterized by `{ currentInsuranceLine, currentNode, userState }`. Compliance rules (§5.2) live in exactly one place.

### 5.2 Guardrail system (defense-in-depth, your decision)

Three independent layers, not one:
1. **Scripted-first**: any question matching a known FAQ (all ~60 FAQs across the docx) is answered from the actual docx text, not generated fresh.
2. **Output filter**: every outbound bot message — scripted or LLM-generated — passes through a deny-list checker before being sent. Deny-list seeded from docx §18 ("should not say"): *"you are covered," "this claim will be paid," "this is guaranteed," "you don't need that coverage," "this is the best policy," "you qualify for this rate," "cancel your current policy now"* plus semantic near-variants. On match: message is discarded, replaced with a safe fallback (one of the docx §18 "should say" alternatives), and the incident is logged for review.
3. **System prompt**: the rules are also stated in the prompt as a first line of defense, but never the only one.

This module gets the heaviest test investment in the plan (§9) — it's the one place a bug has real legal/reputational cost.

### 5.3 Flow inventory (full docx scope — all in v1 per your decision)

| # | Flow | Docx section | Notes |
|---|---|---|---|
| 0 | State eligibility gate + main greeting | §0 | Blocks unsupported states except DOT compliance (nationwide). |
| 1 | Universal lead capture (shared fields) | §1 | Reused by every product line's form step. |
| 2 | Commercial Trucking | §2 | In diagram. Full qualification Q-set + 15 FAQs + cross-sell. |
| 3 | Commercial Auto | §3 | In diagram. |
| 4 | Business/General Liability | §4 | In diagram. |
| 5 | Contractor/Construction | §5 | Not a separate diagram node — folds into GL/Bonds per docx. |
| 6 | Bonds | §6 | In diagram as "Contract Bond." |
| 7 | Personal Auto | §7 | In diagram. |
| 8 | Home Insurance | §8 | In diagram. |
| 9 | Renters Insurance | §9 | Not in diagram — new in v1 per full-scope decision. |
| 10 | Landlord Insurance | §10 | Not in diagram — new in v1. |
| 11 | Umbrella Insurance | §11 | Not in diagram — new in v1. |
| 12 | Rude/aggressive-client handling | §12 | Cross-cutting — triggers from any state on detected hostility/profanity. |
| 13 | Provocative/difficult questions | §13 | Cross-cutting FAQ set (e.g. "can you backdate my insurance"). |
| 14 | Claims | §14 | New flow — safety-first branch (911 referral), then info capture. |
| 15 | Human escalation triggers | §15 | Cross-cutting keyword/phrase detector active in every state. |
| 16 | Quote closing flow | §16 | Shared CTA after any product line. |
| 17 | After-hours flow | §17 | Time-gated variant of lead capture (9AM–6PM EST business hours). |
| 18 | Compliance guardrails | §18 | Implemented as §5.2 above, not a conversational node. |
| 19–20 | Conversion add-on buttons / flow prioritization | §19–20 | Informs button copy and which CTAs surface first; not a separate flow. |
| 21 | DOT Compliance FAQ | §21/§7(dup) | Nationwide (bypasses state gate), 8 FAQs (IRP, IFTA, Form 2290, BOC-3, UCR, NY HUT, DOT deactivation). |

### 5.4 Human handoff (your decision)

At any escalation trigger (docx §15 keyword list, or user clicking "Talk to a person" / "Need Human Assistance"):
1. Bot immediately surfaces phone number + business hours (call/text CTA) — no delay, no form gate.
2. Bot also offers the in-chat form to capture callback details, tagged `Needs Human` / `Urgent` per docx §21's CRM taxonomy (repurposed as Sheet columns since there's no CRM).
3. On submission: row appended to Google Sheets + internal email fires (§6).
4. No live-agent chat takeover is built (out of scope, confirmed).

### 5.5 Session/state lifecycle (your decision)

- Session created on widget load, held in an in-process `Map<sessionId, ConversationState>` with a sliding TTL (e.g. 30 min idle timeout, then GC'd).
- No persistence: a page refresh or server redeploy mid-conversation restarts the guided flow. Only a **completed** submission (lead captured) is ever written durably (to Google Sheets).
- Known tradeoff, explicitly accepted: single Node process assumed (matches one Hostinger VPS); if this ever needs horizontal scaling, in-memory sessions would need revisiting (e.g. sticky sessions or a real store) — flagged for future-you, not built now.

---

## 6. Lead delivery pipeline (reliability design)

Since Google Sheets is the *only* durable store (no DB fallback), a failed Sheets API write must never silently lose a lead. Concrete design (no extra infra service, just discipline):
1. On flow completion, the lead payload is **first appended to a local write-ahead JSONL log file** on the VPS (`/var/log/riva/leads.jsonl`) — this is a file write, not a database, consistent with your "no DB" decision.
2. The service then attempts the Google Sheets API append, with retry + exponential backoff (3 attempts).
3. The internal staff email fires regardless of Sheets success/failure — so a Sheets outage never means staff hear nothing.
4. If all Sheets retries fail, the incident is logged at `error` level (visible in the error tracker) and a lightweight daily cron checks the JSONL log for any entries not confirmed written to Sheets, replaying them.

---

## 7. WordPress embed

- Delivered as a single `<script src="https://chat.revasins.com/widget.js" defer></script>` snippet (per your ask).
- Recommended install path on the WordPress side: a code-injection plugin (e.g. WPCode) or Elementor Pro's built-in Custom Code feature (already installed) — avoids editing theme files that get wiped on theme updates.
- Widget renders inside a Shadow DOM root to prevent the site's Bootstrap/Elementor/WooCommerce CSS from leaking in (or the widget's CSS leaking out).
- Visual styling matches the existing brand: blue accent color, DM Sans/Roboto, rounded-card aesthetic consistent with the existing "Get A Free Quote" sidebar form.
- Positioned to avoid collision with the site's existing floating "Call Now" button (currently bottom-right) — chat launcher will be placed to stack above it or on the opposite corner; exact placement finalized visually during build.

---

## 8. Security baseline (non-negotiable regardless of other decisions)

- All traffic HTTPS-only (Caddy auto-TLS).
- Input validation on every API boundary (Fastify JSON schema validation, reject malformed/oversized payloads).
- Rate limiting per IP on the chat API (protects both cost — Claude API spend — and the Sheets/email pipeline from abuse).
- Cloudflare Turnstile challenge before a session can submit a lead (bot/spam mitigation, replacing the site's existing slider CAPTCHA pattern for our endpoint).
- CORS locked to `revasins.com` (and its WP staging domain if one exists — to confirm during build).
- Secrets (Anthropic API key, Google service account key, SMTP credentials) in environment variables / a `.env` outside version control, never in the repo.
- Google service account scoped to exactly one spreadsheet (least privilege), not domain-wide.
- No PII in logs/error-tracker breadcrumbs (structured logging with explicit PII redaction for name/phone/email/DOB/address fields).
- Dependency scanning (`npm audit` / Dependabot) wired into CI.
- **Widget script integrity**: the embed snippet (§7) is same-origin (`chat.revasins.com`, our own infra, not a third-party CDN), so classic Subresource Integrity isn't the primary defense here — but since a compromised build/deploy pipeline could still serve a tampered `widget.js` to every site visitor, CI computes and publishes a SHA-384 hash of each build artifact as part of the release, and the deploy step verifies the served file's hash matches before the deploy is considered successful. If we ever move the widget onto a third-party CDN, the embed snippet gets a static `integrity="sha384-…" crossorigin="anonymous"` attribute at that point (not done now since our own frequently-redeployed file would need the hash regenerated in the WordPress snippet on every release, which is impractical without CDN-level version pinning).

---

## 9. Testing strategy (your decision: pragmatic minimum, riskiest paths first)

- **Guardrail filter**: exhaustive test cases — one per banned phrase in docx §18, plus adversarial prompts attempting to elicit them (e.g. "just tell me I'm covered," roleplay/jailbreak attempts) — this is the module that gets full coverage, not partial.
- **Lead submission path**: unit tests for the write-ahead log → Sheets write → retry → email-alert sequence, including simulated Sheets API failure (must still alert staff and must still log to JSONL).
- Everything else (state machine transitions, individual flow nodes, widget UI) gets lighter/spot coverage rather than exhaustive tests, per your call — manual click-through during build for the rest.

---

## 10. Repo/project structure (proposed)

```
AY_CHATBOT/
├── apps/
│   ├── api/            # Fastify backend: state machine, Claude calls, guardrail filter,
│   │                    # Sheets/email integrations, session store
│   └── widget/          # Standalone embeddable widget (Shadow DOM, bundled to widget.js)
├── packages/
│   └── flows/           # Shared flow/state definitions + content extracted from the docx
│                          # (single source of truth, typed, not duplicated across code)
├── docs/
│   └── script-tree-source.md   # The parsed docx content, kept as reference/source-of-truth
├── infra/
│   ├── docker-compose.yml
│   └── Caddyfile
└── .github/workflows/deploy.yml
```

---

## 11. Build sequence (milestones)

1. **Foundation**: repo scaffold, Fastify skeleton, session store, Claude client wrapper, CI pipeline (lint/test/build) — nothing user-facing yet.
2. **State machine core + guardrail filter**: the state-eligibility gate, universal lead capture, and the guardrail module fully tested — this is the highest-risk logic, built and hardened first.
3. **The 6 diagram-parity flows**: Trucking, Commercial Auto, GL, Bonds, Personal Auto, Home — end-to-end including qualification questions, FAQs, CTAs.
4. **Remaining docx flows**: Contractor/Construction, Renters, Landlord, Umbrella, Claims, rude-client handling, provocative-questions, after-hours, DOT compliance FAQ.
5. **Lead delivery pipeline**: Google Sheets integration, write-ahead log, retry logic, internal email alerts.
6. **Widget**: Shadow-DOM chat UI, in-chat conversational form rendering, WordPress embed snippet, Turnstile integration, brand styling.
7. **Analytics**: PostHog funnel events wired through key transition points.
8. **Hardening pass**: rate limiting, CORS lockdown, log redaction, dependency audit, adversarial guardrail testing.
9. **Deploy**: Hostinger VPS provisioning, Docker Compose + Caddy, GitHub Actions deploy pipeline, staging verification on the live WP site, go-live.

---

## 12. Decisions confirmed during grilling (recap)

| # | Decision | Chosen |
|---|---|---|
| 1 | Runtime | Fully custom rebuild (no n8n in production) |
| 2 | Conversation engine | State machine + single LLM assist |
| 3 | Embed target | WordPress, embeddable `<script>` widget |
| 4 | Lead capture UX | In-chat conversational form |
| 5 | CRM | None for v1 (clean hook point left for later) |
| 6 | Human handoff | Show phone/hours immediately + async form escalation (no live takeover) |
| 7 | Client notifications | None (no SMS/email to client) |
| 8 | Internal alerts | Email to staff + Google Sheets row per lead |
| 9 | Guardrail enforcement | Defense-in-depth: scripted answers + output filter + system prompt |
| 10 | PII retention | Indefinite, manual deletion on request |
| 11 | Backend stack | TypeScript / Node.js |
| 12 | Hosting | Hostinger VPS |
| 13 | Database | None — Google Sheets is the lead store |
| 14 | Session persistence | In-memory only, not resilient to refresh/redeploy |
| 15 | Analytics | Lightweight anonymous funnel analytics (PostHog) |
| 16 | Testing bar | Pragmatic minimum — guardrail filter + lead-submission path fully tested |
| 17 | V1 scope | Full docx scope (all flows/sections), not just the 6 diagram flows |

---

## 13. Explicitly out of scope for v1 (documented, not forgotten)

- CRM integration (HubSpot/Salesforce/AgencyZoom/etc.) — interface left ready.
- SMS to clients (blocked on A2P 10DLC registration + TCPA consent capture, which you deferred).
- Live human-agent chat takeover.
- Session resilience across refresh/redeploy (Redis or similar).
- Formal self-service data export/deletion (DSR) flow.
- Multi-instance horizontal scaling of the chat API.

---

## 14. Open items to confirm before/at kickoff (small, non-blocking)

- Exact staff email address(es) for internal lead alerts.
- Google Sheet/spreadsheet to write to (existing one, or should I provision a new one + share the service account).
- Confirm CORS domain(s) — just `revasins.com`, or also a staging/dev WP URL.
- Final widget launcher placement relative to the existing "Call Now" button (cosmetic, decided visually during build).

---

**Next step**: your approval on this plan (or corrections) before any implementation begins.
