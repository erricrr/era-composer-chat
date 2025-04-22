
import { useState } from 'react';
import { Composer, Era } from '@/data/composers';
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
    setIsMenuOpen(false);
  };

  const handleStartChat = (composer: Composer) => {
    startConversation(composer);
    setIsChatting(true);
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
      
      {/* Main Content */}
      <div 
        className={`container mx-auto px-4 pt-16 pb-8 transition-all duration-500 ${
          isMenuOpen ? 'opacity-0' : 'opacity-100'
        }`} 
        style={{ height: 'calc(100vh - 2rem)' }}
      >
        {selectedComposer && !isChatting ? (
          <BiographyPanel 
            composer={selectedComposer} 
            onStartChat={handleStartChat}
            onClose={handleCloseBiography}
          />
        ) : selectedComposer && isChatting ? (
          <ChatInterface composer={selectedComposer} />
        ) : (
          <div className="h-full flex items-center justify-center">
            <div className="text-center">
              <h2 className="text-2xl font-serif font-bold mb-4">Select a Composer</h2>
              <p className="text-muted-foreground mb-6">
                Click the menu button above to browse composers by era
              </p>
              <button
                onClick={toggleMenu}
                className="bg-primary text-primary-foreground px-6 py-3 rounded-lg font-medium hover:bg-primary/90 transition-colors"
              >
                Open Composer Menu
              </button>
            </div>
          </div>
        )}
      </div>
    </div>
  );
};

export default Index;
