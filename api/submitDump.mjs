import { Router } from 'express';
import { initFirebase } from '../config/firebase.js';
import { runPromptChain } from '../lib/runPromptChain.mjs';

const router = Router();
const db = initFirebase();

router.post('/submit-dump', async (req, res) => {
  try {
    const { dump } = req.body;
    if (!dump) {
      return res.status(400).json({ error: 'Missing dump' });
    }

    const output = await runPromptChain(db, dump);
    // TODO: write output to Firestore (interactions, next_steps, accounts)

    res.json(output);
  } catch (err) {
    console.error(err);
    res.status(500).json({ error: 'Failed to process dump' });
  }
});

export default router;
