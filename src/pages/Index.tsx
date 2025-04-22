
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
          maxHeight: isMenuOpen ? '95vh' : '0', // Changed from 80vh to 95vh
          height: isMenuOpen ? 'auto' : '0',
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
      
      {/* Biography Panel slides in/out and is anchored to bottom */}
      {!isMenuOpen && selectedComposer && !isChatting && (
        <div
          className={
            `fixed left-0 right-0 top-0 bottom-0 z-50 bg-background/95 shadow-2xl border-t border-border flex flex-col animate-bio-panel-in`
          }
          style={{
            transition: 'transform 0.5s cubic-bezier(0.4,0.0,0.2,1)',
          }}
        >
          <div className="flex-grow flex flex-col overflow-auto">
            <div className="max-w-2xl w-full mx-auto flex flex-col h-full pt-8 px-4 pb-24">
              {/* Close btn */}
              <button
                onClick={handleCloseBiography}
                className="absolute top-4 right-4 p-2 rounded-full text-muted-foreground bg-card hover:bg-muted transition-colors duration-200"
                aria-label="Close biography"
              >
                ×
              </button>
              {/* Composer Image, Name, Metadata */}
              <div className="flex flex-col items-center mt-2 mb-6">
                <img
                  src={selectedComposer.image}
                  alt={selectedComposer.name}
                  className="w-28 h-28 rounded-full object-cover border-2 border-primary/30 mb-3"
                />
                <h2 className="text-2xl font-bold font-serif">{selectedComposer.name}</h2>
                <div className="mt-1 flex gap-2 text-sm text-muted-foreground">
                  <span>{selectedComposer.country}</span>
                  <span>•</span>
                  <span>{selectedComposer.years}</span>
                </div>
                <div className="mt-1">
                  <span className="bg-primary/10 text-primary px-2 py-0.5 rounded text-xs font-medium">{selectedComposer.era} Era</span>
                </div>
              </div>
              {/* Biography/Works */}
              <div className="flex-1 overflow-auto">
                <p className="text-base text-foreground/90 mb-6">{selectedComposer.bio}</p>
                <div>
                  <h4 className="font-semibold mb-2">Notable Works:</h4>
                  <ul className="list-disc pl-5 space-y-1">
                    {selectedComposer.famousWorks.slice(0, 3).map((work, idx) =>
                      <li key={idx} className="text-sm text-foreground/80">{work}</li>
                    )}
                  </ul>
                </div>
              </div>
            </div>
          </div>
          {/* Start Conversation Button at Bottom */}
          <div className="fixed left-0 right-0 bottom-0 px-4 pb-5 z-60">
            <button
              onClick={() => handleStartChat(selectedComposer)}
              className="w-full max-w-2xl mx-auto bg-primary text-primary-foreground rounded-lg py-3 font-semibold shadow-lg transition-transform duration-300 hover:scale-105"
              style={{ display: 'block' }}
            >
              Start Conversation
            </button>
          </div>
        </div>
      )}

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
      {/* Animation for biography panel */}
      <style>
        {`
          .animate-bio-panel-in {
            animation: bio-panel-in 0.5s cubic-bezier(0.4,0.0,0.2,1);
          }
          @keyframes bio-panel-in {
            0% { transform: translateY(100%); }
            100% { transform: translateY(0); }
          }
        `}
      </style>
    </div>
  );
}

export default Index;
