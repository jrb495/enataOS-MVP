import { getFirestore } from 'firebase-admin/firestore';

const refRegex = /\{\{\s*ref:(.+?)\s*\}\}/g;

/**
 * Recursively loads and resolves a prompt from Firestore, replacing
 * any `{{ref:step}}` tokens with the referenced prompt content.
 * @param {string} name - Name of the prompt document in `prompts` collection
 * @param {Set<string>} [visited] - internal cycle detection
 * @returns {Promise<string>}
 */
export async function loadPrompt(name, visited = new Set()) {
  const db = getFirestore();
  const snap = await db.collection('prompts').doc(name).get();
  if (!snap.exists) {
    throw new Error(`[loadPrompt] Prompt ${name} not found`);
  }

  let content = snap.data().content || '';
  let match;
  while ((match = refRegex.exec(content)) !== null) {
    const refName = match[1].trim();
    if (visited.has(refName)) {
      continue; // prevent infinite recursion
    }
    visited.add(refName);
    const refContent = await loadPrompt(refName, visited);
    content = content.replace(match[0], refContent);
  }

  return content;
}

