# EnataOS Development Plan

## Project Purpose

EnataOS is an emotionally intelligent operating system for field sales reps. This will be a mobile first app. Whenever a rep has relevant information to share for an account they press a record button (microphone) on the app home screen and it parses unstructured voice/text brain dumps, ties those voice dumps to an existing or new account, gathers the necessary context of that account’s history (tying in the account’s purchase history, competitive products, and key personalities in the account), scores emotional trust/momentum/loyalty, and the account's "Enata Score" which is the average of each of those scores, and returns structured next steps to deepen the customer relationship. It also summarizes the current interaction and intelligently tells the rep how that interaction fits into the overall strategy and trajectory of the account. All of this will be packaged into a user-friendly mobile-first UI.

This project is for building the 0 to 1 MVP. The base flow of the MVP is titled "Core Workflow" below. Eventually there will be a number of downstream agents that will attach to the end of the base prompt. Don't focus on those until we fully complete the MVP core flow.

---

## Tech Stack

- Node.js (current backend)
- Firebase Firestore (data + prompt chain)
- OpenAI (GPT-4 for processing)
- Codex (dev co-pilot for rapid iteration)
- React Native or Vite + React (frontend, WIP)

---

## Core Workflow

1. Rep submits brain dump (text or voice to text via Whisper API)
2. Saved to `dumps` (Firestore, for traceability and replay)
3. `runPromptChain()` pulls prompt tree from Firestore
4. GPT-4 processes it
5. Returns:
   - trust_delta, momentum_delta, loyalty_delta
   - justifications
   - account summary
   - recommended_actions[]
6. Writes to:
   - `interactions`
   - `next_steps`
   - Updates scores on `accounts`

---

## Key Modules

### 🔹 `submitDump.mjs`
- Main API entry point when a rep submits a brain dump
- Writes raw dump to `dumps` for traceability
- Calls `runPromptChain()` to process the dump using GPT-4
- Writes structured output into:
  - `interactions` (deltas, justification, summary)
  - `next_steps` (actionable recommendations)
  - Updates scores in `accounts`

### 🔹 `firebasePrompts.mjs`
- Loads modular prompt files from Firestore (e.g. `enata_os_base`)
- Recursively resolves `{{ref:step_name}}` syntax
- Ensures prompt logic remains centralized, versioned, and dynamic

### 🔹 `runPromptChain.mjs`
- Orchestrates the full 6-step prompt execution flow
- Pulls the full prompt stack from Firestore
- Sends it to GPT-4 via OpenAI API
- Expects structured JSON response:
  - score deltas
  - next step suggestions
  - emotional and strategic insights
- Acts as the "emotional intelligence engine" — must feel crisp, contextual, and smart

---

## Prompt System

Stored in Firestore  
Base prompt: `enata_os_base`  
Uses references like `{{ref:step_parse_input}}`

---

## Design Philosophy: What Makes It Feel Smart

- Output must feel surgically timed and emotionally precise
- Every next step must sound human, strategic, and aligned to the relationship
- JSON output is structured — but the tone and timing are where the product differentiates
- Codex must ensure prompt quality and fallback safety at all times

---

## Active Tasks

- [ ] Add `serviceAccountKey.json` to backend
- [ ] Confirm prompt tree is loading (check for 📡 Loading prompt logs)
- [ ] Run `runPromptChain()` and ensure it returns valid score/output JSON
- [ ] Insert prompt output into `interactions`, `next_steps`, and update `accounts`
- [ ] Add fallback for bad or null LLM output
- [ ] Write `dev_plan.md` to guide Codex across file boundaries

---

## Codex Agent Instructions

You are the technical cofounder. All development must:

- Stick to the MVP development plan
- Keep a high-level view, managing the project in modular form
- Preserve emotional scoring logic
- Output valid JSON compatible with Node.js or FastAPI endpoints
- Respect all schema formats
- Never hallucinate structure
- Only update with confirmed Firebase structure
- If errors persist, pause and recall this file to point yourself in the right direction
- Don't go down rabbit holes trying to fix a singular error
