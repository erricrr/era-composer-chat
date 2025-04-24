import { useState, useCallback, useMemo } from 'react';
import { useLocalStorage } from './useLocalStorage';
import { Conversation, Message, Composer } from '@/data/composers';
import { v4 as uuidv4 } from 'uuid';


export function useConversations() {
  const [conversations, setConversations] = useLocalStorage<Conversation[]>('composer-conversations', []);
  const [activeConversationId, setActiveConversationId] = useState<string | null>(null);

  // Get active conversation
  const activeConversation = useMemo(() => {
    // Log when useMemo runs and the dependencies
    console.log('[useConversations] useMemo calculating activeConversation. ID:', activeConversationId);

    if (!activeConversationId) {
      console.log('[useConversations] No active conversation ID set');
      return null;
    }

    const foundConv = conversations.find(conv => conv.id === activeConversationId) || null;
    // Log the result
    console.log('[useConversations] useMemo found conversation:', foundConv);

    if (!foundConv) {
      console.log(`[useConversations] Warning: Active conversation ID ${activeConversationId} not found in conversations`);
    }

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

    console.log(`[useConversations] Starting new conversation with composer ${composer.id}, new ID: ${newConversation.id}`);

    // Use functional update to ensure we have latest state
    setConversations(prev => {
      const newConversations = [...prev, newConversation];
      console.log(`[useConversations] Added new conversation. Total conversations: ${newConversations.length}`);
      return newConversations;
    });

    // Set the active conversation ID
    setActiveConversationId(newConversation.id);
    console.log(`[useConversations] Set active conversation ID to: ${newConversation.id}`);

    return newConversation.id;
  }, [setConversations, setActiveConversationId]);

  // Add message to conversation
  const addMessage = useCallback((conversationId: string, text: string, sender: 'user' | 'composer'): void => {
    if (!conversationId) {
      console.error('[useConversations] Cannot add message: No conversation ID provided');
      return;
    }

    console.log(`[useConversations] addMessage called for convId: ${conversationId}, sender: ${sender}`);

    const newMessage: Message = {
      id: uuidv4(),
      text,
      sender,
      timestamp: Date.now()
    };

    // Log the message being added for debugging
    console.log(`[useConversations] Adding message type: ${sender}`);

    // Try to read directly from localStorage first to ensure we have latest data
    try {
      const storedData = localStorage.getItem('composer-conversations');
      if (storedData) {
        const storedConversations = JSON.parse(storedData);
        const conversationIndex = storedConversations.findIndex((c: Conversation) => c.id === conversationId);

        if (conversationIndex !== -1) {
          // Update the conversation directly in the parsed localStorage data
          const updatedConversation = {
            ...storedConversations[conversationIndex],
            messages: [...storedConversations[conversationIndex].messages, newMessage],
            lastUpdated: Date.now()
          };

          // Replace the conversation in the array
          storedConversations[conversationIndex] = updatedConversation;

          // Save back to localStorage
          localStorage.setItem('composer-conversations', JSON.stringify(storedConversations));

          // Update React state to match localStorage
          setConversations(storedConversations);

          console.log(`[useConversations] Directly updated localStorage. Conversation now has ${updatedConversation.messages.length} messages.`);

          // Finished direct localStorage update
          return;
        }
      }
    } catch (e) {
      console.error('[useConversations] Error updating localStorage directly:', e);
      // Fall through to normal state update if direct localStorage update fails
    }

    // If we couldn't update localStorage directly, use the state update method as fallback
    setConversations(prev => {
      // Make a shallow copy of previous conversations
      const updatedConversations = [...prev];

      // Find the conversation index
      const conversationIndex = updatedConversations.findIndex(conv => conv.id === conversationId);

      if (conversationIndex === -1) {
        console.error(`[useConversations] Conversation ${conversationId} not found`);
        return prev; // Return unchanged state
      }

      // Create a new conversation object with the message added
      const updatedConversation = {
        ...updatedConversations[conversationIndex],
        messages: [...updatedConversations[conversationIndex].messages, newMessage],
        lastUpdated: Date.now()
      };

      // Replace the old conversation with the updated one
      updatedConversations[conversationIndex] = updatedConversation;

      console.log(`[useConversations] Updated conversation ${conversationId} with message. Now has ${updatedConversation.messages.length} messages`);

      return updatedConversations;
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
