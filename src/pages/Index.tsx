import { useState } from 'react';
import { Composer, Era, isComposerInPublicDomain } from '@/data/composers';
import { ComposerMenu } from '@/components/ComposerMenu';
import { ChatInterface } from '@/components/ChatInterface';
import { ThemeToggle } from '@/components/ThemeToggle';
import { MusicNoteDecoration } from '@/components/MusicNoteDecoration';
import { useConversations } from '@/hooks/useConversations';
import FooterDrawer from '@/components/ui/footerDrawer';

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
<div className="min-h-screen overflow-hidden bg-background">
{/* Removed Background Decoration */}
      {/* <MusicNoteDecoration /> */}

      {/* Fixed Header */}
      <div
        className="fixed-header cursor-pointer"
        onClick={toggleMenu}
      >
        <div className="container mx-auto px-2 flex items-center justify-between h-full">
          {/* Menu Toggle Button with its container - This part gets the group hover */}
          <div className="flex-1 flex items-center group">
            <div className="p-1 rounded-full transition-colors duration-200 group-hover:bg-muted">
              <svg
                xmlns="http://www.w3.org/2000/svg"
                className={`h-5 w-5 transition-all duration-500 ${isMenuOpen ? 'rotate-180' : 'rotate-0'} group-hover:text-primary`}
                fill="none"
                viewBox="0 0 24 24"
                stroke="currentColor"
                style={{ width: '1.25rem', height: '1.25rem' }}
              >
                {isMenuOpen ? (
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 15l7-7 7 7" />
                ) : (
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 9l-7 7-7-7" />
                )}
              </svg>
            </div>
          </div>

          {/* Icons - These should not trigger the menu toggle or show group hover effects */}
          <div className="flex items-center gap-1" onClick={e => e.stopPropagation()}>
            <FooterDrawer />
            <ThemeToggle />
          </div>
        </div>
      </div>

      <main className="content-main h-full">
        {/* Composer Selection Menu */}
        <div
          className={`
            fixed inset-x-0 z-40
            bg-background backdrop-blur-sm border-b border-border shadow-lg
            transition-transform duration-500 ease-out
            ${isMenuOpen ? 'translate-y-0' : '-translate-y-full pointer-events-none'}
            overflow-y-auto
          `}
          style={{
            maxHeight: `calc(100vh - 1.5rem)`
          }}
        >
          <div className="pb-14">
            <ComposerMenu
              onSelectComposer={handleSelectComposer}
              onStartChat={handleStartChat}
              selectedComposer={selectedComposer}
              isOpen={isMenuOpen}
            />
          </div>
        </div>

        {/* Chat Interface */}
        <div
          className="fixed inset-x-0 bottom-0 overflow-y-auto bg-background"
          style={{
            top: '2.5rem',
            height: 'calc(95vh - 2.5rem)',
            maxHeight: 'calc(95vh - 2.5rem)',
            backdropFilter: 'blur(8px)',
            boxShadow: '0 -10px 25px rgba(0,0,0,0.1)',
          }}
        >
          {selectedComposer && isComposerInPublicDomain(selectedComposer) && (
            <div className="container mx-auto px-4 h-full">
              <ChatInterface
                composer={selectedComposer}
                onUserTyping={() => {}}
                isComposerListOpen={isMenuOpen}
              />
            </div>
          )}
          {selectedComposer && !isComposerInPublicDomain(selectedComposer) && (
            <div className="container mx-auto px-4 h-full flex items-center justify-center">
              <div className="text-center p-6 bg-muted/50 rounded-lg shadow">
                <h2 className="text-xl font-semibold mb-2">Chat Unavailable</h2>
                <p className="text-muted-foreground">
                  Chatting with {selectedComposer.name} is unavailable due to copyright restrictions.
                </p>
              </div>
            </div>
          )}
        </div>
      </main>
    </div>
  );
}

export default Index;
