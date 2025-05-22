import { db } from '../firebase.mjs';
import fs from 'fs/promises';

async function main() {
  const content = await fs.readFile('prompts/enata_os_base.md', 'utf8');
  await db.collection('prompts').doc('enata_os_base').set({ content }, { merge: true });
  console.log('Prompt updated');
}

main().catch((err) => {
  console.error('Failed to update prompt:', err);
});

