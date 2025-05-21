import loadPrompt from './lib/firebasePrompts.mjs';
import executePrompt, { FALLBACK_RESULT } from './lib/runPromptChain.mjs';

/**
 * Wrapper used by the Express API.
 * Loads the base prompt from Firestore, injects the rep dump and then
 * executes the OpenAI prompt chain defined in ./lib/runPromptChain.mjs.
 *
 * @param {string} dump      Raw rep dump text
 * @param {string} accountId Account identifier (currently unused in prompt)
 * @returns {Promise<Object>} Structured JSON output from the LLM
 */
export default async function runPromptChain(dump, accountId) {
  try {
    const basePrompt = await loadPrompt('enata_os_base');
    const resolved = basePrompt.replace('{{dump}}', dump);
    return await executePrompt(resolved);
  } catch (err) {
    console.error('[runPromptChain] Failed to execute prompt chain:', err);
    return FALLBACK_RESULT;
  }
}
