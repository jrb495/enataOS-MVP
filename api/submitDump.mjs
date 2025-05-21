import { Router } from 'express';
import { db } from '../firebase.mjs';
import runPromptChain from '../lib/runPromptChain.mjs';
import { FALLBACK_RESULT } from '../lib/runPromptChain.mjs';

const router = Router();

router.post('/submit-dump', async (req, res) => {
  const { dump } = req.body;
  const accountId = req.body.accountId || req.body.account_id;

  if (!accountId || !dump) {
    return res.status(400).json({ error: 'Missing accountId or dump' });
  }

  const createdAt = new Date();

  try {
    const dumpRef = await db.collection('dumps').add({
      accountId,
      dump,
      created_at: createdAt,
    });
    console.log(`Dump written with ID: ${dumpRef.id}`);

    const rawResult = await runPromptChain(dump, accountId);
    const result = { ...FALLBACK_RESULT, ...rawResult };

    const interactionData = {
      accountId,
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
          accountId,
          action,
          created_at: createdAt,
        });
      });
      await batch.commit();
      console.log(`Next steps saved: ${result.recommended_actions.length}`);
    }

    const accountRef = db.collection('accounts').doc(accountId);
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
        console.log(`Updated account ${accountId}`, scores);
      } else {
        t.set(accountRef, scores);
        console.log(`Created account ${accountId}`, scores);
      }
    });

    res.json({ success: true });
  } catch (err) {
    console.error('Error in submitDump:', err);
    res.status(500).json({ error: err.message });
  }
});

export default router;
