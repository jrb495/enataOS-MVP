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

