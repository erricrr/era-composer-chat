import { useState, useRef, useEffect, KeyboardEvent, useCallback } from 'react';
import { Composer, Message, Era, Conversation } from '@/data/composers';
import { useConversations } from '@/hooks/useConversations';
import { Button } from '@/components/ui/button';
import { RefreshCcw, ArrowUp, Music } from 'lucide-react';
import { useIsMobile } from '@/hooks/use-mobile';
import { Badge } from "@/components/ui/badge";
import { v4 as uuidv4 } from 'uuid';
import { ComposerImageViewer } from './ComposerImageViewer';
import { ComposerSplitView } from './ComposerSplitView';

interface ChatInterfaceProps {
  composer: Composer;
  onUserTyping: (isTyping: boolean) => void;
  isComposerListOpen?: boolean;
}

export function ChatInterface({
  composer,
  onUserTyping,
  isComposerListOpen = false,
}: ChatInterfaceProps) {
  const [inputMessage, setInputMessage] = useState('');
  const messagesEndRef = useRef<HTMLDivElement>(null);
  const textareaRef = useRef<HTMLTextAreaElement>(null);
  const isMobile = useIsMobile();
  const [shouldAutoScroll, setShouldAutoScroll] = useState(true);
  const prevMessagesLengthRef = useRef(0);
  const [isSplitViewOpen, setIsSplitViewOpen] = useState(() => {
    const saved = localStorage.getItem('splitViewOpen');
    return saved ? JSON.parse(saved) : false;
  });

  // Display state controlled entirely by this component
  const [currentMessages, setCurrentMessages] = useState<Message[]>([]);

  // Reference to track current conversation ID to prevent stale state issues
  const currentConversationIdRef = useRef<string | null>(null);

  // State to track if the composer menu is open
  const [isComposerMenuOpen, setIsComposerMenuOpen] = useState(false);

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
    return era;
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
    setShouldAutoScroll(true); // Reset auto-scroll when composer changes

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

  // Modified scroll effect to only scroll when new messages are added
  useEffect(() => {
    // Only auto-scroll if shouldAutoScroll is true and messages were added (not loaded)
    if (shouldAutoScroll && currentMessages.length > prevMessagesLengthRef.current) {
      messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' });
    }
    prevMessagesLengthRef.current = currentMessages.length;
  }, [currentMessages, shouldAutoScroll]);

  // Add scroll listener to detect user scrolling
  useEffect(() => {
    const messageContainer = messagesEndRef.current?.parentElement;
    if (!messageContainer) return;

    const handleScroll = () => {
      const { scrollTop, scrollHeight, clientHeight } = messageContainer;
      // If user scrolls up more than 100px from bottom, disable auto-scroll
      const isNearBottom = scrollHeight - scrollTop - clientHeight < 100;
      setShouldAutoScroll(isNearBottom);
    };

    messageContainer.addEventListener('scroll', handleScroll);
    return () => messageContainer.removeEventListener('scroll', handleScroll);
  }, []);

  // Add effect to handle composer list visibility
  useEffect(() => {
    if (isComposerListOpen) {
      // Scroll to top when composer list opens
      window.scrollTo({ top: 0, behavior: 'smooth' });
    }
  }, [isComposerListOpen]);

  // Effect to persist split view state
  useEffect(() => {
    localStorage.setItem('splitViewOpen', JSON.stringify(isSplitViewOpen));
  }, [isSplitViewOpen]);

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
      const newConversationId = startConversation(composer);
      currentConversationIdRef.current = newConversationId;

      // Update UI immediately
      setCurrentMessages([userMessage]);

      // Then persist to storage
      setTimeout(() => {
        addMessage(newConversationId, userMessage.text, 'user');

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
          addMessage(newConversationId, responseText, 'composer');
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

    // Clear the input and reset textarea height
    setInputMessage('');
    if (textareaRef.current) {
      textareaRef.current.style.height = 'auto';
      textareaRef.current.style.height = '42px'; // Reset to min-height value
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
      const newConversationId = startConversation(composer);
      currentConversationIdRef.current = newConversationId;
    }
  };

  const generatePlaceholderResponse = (userMessage: string, composer: Composer): string => {
    const years = `${composer.birthYear}-${composer.deathYear || 'present'}`;

    if (userMessage.toLowerCase().includes('work') || userMessage.toLowerCase().includes('composition')) {
      return `As ${composer.name}, my most famous works include ${composer.famousWorks.join(', ')}. Each composition reflects my style from the ${composer.era} period.`;
    }
    if (userMessage.toLowerCase().includes('life') || userMessage.toLowerCase().includes('born')) {
      return `I was born in ${composer.birthYear} in ${composer.nationality} and ${composer.deathYear ? `lived until ${composer.deathYear}` : 'am still composing'}. ${composer.shortBio}`;
    }
    if (userMessage.toLowerCase().includes('style') || userMessage.toLowerCase().includes('music')) {
      return `My musical style is characteristic of the ${composer.era} era. ${composer.longBio.split('.')[1] || 'My compositions were known for their technical innovation and emotional depth.'}.`;
    }
    return `Thank you for your interest in my work. I was a composer from the ${composer.era} era, known for ${composer.famousWorks[0]}. ${composer.shortBio}`;
  };

  const chatContent = (
    <div
      className={`relative flex flex-col h-full bg-background overflow-hidden pb-4 transition-all duration-500 ease-in-out`}
    >
      <div className="flex items-center justify-between px-5 pt-3 pb-2 border-b shadow-sm bg-secondary">
        {(!isSplitViewOpen) ? (
          <div
            onClick={() => setIsSplitViewOpen(true)}
            className="flex-1 flex items-center cursor-pointer transition-all duration-300 ease-in-out transform
              [&:not(:active)]:hover:opacity-90 [&:not(:active)]:hover:scale-[0.98]
              motion-reduce:transition-none motion-reduce:transform-none
              delay-[50ms]"
          >
            <div className="flex items-center space-x-6">
              <div>
                <ComposerImageViewer
                  composer={composer}
                  size="sm"
                  onClick={() => setIsSplitViewOpen(true)}
                />
              </div>
              <div className="flex flex-col items-start">
                <h2 className="font-serif font-bold text-lg">{composer.name}</h2>
                <div className="flex items-center gap-2 mt-2">
                  <span className="text-sm md:text-base text-muted-foreground">
                    {composer.nationality}, {composer.birthYear}-{composer.deathYear || 'present'}
                  </span>
                  <Badge variant="badge">
                    {Array.isArray(composer.era) ? composer.era.join(' / ') : composer.era}
                  </Badge>
                </div>
              </div>
            </div>
          </div>
        ) : (
          <div
            onClick={() => setIsSplitViewOpen(false)}
            className="flex-1 flex items-center space-x-3 pb-3 pt-5 cursor-pointer transition-all duration-300 ease-in-out
              [&:not(:active)]:hover:opacity-90
              motion-reduce:transition-none
              delay-[50ms]
              translate-y-[-4px]"
          >
            <Music className="h-4 w-4 text-primary" />
            <span className="text-sm font-medium text-muted-foreground">
              Chat with {composer.name.split(' ').pop()}
            </span>
            <div className="flex space-x-1">
              <div className="h-1 w-1 rounded-full bg-primary"></div>
              <div className="h-1 w-1 rounded-full bg-primary opacity-60"></div>
              <div className="h-1 w-1 rounded-full bg-primary opacity-30"></div>
            </div>
          </div>
        )}
        <Button
          variant="ghost"
          size="icon"
          onClick={handleResetChat}
          title="Reset conversation"
          className="ml-2 rounded-full hover:bg-primary/20 transition-all duration-300 ease-in-out transform hover:scale-105 active:scale-95"
        >
          <RefreshCcw className="h-4 w-4" />
        </Button>
      </div>

      <div className="flex-1 overflow-y-auto p-4 relative">
        <div className="flex flex-col min-h-[calc(100%-2rem)]">
          {currentMessages.length === 0 ? (
            <div className="flex-1 flex items-center justify-center text-muted-foreground text-sm">
              <p>Start a conversation with {composer.name.split(' ').pop()}. Ask them about their music.</p>
            </div>
          ) : (
            <div className="space-y-4 w-full">
              {currentMessages.map((message: Message) => (
                <div key={message.id} className={`flex ${message.sender === 'user' ? 'justify-end' : 'justify-start'}`}>
                  <div className={message.sender === 'user'
                    ? 'max-w-[80%] rounded-2xl px-4 py-2 bg-primary text-background ml-auto shadow-sm'
                    : 'max-w-[80%] rounded-2xl px-4 py-2 text-foreground bg-background'
                  }>
                    {message.text}
                  </div>
                </div>
              ))}
            </div>
          )}
          <div ref={messagesEndRef} />
        </div>
      </div>

      <form onSubmit={handleSendMessage} className="sticky bottom-0 border-t bg-background/80 backdrop-blur-sm">
  <div className="p-4">
    <div className="relative flex gap-2">
      <div className="flex-1">
        <textarea
          ref={textareaRef}
          value={inputMessage}
          onChange={(e) => {
            setInputMessage(e.target.value);
            onUserTyping(true);
          }}
          onKeyDown={handleKeyPress}
          placeholder={`Ask ${composer.name.split(' ').pop()} a question...`}
          className="w-full rounded-xl border border-input bg-background p-3 text-sm text-foreground focus:outline-none focus:ring-1 focus:ring-primary resize-none overflow-hidden min-h-[42px] max-h-[200px] overflow-y-auto"
          rows={1}
          onInput={e => {
            const target = e.target as HTMLTextAreaElement;
            target.style.height = 'auto';
            target.style.height = `${Math.min(target.scrollHeight, 200)}px`;
          }}
          disabled={isComposerListOpen || isComposerMenuOpen}
        />
      </div>
      <div className="self-end pb-3">
      <button
      type="submit"
      disabled={!inputMessage.trim() || isComposerListOpen || isComposerMenuOpen}
      className="h-9 w-9 rounded-full bg-primary hover:bg-primary/90 text-primary-foreground
        flex items-center justify-center disabled:opacity-50 disabled:cursor-not-allowed
        transition-all hover:scale-105 active:scale-95 shadow-sm"
    >
      <ArrowUp className="w-5 h-5" strokeWidth={3} />
    </button>
      </div>
    </div>
    <p className="text-xs text-muted-foreground text-center mt-2">
      AI-generated conversation from verified sources. Does not reflect {composer.name.split(' ').pop()}&apos;s personal views.
    </p>
  </div>
</form>
    </div>
  );

  return (
    <div className="relative w-full h-full">
      <div
        className={`absolute inset-0 transition-all duration-300 ease-out ${
          !isSplitViewOpen
            ? 'opacity-100 translate-x-0'
            : 'opacity-0 translate-x-4 pointer-events-none'
        }`}
      >
        {chatContent}
      </div>

      <div
        className={`fixed inset-0 transition-all duration-300 ease-out ${
          isSplitViewOpen
            ? 'opacity-100 translate-x-0'
            : 'opacity-0 -translate-x-4 pointer-events-none'
        }`}
      >
        {isSplitViewOpen && (
          <ComposerSplitView
            composer={composer}
            isOpen={isSplitViewOpen}
            onClose={() => setIsSplitViewOpen(false)}
          >
            {chatContent}
          </ComposerSplitView>
        )}
      </div>
    </div>
  );
}

export default ChatInterface;
