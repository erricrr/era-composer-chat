import { useState, useRef, useEffect, KeyboardEvent, useCallback } from 'react';
import { Composer, Message, Conversation, getLastName } from '@/data/composers';
import { useConversations } from '@/hooks/useConversations';
import { RefreshCcw, ArrowUp, Music, Mic } from 'lucide-react';
import { useIsMobile } from '@/hooks/use-mobile';
import { Badge } from "@/components/ui/badge";
import { v4 as uuidv4 } from 'uuid';
import { ComposerImageViewer } from './ComposerImageViewer';
import { ComposerSplitView } from './ComposerSplitView';
import { Tooltip, TooltipContent, TooltipTrigger, TooltipPortal } from '@/components/ui/tooltip';
import { useIsTouch } from '@/hooks/useIsTouch';
import { useGeminiChat } from '@/hooks/useGeminiChat';
import ReactMarkdown from 'react-markdown';
import { ChatMessage } from '@/types/gemini';

// Add type definitions for Web Speech API
interface SpeechRecognitionEvent extends Event {
  results: SpeechRecognitionResultList;
  resultIndex: number;
  error: any;
}

interface SpeechRecognitionResultList {
  length: number;
  item(index: number): SpeechRecognitionResult;
  [index: number]: SpeechRecognitionResult;
}

interface SpeechRecognitionResult {
  isFinal: boolean;
  length: number;
  item(index: number): SpeechRecognitionAlternative;
  [index: number]: SpeechRecognitionAlternative;
}

interface SpeechRecognitionAlternative {
  transcript: string;
  confidence: number;
}

interface SpeechRecognition extends EventTarget {
  lang: string;
  continuous: boolean;
  interimResults: boolean;
  maxAlternatives: number;
  start(): void;
  stop(): void;
  abort(): void;
  onresult: (event: SpeechRecognitionEvent) => void;
  onerror: (event: SpeechRecognitionEvent) => void;
  onstart: (event: Event) => void;
  onend: (event: Event) => void;
}

interface SpeechRecognitionConstructor {
  new (): SpeechRecognition;
}

declare global {
  interface Window {
    SpeechRecognition: SpeechRecognitionConstructor;
    webkitSpeechRecognition: SpeechRecognitionConstructor;
  }
}

interface ChatInterfaceProps {
  composer: Composer;
  onUserTyping: (isTyping: boolean) => void;
  onUserSend?: (composer: Composer) => void;
  onSplitViewToggle?: (isOpen: boolean) => void;
  isComposerListOpen?: boolean;
  isActiveChatsOpen?: boolean;
}

