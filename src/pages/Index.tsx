
import { useState } from 'react';
import { Composer } from '@/data/composers';
import { ComposerMenu } from '@/components/ComposerMenu';
import { ChatInterface } from '@/components/ChatInterface';
import { ThemeToggle } from '@/components/ThemeToggle';
import { MusicNoteDecoration } from '@/components/MusicNoteDecoration';
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
    setIsMenuOpen(false);
  };

  const handleCloseBiography = () => {
    setIsMenuOpen(true);
    setSelectedComposer(null);
    setIsChatting(false);
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
      {/* Background Decoration */}
      <MusicNoteDecoration />
      
      {/* Theme Toggle */}
      <ThemeToggle />
      
      {/* Composer Selection Menu */}
      <ComposerMenu 
        onSelectComposer={handleSelectComposer}
        onStartChat={handleStartChat}
        selectedComposer={selectedComposer}
        isOpen={isMenuOpen} 
      />
      
      {/* Menu Toggle Button */}
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
      
      {/* Chat Interface */}
      {isChatting && (
        <div className="container mx-auto px-4 pt-16 pb-8" style={{ height: 'calc(100vh - 2rem)' }}>
          <ChatInterface composer={selectedComposer!} />
        </div>
      )}
    </div>
  );
}

export default Index;
