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

export default async function runPromptChain(resolvedPrompt) {
<<<<<<< ours
  if (process.env.NODE_ENV !== 'production') {
    console.log('[runPromptChain] Resolved prompt:', resolvedPrompt);
  }

=======
>>>>>>> theirs
  const openai = new OpenAIApi(
    new Configuration({ apiKey: process.env.OPENAI_API_KEY })
  );

  if (process.env.NODE_ENV !== 'production') {
    console.log('[runPromptChain] Resolved prompt:', resolvedPrompt);
  }

  let content;
  try {
    const response = await openai.createChatCompletion({
      model: 'gpt-4',
      messages: [{ role: 'user', content: resolvedPrompt }],
      temperature: 0.2
    });

    content = response?.data?.choices?.[0]?.message?.content;
    if (process.env.NODE_ENV !== 'production') {
      console.log('[runPromptChain] Resolved prompt:\n', resolvedPrompt);
      console.log('🔥 Raw GPT output:\n', content);
    }
  } catch (err) {
    console.error('[runPromptChain] OpenAI request failed:', err);
    return FALLBACK_RESULT;
  }

  if (process.env.NODE_ENV !== 'production') {
    console.log('🔥 Raw GPT output:\n', content);
  }

  if (!content) {
    return FALLBACK_RESULT;
  }

  const jsonText = parseJsonBlock(content) || content;

  try {
    return JSON.parse(jsonText);
  } catch (err) {
    console.error('[runPromptChain] Failed to parse LLM response:', err);
    console.error('[runPromptChain] Raw content that failed to parse:\n', content);
    return FALLBACK_RESULT;
  }
}


