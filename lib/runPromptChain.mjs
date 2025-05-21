import { Configuration, OpenAIApi } from 'openai';
import dotenv from 'dotenv';
import { loadPrompt } from './firebasePrompts.mjs';

dotenv.config();

const openai = new OpenAIApi(new Configuration({
  apiKey: process.env.OPENAI_API_KEY,
}));

export async function runPromptChain(db, dumpText) {
  const safeOutput = {
    trust_delta: 0,
    momentum_delta: 0,
    loyalty_delta: 0,
    justification: '',
    summary: '',
<<<<<<< ours
    recommended_actions: []
  };
  try {
    const systemPrompt = await loadPrompt(db, 'enata_os_base');
    if (process.env.NODE_ENV !== 'production') {
      console.log('Resolved prompt:\n', systemPrompt);
    }
    const messages = [
      { role: 'system', content: systemPrompt },
      { role: 'user', content: dumpText },
    ];

    const response = await openai.createChatCompletion({
=======
    recommended_actions: [],
  };

  let systemPrompt;
  try {
    systemPrompt = await loadPrompt(db, 'enata_os_base');
    if (process.env.NODE_ENV !== 'production') {
      console.log('Resolved prompt:', systemPrompt);
    }
  } catch (err) {
    console.error('Failed to load prompt:', err);
    return safeOutput;
  }

  const messages = [
    { role: 'system', content: systemPrompt },
    { role: 'user', content: dumpText },
  ];

  let response;
  try {
    response = await openai.createChatCompletion({
>>>>>>> theirs
      model: 'gpt-4',
      messages,
      temperature: 0.2,
    });
<<<<<<< ours

    if (!response.data.choices || !response.data.choices.length) {
      console.error('OpenAI returned empty choices');
      return safeOutput;
    }

    const content = response.data.choices[0].message.content;
    try {
      return JSON.parse(content);
    } catch (err) {
      console.error('Failed to parse GPT response:', content);
      return safeOutput;
    }
  } catch (err) {
    console.error('runPromptChain error:', err);
=======
  } catch (err) {
    console.error('OpenAI API call failed:', err);
    return safeOutput;
  }

  if (!response?.data?.choices?.length) {
    console.error('OpenAI returned empty response:', response?.data);
    return safeOutput;
  }

  const raw = response.data.choices[0].message?.content || '';
  try {
    return JSON.parse(raw);
  } catch (err) {
    console.error('Failed to parse OpenAI response:', raw, err);
>>>>>>> theirs
    return safeOutput;
  }
}
