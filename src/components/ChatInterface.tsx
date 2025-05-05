import { useState, useRef, useEffect, KeyboardEvent, useCallback } from 'react';
import { Composer, Message, Era, Conversation, getLastName } from '@/data/composers';
import { useConversations } from '@/hooks/useConversations';
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
  onUserSend?: (composer: Composer) => void;
  onSplitViewToggle?: (isOpen: boolean) => void;
  isComposerListOpen?: boolean;
}

export function ChatInterface({
  composer,
  onUserTyping,
  onUserSend,
  onSplitViewToggle,
  isComposerListOpen = false,
}: ChatInterfaceProps) {
  const [inputMessage, setInputMessage] = useState('');
  const messagesEndRef = useRef<HTMLDivElement>(null);
  const chatContainerRef = useRef<HTMLDivElement>(null); // Keep ref for the container
  const textareaRef = useRef<HTMLTextAreaElement>(null);
  const isMobile = useIsMobile();
  const [shouldAutoScroll, setShouldAutoScroll] = useState(true);
  const prevMessagesLengthRef = useRef(0);
  const [visibleSentences, setVisibleSentences] = useState<Record<string, number>>({});
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

  // Function to count sentences in text
  const countSentences = (text: string): number => {
    const sentences = text.split(/[.!?]+\s*/g).filter(sentence => sentence.trim().length > 0);
    return sentences.length;
  };

  // Function to get text up to n sentences
  const getTextUpToNSentences = (text: string, n: number): string => {
    const sentences = text.split(/([.!?]+\s*)/).filter(Boolean);
    let result = '';
    let count = 0;

    for (let i = 0; i < sentences.length; i++) {
      const part = sentences[i];
      result += part;
      if (part.match(/[.!?]+\s*/)) {
        count++;
        if (count >= n) break;
      }
    }

    return result;
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

  // Function to scroll user messages to bottom
  const scrollToBottom = useCallback(() => {
    if (!shouldAutoScroll) return;
    // Scroll to the end sentinel to show latest message
    setTimeout(() => {
      messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' });
    }, 100);
  }, [shouldAutoScroll]);

  // Function to scroll composer messages top into view on mobile
  const scrollComposerTop = useCallback(() => {
    const container = chatContainerRef.current;
    if (!container) return;
    setTimeout(() => {
      const composerBubbles = container.querySelectorAll('.message-bubble[data-sender="composer"]');
      if (composerBubbles.length > 0) {
        const lastComposerEl = composerBubbles[composerBubbles.length - 1] as HTMLElement;
        lastComposerEl.scrollIntoView({ behavior: 'smooth', block: 'start' });
      }
    }, 100);
  }, []);

  // Scroll effect based on messages
  useEffect(() => {
    if (currentMessages.length > prevMessagesLengthRef.current) {
      const lastMessage = currentMessages[currentMessages.length - 1];
      if (lastMessage.sender === 'composer' && isMobile) {
        scrollComposerTop();
      } else {
        scrollToBottom();
      }
    }
    prevMessagesLengthRef.current = currentMessages.length;
  }, [currentMessages, isMobile, scrollToBottom, scrollComposerTop]);

  // Add scroll listener to detect user scrolling
  useEffect(() => {
    const messageContainer = chatContainerRef.current;
    if (!messageContainer) return;

    const handleScroll = () => {
      const { scrollTop, scrollHeight, clientHeight } = messageContainer;
      // If user scrolls up more than a bit from bottom, disable auto-scroll
      const isNearBottom = scrollHeight - scrollTop - clientHeight < 100;
      if (!isNearBottom) {
        setShouldAutoScroll(false);
      } else {
        // Re-enable auto-scroll if scrolled back to bottom
        setShouldAutoScroll(true);
      }
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

  // Add effect to notify parent of split view toggle
  useEffect(() => {
    onSplitViewToggle?.(isSplitViewOpen);
  }, [isSplitViewOpen, onSplitViewToggle]);

  // Add effect to reset textarea height on closing split view
  useEffect(() => {
    if (!isSplitViewOpen) {
      // Delay to allow DOM to update and the textarea to re-render
      setTimeout(() => {
        if (textareaRef.current) {
          textareaRef.current.style.height = '48px';
        }
      }, 0);
    }
  }, [isSplitViewOpen]);

  // Show loading state
  if (!activeConversationId && currentMessages.length === 0) {
    return <div className="flex items-center justify-center h-full">Loading conversation...</div>;
  }

  const handleMessageSubmit = () => {
    if (!inputMessage.trim()) return;
    // Notify parent that user sent a message (activate chat)
    onUserSend?.(composer);

    // Create the user message
    const userMessage: Message = {
      id: uuidv4(),
      text: inputMessage.trim(),
      sender: 'user',
      timestamp: Date.now()
    };

    // Get the conversation ID (from ref to avoid stale state)
    const conversationId = currentConversationIdRef.current;

    // Enable auto-scroll when user sends a message
    setShouldAutoScroll(true);

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

    // Clear the input and reset textarea height (like chat-panel.tsx)
    setInputMessage('');
    setTimeout(() => {
      if (textareaRef.current) {
        // Clear inline height to use CSS min-height
        textareaRef.current.style.height = '';
      }
    }, 0);
  };

  const handleSendMessage = (e: React.FormEvent) => {
    e.preventDefault();
    handleMessageSubmit();
    // Clear inline height after submission
    if (textareaRef.current) {
      textareaRef.current.style.height = '';
    }
  };

  const handleKeyPress = (e: KeyboardEvent<HTMLTextAreaElement>) => {
    if (!isMobile && e.key === 'Enter' && !e.shiftKey) {
      e.preventDefault();
      handleMessageSubmit();
      // Clear inline height after Enter press
      (e.target as HTMLTextAreaElement).style.height = '';
    }
  };

  const handleResetChat = () => {
    if (composer) {
      // Clear the current messages immediately for UI responsiveness
      setCurrentMessages([]);

      // Start a new conversation
      const newConversationId = startConversation(composer);
      currentConversationIdRef.current = newConversationId;

      // Enable auto-scroll
      setShouldAutoScroll(true);

      // Reset input field
      setInputMessage('');
      // Clear inline height on reset
      setTimeout(() => {
        if (textareaRef.current) {
          textareaRef.current.style.height = '';
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
      className="relative flex flex-col h-full bg-background overflow-hidden"
    >
      <div className="relative flex items-center justify-end px-2">
        {(!isSplitViewOpen) ? (
          <div className="flex items-center justify-between px-2 py-3 md:px-5 md:py-4 -mt-1 w-full bg-secondary border-b shadow-md z-10">
            <div
              onClick={() => setIsSplitViewOpen(true)}
              className="flex items-center space-x-3 sm:space-x-6 cursor-pointer group hover:opacity-90 transition-all duration-300"
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
            size="sm"
            className="!scale-100"
          />
        </div>
        <div className="flex flex-col justify-center">
          <h2 className="font-serif font-bold text-base md:text-lg text-left group-hover:text-primary transition-colors">{composer.name}</h2>
          <div className="flex flex-col sm:flex-row sm:items-center gap-2 mt-1">
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
      {/* Assign ref to chat container */}
      <div className="flex-1 overflow-y-auto p-4 relative" ref={chatContainerRef}>
        <div className="flex flex-col min-h-[calc(100%-2rem)]">
          {currentMessages.length === 0 ? (
            <div className="flex-1 flex items-center justify-center text-muted-foreground text-sm">
              <p>Start a conversation with {getLastName(composer.name)}. Ask them about their music.</p>
            </div>
          ) : (
            <div className="space-y-4 w-full pr-7">
              {currentMessages.map((message: Message) => (
                <div
                  key={message.id}
                  className={`message-bubble flex ${
                    message.sender === 'user' ? 'justify-end' : 'justify-start'
                  }`}
                  data-sender={message.sender}
                >
                  <div
                    className={message.sender === 'user'
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
          {/* Keep this for the scroll-to-bottom logic */}
          <div ref={messagesEndRef} className="h-0" />
        </div>
      </div>

      <form onSubmit={handleSendMessage} className="sticky bottom-0 border-t bg-background/80 backdrop-blur-sm">
  <div className="pt-4 relative mx-5">
    <div className="relative flex gap-2">
      <div key={`input-${isSplitViewOpen}`} className="flex-1 relative">
        <textarea
          key={`textarea-${isSplitViewOpen}`}
          ref={textareaRef}
          value={inputMessage}
          onChange={(e) => {
            setInputMessage(e.target.value);
            onUserTyping(true);
            // Reset then resize
            e.target.style.height = '48px';
            e.target.style.height = `${Math.min(e.target.scrollHeight, 300)}px`;
          }}
          onKeyDown={handleKeyPress}
          placeholder={`Ask ${getLastName(composer.name)} a question...`}
          className="w-full bg-background pl-5 pr-20 py-3 border border-input text-sm text-foreground focus:outline-none focus:ring-1 focus:ring-primary min-h-[48px] max-h-[300px] overflow-y-auto resize-none"
          rows={1}
          disabled={isComposerListOpen || isComposerMenuOpen}
        />
        {/* Send Button */}
        <button
          type="submit"
          disabled={!inputMessage.trim() || isComposerListOpen || isComposerMenuOpen}
          className="absolute bottom-3.5 right-10 h-8 w-8 rounded-full bg-primary hover:bg-primary/90 text-primary-foreground flex items-center justify-center disabled:opacity-50 disabled:cursor-not-allowed transition-all hover:scale-105 active:scale-95 shadow-sm"
        >
          <ArrowUp className="w-5 h-5" strokeWidth={3} />
        </button>

        {/* Reset Button */}
        {!isTouch ? (
          <Tooltip delayDuration={200}>
            <TooltipTrigger asChild>
              <button
                type="button"
                disabled={isComposerListOpen || isComposerMenuOpen}
                onClick={handleResetChat}
                className="absolute bottom-3.5 right-1 h-8 w-8 rounded-full flex items-center justify-center text-muted-foreground hover:text-primary transition-colors duration-200 hover:scale-105 active:scale-95 shadow-sm disabled:opacity-50 disabled:cursor-not-allowed"
                aria-label="Reset chat"
              >
                <RefreshCcw className="w-5 h-5" strokeWidth={2} />
              </button>
            </TooltipTrigger>
            <TooltipContent side="bottom" align="center" className="text-xs">
              Reset chat
            </TooltipContent>
          </Tooltip>
        ) : (
          <button
            type="button"
            disabled={isComposerListOpen || isComposerMenuOpen}
            onClick={handleResetChat}
            className="absolute bottom-3.5 right-1 h-8 w-8 rounded-full flex items-center justify-center text-muted-foreground transition-all active:scale-95 disabled:opacity-50 disabled:cursor-not-allowed"
            aria-label="Reset chat"
          >
            <RefreshCcw className="w-5 h-5" strokeWidth={2} />
          </button>
        )}
      </div>
    </div>
  </div>
  <p className="text-xs text-muted-foreground text-center mx-11 pb-2 pt-2">
    AI-generated conversation from verified sources. Does not reflect {getLastName(composer.name)}&apos;s personal views.
  </p>
</form>

    </div>
  );

  return (
    <div className="relative w-full h-full">
      {/* Regular chat view: only show when split view is closed */}
      <div
        className={`absolute inset-0 transition-all duration-300 ease-out ${
          !isSplitViewOpen
            ? 'opacity-100 translate-x-0'
            : 'opacity-0 translate-x-4 pointer-events-none'
        }`}
      >
        {!isSplitViewOpen && chatContent}
      </div>

      {/* Split view: only render chatContent inside split view when open */}
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
