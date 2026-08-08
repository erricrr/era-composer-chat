import { GoogleGenerativeAI } from '@google/generative-ai';
import { DEFAULT_CONFIG, GEMINI_MODEL, SAFETY_SETTINGS } from './config';
import { buildSystemPrompt } from './prompt';
import type { ChatMessage, ComposerPayload } from './types';

export async function generateGeminiResponse(
  apiKey: string,
  composer: ComposerPayload,
  history: ChatMessage[],
  userMessage: string,
): Promise<string> {
  const genAI = new GoogleGenerativeAI(apiKey);
  const model = genAI.getGenerativeModel({
    model: GEMINI_MODEL,
    safetySettings: SAFETY_SETTINGS,
    generationConfig: DEFAULT_CONFIG,
  });

  const systemPrompt = buildSystemPrompt(composer);
  const seededHistory: ChatMessage[] = [{ role: 'user', text: systemPrompt }, ...history];

  const formattedHistory = seededHistory.map((msg) => ({
    role: msg.role,
    parts: [{ text: msg.text }],
  }));

  const chat = model.startChat({
    history: formattedHistory,
    generationConfig: DEFAULT_CONFIG,
  });

  const result = await chat.sendMessage(userMessage);

  if (!result.response) {
    throw new Error('Empty response received from Gemini');
  }

  return result.response.text();
}
