export const FALLBACK_RESULT = {
  trust_delta: 0,
  momentum_delta: 0,
  loyalty_delta: 0,
  recommended_actions: []
};

import { Configuration, OpenAIApi } from 'openai';

export default async function runPromptChain(resolvedPrompt) {
  if (process.env.NODE_ENV !== 'production') {
    console.log('[runPromptChain] Resolved prompt:', resolvedPrompt);
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

    if (
      !response?.data?.choices ||
      !Array.isArray(response.data.choices) ||
      response.data.choices.length === 0
    ) {
      console.error('[runPromptChain] Malformed OpenAI response:', response?.data);
      return FALLBACK_RESULT;
    }

    content = response.data.choices[0].message?.content;
  } catch (err) {
    console.error('[runPromptChain] OpenAI request failed:', err);
    return FALLBACK_RESULT;
  }

  if (!content) {
    return FALLBACK_RESULT;
  }

  if (process.env.NODE_ENV !== 'production') {
    console.log('[runPromptChain] Raw LLM content:', content);
  }

  try {
    return JSON.parse(content);
  } catch (err) {
    console.error('[runPromptChain] Failed to parse LLM response:', err);
    if (process.env.NODE_ENV !== 'production') {
      console.error('[runPromptChain] Unparsable content:', content);
    }
    return FALLBACK_RESULT;
  }
}
