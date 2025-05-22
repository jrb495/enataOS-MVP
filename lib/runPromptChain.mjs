import { Configuration, OpenAIApi } from 'openai';
import parseJsonBlock from './parseJsonBlock.mjs';

export const FALLBACK_RESULT = {
  trust_delta: 0,
  momentum_delta: 0,
  loyalty_delta: 0,
  summary: '',
  justification: '',
  recommended_actions: []
};

import { Configuration, OpenAIApi } from 'openai';

export default async function executePrompt(resolvedPrompt) {
  console.log('[LogResponseAgent] Resolved prompt:', resolvedPrompt);

  const openai = new OpenAIApi(
    new Configuration({ apiKey: process.env.OPENAI_API_KEY })
  );

  let content = '';
  try {
    const response = await openai.createChatCompletion({
      model: 'gpt-4',
      messages: [{ role: 'user', content: resolvedPrompt }],
      temperature: 0.2
    });

    content = response?.data?.choices?.[0]?.message?.content || '';
    console.log('[LogResponseAgent] Raw LLM response:', content);
  } catch (err) {
    console.error('[runPromptChain] OpenAI request failed:', err);
    return '';
  }
  return content;
}
