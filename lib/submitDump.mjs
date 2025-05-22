import { getFirestore, FieldValue } from 'firebase-admin/firestore';
import loadPrompt from './firebasePrompts.mjs';
import runPromptChain, { FALLBACK_RESULT } from './runPromptChain.mjs';

/**
 * Process and store a rep dump about an account.
 * @param {Object} params
 * @param {string} params.rep_id - ID of the rep submitting the dump
 * @param {string} params.account_id - ID of the account the dump is about
 * @param {string} params.text - Raw text dump
 */
export default async function submitDump({ rep_id, account_id, text }) {
  const db = getFirestore();
  const timestamp = Date.now();

  // Save raw dump
  const dumpRef = await db.collection('dumps').add({
    rep_id,
    account_id,
    text,
    created_at: timestamp
  });
  console.log(`📥 Dump saved (${dumpRef.id})`);

  // Build prompt. The `enata_os_base` prompt must include a `{{dump}}` token.
  const basePrompt = await loadPrompt('enata_os_base');
  const resolvedPrompt = basePrompt.replaceAll('{{dump}}', text);

  // Run prompt chain
  const rawOutput = await runPromptChain(resolvedPrompt);
  const output = { ...FALLBACK_RESULT, ...rawOutput };

  // Save interaction with output
  const interactionRef = await db.collection('interactions').add({
    rep_id,
    account_id,
    dump_id: dumpRef.id,
    output,
    created_at: timestamp
  });
  console.log('📚 Interaction stored:', interactionRef.id);

  // Save next steps
  if (Array.isArray(output.recommended_actions)) {
    await Promise.all(
      output.recommended_actions.map(step =>
        db.collection('next_steps').add({
          rep_id,
          account_id,
          interaction_id: interactionRef.id,
          step,
          created_at: timestamp
        })
      )
    );
    console.log('✅ Next steps saved');
  }

  // Update account scores
  const accountRef = db.collection('accounts').doc(account_id);
  await accountRef.set(
    {
      trust: FieldValue.increment(output.trust_delta || 0),
      momentum: FieldValue.increment(output.momentum_delta || 0),
      loyalty: FieldValue.increment(output.loyalty_delta || 0)
    },
    { merge: true }
  );
  console.log('📈 Account updated');

  return { dump_id: dumpRef.id, interaction_id: interactionRef.id, output };
}
