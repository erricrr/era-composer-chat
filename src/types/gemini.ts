import { Composer } from '@/data/composers';

export interface ChatMessage {
  role: 'user' | 'model';
  text: string;
}

export interface GeminiServiceInterface {
  initializeChat: (composer: Composer, previousChatHistory?: ChatMessage[]) => Promise<void>;
  generateResponse: (userMessage: string) => Promise<string>;
  saveChatHistory: () => Promise<void>;
  loadChatHistory: () => Promise<void>;
}
