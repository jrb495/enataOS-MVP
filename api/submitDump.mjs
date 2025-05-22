import { db } from '../firebase.mjs';
import runPromptChain, { FALLBACK_RESULT } from '../lib/runPromptChain.mjs';
import parseJsonBlock from '../lib/parseJsonBlock.mjs';

export default async function submitDump(req, res) {
  const accountId = req.body.accountId || req.body.account_id;
  const { dump } = req.body;
  if (!accountId || !dump) {
    return res.status(400).json({ error: 'Missing accountId or dump' });
  }
  const createdAt = new Date();

  try {
    // Write raw dump
    const dumpData = { account_id: accountId, dump, created_at: createdAt };
    try {
      const dumpRef = await db.collection('dumps').add(dumpData);
      console.log('✅ [FirestoreWriteAgent] Dump written', dumpData, dumpRef.id);
    } catch (err) {
      console.error('❌ [FirestoreWriteAgent] Failed to write dump', dumpData, err);
      throw err;
    }

    // Run prompt chain to process dump
    const rawResult = await runPromptChain(dump, accountId);
    console.log('[LogResponseAgent] Raw result from LLM:', rawResult);
    let result;
    try {
      const jsonText = parseJsonBlock(rawResult) || rawResult;
      result = JSON.parse(jsonText);
      console.log('[JSONParseAgent] Parsed result:', result);
    } catch (err) {
      console.error('[JSONParseAgent] Failed to parse:', err);
      result = FALLBACK_RESULT;
    }

    // Persist interaction data
    const interactionData = {
      account_id: accountId,
      trust_delta: result.trust_delta ?? 0,
      momentum_delta: result.momentum_delta ?? 0,
      loyalty_delta: result.loyalty_delta ?? 0,
      justification: result.justification ?? '',
      summary: result.summary ?? '',
      created_at: createdAt,
    };
    try {
      const interactionRef = await db.collection('interactions').add(interactionData);
      console.log('✅ [FirestoreWriteAgent] Interaction written', interactionData, interactionRef.id);
    } catch (err) {
      console.error('❌ [FirestoreWriteAgent] Failed to write interaction', interactionData, err);
      throw err;
    }

    // Store recommended actions
    if (Array.isArray(result.recommended_actions)) {
      const batch = db.batch();
      result.recommended_actions.forEach((action) => {
        const ref = db.collection('next_steps').doc();
        batch.set(ref, {
          account_id: accountId,
          action,
          created_at: createdAt,
        });
      });
      try {
        await batch.commit();
        console.log(
          `✅ [FirestoreWriteAgent] Next steps saved: ${result.recommended_actions.length}`
        );
      } catch (err) {
        console.error('❌ [FirestoreWriteAgent] Failed to write next steps', err);
        throw err;
      }
    }

    // Update account scores
    const accountRef = db.collection('accounts').doc(accountId);
    try {
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
          console.log(
            `✅ [FirestoreWriteAgent] Updated account ${accountId}`,
            scores
          );
        } else {
          t.set(accountRef, scores);
          console.log(
            `✅ [FirestoreWriteAgent] Created account ${accountId}`,
            scores
          );
        }
      });
    } catch (err) {
      console.error('❌ [FirestoreWriteAgent] Failed to update account', err);
      throw err;
    }

    res.json({ success: true });
  } catch (err) {
    console.error('Error in submitDump:', err);
    res.status(500).json({ error: err.message });
  }
}

