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
}
