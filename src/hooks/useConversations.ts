
import { useState, useCallback } from 'react';
import { useLocalStorage } from './useLocalStorage';
import { Conversation, Message, Composer } from '@/data/composers';
import { getComposerIntroduction } from '@/data/composerIntroductions';
import { v4 as uuidv4 } from 'uuid';

const MAX_CONVERSATIONS_PER_ERA = 3;

export function useConversations() {
  const [conversations, setConversations] = useLocalStorage<Conversation[]>('composer-conversations', []);
  const [activeConversationId, setActiveConversationId] = useState<string | null>(null);

  // Get active conversation
  const activeConversation = useCallback(() => {
    return conversations.find(conv => conv.id === activeConversationId) || null;
  }, [conversations, activeConversationId]);

  // Start a new conversation with a composer
  const startConversation = useCallback((composer: Composer): string => {
    // Check if we already have a conversation with this composer
    const existingConversation = conversations.find(conv => conv.composerId === composer.id);
    
    if (existingConversation) {
      setActiveConversationId(existingConversation.id);
      return existingConversation.id;
    }
    
    // Count existing conversations for this era
    const eraConversations = conversations.filter(
      conv => conversations.find(c => c.composerId === conv.composerId)?.composerId === composer.id
    );
    
    // Check if we've reached the limit
    if (eraConversations.length >= MAX_CONVERSATIONS_PER_ERA) {
      // Sort by last updated and remove the oldest
      const sortedConversations = [...eraConversations].sort((a, b) => a.lastUpdated - b.lastUpdated);
      const toRemove = sortedConversations[0].id;
      
      setConversations(prev => prev.filter(conv => conv.id !== toRemove));
    }
    
    // Create new conversation with personalized introduction
    const newConversation: Conversation = {
      id: uuidv4(),
      composerId: composer.id,
      messages: [
        {
          id: uuidv4(),
          text: getComposerIntroduction(composer),
          sender: 'composer',
          timestamp: Date.now()
        }
      ],
      lastUpdated: Date.now()
    };
    
    setConversations(prev => [...prev, newConversation]);
    setActiveConversationId(newConversation.id);
    return newConversation.id;
  }, [conversations, setConversations]);

  // Add message to conversation
  const addMessage = useCallback((conversationId: string, text: string, sender: 'user' | 'composer'): void => {
    const newMessage: Message = {
      id: uuidv4(),
      text,
      sender,
      timestamp: Date.now()
    };
    
    setConversations(prev => prev.map(conv => 
      conv.id === conversationId 
        ? { 
            ...conv, 
            messages: [...conv.messages, newMessage],
            lastUpdated: Date.now() 
          } 
        : conv
    ));
  }, [setConversations]);

  // Get conversations for a specific composer
  const getConversationsForComposer = useCallback((composerId: string): Conversation[] => {
    return conversations.filter(conv => conv.composerId === composerId);
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
    activeConversation: activeConversation(),
    startConversation,
    addMessage,
    getConversationsForComposer,
    clearAllConversations,
    deleteConversation,
    setActiveConversationId
  };
}
