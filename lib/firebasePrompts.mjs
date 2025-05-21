import { getFirestore } from 'firebase-admin/firestore';

/**
 * Recursively load a prompt from Firestore.
 * Resolves {{ref:step}} tokens referencing other prompt docs.
 */
export default async function loadPrompt(name, visited = new Set()) {
  if (visited.has(name)) {
    console.warn(`[loadPrompt] Cyclic reference detected for ${name}`);
    return '';
  }
  visited.add(name);

  const db = getFirestore();
  const snap = await db.collection('prompts').doc(name).get();
  const data = snap.data() || {};
  let text = data.content || '';

  const refRegex = /{{ref:([^}]+)}}/g;
  let match;
  while ((match = refRegex.exec(text)) !== null) {
    const refName = match[1];
    const refPrompt = await loadPrompt(refName, visited);
    text = text.replace(match[0], refPrompt);
  }
  return text;
}
