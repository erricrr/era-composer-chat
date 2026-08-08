import { Composer } from '@/data/composers';
import { getGreeting } from '../../shared/gemini/prompt';
import type { ChatMessage, GeminiServiceInterface } from '@/types/gemini';

const CHAT_API_PATH = '/api/chat';

export class GeminiService implements GeminiServiceInterface {
  private chatHistory: ChatMessage[] = [];
  private composer: Composer | null = null;

  public async initializeChat(composer: Composer, previousChatHistory: ChatMessage[] = []) {
    this.composer = composer;
    this.chatHistory = [...previousChatHistory];
  }

  public async generateResponse(userMessage: string): Promise<string> {
    if (!this.composer) {
      throw new Error('Chat not initialized with composer');
    }

    try {
      const response = await fetch(CHAT_API_PATH, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          message: userMessage,
          composer: this.composer,
          history: this.chatHistory,
        }),
      });

      if (!response.ok) {
        throw new Error(`Chat API responded with ${response.status}`);
      }

      const data = (await response.json()) as { text?: string; error?: string };

      if (!data.text) {
        throw new Error(data.error || 'Empty response received from chat API');
      }

      this.chatHistory.push({ role: 'user', text: userMessage });
      this.chatHistory.push({ role: 'model', text: data.text });

      return data.text;
    } catch (error) {
      console.error('Detailed error in chat response:', {
        error,
        composer: this.composer.name,
        messageCount: this.chatHistory.length,
      });

      const greeting = getGreeting(this.composer.nationality);
      const era = Array.isArray(this.composer.era) ? this.composer.era[0] : this.composer.era;

      const lastMessage = this.chatHistory[this.chatHistory.length - 1];
      if (lastMessage?.text?.includes('technical difficulty')) {
        return `Perhaps we could discuss my composition *${this.composer.famousWorks[0]}* or my experiences during the ${era} period instead?`;
      }

      return `${greeting}! I apologize for the technical difficulty. Shall we discuss my composition *${this.composer.famousWorks[0]}* or my experiences during the ${era} period instead?`;
    }
  }

  public async saveChatHistory() {
    // Will be implemented when Firebase is integrated
  }

  public async loadChatHistory() {
    // Will be implemented when Firebase is integrated
  }
}

let _geminiService: GeminiService | null = null;

export const geminiService = {
  get instance(): GeminiService {
    if (!_geminiService) {
      _geminiService = new GeminiService();
    }
    return _geminiService;
  },
};
