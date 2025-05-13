import { useState, useCallback } from 'react';
import { Composer } from '@/data/composers';
import { geminiService } from '@/services/gemini';

export function useGeminiChat() {
  const [isGenerating, setIsGenerating] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const initializeChat = useCallback(async (composer: Composer) => {
    try {
      await geminiService.initializeChat(composer);
      setError(null);
    } catch (err) {
      setError('Failed to initialize chat');
      console.error('Error initializing chat:', err);
    }
  }, []);

  const generateResponse = useCallback(async (userMessage: string): Promise<string> => {
    setIsGenerating(true);
    setError(null);

    try {
      const response = await geminiService.generateResponse(userMessage);
      return response;
    } catch (err) {
      setError('Failed to generate response');
      console.error('Error generating response:', err);
      throw err;
    } finally {
      setIsGenerating(false);
    }
  }, []);

  return {
    isGenerating,
    error,
    initializeChat,
    generateResponse,
  };
};
