
import { useState, useRef, useEffect } from 'react';
import { Composer, Message } from '@/data/composers';
import { useConversations } from '@/hooks/useConversations';

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
  
  // Start conversation if none exists
  useEffect(() => {
    if (!activeConversation) {
      startConversation(composer);
    }
  }, [activeConversation, composer, startConversation]);

  // Scroll to bottom of messages
  useEffect(() => {
    messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' });
  }, [activeConversation?.messages]);

  const handleSendMessage = (e: React.FormEvent) => {
    e.preventDefault();
    
    if (!inputMessage.trim() || !activeConversationId) return;
    
    // Send user message
    addMessage(activeConversationId, inputMessage, 'user');
    setInputMessage('');
    
    // Simulate composer response (would be replaced with Gemini API call)
    setTimeout(() => {
      if (activeConversationId) {
        const response = generatePlaceholderResponse(inputMessage, composer);
        addMessage(activeConversationId, response, 'composer');
      }
    }, 1000);
  };

  // Placeholder response generation function
  // This would be replaced with the Gemini API in the final implementation
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
    
    // Default response
    return `Thank you for your interest in my work. I was a composer from the ${composer.era} era, known for ${composer.famousWorks[0]}. Is there anything specific about my compositions or life you would like to know?`;
  };

  if (!activeConversation) {
    return <div className="flex items-center justify-center h-full">Loading conversation...</div>;
  }

  return (
    <div className="flex flex-col h-full bg-card rounded-lg shadow-lg overflow-hidden">
      {/* Chat header */}
      <div className={`flex items-center p-4 border-b ${
          composer.era === 'Baroque' ? 'bg-baroque/10' :
          composer.era === 'Classical' ? 'bg-classical/10' : 
          composer.era === 'Romantic' ? 'bg-romantic/10' :
          'bg-modern/10'
        }`}>
        <img 
          src={composer.image} 
          alt={composer.name} 
          className="w-10 h-10 rounded-full object-cover border border-primary shadow-md"
        />
        <div className="ml-3">
          <h2 className="font-serif font-bold">{composer.name}</h2>
          <p className="text-xs text-muted-foreground">{composer.era} Era • {composer.years}</p>
        </div>
        <div className="ml-auto text-xs text-muted-foreground">
          <span className="inline-block px-2 py-1 rounded-full bg-card shadow-sm">
            {composer.country}
          </span>
        </div>
      </div>
      
      {/* Messages area */}
      <div className="flex-1 overflow-y-auto p-4 music-paper-bg">
        {activeConversation.messages.map((message: Message) => (
          <div 
            key={message.id} 
            className={`flex ${message.sender === 'user' ? 'justify-end' : 'justify-start'} mb-4`}
          >
            {message.sender === 'composer' && (
              <img 
                src={composer.image} 
                alt={composer.name} 
                className="w-8 h-8 rounded-full object-cover mr-2 self-end"
              />
            )}
            <div 
              className={message.sender === 'user' ? 'chat-message-user' : 'chat-message-composer'}
            >
              {message.text}
            </div>
          </div>
        ))}
        <div ref={messagesEndRef} />
      </div>
      
      {/* Input area */}
      <form onSubmit={handleSendMessage} className="p-4 border-t">
        <div className="flex">
          <input
            type="text"
            value={inputMessage}
            onChange={(e) => setInputMessage(e.target.value)}
            placeholder={`Ask ${composer.name} a question...`}
            className="flex-1 rounded-l-lg border border-r-0 p-3 focus:outline-none focus:ring-1 focus:ring-primary bg-background"
          />
          <button
            type="submit"
            disabled={!inputMessage.trim()}
            className={`py-3 px-6 rounded-r-lg font-medium disabled:opacity-50 disabled:cursor-not-allowed transition-colors ${
              composer.era === 'Baroque' ? 'bg-baroque text-white' :
              composer.era === 'Classical' ? 'bg-classical text-white' : 
              composer.era === 'Romantic' ? 'bg-romantic text-white' :
              'bg-modern text-white'
            }`}
          >
            Send
          </button>
        </div>
      </form>
    </div>
  );
}
