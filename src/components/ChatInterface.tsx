import { useState, useRef, useEffect } from 'react';
import { Composer, Message } from '@/data/composers';
import { useConversations } from '@/hooks/useConversations';
import { Button } from '@/components/ui/button';
import { RefreshCcw } from 'lucide-react';

interface ChatInterfaceProps {
  composer: Composer;
}

export function ChatInterface({ composer }: ChatInterfaceProps) {
  const [inputMessage, setInputMessage] = useState('');
  const messagesEndRef = useRef<HTMLDivElement>(null);
  const { 
    activeConversation, 
    activeConversationId,
    startConversation, 
    addMessage 
  } = useConversations();
  
  useEffect(() => {
    if (!activeConversation) {
      startConversation(composer);
    }
  }, [activeConversation, composer, startConversation]);

  useEffect(() => {
    messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' });
  }, [activeConversation?.messages]);

  const handleSendMessage = (e: React.FormEvent) => {
    e.preventDefault();
    
    if (!inputMessage.trim() || !activeConversationId) return;
    
    addMessage(activeConversationId, inputMessage, 'user');
    setInputMessage('');
    
    setTimeout(() => {
      if (activeConversationId) {
        const response = generatePlaceholderResponse(inputMessage, composer);
        addMessage(activeConversationId, response, 'composer');
      }
    }, 1000);
  };

  const handleResetChat = () => {
    if (activeConversationId) {
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

  return (
    <div className="flex flex-col h-full bg-background/50 backdrop-blur-sm rounded-lg overflow-hidden z-10">
      <div className={`flex items-center justify-between p-4 border-b shadow-sm ${
        composer.era === 'Baroque' ? 'bg-baroque/5' :
        composer.era === 'Classical' ? 'bg-classical/5' : 
        composer.era === 'Romantic' ? 'bg-romantic/5' :
        'bg-modern/5'
      }`}>
        <div className="flex items-center">
          <img 
            src={composer.image} 
            alt={composer.name} 
            className="w-10 h-10 rounded-full object-cover shadow-sm"
          />
          <div className="ml-3">
            <h2 className="font-serif font-bold">{composer.name}</h2>
            <p className="text-xs text-muted-foreground">{composer.era} Era • {composer.years}</p>
          </div>
        </div>
        <Button
          variant="ghost"
          size="icon"
          onClick={handleResetChat}
          className="ml-2"
          title="Reset conversation"
        >
          <RefreshCcw className="h-4 w-4" />
        </Button>
      </div>
      
      <div className="flex-1 overflow-y-auto p-4 space-y-4">
        {activeConversation?.messages.map((message: Message, index) => (
          <div 
            key={message.id} 
            className={`flex ${message.sender === 'user' ? 'justify-end' : 'justify-start'}`}
          >
            <div 
              className={`max-w-[80%] rounded-2xl px-4 py-2 ${
                message.sender === 'user' 
                  ? 'bg-primary text-primary-foreground ml-auto' 
                  : 'bg-muted'
              }`}
            >
              {message.text}
            </div>
          </div>
        ))}
        <div ref={messagesEndRef} />
      </div>
      
      <form onSubmit={handleSendMessage} className="p-4 border-t bg-background/50">
        <div className="flex gap-2 items-start">
          <div className="flex-1">
            <textarea
              value={inputMessage}
              onChange={(e) => setInputMessage(e.target.value)}
              placeholder={`Ask ${composer.name} a question...`}
              className="w-full rounded-xl border bg-background p-3 text-sm focus:outline-none focus:ring-1 focus:ring-primary resize-none overflow-hidden"
              rows={1}
              onInput={(e) => {
                const target = e.target as HTMLTextAreaElement;
                target.style.height = 'auto';
                target.style.height = `${target.scrollHeight}px`;
              }}
            />
          </div>
          <Button
            type="submit"
            disabled={!inputMessage.trim()}
            className={`px-4 h-10 rounded-xl font-medium disabled:opacity-50 disabled:cursor-not-allowed transition-colors ${
              composer.era === 'Baroque' ? 'bg-baroque text-white' :
              composer.era === 'Classical' ? 'bg-classical text-white' : 
              composer.era === 'Romantic' ? 'bg-romantic text-white' :
              'bg-modern text-white'
            }`}
          >
            Send
          </Button>
        </div>
      </form>
    </div>
  );
}
