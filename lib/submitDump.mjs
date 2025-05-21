import admin from 'firebase-admin';
import runPromptChain from './runPromptChain.mjs';

const db = admin.firestore();

/**
 * Main entry point for new brain dumps.
 * Writes the raw dump, runs the prompt chain, and stores results.
 * Temporarily saves the raw LLM output for debugging.
 */
export default async function submitDump({ accountId, text }) {
  const dumpRef = await db.collection('dumps').add({
    account_id: accountId,
    text,
    created_at: admin.firestore.FieldValue.serverTimestamp(),
  });

  // Run the prompt chain using the submitted text
  const rawOutput = await runPromptChain(text);

  // Update the dump with the raw output for debugging
  await dumpRef.update({ llm_raw_output: rawOutput });

  // TODO: parse and write structured data to interactions/next_steps/accounts
  return rawOutput;
}
