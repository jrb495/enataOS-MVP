export const FALLBACK_RESULT = {
  trust_delta: 0,
  momentum_delta: 0,
  loyalty_delta: 0,
  summary: '',
  justification: '',
  recommended_actions: []
};

import { Configuration, OpenAIApi } from 'openai';
import parseJsonBlock from './parseJsonBlock.mjs';

export default async function runPromptChain(resolvedPrompt) {
  if (process.env.NODE_ENV !== 'production') {
    console.log('[runPromptChain] Resolved prompt:', resolvedPrompt);
    console.log('🔥 Raw GPT output:\n', content);
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
  } catch (err) {
    console.error('[runPromptChain] OpenAI request failed:', err);
    return FALLBACK_RESULT;
  }

  if (!content) {
    return FALLBACK_RESULT;
  }

  const jsonText = parseJsonBlock(content) || content;

  try {
    return JSON.parse(jsonText);
  } catch (err) {
    console.error('[runPromptChain] Failed to parse LLM response:', err);
    return FALLBACK_RESULT;
  }
}
