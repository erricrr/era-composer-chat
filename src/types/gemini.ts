import { HarmCategory, HarmBlockThreshold } from '@google/generative-ai';
import { Composer } from '@/data/composers';

export interface ChatMessage {
  role: 'user' | 'model';
  text: string;
}

export interface GeminiConfig {
  temperature: number;
  topK: number;
  topP: number;
  maxOutputTokens: number;
}

export interface SafetySetting {
  category: HarmCategory;
  threshold: HarmBlockThreshold;
}

export interface GeminiServiceInterface {
  initializeChat: (composer: Composer) => Promise<void>;
  generateResponse: (userMessage: string) => Promise<string>;
  saveChatHistory: () => Promise<void>;
  loadChatHistory: () => Promise<void>;
}
