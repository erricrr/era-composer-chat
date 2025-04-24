import { useState, useCallback, useMemo } from 'react';
import { useLocalStorage } from './useLocalStorage';
import { Conversation, Message, Composer } from '@/data/composers';
import { getComposerIntroduction } from '@/data/composerIntroductions';
import { v4 as uuidv4 } from 'uuid';

const MAX_CONVERSATIONS_PER_ERA = 3;

export function useConversations() {
  const [conversations, setConversations] = useLocalStorage<Conversation[]>('composer-conversations', []);
  const [activeConversationId, setActiveConversationId] = useState<string | null>(null);

  // Get active conversation
  const activeConversation = useMemo(() => {
    // Log when useMemo runs and the dependencies
    console.log('[useConversations] useMemo calculating activeConversation. ID:', activeConversationId);
    const foundConv = conversations.find(conv => conv.id === activeConversationId) || null;
    // Log the result
    console.log('[useConversations] useMemo found conversation:', foundConv);
    return foundConv;
  }, [conversations, activeConversationId]);

  // Start a new conversation with a composer
  const startConversation = useCallback((composer: Composer): string => {
    // Create new conversation
    const newConversation: Conversation = {
      id: uuidv4(),
      composerId: composer.id,
      messages: [], // Start with empty messages array
      lastUpdated: Date.now()
    };

    // Directly use the new conversation without the greeting
    setConversations(prev => [...prev, newConversation]);
    setActiveConversationId(newConversation.id);
    return newConversation.id;
  }, [setConversations]);

  // Add message to conversation
  const addMessage = useCallback((conversationId: string, text: string, sender: 'user' | 'composer'): void => {
    if (!conversationId) return;

    console.log(`[useConversations] addMessage called for convId: ${conversationId}, sender: ${sender}, text: ${text}`);

    const newMessage: Message = {
      id: uuidv4(),
      text,
      sender,
      timestamp: Date.now()
    };

    setConversations(prev => {
      console.log('[useConversations] setConversations - previous state:', prev);
      const updated = prev.map(conv =>
        conv.id === conversationId
          ? {
              ...conv,
              messages: [...conv.messages, newMessage],
              lastUpdated: Date.now()
            }
          : conv
      );
      console.log('[useConversations] setConversations - next state:', updated);
      return updated;
    });
  }, [setConversations]);

  // Get conversations for a specific composer
  const getConversationsForComposer = useCallback((composerId: string): Conversation[] => {
    return conversations.filter(conv => conv.composerId === composerId)
      .sort((a, b) => b.lastUpdated - a.lastUpdated); // Sort by most recent first
  }, [conversations]);

  // Clear all conversations
  const clearAllConversations = useCallback((): void => {
    setConversations([]);
    setActiveConversationId(null);
  }, [setConversations]);

  // Delete a specific conversation
  const deleteConversation = useCallback((conversationId: string): void => {
    setConversations(prev => prev.filter(conv => conv.id !== conversationId));

    if (activeConversationId === conversationId) {
      setActiveConversationId(null);
    }
  }, [activeConversationId, setConversations]);

  return {
    conversations,
    activeConversationId,
    activeConversation,
    startConversation,
    addMessage,
    getConversationsForComposer,
    clearAllConversations,
    deleteConversation,
    setActiveConversationId
  };
}
