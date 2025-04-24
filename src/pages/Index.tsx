import { useState } from 'react';
import { Composer, Era } from '@/data/composers';
import { ComposerMenu } from '@/components/ComposerMenu';
import { ChatInterface } from '@/components/ChatInterface';
import { ThemeToggle } from '@/components/ThemeToggle';
import { MusicNoteDecoration } from '@/components/MusicNoteDecoration';
import { useConversations } from '@/hooks/useConversations';

const Index = () => {
  const [selectedComposer, setSelectedComposer] = useState<Composer | null>(() => {
    const saved = localStorage.getItem('selectedComposer');
    return saved ? JSON.parse(saved) : null;
  });

  const [isMenuOpen, setIsMenuOpen] = useState(() => {
    const saved = localStorage.getItem('isMenuOpen');
    return saved ? JSON.parse(saved) : true;
  });

  const [isChatting, setIsChatting] = useState(() => {
    const saved = localStorage.getItem('isChatting');
    return saved ? JSON.parse(saved) : false;
  });

  const { startConversation, getConversationsForComposer } = useConversations();

  const handleSelectComposer = (composer: Composer) => {
    setSelectedComposer(composer);
    localStorage.setItem('selectedComposer', JSON.stringify(composer));
  };

  const handleStartChat = (composer: Composer) => {
    if (composer) {
      // Get existing conversations for this composer
      const composerConversations = getConversationsForComposer(composer.id);

      // Only start a new conversation if there are no existing ones
      if (composerConversations.length === 0) {
        startConversation(composer);
      }

      // First start the menu sliding animation
      setIsMenuOpen(false);
      localStorage.setItem('isMenuOpen', 'false');

      // After the menu slides up, show the chat interface
      setTimeout(() => {
        setIsChatting(true);
        localStorage.setItem('isChatting', 'true');
      }, 500); // This matches the menu slide duration
    }
  };

  const toggleMenu = () => {
    if (!isMenuOpen) {
      setIsChatting(false);
      localStorage.setItem('isChatting', 'false');
      setIsMenuOpen(true);
      localStorage.setItem('isMenuOpen', 'true');
    } else {
      setIsChatting(false); // Ensure chat is hidden when closing menu
      localStorage.setItem('isChatting', 'false');
      setIsMenuOpen(false);
      localStorage.setItem('isMenuOpen', 'false');
    }
  };

  return (
    <div className="min-h-screen bg-background">
      {/* Background Decoration */}
      <MusicNoteDecoration />
      {/* Theme Toggle */}
      <ThemeToggle />

      {/* Composer Selection Menu - With max height and forced scrollbar */}
      <div
        className={`
          fixed inset-x-0 top-0 z-40
          bg-background backdrop-blur-sm border-b border-border shadow-lg
          transition-transform duration-500 ease-[cubic-bezier(0.25, 0.8, 0.25, 1)]
          ${isMenuOpen ? 'translate-y-0' : '-translate-y-full pointer-events-none'}
          overflow-y-scroll max-h-screen
        `}
      >
        <div className="pb-20"> {/* Add padding at bottom to ensure content is visible */}
          <ComposerMenu
            onSelectComposer={handleSelectComposer}
            onStartChat={handleStartChat}
            selectedComposer={selectedComposer}
            isOpen={isMenuOpen}
          />
        </div>
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

      {/* Chat Interface */}
      <div
        className="fixed inset-x-0 bottom-0 overflow-y-auto"
        style={{
          height: 'calc(100vh - 0rem)',
          backdropFilter: 'blur(8px)',
          boxShadow: '0 -10px 25px rgba(0,0,0,0.1)',
        }}
      >
        {selectedComposer && (
          <div className="container mx-auto px-4 pt-16 pb-8 h-full">
            <ChatInterface
              composer={selectedComposer}
              onUserTyping={() => {}} // Add required prop
            />
          </div>
        )}
      </div>
    </div>
  );
}

export default Index;
