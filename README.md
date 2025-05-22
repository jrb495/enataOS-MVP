# EnataOS Backend (MVP)

This is the backend for EnataOS — an emotionally intelligent operating system for field sales reps.

## Purpose

This repo powers the 0→1 MVP: reps speak or type unstructured brain dumps, which are parsed using a GPT-4 prompt chain and scored for relationship health (trust, momentum, loyalty).

## Stack

- Node.js (Express backend)
- Firebase Firestore (data + modular prompt chain)
- OpenAI GPT-4 (processing)
- Codex (build assistant)

## Core Flow

1. `/submit-dump` endpoint accepts brain dumps
2. Raw input stored in Firestore (`dumps` collection)
3. Prompt chain runs via Firestore → OpenAI
4. Scores + next steps written to:
   - `interactions`
   - `next_steps`
   - Updates scores on `accounts`

## Getting Started

1. Clone the repo
2. Install dependencies:
   ```bash
   npm install
   ```
3. Codex runs `.codex/setup.sh` to install these dependencies automatically.

## Debugging

Use `npm run debug` to POST the included `test-dump.json` to the running server. Ensure the Firestore prompt `enata_os_base` instructs GPT‑4 to reply with a JSON object wrapped in triple backticks:

```json
{
  "trust_delta": 0,
  "momentum_delta": 0,
  "loyalty_delta": 0,
  "summary": "...",
  "justification": "...",
  "recommended_actions": []
}
```

To push the local prompt to Firestore, run:

```bash
node scripts/updatePrompt.mjs
```
