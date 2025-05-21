import { Router } from 'express';
import { db } from '../firebase.mjs';
import runPromptChain from '../lib/runPromptChain.mjs';
import { FALLBACK_RESULT } from '../lib/runPromptChain.mjs';

export default async function submitDump(req, res) {
  const { accountId, account_id, dump } = req.body;
  const id = accountId || account_id;
  if (!id || !dump) {
    return res.status(400).json({ error: 'Missing accountId or dump' });
  }
  const createdAt = new Date();

  try {
    const dumpRef = await db.collection('dumps').add({
      account_id: id,
      dump,
      created_at: createdAt,
    });
    console.log(`Dump written with ID: ${dumpRef.id}`);

    // Run prompt chain to process dump
    const rawResult = await runPromptChain(dump, id);
    const result = { ...FALLBACK_RESULT, ...rawResult };

    const interactionData = {
      account_id: id,
      trust_delta: result.trust_delta ?? 0,
      momentum_delta: result.momentum_delta ?? 0,
      loyalty_delta: result.loyalty_delta ?? 0,
      justification: result.justification ?? '',
      summary: result.summary ?? '',
      created_at: createdAt,
    };
    const interactionRef = await db.collection('interactions').add(interactionData);
    console.log(`Interaction written with ID: ${interactionRef.id}`);

    if (Array.isArray(result.recommended_actions)) {
      const batch = db.batch();
      result.recommended_actions.forEach((action) => {
        const ref = db.collection('next_steps').doc();
        batch.set(ref, {
          account_id: id,
          action,
          created_at: createdAt,
        });
      });
      await batch.commit();
      console.log(`Next steps saved: ${result.recommended_actions.length}`);
    }

    // Update account scores
    const accountRef = db.collection('accounts').doc(id);
    await db.runTransaction(async (t) => {
      const doc = await t.get(accountRef);
      const scores = {
        trust: result.trust_delta || 0,
        momentum: result.momentum_delta || 0,
        loyalty: result.loyalty_delta || 0,
      };
      if (doc.exists) {
        const data = doc.data();
        scores.trust += data.trust || 0;
        scores.momentum += data.momentum || 0;
        scores.loyalty += data.loyalty || 0;
        t.update(accountRef, scores);
        console.log(`Updated account ${id}`, scores);
      } else {
        t.set(accountRef, scores);
        console.log(`Created account ${id}`, scores);
      }
    });

    res.json({ success: true });
  } catch (err) {
    console.error('Error in submitDump:', err);
    res.status(500).json({ error: err.message });
  }
});

export default router;
