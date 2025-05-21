<<<<<<< ours
<<<<<<< ours
// Firestore Admin SDK does not expose doc/getDoc helpers like the client SDK.
// Use collection().doc() and .get() instead.

// Recursively load prompt documents and resolve {{ref:name}} syntax
export async function loadPrompt(db, name) {
  // 'db' is an instance of Firestore from the Admin SDK
  const docRef = db.collection('prompts').doc(name);
  const snapshot = await docRef.get();
=======
// Firestore Admin SDK doesn't expose doc()/getDoc() helpers like the client SDK
// so we use collection().doc().get()

// Recursively load prompt documents and resolve {{ref:name}} syntax
export async function loadPrompt(db, name) {
  const snapshot = await db.collection('prompts').doc(name).get();
>>>>>>> theirs
  if (!snapshot.exists) {
    throw new Error(`Prompt ${name} not found`);
  }
  let text = snapshot.data().text;
  const refRegex = /\{\{ref:([\w_-]+)\}\}/g;
  let match;
  while ((match = refRegex.exec(text))) {
    const refName = match[1];
    const refText = await loadPrompt(db, refName);
    text = text.replace(match[0], refText);
<<<<<<< ours
=======
    refRegex.lastIndex = 0; // restart search after replacement
>>>>>>> theirs
  }
  return text;
=======
import admin from 'firebase-admin';

// Initialize Firestore via Firebase Admin SDK
// Assumes admin has already been initialized elsewhere in the app
const db = admin.firestore();

/**
 * Recursively resolve {{ref:some_prompt}} references inside a prompt string.
 * @param {string} content
 * @param {Set<string>} seen Used to detect circular references
 * @returns {Promise<string>}
 */
async function resolveRefs(content, seen = new Set()) {
  let refRegex = /{{ref:([^}]+)}}/g;
  let match;

  while ((match = refRegex.exec(content))) {
    const refName = match[1].trim();
    if (seen.has(refName)) {
      throw new Error(`Circular reference detected for prompt: ${refName}`);
    }
    seen.add(refName);
    const snapshot = await db.collection('prompts').doc(refName).get();
    if (!snapshot.exists) {
      throw new Error(`Referenced prompt not found: ${refName}`);
    }
    let replacement = snapshot.data().content || '';
    replacement = await resolveRefs(replacement, seen);
    content = content.replace(match[0], replacement);
    // Reset regex so replacements are properly re-scanned
    refRegex.lastIndex = 0;
  }

  return content;
}

/**
 * Load a prompt from Firestore and resolve any {{ref:...}} entries.
 * @param {string} name Name of the document in the `prompts` collection
 * @returns {Promise<string>} Fully resolved prompt content
 */
export async function loadPrompt(name) {
  const snapshot = await db.collection('prompts').doc(name).get();
  if (!snapshot.exists) {
    throw new Error(`Prompt not found: ${name}`);
  }
  const content = snapshot.data().content || '';
  return resolveRefs(content, new Set([name]));
>>>>>>> theirs
}
