export const FALLBACK_RESULT = {
  trust_delta: 0,
  momentum_delta: 0,
  loyalty_delta: 0,
  recommended_actions: []
};

function isValid(result) {
  return (
    typeof result === 'object' &&
    typeof result.trust_delta === 'number' &&
    typeof result.momentum_delta === 'number' &&
    typeof result.loyalty_delta === 'number' &&
    Array.isArray(result.recommended_actions)
  );
}

import { Configuration, OpenAIApi } from 'openai';

export default async function runPromptChain(resolvedPrompt) {
  if (process.env.NODE_ENV !== 'production') {
    console.log('[runPromptChain] Resolved prompt:', resolvedPrompt);
    if (!/Respond ONLY with valid JSON/i.test(resolvedPrompt)) {
      console.warn('[runPromptChain] Prompt may be missing strict JSON instructions');
    }
  }

  const openai = new OpenAIApi(
    new Configuration({ apiKey: process.env.OPENAI_API_KEY })
  );

  let content;
  try {
    const response = await openai.createChatCompletion({
      model: 'gpt-4',
      messages: [{ role: 'user', content: resolvedPrompt }]
    });
    content = response?.data?.choices?.[0]?.message?.content;
    if (process.env.NODE_ENV !== 'production') {
      console.log('[runPromptChain] Raw LLM output:', content);
    }
  } catch (err) {
    console.error('[runPromptChain] OpenAI request failed:', err);
    return FALLBACK_RESULT;
  }

  if (!content) {
    return FALLBACK_RESULT;
  }

  let parsed;
  try {
    parsed = JSON.parse(content);
  } catch (err) {
    console.error('[runPromptChain] Failed to parse LLM response:', err);
    if (process.env.NODE_ENV !== 'production') {
      console.log('[runPromptChain] Unparsed content:', content);
    }
    return FALLBACK_RESULT;
  }

  if (!isValid(parsed)) {
    console.error('[runPromptChain] LLM output did not pass validation');
    if (process.env.NODE_ENV !== 'production') {
      console.log('[runPromptChain] Invalid content:', parsed);
    }
    return FALLBACK_RESULT;
  }

  return parsed;
}