export function ChatInterface({
  composer,
  onUserTyping,
  onUserSend,
  onSplitViewToggle,
  isComposerListOpen = false,
  isActiveChatsOpen = false,
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
  const [isDictating, setIsDictating] = useState(false);

  // Display state controlled entirely by this component
  const [currentMessages, setCurrentMessages] = useState<Message[]>([]);

  // Reference to track current conversation ID to prevent stale state issues
  const currentConversationIdRef = useRef<string | null>(null);

  // State to track if the composer menu is open
  const [isComposerMenuOpen, setIsComposerMenuOpen] = useState(false);

  // Reference for speech recognition
  const recognitionRef = useRef<SpeechRecognition | null>(null);

  const {
    activeConversation,
    activeConversationId,
    startConversation,
    addMessage,
    getConversationsForComposer,
    setActiveConversationId
  } = useConversations();

  const {
    isGenerating,
    error: geminiError,
    initializeChat,
    generateResponse
  } = useGeminiChat();

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

  // Effect to handle composer changes and initialize Gemini chat with existing messages
  useEffect(() => {
    console.log(`[ChatInterface] Composer changed to: ${composer.id}`);

    // Reset UI state
    setCurrentMessages([]);
    setShouldAutoScroll(true);

    const composerConversations = getConversationsForComposer(composer.id);
    let loadedMessages: Message[] = [];

    if (composerConversations.length > 0) {
      // Use the most recent conversation
      const mostRecentConversation = composerConversations.reduce(
        (latest, current) => current.lastUpdated > latest.lastUpdated ? current : latest
      );

      // Set active conversation ID
      const conversationId = mostRecentConversation.id;
      setActiveConversationId(conversationId);
      currentConversationIdRef.current = conversationId;

      // Load messages from localStorage if available
      const storageConversation = getConversationFromStorage(conversationId);
      if (storageConversation && storageConversation.messages.length > 0) {
        loadedMessages = storageConversation.messages;
      } else {
        loadedMessages = mostRecentConversation.messages;
      }
    } else {
      // Start a new conversation
      const newConversationId = startConversation(composer);
      currentConversationIdRef.current = newConversationId;
      loadedMessages = [];
    }

    // Update UI messages
    setCurrentMessages(loadedMessages);

    // Seed Gemini service with existing chat history to prevent duplicate greeting
    const serviceChatHistory = (
      loadedMessages.map(msg => ({
        role: msg.sender === 'user' ? 'user' : 'model',
        text: msg.text,
      }))
    ) as ChatMessage[];
    initializeChat(composer, serviceChatHistory);
  }, [composer.id, initializeChat]); // eslint-disable-line react-hooks/exhaustive-deps

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
      if (lastMessage.sender === 'composer') {
        scrollComposerTop();
      } else {
        scrollToBottom();
      }
    }
    prevMessagesLengthRef.current = currentMessages.length;
  }, [currentMessages, scrollToBottom, scrollComposerTop]);

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

  // Add global CSS for mic pulse animation
  useEffect(() => {
    // Add global CSS for mic pulse animation
    const style = document.createElement('style');
    style.textContent = `
      @keyframes micPulse {
        0% {
          box-shadow: 0 0 0 0 rgba(239, 68, 68, 0.4);
        }
        70% {
          box-shadow: 0 0 0 10px rgba(239, 68, 68, 0);
        }
        100% {
          box-shadow: 0 0 0 0 rgba(239, 68, 68, 0);
        }
      }
      .mic-pulse-animation {
        animation: micPulse 1.5s infinite;
      }
    `;
    document.head.appendChild(style);

    return () => {
      document.head.removeChild(style);
    };
  }, []);

  // Effect to handle edge cases with input clearing
  useEffect(() => {
    // If the input should be empty but contains only dictation markers, clear it
    if (inputMessage === '[listening]' || inputMessage.trim() === '') {
      if (textareaRef.current) {
        textareaRef.current.value = '';
        textareaRef.current.style.height = '48px';
      }
    }
  }, [inputMessage]);

  // Auto-focus textarea when composer changes or split view toggles
  useEffect(() => {
    if (!isSplitViewOpen && textareaRef.current) {
      textareaRef.current.focus();
    }
  }, [composer.id, isSplitViewOpen]);

  // Show loading state
  if (!activeConversationId && currentMessages.length === 0) {
    return <div className="flex items-center justify-center h-full">Loading conversation...</div>;
  }

  const handleMessageSubmit = async () => {
    if (!inputMessage.trim() || isGenerating) return;

    // Stop dictation if active
    if (isDictating && recognitionRef.current) {
      recognitionRef.current.stop();
      setIsDictating(false);
      recognitionRef.current = null;
    }

    // Clean up any [listening] markers from message text
    const cleanMessage = inputMessage.trim().replace(/\s*\[listening\]\s*$/g, '');

    // Notify parent that user sent a message (activate chat)
    onUserSend?.(composer);

    // Create the user message
    const userMessage: Message = {
      id: uuidv4(),
      text: cleanMessage,
      sender: 'user',
      timestamp: Date.now()
    };

    // Get the conversation ID (from ref to avoid stale state)
    const conversationId = currentConversationIdRef.current;

    // Enable auto-scroll when user sends a message
    setShouldAutoScroll(true);

    try {
      // Update UI immediately with user message
      setCurrentMessages(messages => [...messages, userMessage]);

      // Clear input immediately so the textarea empties before the AI responds
      setInputMessage('');
      if (textareaRef.current) {
        textareaRef.current.value = '';
        textareaRef.current.style.height = '48px';
      }

      if (!conversationId) {
        console.log("[ChatInterface] No conversation ID available, starting new conversation");
        const newConversationId = startConversation(composer);
        currentConversationIdRef.current = newConversationId;
      }

      // Persist user message
      addMessage(conversationId || currentConversationIdRef.current!, userMessage.text, 'user');

      // Generate AI response
      const responseText = await generateResponse(cleanMessage);

      const composerMessage: Message = {
        id: uuidv4(),
        text: responseText,
        sender: 'composer',
        timestamp: Date.now()
      };

      // Update UI with composer's response
      setCurrentMessages(messages => [...messages, composerMessage]);

      // Persist composer message
      addMessage(conversationId || currentConversationIdRef.current!, responseText, 'composer');

    } catch (error) {
      console.error('Error in message submission:', error);
      // Error is handled by useGeminiChat and displayed in UI if needed
    }
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

  // Function to handle dictation
  const handleDictation = () => {
    // If already dictating, stop it
    if (isDictating && recognitionRef.current) {
      recognitionRef.current.stop();
      setIsDictating(false);
      recognitionRef.current = null;
      return;
    }

    if (!window.SpeechRecognition && !window.webkitSpeechRecognition) {
      // Show error if browser doesn't support Speech Recognition
      alert("Your browser doesn't support speech recognition. Please try using Chrome or Edge.");
      return;
    }

    const SpeechRecognition = window.SpeechRecognition || window.webkitSpeechRecognition;
    const recognition = new SpeechRecognition();

    // Store reference to recognition object
    recognitionRef.current = recognition;

    // Track the base input before dictation started - will be empty after sending a message
    const baseInput = inputMessage;
    // Store the last transcript to avoid duplications
    let lastTranscript = '';

    recognition.lang = 'en-US';
    recognition.continuous = true; // Keep listening until explicitly stopped
    recognition.interimResults = true; // Show interim results
    recognition.maxAlternatives = 1;

    recognition.onstart = () => {
      setIsDictating(true);

      // Focus the textarea when dictation starts to show the focus ring
      if (textareaRef.current) {
        textareaRef.current.focus();
      }
    };

    recognition.onresult = (event) => {
      // Build the complete transcript from current recognition session
      let finalTranscript = '';
      let interimTranscript = '';

      // Process all results from this session
      for (let i = 0; i < event.results.length; i++) {
        const result = event.results[i];
        if (result.isFinal) {
          finalTranscript += result[0].transcript;
        } else {
          interimTranscript += result[0].transcript;
        }
      }

      // Combine with the base input
      const combinedTranscript = finalTranscript;

      // Only update if we have new content
      if (combinedTranscript !== lastTranscript) {
        lastTranscript = combinedTranscript;

        // Set the input with appropriate formatting
        setInputMessage(
          baseInput
            ? `${baseInput} ${combinedTranscript}${interimTranscript ? ' ' + interimTranscript + ' [listening]' : ''}`
            : `${combinedTranscript}${interimTranscript ? ' ' + interimTranscript + ' [listening]' : ''}`
        );
      } else if (interimTranscript) {
        // Only update interim results if they've changed
        setInputMessage(
          baseInput
            ? `${baseInput} ${finalTranscript} ${interimTranscript} [listening]`
            : `${finalTranscript} ${interimTranscript} [listening]`
        );
      }

      // Ensure textarea stays focused while dictating
      if (textareaRef.current) {
        textareaRef.current.focus();

        // Resize the textarea after adding text
        textareaRef.current.style.height = '48px';
        textareaRef.current.style.height = `${Math.min(textareaRef.current.scrollHeight, 300)}px`;
      }
    };

    recognition.onend = () => {
      // Remove any [listening] markers
      setInputMessage(prevInput => {
        if (prevInput && prevInput.includes('[listening]')) {
          return prevInput.split('[listening]')[0].trim();
        }
        return prevInput;
      });

      // If dictation should continue but ended automatically, restart it
      if (isDictating && recognitionRef.current) {
        try {
          recognition.start();
          return; // Don't reset state if continuing
        } catch (e) {
          console.error('Failed to restart recognition', e);
          // Fall through to reset state
        }
      }

      // Default handling if we're stopping
      setIsDictating(false);
      recognitionRef.current = null;

      // If the input is now empty (like after sending), make sure it stays empty
      if (!inputMessage.trim() || inputMessage.trim() === '[listening]') {
        setInputMessage('');
        if (textareaRef.current) {
          textareaRef.current.value = '';
          textareaRef.current.style.height = '48px';
        }
      }
    };

    recognition.onerror = (event) => {
      console.error('Speech recognition error', event.error);

      // Clean up any [listening] markers
      setInputMessage(prevInput => {
        if (prevInput && prevInput.includes('[listening]')) {
          return prevInput.split('[listening]')[0].trim();
        }
        return prevInput;
      });

      // Only stop if it's a fatal error
      if (event.error === 'not-allowed' || event.error === 'service-not-allowed') {
        setIsDictating(false);
        recognitionRef.current = null;
      } else if (isDictating && recognitionRef.current) {
        // For other errors, try to restart if still active
        try {
          setTimeout(() => {
            recognition.start();
          }, 1000);
          return; // Keep state as dictating
        } catch (e) {
          console.error('Failed to restart after error', e);
          // Fall through to reset state
        }
      }

      // Default error handling
      setIsDictating(false);
      recognitionRef.current = null;
    };

    recognition.start();
  };

  const chatContent = (
    <div
      className="relative flex flex-col h-full bg-background overflow-hidden chat-container"
    >
      <div className="relative flex items-center justify-end px-2">
        {(!isSplitViewOpen) ? (
          <div className="flex items-center justify-between px-5 py-5 pb-2.5 -mt-1 w-full bg-primary-foreground border-b shadow-md z-10">
            <Tooltip>
              <TooltipTrigger asChild>
                <button
                  type="button"
                  aria-label={`Open split view for ${composer.name}`}
                  aria-expanded={isSplitViewOpen}
                  className="chat-split-btn appearance-none border-none outline-none focus-visible:ring-2 focus-visible:ring-primary focus-visible:ring-offset-0 flex items-center space-x-6 cursor-pointer hover:opacity-90 transition-all duration-300"
                  onClick={(e) => {
                    e.stopPropagation();
                    setIsSplitViewOpen(true);
                  }}
                  onKeyDown={(e) => {
                    e.stopPropagation();
                    if (e.key === 'Enter' || e.key === ' ') {
                      e.preventDefault();
                      setIsSplitViewOpen(true);
                    }
                  }}
                >
                  <div className="flex items-center gap-4">
                    <div className="flex-shrink-0">
                      <ComposerImageViewer
                        composer={composer}
                        size="sm"
                        className="!scale-100"
                      />
                    </div>
                    <div className="flex flex-col justify-center text-left">
                      <h2 className="font-serif font-bold text-base md:text-lg hover:text-primary transition-colors">{composer.name}</h2>
                      <div className="flex flex-col sm:flex-row sm:items-center gap-2 mt-1">
                        <span className="text-xs md:text-base text-muted-foreground hover:text-primary transition-colors">
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
                </button>
              </TooltipTrigger>
              <TooltipContent side="bottom" align="start" alignOffset={-20} className="text-xs">
                More about {getLastName(composer.name)}
              </TooltipContent>
            </Tooltip>
          </div>
        ) : null}
      </div>

      {/* Assign ref to chat container */}
      <div className="flex-1 overflow-y-auto overscroll-contain p-4 relative chat-container" ref={chatContainerRef}>
        <div className="flex flex-col min-h-[calc(100%-2rem)]">
          {currentMessages.length === 0 ? (
            <div className="flex-1 flex items-center justify-center text-muted-foreground text-sm">
              <p>Start a conversation with {getLastName(composer.name)}. Ask them about their music.</p>
            </div>
          ) : (
            <div className="space-y-4 w-full pr-7" aria-live="polite" aria-relevant="additions">
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
                  >
                    <ReactMarkdown
                      components={{
                        // Style italics with proper font style
                        em: ({ node, ...props }) => <em className="italic" {...props} />,
                        // Preserve line breaks
                        p: ({ children }) => <p style={{ whiteSpace: 'pre-line' }}>{children}</p>
                      }}
                    >
                      {message.text}
                    </ReactMarkdown>
                  </div>
                </div>
              ))}
              {isGenerating && (
                <div className="message-bubble flex justify-start">
                  <div className="max-w-[85%] rounded-2xl px-4 py-2 text-foreground bg-background">
                    <span className="animate-pulse">Composing response...</span>
                  </div>
                </div>
              )}
              {geminiError && (
                <div className="message-bubble flex justify-start">
                  <div className="max-w-[85%] rounded-2xl px-4 py-2 text-destructive bg-destructive/10">
                    {geminiError}
                  </div>
                </div>
              )}
            </div>
          )}
          {/* Keep this for the scroll-to-bottom logic */}
          <div ref={messagesEndRef} className="h-0" />
        </div>
      </div>

      <form onSubmit={handleSendMessage} className="sticky bottom-0 border-t bg-background/80 backdrop-blur-sm pb-4 chat-container">
        <div className="pt-4 px-3 sm:px-5 relative z-10">
          <div className="relative flex gap-2 max-w-full">
            <div key={`input-${isSplitViewOpen}`} className="flex-1 relative max-w-full">
              <textarea
                id="chat-input"
                aria-label="Type your message"
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
                placeholder={`Ask a question...`}
                className={`w-full bg-background pl-4 pr-28 py-3 border border-input text-sm text-foreground
                  outline-none focus-visible:ring-2 focus-visible:ring-primary focus-visible:ring-offset-0
                  ${isDictating ? 'ring-1 ring-primary' : ''}
                  min-h-[48px] max-h-[300px] overflow-y-auto resize-none
                  [&::-webkit-scrollbar]:hidden [-ms-overflow-style:none] [scrollbar-width:none]
                  touch-manipulation`}
                style={{
                  fontSize: '16px', // Prevent iOS zoom
                  maxWidth: '100%',
                  boxSizing: 'border-box',
                  WebkitTextSizeAdjust: '100%',
                  MozTextSizeAdjust: '100%',
                  textSizeAdjust: '100%'
                }}
                rows={1}
                disabled={isComposerListOpen || isComposerMenuOpen}
              />

              {/* Control buttons container - make it stick to viewport on mobile */}
              <div className="absolute bottom-3.5 right-0 flex items-center gap-1.5 px-1.5">
                {/* Dictation Button */}
                <div className="z-20">
                  <Tooltip>
                    <TooltipTrigger asChild>
                      <button
                        type="button"
                        disabled={isComposerListOpen || isComposerMenuOpen}
                        onClick={handleDictation}
                        className={`h-8 w-8 rounded-full flex items-center justify-center
                          ${isComposerListOpen || isComposerMenuOpen ? 'opacity-50 cursor-not-allowed' : ''}
                          ${isDictating
                            ? 'bg-destructive text-background mic-pulse-animation'
                            : 'text-muted-foreground hover:text-primary'
                          } transition-colors duration-200 hover:scale-105 active:scale-95`}
                        aria-label={isDictating ? "Stop dictating" : "Dictate"}
                      >
                        <Mic className="w-5 h-5" strokeWidth={2} />
                      </button>
                    </TooltipTrigger>
                    <TooltipPortal>
                      <TooltipContent
                        side="top"
                        align="center"
                        className="text-xs"
                        sideOffset={5}
                      >
                        {isDictating ? 'Stop dictating' : 'Dictate'}
                      </TooltipContent>
                    </TooltipPortal>
                  </Tooltip>
                </div>

                {/* Send Button */}
                <Tooltip>
                  <TooltipTrigger asChild>
                    <button
                      type="submit"
                      disabled={!inputMessage.trim() || isComposerListOpen || isComposerMenuOpen}
                      className={`h-8 w-8 rounded-full flex items-center justify-center disabled:opacity-50 disabled:cursor-not-allowed transition-all duration-200 hover:scale-105 active:scale-95 shadow-sm ${
                        inputMessage.trim()
                          ? 'bg-primary text-background hover:bg-primary/90'
                          : 'text-muted-foreground hover:text-primary'
                      }`}
                    >
                      <ArrowUp className="w-5 h-5" strokeWidth={2} />
                    </button>
                  </TooltipTrigger>
                  <TooltipPortal>
                    <TooltipContent side="top" align="center" className="text-xs">
                      Send
                    </TooltipContent>
                  </TooltipPortal>
                </Tooltip>

                {/* Reset Button */}
                {!isTouch ? (
                  <Tooltip>
                    <TooltipTrigger asChild>
                      <button
                        type="button"
                        disabled={isComposerListOpen || isComposerMenuOpen}
                        onClick={handleResetChat}
                        className="h-8 w-8 rounded-full flex items-center justify-center text-muted-foreground hover:text-primary transition-colors duration-200 hover:scale-105 active:scale-95 shadow-sm disabled:opacity-50 disabled:cursor-not-allowed"
                        aria-label="Reset chat"
                      >
                        <RefreshCcw className="w-5 h-5" strokeWidth={2} />
                      </button>
                    </TooltipTrigger>
                    <TooltipPortal>
                      <TooltipContent side="top" align="center" className="text-xs">
                        Reset chat
                      </TooltipContent>
                    </TooltipPortal>
                  </Tooltip>
                ) : (
                  <button
                    type="button"
                    disabled={isComposerListOpen || isComposerMenuOpen}
                    onClick={handleResetChat}
                    className="h-8 w-8 rounded-full flex items-center justify-center text-muted-foreground transition-all active:scale-95 disabled:opacity-50 disabled:cursor-not-allowed"
                    aria-label="Reset chat"
                  >
                    <RefreshCcw className="w-5 h-5" strokeWidth={2} />
                  </button>
                )}
              </div>
            </div>
          </div>
        </div>
        <p
          tabIndex={0}
          className="
            text-xs text-muted-foreground text-center
            mx-11 py-1
            focus:outline-none
            focus-visible:ring-1
            focus-visible:ring-primary
            focus-visible:ring-offset-1
            rounded-none
          "
        >
          AI-generated chat. Not {getLastName(composer.name)}&apos;s own words.
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
            isActiveChatsOpen={isActiveChatsOpen}
          >
            <div className="h-full">{chatContent}</div>
          </ComposerSplitView>
        )}
      </div>
    </div>
  );
}

export default ChatInterface;
