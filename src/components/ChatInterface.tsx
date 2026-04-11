import { useState, useRef, useEffect, useLayoutEffect, KeyboardEvent, useCallback } from 'react';
import { Composer, Message, Conversation, getLastName } from '@/data/composers';
import { useConversations } from '@/hooks/useConversations';
import { MoreVertical, ArrowUp, Music, Mic } from 'lucide-react';
import { useIsMobile } from '@/hooks/use-mobile';
import { Badge } from "@/components/ui/badge";
import { v4 as uuidv4 } from 'uuid';
import { ComposerImageViewer } from './ComposerImageViewer';
import { ComposerSplitView } from './ComposerSplitView';
import { Tooltip, TooltipContent, TooltipTrigger, TooltipPortal } from '@/components/ui/tooltip';
import { useIsTouch } from '@/hooks/useIsTouch';
import { useStandaloneDisplayMode } from '@/hooks/useStandaloneDisplayMode';
import { useGeminiChat } from '@/hooks/useGeminiChat';
import ReactMarkdown from 'react-markdown';
import { ChatMessage } from '@/types/gemini';
import { toast } from 'sonner';
import { useOnlineStatus } from '@/hooks/useOnlineStatus';
import { useVirtualKeyboard, scrollChatTextareaIntoView, syncKeyboardVisualInset } from '@/hooks/useVirtualKeyboard';
import {
  AlertDialog,
  AlertDialogAction,
  AlertDialogCancel,
  AlertDialogContent,
  AlertDialogDescription,
  AlertDialogFooter,
  AlertDialogHeader,
  AlertDialogTitle,
} from '@/components/ui/alert-dialog';
import { buttonVariants } from '@/components/ui/button';
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from '@/components/ui/dropdown-menu';
import { Sheet, SheetContent, SheetHeader, SheetTitle } from '@/components/ui/sheet';
import { cn } from '@/lib/utils';

// Add type definitions for Web Speech API
interface SpeechRecognitionEvent extends Event {
  results: SpeechRecognitionResultList;
  resultIndex: number;
  error: unknown;
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
  onClose?: () => void;
  onOpenComposerMenu?: () => void;
}

