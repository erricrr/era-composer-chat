
import { useState } from 'react';
import { Composer } from '@/data/composers';
import { ComposerMenu } from '@/components/ComposerMenu';
import { ChatInterface } from '@/components/ChatInterface';
import { ThemeToggle } from '@/components/ThemeToggle';
import { MusicNoteDecoration } from '@/components/MusicNoteDecoration';
import { BiographyPanel } from '@/components/BiographyPanel';
import { useConversations } from '@/hooks/useConversations';

const Index = () => {
  const [isMenuOpen, setIsMenuOpen] = useState(true);
  const [selectedComposer, setSelectedComposer] = useState<Composer | null>(null);
  const [isChatting, setIsChatting] = useState(false);
  const { startConversation } = useConversations();

  const handleSelectComposer = (composer: Composer) => {
    setSelectedComposer(composer);
  };

  const handleStartChat = (composer: Composer) => {
    startConversation(composer);
    setIsChatting(true);
  };

  const toggleMenu = () => {
    setIsMenuOpen(!isMenuOpen);
    if (!isMenuOpen) {
      setSelectedComposer(null);
      setIsChatting(false);
    }
  };

  return (
    <div className="min-h-screen bg-background">
      <MusicNoteDecoration />
      <ThemeToggle />
      
      <div className={`transition-all duration-500 ${
        isChatting ? '-translate-y-full' : 'translate-y-0'
      }`}>
        <ComposerMenu 
          onSelectComposer={handleSelectComposer} 
          isOpen={isMenuOpen}
          selectedComposer={selectedComposer}
        />
        
        {selectedComposer && (
          <div className="container mx-auto px-4 mt-4 animate-fade-in">
            <BiographyPanel 
              composer={selectedComposer} 
              onStartChat={handleStartChat}
            />
          </div>
        )}
      </div>

      {isChatting && selectedComposer && (
        <div className="fixed inset-0 animate-fade-in">
          <ChatInterface composer={selectedComposer} />
        </div>
      )}

      <button
        onClick={toggleMenu}
        className="fixed top-4 left-4 z-50 p-2 rounded-full bg-card hover:bg-muted transition-colors duration-200 shadow-md"
        aria-label={isMenuOpen ? "Close menu" : "Open menu"}
      >
        <svg 
          xmlns="http://www.w3.org/2000/svg" 
          className="h-5 w-5" 
          fill="none" 
          viewBox="0 0 24 24" 
          stroke="currentColor"
        >
          {isMenuOpen ? (
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 15l7-7 7 7" />
          ) : (
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 9l-7 7-7-7" />
          )}
        </svg>
      </button>
    </div>
  );
}

export default Index;
