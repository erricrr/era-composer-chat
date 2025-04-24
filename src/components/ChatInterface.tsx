import { useState, useRef, useEffect, KeyboardEvent, useCallback } from 'react';
import { Composer, Message, Era, Conversation } from '@/data/composers';
import { useConversations } from '@/hooks/useConversations';
import { Button } from '@/components/ui/button';
import { RefreshCcw } from 'lucide-react';
import { useIsMobile } from '@/hooks/use-mobile';
import { Badge } from "@/components/ui/badge";
import { v4 as uuidv4 } from 'uuid';
import { ComposerImageViewer } from './ComposerImageViewer';

interface ChatInterfaceProps {
  composer: Composer;
  onUserTyping: (isTyping: boolean) => void;
}

export function ChatInterface({
  composer,
  onUserTyping,
}: ChatInterfaceProps) {
  const [inputMessage, setInputMessage] = useState('');
  const messagesEndRef = useRef<HTMLDivElement>(null);
  const textareaRef = useRef<HTMLTextAreaElement>(null);
  const isMobile = useIsMobile();

  // Display state controlled entirely by this component
  const [currentMessages, setCurrentMessages] = useState<Message[]>([]);

  // Reference to track current conversation ID to prevent stale state issues
  const currentConversationIdRef = useRef<string | null>(null);

  const {
    activeConversation,
    activeConversationId,
    startConversation,
    addMessage,
    getConversationsForComposer,
    setActiveConversationId
  } = useConversations();

  // Format era display text
  const getEraDisplayText = (era: string): string => {
    return era === Era.Modern ? '20th-21st Century' : era;
  };

  // Function to directly access localStorage to ensure we have the latest data
  const getConversationFromStorage = (conversationId: string): Conversation | null => {
    try {
      const rawData = localStorage.getItem('composer-conversations');
      if (!rawData) return null;

      const conversations = JSON.parse(rawData) as Conversation[];
      return conversations.find(c => c.id === conversationId) || null;
    } catch (e) {
      console.error('Error accessing localStorage:', e);
      return null;
    }
  };

  // Effect to handle composer changes
  useEffect(() => {
    console.log(`[ChatInterface] Composer changed to: ${composer.id}`);

    // Reset message display when changing composers
    setCurrentMessages([]);

    const composerConversations = getConversationsForComposer(composer.id);

    if (composerConversations.length > 0) {
      // Use the most recent conversation
      const mostRecentConversation = composerConversations.reduce(
        (latest, current) => current.lastUpdated > latest.lastUpdated ? current : latest
      );

      // Set active conversation ID
      const conversationId = mostRecentConversation.id;
      setActiveConversationId(conversationId);
      currentConversationIdRef.current = conversationId;

      // Get the most accurate message data directly from localStorage
      const storageConversation = getConversationFromStorage(conversationId);

      if (storageConversation && storageConversation.messages.length > 0) {
        console.log(`[ChatInterface] Found ${storageConversation.messages.length} messages in localStorage`);

        // Count messages by type
        const userMsgs = storageConversation.messages.filter(m => m.sender === 'user').length;
        const composerMsgs = storageConversation.messages.filter(m => m.sender === 'composer').length;
        console.log(`[ChatInterface] Message counts - User: ${userMsgs}, Composer: ${composerMsgs}`);

        // Directly set messages from storage
        setCurrentMessages(storageConversation.messages);
      } else {
        // Fallback to the state data if localStorage fails
        setCurrentMessages(mostRecentConversation.messages);
      }
    } else {
      // Start a new conversation if none exists
      const newConversationId = startConversation(composer);
      currentConversationIdRef.current = newConversationId;
      setCurrentMessages([]);
    }
  }, [composer.id, getConversationsForComposer, startConversation, setActiveConversationId]);

  // Scroll to bottom when messages change
  useEffect(() => {
    messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' });
  }, [currentMessages]);

  // Show loading state
  if (!activeConversationId && currentMessages.length === 0) {
    return <div className="flex items-center justify-center h-full">Loading conversation...</div>;
  }

  const handleMessageSubmit = () => {
    if (!inputMessage.trim()) return;

    // Create the user message
    const userMessage: Message = {
      id: uuidv4(),
      text: inputMessage.trim(),
      sender: 'user',
      timestamp: Date.now()
    };

    // Get the conversation ID (from ref to avoid stale state)
    const conversationId = currentConversationIdRef.current;

    if (!conversationId) {
      console.log("[ChatInterface] No conversation ID available, starting new conversation");
      const newId = startConversation(composer);
      currentConversationIdRef.current = newId;

      // Update UI immediately
      setCurrentMessages([userMessage]);

      // Then persist to storage
      setTimeout(() => {
        addMessage(newId, userMessage.text, 'user');

        // Add composer response
        setTimeout(() => {
          const responseText = generatePlaceholderResponse(userMessage.text, composer);
          const composerMessage: Message = {
            id: uuidv4(),
            text: responseText,
            sender: 'composer',
            timestamp: Date.now()
          };

          // Update UI
          setCurrentMessages(messages => [...messages, composerMessage]);

          // Persist to storage
          addMessage(newId, responseText, 'composer');
        }, 1000);
      }, 100);
    } else {
      // Update UI immediately
      setCurrentMessages(messages => [...messages, userMessage]);

      // Persist to storage
      addMessage(conversationId, userMessage.text, 'user');

      // Handle composer response
      setTimeout(() => {
        const responseText = generatePlaceholderResponse(userMessage.text, composer);
        const composerMessage: Message = {
          id: uuidv4(),
          text: responseText,
          sender: 'composer',
          timestamp: Date.now()
        };

        // Update UI
        setCurrentMessages(messages => [...messages, composerMessage]);

        // Persist to storage
        addMessage(conversationId, responseText, 'composer');
      }, 1000);
    }

    // Clear the input
    setInputMessage('');
    if (textareaRef.current) {
      textareaRef.current.style.height = 'auto';
    }
  };

  const handleSendMessage = (e: React.FormEvent) => {
    e.preventDefault();
    handleMessageSubmit();
  };

  const handleKeyPress = (e: KeyboardEvent<HTMLTextAreaElement>) => {
    if (!isMobile && e.key === 'Enter' && !e.shiftKey) {
      e.preventDefault();
      handleMessageSubmit();
    }
  };

  const handleResetChat = () => {
    if (composer) {
      // Clear the current messages immediately for UI responsiveness
      setCurrentMessages([]);

      // Start a new conversation
      const newId = startConversation(composer);
      currentConversationIdRef.current = newId;
    }
  };

  const generatePlaceholderResponse = (userMessage: string, composer: Composer): string => {
    if (userMessage.toLowerCase().includes('work') || userMessage.toLowerCase().includes('composition')) {
      return `As ${composer.name}, my most famous works include ${composer.famousWorks.join(', ')}. Each composition reflects my style from the ${composer.era} period.`;
    }
    if (userMessage.toLowerCase().includes('life') || userMessage.toLowerCase().includes('born')) {
      return `I was born in ${composer.years.split('-')[0]} in ${composer.country} and lived until ${composer.years.split('-')[1]}. ${composer.bio.split('.')[0]}.`;
    }
    if (userMessage.toLowerCase().includes('style') || userMessage.toLowerCase().includes('music')) {
      return `My musical style is characteristic of the ${composer.era} era. ${composer.bio.split('.')[1] || 'My compositions were known for their technical innovation and emotional depth.'}.`;
    }
    return `Thank you for your interest in my work. I was a composer from the ${composer.era} era, known for ${composer.famousWorks[0]}. Is there anything specific about my compositions or life you would like to know?`;
  };

  return <div className="flex flex-col h-full bg-background/60 backdrop-blur-sm rounded-lg overflow-hidden z-10 shadow-md">
    <div className="flex items-center justify-between p-4 border-b shadow-sm bg-primary/10">
      <div className="flex items-center space-x-6">
        <ComposerImageViewer composer={composer} size="sm" />
        <div className="flex flex-col items-start">
          <h2 className="font-serif font-bold text-lg">{composer.name}</h2>
          <div className="flex items-center gap-2 mt-1">
            <p className="text-sm text-muted-foreground">
              {composer.country}, {composer.years}
            </p>
            <Badge
              variant="default" className="ml-2 bg-primary/65 text-background">
              {getEraDisplayText(composer.era)}
            </Badge>
          </div>
        </div>
      </div>
      <Button
        variant="ghost"
        size="icon"
        onClick={handleResetChat}
        title="Reset conversation"
        className="ml-2 rounded-full hover:bg-primary/20 transition-colors"
      >
        <RefreshCcw className="h-4 w-4" />
      </Button>
    </div>

    <div className="flex-1 overflow-y-auto p-4 space-y-4 relative bg-gray-50/30 dark:bg-gray-800/30">
      {currentMessages.length === 0 && (
        <div className="absolute inset-0 flex items-center justify-center text-muted-foreground text-sm pointer-events-none">
          <p>Start a conversation with {composer.name.split(' ').pop()}. Ask them about their music.</p>
        </div>
      )}

      {currentMessages.map((message: Message) => (
        <div key={message.id} className={`flex ${message.sender === 'user' ? 'justify-end' : 'justify-start'}`}>
          <div className={message.sender === 'user'
            ? 'max-w-[80%] rounded-2xl px-4 py-2 bg-primary/80 text-background ml-auto shadow-sm'
            : 'max-w-[80%] px-4 py-2 text-foreground'
          }>
            {message.text}
          </div>
        </div>
      ))}
      <div ref={messagesEndRef} />
    </div>

    <form onSubmit={handleSendMessage} className="sticky bottom-0 p-4 border-t bg-background/80 backdrop-blur-sm">
      <div className="flex flex-col gap-2">
        <div className="flex items-stretch gap-2">
          <div className="flex-1">
            <textarea
              ref={textareaRef}
              value={inputMessage}
              onChange={(e) => {
                setInputMessage(e.target.value);
                onUserTyping(true);
              }}
              onKeyDown={handleKeyPress}
              placeholder={`Ask ${composer.name} a question...`}
              className="w-full rounded-xl border bg-background/80 p-3 text-sm focus:outline-none focus:ring-1 focus:ring-primary resize-none overflow-hidden min-h-[42px]"
              rows={1}
              onInput={e => {
                const target = e.target as HTMLTextAreaElement;
                target.style.height = 'auto';
                target.style.height = `${Math.min(target.scrollHeight, 200)}px`;
              }}
            />
          </div>
          <Button
            type="submit"
            disabled={!inputMessage.trim()}
            className={`px-4 h-10 mb-2.5 rounded-lg font-medium disabled:opacity-50 disabled:cursor-not-allowed transition-colors shrink-0 bg-primary text-background hover:opacity-90 self-end`}
          >
            Send
          </Button>
        </div>
        <p className="text-xs text-muted-foreground text-center">
          AI-generated conversation from verified sources. Does not reflect {composer.name.split(' ').pop()}&apos;s personal views.
        </p>
      </div>
    </form>
  </div>;
}

export default ChatInterface;