export function ChatInterface({
  composer,
  onUserTyping,
  onUserSend,
  onSplitViewToggle,
  isComposerListOpen = false,
  isActiveChatsOpen = false,
  onClose,
  onOpenComposerMenu,
}: ChatInterfaceProps) {
  const [inputMessage, setInputMessage] = useState('');
  const messagesEndRef = useRef<HTMLDivElement>(null);
  const chatContainerRef = useRef<HTMLDivElement>(null); // Keep ref for the container
  /** Persists message list scroll when chat content remounts between regular and split layout. */
  const savedChatScrollTopRef = useRef(0);
  /**
   * When true, restore by snapping to max scroll after toggle — not raw scrollTop.
   * Layout/remount changes scrollHeight (header padding, panel height), so the previous numeric max scroll is no longer the bottom.
   */
  const savedChatWasAtBottomRef = useRef(false);
  const textareaRef = useRef<HTMLTextAreaElement>(null);
  const isMobile = useIsMobile();
  const isOnline = useOnlineStatus();
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

  // Add state to track recognition initialization errors
  const [recognitionErrors, setRecognitionErrors] = useState<string[]>([]);

  const [resetConfirmOpen, setResetConfirmOpen] = useState(false);
  const [chatActionsMenuOpen, setChatActionsMenuOpen] = useState(false);

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
  const standaloneDisplay = useStandaloneDisplayMode();

  useVirtualKeyboard(isMobile || isTouch, textareaRef);

  const handleChatInputFocus = useCallback(() => {
    if (isMobile || isTouch) {
      syncKeyboardVisualInset();
      scrollChatTextareaIntoView(textareaRef.current);
      window.setTimeout(() => syncKeyboardVisualInset(), 250);
    }
  }, [isMobile, isTouch]);

  // Add Chrome detection helper
  const isChrome = typeof window !== 'undefined' &&
    (navigator.userAgent.indexOf("Chrome") !== -1 ||
     navigator.userAgent.indexOf("Chromium") !== -1);

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

  // Message list scroll: persist position for split toggle remounts; keep near-bottom detection for auto-scroll.
  const handleChatContainerScroll = useCallback(() => {
    const messageContainer = chatContainerRef.current;
    if (!messageContainer) return;
    const { scrollTop, scrollHeight, clientHeight } = messageContainer;
    savedChatScrollTopRef.current = scrollTop;
    const gapToBottom = scrollHeight - scrollTop - clientHeight;
    // Small epsilon: browsers may leave 0.5–1px subpixel gap at max scroll.
    savedChatWasAtBottomRef.current = gapToBottom <= 3;
    const isNearBottom = gapToBottom < 100;
    setShouldAutoScroll(isNearBottom);
  }, []);

  useLayoutEffect(() => {
    const apply = () => {
      const el = chatContainerRef.current;
      if (!el) return;
      if (savedChatWasAtBottomRef.current) {
        el.scrollTop = Math.max(0, el.scrollHeight - el.clientHeight);
      } else {
        el.scrollTop = savedChatScrollTopRef.current;
      }
    };
    apply();
    // Mobile: layout may settle after flex/panel sizing; second frame matches visual scroll owner.
    const id = window.requestAnimationFrame(() => {
      window.requestAnimationFrame(apply);
    });
    return () => window.cancelAnimationFrame(id);
  }, [isSplitViewOpen]);

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

  // Add effect to handle edge cases with input clearing
  useEffect(() => {
    // If the input should be empty but contains only dictation markers, clear it
    if (inputMessage === '[listening]' || inputMessage.trim() === '') {
      if (textareaRef.current) {
        textareaRef.current.value = '';
        textareaRef.current.style.height = '48px';
      }
    }
  }, [inputMessage]);

  // Auto-focus textarea when composer changes or split view toggles.
  // preventScroll avoids the browser scrolling the message list (especially after restoring scroll from split view).
  useEffect(() => {
    if (!isSplitViewOpen && textareaRef.current) {
      textareaRef.current.focus({ preventScroll: true });
    }
  }, [composer.id, isSplitViewOpen]);

  // Show loading state
  if (!activeConversationId && currentMessages.length === 0) {
    return <div className="flex items-center justify-center h-full">Loading conversation...</div>;
  }

  // Function to safely initialize and clean up speech recognition
  const initializeSpeechRecognition = () => {
    // Always ensure previous recognition instance is properly cleaned up
    if (recognitionRef.current) {
      try {
        recognitionRef.current.stop();
        recognitionRef.current.onresult = null;
        recognitionRef.current.onerror = null;
        recognitionRef.current.onend = null;
        recognitionRef.current.onstart = null;
        recognitionRef.current = null;
      } catch (e) {
        console.error('Error cleaning up previous recognition instance:', e);
      }
    }

    // Check for browser compatibility
    const SpeechRecognition = window.SpeechRecognition || window.webkitSpeechRecognition;
    if (!SpeechRecognition) {
      alert("Speech recognition is not supported in your browser. Please try Chrome, Edge, or Safari.");
      return null;
    }

    try {
      const recognition = new SpeechRecognition();

      // Detect browser for optimal settings
      const isEdge = navigator.userAgent.indexOf("Edg") !== -1;
      const isFirefox = navigator.userAgent.indexOf("Firefox") !== -1;
      const isSafari = /^((?!chrome|android).)*safari/i.test(navigator.userAgent);

      // Configure recognition settings based on browser
      recognition.lang = navigator.language || 'en-US';
      recognition.continuous = !isSafari; // Safari works better with continuous: false
      recognition.interimResults = true;
      recognition.maxAlternatives = 1;

      // Special handling for Firefox
      if (isFirefox) {
        recognition.continuous = false;
        recognition.interimResults = false;
      }

      // For Edge, use specific settings
      if (isEdge) {
        recognition.lang = 'en-US'; // Edge works best with en-US
      }

      return recognition;
    } catch (e) {
      console.error('Error initializing speech recognition:', e);
      alert("There was an error initializing speech recognition. Please try again or use a different browser.");
      return null;
    }
  };

  // Enhanced microphone permission check
  const checkMicrophonePermission = async (): Promise<boolean> => {
    try {
      // First try the permissions API
      if (navigator.permissions && navigator.permissions.query) {
        try {
          const result = await navigator.permissions.query({ name: 'microphone' as PermissionName });

          if (result.state === 'granted') return true;
          if (result.state === 'denied') {
            alert("Microphone access is blocked. Please allow microphone access in your browser settings.");
            return false;
          }
        } catch (e) {
          console.log('Permissions API not fully supported, falling back to getUserMedia');
        }
      }

      // Fallback to getUserMedia
      const stream = await navigator.mediaDevices.getUserMedia({ audio: true });
      // Stop all tracks immediately - we just needed the permission
      stream.getTracks().forEach(track => track.stop());
      return true;
    } catch (e) {
      console.error('Error checking microphone permission:', e);
      alert("Unable to access microphone. Please ensure microphone permissions are granted and your microphone is working.");
      return false;
    }
  };

  /** Clears the message field after send. On touch devices, blurs to dismiss the virtual keyboard; on desktop, keeps focus for quick follow-ups. */
  const cleanupTextarea = () => {
    setInputMessage('');
    const el = textareaRef.current;
    if (!el) return;

    el.value = '';
    el.style.height = '48px';
    el.style.display = 'none';
    void el.offsetHeight;
    el.style.display = '';

    const dismissVirtualKeyboard = isTouch || isMobile;
    if (dismissVirtualKeyboard) {
      el.blur();
      document.documentElement.classList.remove('keyboard-visible');
      syncKeyboardVisualInset();
    } else {
      el.focus();
    }

    requestAnimationFrame(() => {
      const t = textareaRef.current;
      if (!t) return;
      t.value = '';
      t.style.height = '48px';
    });
  };

  const handleMessageSubmit = async () => {
    if (!inputMessage.trim() || isGenerating) return;

    if (!isOnline) {
      toast.error("You are offline. Connect to the internet to get a reply from the composer.");
      return;
    }

    // Store the clean message before clearing state
    const cleanMessage = inputMessage.trim().replace(/\s*\[listening\]\s*$/g, '');

    // Stop dictation if active
    if (isDictating && recognitionRef.current) {
      try {
        recognitionRef.current.stop();
        setIsDictating(false);
        recognitionRef.current = null;
      } catch (e) {
        console.error('Error stopping dictation:', e);
      }
    }

    // Immediate cleanup
    cleanupTextarea();

    // Additional cleanup with delay for Safari
    setTimeout(() => {
      cleanupTextarea();
    }, 50);

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

      // Final cleanup to ensure textarea is clear
      cleanupTextarea();

    } catch (error) {
      console.error('Error in message submission:', error);
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

  // Handle textarea value changes
  const handleTextareaChange = (e: React.ChangeEvent<HTMLTextAreaElement>) => {
    const value = e.target.value;
    setInputMessage(value);
    onUserTyping(true);

    // Adjust height
    e.target.style.height = '48px';
    e.target.style.height = `${Math.min(e.target.scrollHeight, 300)}px`;
  };

  const performResetChat = () => {
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

  // Enhanced dictation handler
  const handleDictation = async () => {
    // If already dictating, stop it
    if (isDictating && recognitionRef.current) {
      try {
        recognitionRef.current.stop();
        setIsDictating(false);
        recognitionRef.current = null;
        return;
      } catch (e) {
        console.error('Error stopping dictation:', e);
      }
    }

    // Check microphone permissions first
    const hasMicrophonePermission = await checkMicrophonePermission();
    if (!hasMicrophonePermission) return;

    // Detect browser for optimal settings
    const isSafari = /^((?!chrome|android).)*safari/i.test(navigator.userAgent);

    // Initialize recognition with browser-specific settings
    const recognition = initializeSpeechRecognition();
    if (!recognition) return;

    // Store reference and base input
    recognitionRef.current = recognition;
    const baseInput = inputMessage;
    let lastTranscript = '';
    let retryCount = 0;
    const MAX_RETRIES = 3;

    // Set up recognition handlers
    recognition.onstart = () => {
      setIsDictating(true);
      if (textareaRef.current) {
        textareaRef.current.focus();
      }
    };

    recognition.onresult = (event) => {
      let finalTranscript = '';
      let interimTranscript = '';

      for (let i = 0; i < event.results.length; i++) {
        const result = event.results[i];
        if (result.isFinal) {
          finalTranscript += result[0].transcript;
          retryCount = 0; // Reset retry count on successful result
        } else {
          interimTranscript += result[0].transcript;
        }
      }

      // Only update if we have new content
      if (finalTranscript !== lastTranscript || interimTranscript) {
        lastTranscript = finalTranscript;
        setInputMessage(
          baseInput
            ? `${baseInput} ${finalTranscript}${interimTranscript ? ' ' + interimTranscript + ' [listening]' : ''}`
            : `${finalTranscript}${interimTranscript ? ' ' + interimTranscript + ' [listening]' : ''}`
        );

        // Ensure textarea stays focused and properly sized
        if (textareaRef.current) {
          textareaRef.current.focus();
          textareaRef.current.style.height = '48px';
          textareaRef.current.style.height = `${Math.min(textareaRef.current.scrollHeight, 300)}px`;
        }
      }
    };

    recognition.onend = () => {
      // Remove [listening] marker
      setInputMessage(prev => prev.replace(/\s*\[listening\]\s*$/g, ''));

      // Handle retry logic
      if (isDictating && recognitionRef.current && retryCount < MAX_RETRIES) {
        retryCount++;
        try {
          setTimeout(() => {
            recognition.start();
          }, 100);
          return;
        } catch (e) {
          console.error('Failed to restart recognition:', e);
        }
      }

      // If we're not retrying or max retries reached, clean up
      setIsDictating(false);
      recognitionRef.current = null;

      // Additional cleanup for Safari
      if (textareaRef.current) {
        // Force Safari to update the textarea display
        const temp = textareaRef.current.style.display;
        textareaRef.current.style.display = 'none';
        void textareaRef.current.offsetHeight; // Force reflow
        textareaRef.current.style.display = temp;
      }
    };

    recognition.onerror = (event) => {
      console.error('Speech recognition error:', event.error);

      // Handle specific error cases
      switch (event.error) {
        case 'network':
          // Attempt restart for network errors
          if (retryCount < MAX_RETRIES) {
            retryCount++;
            setTimeout(() => {
              try {
                recognition.start();
                return;
              } catch (e) {
                console.error('Failed to restart after network error:', e);
              }
            }, 1000);
          }
          break;
        case 'not-allowed':
        case 'service-not-allowed':
          alert("Microphone access is required for dictation. Please allow microphone access and try again.");
          setIsDictating(false);
          recognitionRef.current = null;
          break;
        case 'no-speech':
          // Just retry for no speech detected
          if (isDictating && recognitionRef.current) {
            try {
              recognition.start();
              return;
            } catch (e) {
              console.error('Failed to restart after no-speech:', e);
            }
          }
          break;
        default:
          // For other errors, try to restart if still dictating
          if (isDictating && recognitionRef.current && retryCount < MAX_RETRIES) {
            retryCount++;
            setTimeout(() => {
              try {
                recognition.start();
                return;
              } catch (e) {
                console.error('Failed to restart after error:', e);
              }
            }, 1000);
          }
      }
    };

    // Start recognition with error handling
    try {
      recognition.start();
    } catch (e) {
      console.error('Failed to start speech recognition:', e);

      // Special case for Safari which might need a moment
      if (isSafari) {
        setTimeout(() => {
          try {
            recognition.start();
          } catch (delayedError) {
            console.error('Failed to start speech recognition even after delay:', delayedError);
            alert("There was an error starting speech recognition. Please try again or use a different browser.");
            setIsDictating(false);
            recognitionRef.current = null;
          }
        }, 100);
        return;
      }

      alert("There was an error starting speech recognition. Please try again or use a different browser.");
      setIsDictating(false);
      recognitionRef.current = null;
    }
  };

  const chatContent = (
    <div
      className="chat-shell relative flex min-h-0 h-full flex-col overflow-visible bg-background"
      role="region"
      aria-label="Chat interface"
    >
      {(!isSplitViewOpen) ? (
        <header className="chat-header shrink-0 -mx-[100vw] bg-primary-foreground border-b shadow-md z-40" role="banner">
          <div className="mx-[100vw]">
            <nav className="flex items-center justify-between px-5 pt-6 pb-3 md:pt-7 md:pb-4" aria-label="Composer information">
              <Tooltip>
                <TooltipTrigger asChild>
                  <button
                    type="button"
                    aria-label={`View more information about ${composer.name}`}
                    aria-expanded={isSplitViewOpen}
                    aria-haspopup="dialog"
                    className="chat-split-btn appearance-none border-none outline-none focus-visible:ring-2 focus-visible:ring-primary focus-visible:ring-offset-0 flex items-center space-x-6 cursor-pointer hover:opacity-90 transition-opacity duration-300"
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
                      <div className="flex-shrink-0" aria-hidden="true">
                        <ComposerImageViewer
                          composer={composer}
                          size="lg"
                          presentationOnly
                          className="!scale-100 !w-20 !h-20 md:!w-24 md:!h-24"
                        />
                      </div>
                      <div className="flex flex-col justify-center text-left">
                        <h1 className="font-serif font-bold text-lg md:text-xl hover:text-primary">{composer.name}</h1>
                        <div className={`flex ${
                          Array.isArray(composer.era) && composer.era.length === 2
                            ? 'flex-col sm:flex-row sm:items-center'
                            : 'flex-col sm:flex-row sm:items-center'
                        } gap-1.5 mt-0.5`}>
                          <span className="text-base md:text-lg text-muted-foreground hover:text-primary whitespace-nowrap">
                            <span className="sr-only">Nationality and years: </span>
                            {composer.nationality}, {composer.birthYear}-{composer.deathYear || 'present'}
                          </span>
                          <div
                            className="flex flex-wrap gap-1 -translate-y-[1px]"
                            role="list"
                            aria-label="Musical eras"
                          >
                            {Array.isArray(composer.era)
                              ? composer.era.map((era, idx) => (
                                  <div key={era + idx} role="listitem">
                                    <Badge variant="badge">{era}</Badge>
                                  </div>
                                ))
                              : <div role="listitem"><Badge variant="badge">{composer.era}</Badge></div>}
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

              <div className="shrink-0">
                {isMobile ? (
                  <button
                    type="button"
                    disabled={isComposerListOpen || isComposerMenuOpen}
                    onClick={() => setChatActionsMenuOpen(true)}
                    className="inline-flex h-11 w-11 min-h-[44px] min-w-[44px] items-center justify-center rounded-md text-muted-foreground hover:text-foreground hover:bg-muted focus-visible:ring-2 focus-visible:ring-primary focus-visible:ring-offset-0 transition-colors disabled:opacity-50 disabled:cursor-not-allowed touch-manipulation"
                    aria-label="Chat actions"
                    aria-haspopup="dialog"
                    aria-expanded={chatActionsMenuOpen}
                  >
                    <MoreVertical className="h-5 w-5" strokeWidth={2} aria-hidden />
                  </button>
                ) : (
                  <DropdownMenu>
                    <DropdownMenuTrigger asChild>
                      <button
                        type="button"
                        disabled={isComposerListOpen || isComposerMenuOpen}
                        className="inline-flex h-11 w-11 min-h-[44px] min-w-[44px] items-center justify-center rounded-md text-muted-foreground hover:text-foreground hover:bg-muted focus-visible:ring-2 focus-visible:ring-primary focus-visible:ring-offset-0 transition-colors disabled:opacity-50 disabled:cursor-not-allowed"
                        aria-label="Chat actions"
                      >
                        <MoreVertical className="h-5 w-5" strokeWidth={2} aria-hidden />
                      </button>
                    </DropdownMenuTrigger>
                    <DropdownMenuContent align="end" side="bottom" sideOffset={8} className="min-w-[12rem]">
                      <DropdownMenuItem
                        className="min-h-11 cursor-pointer text-base"
                        onSelect={() => setResetConfirmOpen(true)}
                      >
                        Reset conversation
                      </DropdownMenuItem>
                      {onClose ? (
                        <>
                          <DropdownMenuSeparator />
                          <DropdownMenuItem
                            className="min-h-11 cursor-pointer text-base"
                            onSelect={() => onClose()}
                          >
                            Close chat
                          </DropdownMenuItem>
                        </>
                      ) : null}
                    </DropdownMenuContent>
                  </DropdownMenu>
                )}
              </div>
            </nav>
          </div>

        </header>
      ) : null}
      <div
        className={`chat-messages min-h-0 flex-1 overflow-y-auto overscroll-contain px-5 relative ${
          !isSplitViewOpen ? 'pt-4' : 'py-4'
        }`}
        ref={chatContainerRef}
        onScroll={handleChatContainerScroll}
        role="log"
        aria-label="Chat messages"
        aria-live="polite"
      >
        <div className="flex flex-col min-h-[calc(100%-2rem)] pb-2">
          {currentMessages.length === 0 ? (
            <div
              className="flex-1 flex items-center justify-center text-muted-foreground text-base"
              role="status"
              aria-label="Empty chat"
            >
              <p>Start a conversation with {getLastName(composer.name)}. Ask them about their music.</p>
            </div>
          ) : (
            <div className="space-y-2 w-full max-w-full">
              {currentMessages.map((message: Message) => (
                <article
                  key={message.id}
                  className={`message-bubble flex ${
                    message.sender === 'user' ? 'justify-end' : 'justify-start'
                  }`}
                  data-sender={message.sender}
                  role="article"
                  aria-label={`${message.sender === 'user' ? 'Your message' : `${composer.name}'s response`}`}
                >
                  <div
                    className={message.sender === 'user'
                      ? 'max-w-[75%] rounded-2xl px-4 py-2 bg-primary text-background ml-auto mr-1 shadow-sm'
                      : 'max-w-[85%] rounded-2xl px-4 py-2 text-foreground bg-background -ml-4'
                    }
                  >
                    <ReactMarkdown
                      components={{
                        em: ({ node, ...props }) => <em className="italic" {...props} />,
                        p: ({ children }) => <p style={{ whiteSpace: 'pre-line' }}>{children}</p>
                      }}
                    >
                      {message.text}
                    </ReactMarkdown>
                  </div>
                </article>
              ))}
              {isGenerating && (
                <article
                  className="message-bubble flex justify-start"
                  role="status"
                  aria-label="Composing response"
                >
                  <div className="max-w-[85%] rounded-2xl px-4 py-2 text-foreground bg-background">
                    <span className="animate-pulse">Composing response...</span>
                  </div>
                </article>
              )}
              {geminiError && (
                <article
                  className="message-bubble flex justify-start"
                  role="alert"
                  aria-label="Error message"
                >
                  <div className="max-w-[85%] rounded-2xl px-4 py-2 text-destructive bg-destructive/10">
                    {geminiError}
                  </div>
                </article>
              )}
            </div>
          )}
          <div ref={messagesEndRef} className="h-0" aria-hidden="true" />
        </div>
      </div>

      <form
        onSubmit={handleSendMessage}
        className="chat-composer border-t bg-background/80 backdrop-blur-sm pb-4"
        style={{
          ...(isMobile ? {
            paddingBottom: 'max(env(safe-area-inset-bottom), 0.5rem)',
            marginBottom: 0
          } : {})
        }}
      >
        <div className="pt-4 px-3 sm:px-5 relative z-10">
          <div key={`input-${isSplitViewOpen}`} className="relative max-w-full">
            <textarea
              id="chat-input"
              aria-label="Type your message"
              key={`textarea-${isSplitViewOpen}`}
              ref={textareaRef}
              value={inputMessage}
              onChange={handleTextareaChange}
              onKeyDown={handleKeyPress}
              onFocus={handleChatInputFocus}
              placeholder={`Ask a question...`}
              className={`w-full bg-background pl-4 pr-[6.75rem] py-3 border border-input text-base text-foreground
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
                textSizeAdjust: '100%',
                position: 'relative',
                zIndex: 30,
                paddingRight: '6.75rem', // Space for mic + send (fits inside single-line row)
              }}
              rows={1}
              disabled={isComposerListOpen || isComposerMenuOpen}
            />

            {/* Control buttons: 36px circles centered in 44×44 tap wrappers; cluster vertically centered in field */}
            <div
              className="pointer-events-auto absolute right-1.5 top-1/2 z-50 flex translate-y-[calc(-50%-4px)] items-center gap-1"
              style={{ zIndex: 50 }}
            >
              {/* Dictation Button */}
              <div className="z-50 flex h-11 w-11 shrink-0 items-center justify-center">
                <Tooltip>
                  <TooltipTrigger asChild>
                    <button
                      type="button"
                      disabled={isComposerListOpen || isComposerMenuOpen}
                      onClick={handleDictation}
                      className={`inline-flex h-9 w-9 rounded-full items-center justify-center touch-manipulation
                        ${isComposerListOpen || isComposerMenuOpen ? 'opacity-50 cursor-not-allowed' : ''}
                        ${isDictating
                          ? 'bg-destructive text-background mic-pulse-animation'
                          : 'text-muted-foreground hover:text-primary'
                        } hover:scale-105 active:scale-95`}
                      aria-label={isDictating ? "Stop dictating" : "Dictate"}
                      style={{ zIndex: 50 }}
                    >
                      <Mic className="h-[1.125rem] w-[1.125rem]" strokeWidth={2} />
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
              <div className="flex h-11 w-11 shrink-0 items-center justify-center">
                <Tooltip>
                  <TooltipTrigger asChild>
                    <button
                      type="submit"
                      disabled={!inputMessage.trim() || isComposerListOpen || isComposerMenuOpen}
                      className={`inline-flex h-9 w-9 rounded-full items-center justify-center disabled:opacity-50 disabled:cursor-not-allowed transition-[transform] duration-200 hover:scale-105 active:scale-95 shadow-sm touch-manipulation ${
                        inputMessage.trim()
                          ? 'bg-primary text-background hover:bg-primary/90'
                          : 'text-muted-foreground hover:text-primary'
                      }`}
                      style={{ zIndex: 50 }}
                    >
                      <ArrowUp className="h-[1.125rem] w-[1.125rem]" strokeWidth={2} />
                    </button>
                  </TooltipTrigger>
                  <TooltipPortal>
                    <TooltipContent side="top" align="center" className="text-xs">
                      Send
                    </TooltipContent>
                  </TooltipPortal>
                </Tooltip>
              </div>
            </div>
          </div>
        </div>
        <p
          tabIndex={0}
          className="text-xs text-muted-foreground text-center mx-11 py-1 focus:outline-none focus-visible:ring-1 focus-visible:ring-primary focus-visible:ring-offset-1 rounded-none"
        >
          AI-generated chat. Not {getLastName(composer.name)}&apos;s own words.
        </p>
      </form>

      {isMobile ? (
        <Sheet open={chatActionsMenuOpen} onOpenChange={setChatActionsMenuOpen}>
          <SheetContent
            side="bottom"
            className="rounded-t-2xl p-4 pb-[max(1rem,env(safe-area-inset-bottom))] [&>button]:hidden"
          >
            <SheetHeader className="sr-only">
              <SheetTitle>Chat actions</SheetTitle>
            </SheetHeader>
            <div className="flex flex-col gap-1">
              <button
                type="button"
                className="flex min-h-11 w-full items-center rounded-md px-3 py-3 text-left text-base font-medium text-foreground hover:bg-accent focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-primary"
                onClick={() => {
                  setChatActionsMenuOpen(false);
                  setResetConfirmOpen(true);
                }}
              >
                Reset conversation
              </button>
              {onClose ? (
                <button
                  type="button"
                  className="flex min-h-11 w-full items-center rounded-md px-3 py-3 text-left text-base font-medium text-foreground hover:bg-accent focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-primary"
                  onClick={() => {
                    setChatActionsMenuOpen(false);
                    onClose();
                  }}
                >
                  Close chat
                </button>
              ) : null}
            </div>
          </SheetContent>
        </Sheet>
      ) : null}

      <AlertDialog open={resetConfirmOpen} onOpenChange={setResetConfirmOpen}>
        <AlertDialogContent>
          <AlertDialogHeader>
            <AlertDialogTitle>Reset conversation?</AlertDialogTitle>
            <AlertDialogDescription>
              This will clear your current conversation. You can&apos;t undo this.
            </AlertDialogDescription>
          </AlertDialogHeader>
          <AlertDialogFooter>
            <AlertDialogCancel>Cancel</AlertDialogCancel>
            <AlertDialogAction
              className={cn(buttonVariants({ variant: 'destructive' }))}
              onClick={performResetChat}
            >
              Reset
            </AlertDialogAction>
          </AlertDialogFooter>
        </AlertDialogContent>
      </AlertDialog>
    </div>
  );

  const splitTransitionBase = standaloneDisplay
    ? 'transition-opacity duration-200 ease-in-out motion-reduce:!transition-none motion-reduce:duration-0'
    : cn(
        'ease-in-out motion-reduce:!transition-none motion-reduce:duration-0',
        'max-md:transition-opacity max-md:duration-200',
        'md:transition-[opacity,transform] md:duration-200',
      );

  const chatLayerState = standaloneDisplay
    ? !isSplitViewOpen
      ? 'opacity-100'
      : 'opacity-0 pointer-events-none'
    : !isSplitViewOpen
      ? 'opacity-100 scale-100'
      : 'opacity-0 pointer-events-none max-md:scale-100 md:scale-95';

  const splitOverlayState = standaloneDisplay
    ? isSplitViewOpen
      ? 'opacity-100'
      : 'opacity-0 pointer-events-none'
    : isSplitViewOpen
      ? 'opacity-100 scale-100'
      : 'opacity-0 pointer-events-none max-md:scale-100 md:scale-105';

  return (
    <div className="relative w-full h-full">
      {/* Regular chat view: only show when split view is closed */}
      <div
        className={cn('absolute inset-0', splitTransitionBase, chatLayerState)}
      >
        {!isSplitViewOpen && chatContent}
      </div>

      {/* Split view: render overlay only while open to avoid stale fixed layers over chat on mobile. */}
      {isSplitViewOpen ? (
        <div
          className={cn('fixed inset-0', splitTransitionBase, splitOverlayState)}
        >
          <ComposerSplitView
            composer={composer}
            isOpen={isSplitViewOpen}
            onClose={() => setIsSplitViewOpen(false)}
            isActiveChatsOpen={isActiveChatsOpen}
          >
            <div className="h-full">{chatContent}</div>
          </ComposerSplitView>
        </div>
      ) : null}
    </div>
  );
}

export default ChatInterface;
