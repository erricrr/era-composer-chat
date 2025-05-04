import { useState, useRef, useEffect, KeyboardEvent, useCallback } from 'react';
import { Composer, Message, Era, Conversation, getLastName } from '@/data/composers';
import { useConversations } from '@/hooks/useConversations';
import { Button } from '@/components/ui/button';
import { RefreshCcw, ArrowUp, Music } from 'lucide-react';
import { useIsMobile } from '@/hooks/use-mobile';
import { Badge } from "@/components/ui/badge";
import { v4 as uuidv4 } from 'uuid';
import { ComposerImageViewer } from './ComposerImageViewer';
import { ComposerSplitView } from './ComposerSplitView';
import { Tooltip, TooltipContent, TooltipTrigger } from '@/components/ui/tooltip';
import { useIsTouch } from '@/hooks/useIsTouch';

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

  const isTouch = useIsTouch();

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

    // Clear the input and reset textarea height - IMPROVED RESET LOGIC
    setInputMessage('');

    // Use a small timeout to ensure React state is updated before manipulating the DOM
    setTimeout(() => {
      if (textareaRef.current) {
        textareaRef.current.style.height = '42px'; // Reset to min-height value
        textareaRef.current.rows = 1; // Ensure rows is reset
      }
    }, 0);
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

      // Reset input field and textarea height when resetting chat
      setInputMessage('');
      setTimeout(() => {
        if (textareaRef.current) {
          textareaRef.current.style.height = '42px';
          textareaRef.current.rows = 1;
        }
      }, 0);
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
      className={`relative flex flex-col h-full bg-background overflow-hidden transition-all duration-500 ease-in-out`}
    >
      <div className="relative flex items-center justify-end px-2">
        {(!isSplitViewOpen) ? (
          <div className="flex items-center justify-between px-5 py-4 -mt-1 w-full bg-secondary border-b shadow-md z-10">
            <div
              onClick={() => setIsSplitViewOpen(true)}
              className="flex items-center space-x-6 cursor-pointer group hover:opacity-90 transition-all duration-300"
            >

<Tooltip delayDuration={200}>
  <TooltipTrigger asChild>
    <div
      className="flex items-center space-x-6 cursor-pointer group hover:opacity-90 transition-all duration-300"
      onClick={(e) => {
        e.stopPropagation();
        setIsSplitViewOpen(true);
      }}
    >
      <div className="flex items-center gap-4 group">
        <div className="flex-shrink-0">
          <ComposerImageViewer
            composer={composer}
            size="md"
            className="!scale-100"
          />
        </div>
        <div className="flex flex-col justify-center">
          <h2 className="font-serif font-bold text-base md:text-lg text-left group-hover:text-primary transition-colors">{composer.name}</h2>
          <div className="flex items-center gap-2 mt-1">
            <span className="text-xs md:text-base text-muted-foreground group-hover:text-primary transition-colors">
              {composer.nationality}, {composer.birthYear}-{composer.deathYear || 'present'}
            </span>
            <div className="flex flex-wrap gap-1 truncate">
              {Array.isArray(composer.era)
                ? composer.era.map((era, idx) => (
                    <Badge key={era + idx} variant="badge">{era}</Badge>
                  ))
                : <Badge variant="badge">{composer.era}</Badge>}
            </div>
          </div>
        </div>
      </div>
    </div>
  </TooltipTrigger>
  <TooltipContent side="bottom" align="start" alignOffset={-50} className="text-xs">
    More about {getLastName(composer.name)}
</TooltipContent>
</Tooltip>
</div>

</div>
) : null}

      </div>
      <div className="flex-1 overflow-y-auto p-4 relative">
  <div className="flex flex-col min-h-[calc(100%-2rem)]">
    {currentMessages.length === 0 ? (
      <div className="flex-1 flex items-center justify-center text-muted-foreground text-sm">
        <p>Start a conversation with {getLastName(composer.name)}. Ask them about their music.</p>
      </div>
    ) : (
      <div className="space-y-4 w-full pr-7">
        {currentMessages.map((message: Message) => (
          <div key={message.id} className={`flex ${message.sender === 'user' ? 'justify-end' : 'justify-start'}`}>
            <div className={message.sender === 'user'
              ? 'max-w-[85%] rounded-2xl px-4 py-2 bg-primary text-background ml-auto shadow-sm'
              : 'max-w-[85%] rounded-2xl px-4 py-2 text-foreground bg-background'
            }
             style={{ whiteSpace: 'pre-line' }}
             >
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
  <div className="pt-4 relative mx-10">
    <div className="relative flex gap-2 border border-input ">
      <div className="flex-1 relative">
      <textarea
  ref={textareaRef}
  value={inputMessage}
  onChange={(e) => {
    setInputMessage(e.target.value);
    onUserTyping(true);
  }}
  onKeyDown={handleKeyPress}
  placeholder={`Ask ${getLastName(composer.name)} a question...`}
  className="mb-10 w-full bg-background pl-5 pr-5 py-2.5 text-sm overflow-hidden text-foreground focus:outline-none focus:ring-1 focus:ring-primary min-h-[42px] max-h-[250px] overflow-y-auto"
  rows={1}
  onInput={(e) => {
    const target = e.target as HTMLTextAreaElement;
    target.style.height = 'auto';
    target.style.height = `${Math.min(target.scrollHeight, 200)}px`;
  }}
  disabled={isComposerListOpen || isComposerMenuOpen}
/>
        {/* Send Button (bottom-right inside textarea) */}
        <button
          type="submit"
          disabled={!inputMessage.trim() || isComposerListOpen || isComposerMenuOpen}
          className="absolute bottom-2 right-2 h-8 w-8 rounded-full bg-primary hover:bg-primary/90 text-primary-foreground flex items-center justify-center disabled:opacity-50 disabled:cursor-not-allowed transition-all hover:scale-105 active:scale-95 shadow-sm"
        >
          <ArrowUp className="w-5 h-5" strokeWidth={3} />
        </button>

        {/* Reset Button (bottom-left inside input container) */}
        {!isTouch ? (
        <Tooltip delayDuration={200}>
          <TooltipTrigger asChild>
            <button
              type="button"
              onClick={handleResetChat}
              className="absolute bottom-3 left-2 h-8 w-8 rounded-full flex items-center justify-center text-primary transition-all hover:scale-105 active:scale-95 shadow-sm"
              aria-label="Reset chat"
            >
              <RefreshCcw className="w-5 h-5" strokeWidth={2.5} />
            </button>
          </TooltipTrigger>
          <TooltipContent side="right" align="center" className="text-xs">
            Reset chat
          </TooltipContent>
        </Tooltip>
        ) : (
          <button
            type="button"
            onClick={handleResetChat}
            className="absolute bottom-1 left-2 h-8 w-8 rounded-full flex items-center justify-center text-primary-foreground transition-all hover:scale-105 active:scale-95 shadow-sm"
          >
            <RefreshCcw className="w-5 h-5" strokeWidth={3} />
          </button>
        )}
      </div>

    </div>
  </div>
  <p className="text-xs text-muted-foreground text-center mx-11">
    AI-generated conversation from verified sources. Does not reflect {getLastName(composer.name)}&apos;s personal views.
  </p>

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
            <div className="h-full">{chatContent}</div>
          </ComposerSplitView>
        )}
      </div>
    </div>
  );
}

export default ChatInterface;
