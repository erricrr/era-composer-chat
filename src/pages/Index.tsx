
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
    // Make sure composer is not undefined before starting conversation
    if (composer) {
      startConversation(composer);
      // First start the menu sliding animation
      setIsMenuOpen(false);
      // After the menu slides up, show the chat interface
      setTimeout(() => {
        setIsChatting(true);
      }, 500); // This matches the menu slide duration
    }
  };

  const handleCloseBiography = () => {
    setIsMenuOpen(true);
    setSelectedComposer(null);
    setIsChatting(false);
  };

  const toggleMenu = () => {
    if (!isMenuOpen) {
      setIsChatting(false);
      setIsMenuOpen(true);
    } else {
      setIsChatting(false); // Ensure chat is hidden when closing menu
      setIsMenuOpen(false);
    }
  };

  return (
    <div className="min-h-screen bg-background">
      {/* Background Decoration */}
      <MusicNoteDecoration />
      
      {/* Theme Toggle */}
      <ThemeToggle />
      
      {/* Composer Selection Menu - Updated animation */}
      <div
        className={`fixed inset-x-0 top-0 z-40 bg-background/95 backdrop-blur-sm border-b border-border shadow-lg transition-all duration-500 ease-in-out ${
          isMenuOpen ? 'translate-y-0' : '-translate-y-full'
        }`}
        style={{ 
          height: isMenuOpen ? 'auto' : '0',
          maxHeight: isMenuOpen ? '80vh' : '0',
          overflow: 'hidden'
        }}
      >
        <ComposerMenu 
          onSelectComposer={handleSelectComposer}
          onStartChat={handleStartChat}
          selectedComposer={selectedComposer}
          isOpen={isMenuOpen} 
        />
      </div>
      
      {/* Menu Toggle Button */}
      <button
        onClick={toggleMenu}
        className="fixed top-4 left-4 z-50 p-2 rounded-full bg-card hover:bg-muted transition-colors duration-200 shadow-md"
        aria-label={isMenuOpen ? "Close menu" : "Open menu"}
      >
        <svg 
          xmlns="http://www.w3.org/2000/svg" 
          className={`h-5 w-5 transition-transform duration-500 ${isMenuOpen ? 'rotate-180' : 'rotate-0'}`}
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
      
      {/* Chat Interface with slide-in animation */}
      <div 
        className={`transition-transform duration-500 ease-in-out ${
          isChatting ? 'translate-y-0' : 'translate-y-full'
        }`}
      >
        {isChatting && selectedComposer && (
          <div className="container mx-auto px-4 pt-16 pb-8" style={{ height: 'calc(100vh - 2rem)' }}>
            <ChatInterface composer={selectedComposer} />
          </div>
        )}
      </div>
    </div>
  );
}

export default Index;
