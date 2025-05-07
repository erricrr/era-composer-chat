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
    if (!composerId) {
      console.error('[useConversations] Cannot get conversations: No composer ID provided');
      return [];
    }

    console.log(`[useConversations] Getting conversations for composer: ${composerId}`);

    try {
      // First try to read directly from localStorage to ensure latest data
      try {
        const storedData = localStorage.getItem('composer-conversations');
        if (storedData) {
          const storedConversations = JSON.parse(storedData);
          const composerConversations = storedConversations.filter(
            (c: Conversation) => c.composerId === composerId
          );

          console.log(`[useConversations] Found ${composerConversations.length} conversations for composer ${composerId} in localStorage`);
          return composerConversations.sort((a: Conversation, b: Conversation) => b.lastUpdated - a.lastUpdated);
        }
      } catch (e) {
        console.error('[useConversations] Error reading from localStorage:', e);
        // Fall through to using the in-memory state
      }

      // If localStorage read fails, use the in-memory state
      const filteredConversations = conversations.filter(conv => {
        const match = conv.composerId === composerId;
        if (match) {
          console.log(`[useConversations] Found conversation ${conv.id} for composer ${composerId}`);
        }
        return match;
      });

      console.log(`[useConversations] Total conversations for composer ${composerId}: ${filteredConversations.length}`);
      return filteredConversations.sort((a, b) => b.lastUpdated - a.lastUpdated); // Sort by most recent first
    } catch (error) {
      console.error(`[useConversations] Error in getConversationsForComposer:`, error);
      return [];
    }
  }, [conversations]);

  // Clear all conversations
  const clearAllConversations = useCallback((): void => {
    setConversations([]);
    setActiveConversationId(null);
  }, [setConversations]);

  // Delete a specific conversation
  const deleteConversation = useCallback((conversationId: string): void => {
    if (!conversationId) {
      console.error('[useConversations] Cannot delete conversation: No conversation ID provided');
      return;
    }

    try {
      console.log(`[useConversations] Deleting conversation: ${conversationId}`);

      // First try to directly update localStorage
      try {
        const storedData = localStorage.getItem('composer-conversations');
        if (storedData) {
          const storedConversations = JSON.parse(storedData);
          const filteredConversations = storedConversations.filter(
            (c: Conversation) => c.id !== conversationId
          );

          // Only update if something was actually removed
          if (filteredConversations.length !== storedConversations.length) {
            localStorage.setItem('composer-conversations', JSON.stringify(filteredConversations));
            setConversations(filteredConversations);
            console.log(`[useConversations] Successfully deleted conversation ${conversationId} directly from localStorage`);

            // Update activeConversationId if needed
            if (activeConversationId === conversationId) {
              setActiveConversationId(null);
              console.log(`[useConversations] Reset active conversation ID to null`);
            }

            return;
          }
        }
      } catch (e) {
        console.error('[useConversations] Error updating localStorage directly:', e);
        // Fall through to using the React state update as fallback
      }

      // If direct localStorage update fails, use the React state update mechanism
      setConversations(prev => {
        const filtered = prev.filter(conv => conv.id !== conversationId);
        console.log(`[useConversations] Filtered conversations from ${prev.length} to ${filtered.length}`);
        return filtered;
      });

      if (activeConversationId === conversationId) {
        setActiveConversationId(null);
        console.log(`[useConversations] Reset active conversation ID to null`);
      }
    } catch (error) {
      console.error(`[useConversations] Error in deleteConversation:`, error);
    }
  }, [activeConversationId, setConversations, setActiveConversationId]);

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
