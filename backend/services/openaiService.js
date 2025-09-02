import OpenAI from 'openai';
import dotenv from 'dotenv';

dotenv.config();

const openai = new OpenAI({
  apiKey: process.env.AI_API_KEY,
});

export const generateAIResponse = async (userMessage, userId) => {
  try {
    const completion = await openai.chat.completions.create({
      model: process.env.AI_MODEL || 'gpt-3.5-turbo',
      messages: [
        {
          role: 'system',
          content: 'You are a compassionate AI mental health companion. Provide supportive, empathetic responses. Never give medical advice.'
        },
        {
          role: 'user',
          content: userMessage
        }
      ],
      max_tokens: 200,
      temperature: 0.7,
    });

    return completion.choices[0].message.content.trim();
  } catch (error) {
    console.error('OpenAI API error:', error);
    return "I'm here to listen and support you. How are you feeling right now?";
  }
};
