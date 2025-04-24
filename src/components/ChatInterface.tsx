import { useState, useRef, useEffect, KeyboardEvent, useCallback } from 'react';
import { Composer, Message, Era } from '@/data/composers';
import { useConversations } from '@/hooks/useConversations';
import { Button } from '@/components/ui/button';
import { RefreshCcw } from 'lucide-react';
import { useIsMobile } from '@/hooks/use-mobile';
import { ImageModal } from './ImageModal';
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
  const [imageModalOpen, setImageModalOpen] = useState(false);
  const messagesEndRef = useRef<HTMLDivElement>(null);
  const textareaRef = useRef<HTMLTextAreaElement>(null);
  const isMobile = useIsMobile();
  const {
    activeConversation,
    activeConversationId,
    startConversation,
    addMessage
  } = useConversations();
  const [localMessages, setLocalMessages] = useState<Message[]>([]);

  // Format era display text
  const getEraDisplayText = (era: string): string => {
    return era === Era.Modern ? '20th-21st Century' : era;
  };

  useEffect(() => {
    if (!activeConversation) {
      startConversation(composer);
    }
  }, [activeConversation, composer, startConversation]);

  useEffect(() => {
    messagesEndRef.current?.scrollIntoView({
      behavior: 'smooth'
    });
  }, [activeConversation?.messages]);

  useEffect(() => {
    if (activeConversation && activeConversation.messages.length > 0) {
      // Only update local messages if we're initializing or resetting
      if (localMessages.length === 0) {
        console.log('Initializing local messages from active conversation');
        setLocalMessages(activeConversation.messages);
      }
    }
  }, [activeConversation]);

  const handleMessageSubmit = () => {
    if (!inputMessage.trim() || !activeConversationId) return;

    const userMessage: Message = {
      id: uuidv4(),
      text: inputMessage,
      sender: 'user',
      timestamp: Date.now()
    };

    // Update local state first
    setLocalMessages(prev => [...prev, userMessage]);

    // Then update conversation state
    addMessage(activeConversationId, inputMessage, 'user');
    setInputMessage('');

    if (textareaRef.current) {
      textareaRef.current.style.height = 'auto';
    }

    // Handle composer response
    setTimeout(() => {
      if (activeConversationId) {
        const response = generatePlaceholderResponse(inputMessage, composer);
        const composerMessage: Message = {
          id: uuidv4(),
          text: response,
          sender: 'composer',
          timestamp: Date.now()
        };

        // Update local state first
        setLocalMessages(prev => [...prev, composerMessage]);

        // Then update conversation state
        addMessage(activeConversationId, response, 'composer');
      }
    }, 1000);
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
    if (activeConversationId) {
      setLocalMessages([]); // Clear local messages first
      startConversation(composer);
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

  if (!activeConversation) {
    return <div className="flex items-center justify-center h-full">Loading conversation...</div>;
  }


  return   <div className="flex flex-col h-full bg-background/60 backdrop-blur-sm rounded-lg overflow-hidden z-10 shadow-md">
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
            variant="default" className="ml-2 bg-primary/65 text-background"         >
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
        {localMessages.length === 0 && <div className="absolute inset-0 flex items-center justify-center text-muted-foreground text-sm pointer-events-none">
            <p>Start a conversation with {composer.name.split(' ').pop()}. Ask them about their music.</p>
          </div>}

        {localMessages.map((message: Message, index) => (
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
