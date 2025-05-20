import React, { useState, useRef, useEffect } from "react";
import {
  Drawer,
  DrawerContent,
  DrawerHeader,
  DrawerFooter,
  DrawerTitle,
  DrawerDescription,
  DrawerClose
} from "./drawer";
import { Button } from "@/components/ui/button";
import { FontAwesomeIcon } from '@fortawesome/react-fontawesome';
import { faInfoCircle, faEnvelope } from '@fortawesome/free-solid-svg-icons';

interface FooterDrawerProps {
  onTrigger?: () => void;
  onVisibilityChange?: (isVisible: boolean) => void;
}

const FooterDrawer: React.FC<FooterDrawerProps> = ({ onTrigger, onVisibilityChange }) => {
  const [isOpen, setIsOpen] = useState(false);
  const infoButtonRef = useRef<HTMLButtonElement>(null);
  const closeButtonRef = useRef<HTMLButtonElement>(null);
  const drawerContentRef = useRef<HTMLDivElement>(null);

  // Refs to track previous state for focus management
  const initialMount = useRef(true);
  const prevIsOpen = useRef(isOpen);

  // Toggle drawer open/close on info-icon click
  const toggleDrawer = (e: React.MouseEvent) => {
    e.stopPropagation();
    const newIsOpen = !isOpen;
    setIsOpen(newIsOpen);
    if (newIsOpen && onTrigger) {
      onTrigger();
    }
  };

  // Effect to report visibility changes
  useEffect(() => {
    if (onVisibilityChange) {
      onVisibilityChange(isOpen);
    }
  }, [isOpen, onVisibilityChange]);

  // Focus management when drawer opens/closes
  useEffect(() => {
    if (initialMount.current) {
      initialMount.current = false;
      // On initial mount, if isOpen is false, do nothing here regarding infoButtonRef focus.
      // The blur effect (further down) will handle if it somehow gets focused.
      if (isOpen) { // If somehow initial state is open, focus close button
        setTimeout(() => closeButtonRef.current?.focus(), 100);
      }
    } else {
      if (isOpen) {
        // Focus the close button when the drawer opens
        setTimeout(() => {
          closeButtonRef.current?.focus();
        }, 100);
      } else if (prevIsOpen.current && !isOpen) {
        // Only return focus if drawer was previously open and is now closing
        if (infoButtonRef.current) {
          infoButtonRef.current.focus();
        }
      }
    }
    prevIsOpen.current = isOpen; // Update previous state for next render
  }, [isOpen]);

  // Effect to blur the info button if it's focused on initial page load
  useEffect(() => {
    const timerId = setTimeout(() => {
      const button = infoButtonRef.current;
      if (button && document.activeElement === button) {
        button.blur();
      }
    }, 0); // setTimeout with 0 delay defers execution until after the current call stack clears

    return () => clearTimeout(timerId); // Cleanup the timeout if the component unmounts
  }, []); // Empty dependency array ensures this runs only once on mount

  // Handle keyboard navigation and focus trapping
  useEffect(() => {
    if (!isOpen || !drawerContentRef.current) return;

    const handleKeyDown = (e: KeyboardEvent) => {
      // Close on Escape
      if (e.key === 'Escape') {
        setIsOpen(false);
        return;
      }

      // Trap focus within the drawer
      if (e.key === 'Tab') {
        const focusableElements = drawerContentRef.current?.querySelectorAll(
          'button, [href], input, select, textarea, [tabindex]:not([tabindex="-1"])'
        ) || [];

        const focusable = Array.from(focusableElements).filter(
          el => window.getComputedStyle(el as HTMLElement).display !== 'none'
        ) as HTMLElement[];

        if (focusable.length === 0) return;

        // Trap focus in a circle
        if (e.shiftKey && document.activeElement === focusable[0]) {
          e.preventDefault();
          focusable[focusable.length - 1].focus();
        } else if (!e.shiftKey && document.activeElement === focusable[focusable.length - 1]) {
          e.preventDefault();
          focusable[0].focus();
        }
      }
    };

    document.addEventListener('keydown', handleKeyDown);
    return () => document.removeEventListener('keydown', handleKeyDown);
  }, [isOpen]);

  return (
    <>
      <button
        ref={infoButtonRef}
        type="button"
        className="w-11 h-11 flex items-center justify-center rounded-md hover:bg-muted transition-colors duration-200 text-muted-foreground hover:text-muted-foreground focus-ring-inset"
        onClick={toggleDrawer}
        aria-label="About"
        aria-expanded={isOpen}
      >
        <FontAwesomeIcon icon={faInfoCircle} className="h-4 w-4" />
      </button>

      <Drawer open={isOpen} onOpenChange={setIsOpen}>
        {/* close drawer when transparent background is touched */}
        <DrawerContent
          ref={drawerContentRef}
          className="z-[150] select-text"
          onOverlayClick={() => setIsOpen(false)}
          role="dialog"
          aria-modal="true"
          aria-label="About Era Composer Chat"
        >
          <div className="flex flex-col max-h-[85vh] overflow-y-auto">
            <DrawerHeader className="pb-2 flex-shrink-0">
              <DrawerTitle className="text-center text-lg font-semibold text-primary" tabIndex={0} data-vaul-no-drag="true">
                Era Composer Chat
              </DrawerTitle>
              <DrawerDescription className="text-center text-muted-foreground" tabIndex={0} data-vaul-no-drag="true">
                An educational tool for exploring classical music through interactive conversations
              </DrawerDescription>
            </DrawerHeader>

            <div className="px-4">
              <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-3">
                <div className="space-y-1">
                  <div className="relative py-2">
                    <h3
                      className="font-medium text-lg text-primary inline-block"
                      tabIndex={0}
                      data-vaul-no-drag="true"
                    >
                      <span className="focus-visible:ring-2 focus-visible:ring-primary focus-visible:rounded-sm focus-visible:ring-offset-2" data-vaul-no-drag="true">
                        Educational Purpose
                      </span>
                    </h3>
                  </div>
                  <p className="text-sm text-muted-foreground" tabIndex={0} data-vaul-no-drag="true">
                    This application was designed to make classical music more accessible and engaging
                    through interactive AI conversations with historical composers. Explore music history and discover
                    the stories behind famous works.
                  </p>
                </div>
                <div className="space-y-1">
                  <div className="relative py-2">
                    <h3
                      className="font-medium text-lg text-primary inline-block"
                      tabIndex={0}
                      data-vaul-no-drag="true"
                    >
                      <span className="focus-visible:ring-2 focus-visible:ring-primary focus-visible:rounded-sm focus-visible:ring-offset-2" data-vaul-no-drag="true">
                        AI Generated Content
                      </span>
                    </h3>
                  </div>
                  <p className="text-sm text-muted-foreground" tabIndex={0} data-vaul-no-drag="true">
                    Responses are AI generated and do not represent the actual views or words of the composers.
                    AI technology is used to create historically informed representations of composers.
                  </p>
                </div>
                <div className="space-y-1">
                  <div className="relative py-2">
                    <h3
                      className="font-medium text-lg text-primary inline-block"
                      tabIndex={0}
                      data-vaul-no-drag="true"
                    >
                      <span className="focus-visible:ring-2 focus-visible:ring-primary focus-visible:rounded-sm focus-visible:ring-offset-2" data-vaul-no-drag="true">
                        Contact / Feedback
                      </span>
                    </h3>
                  </div>
                  <p className="text-sm text-muted-foreground" tabIndex={0} data-vaul-no-drag="true">
                    I'd love to hear your feedback and ideas for improving the app or adding new composers! Drop me an <a
                      href="mailto:voicevoz321@gmail.com"
                      className="text-primary hover:underline focus:outline-none focus-visible:ring-1 focus-visible:ring-primary focus-visible:rounded-sm inline-flex items-center gap-1"
                      data-vaul-no-drag="true"
                      onClick={(e) => e.stopPropagation()}
                      data-vaul-drawer-ignore="true"
                      aria-label="email me (opens email client)"
                    >
                      email <FontAwesomeIcon icon={faEnvelope} className="h-3 w-3" aria-hidden="true" />
                    </a>. And if I'm accidentally breaking any laws (except maybe murdering Beethoven's 5th), do let me know—my lawyer will thank you!
                  </p>
                </div>
              </div>

              <div className="mt-4 mb-2 text-xs text-muted-foreground text-center">
                <p tabIndex={0} data-vaul-no-drag="true">
                  Privacy Policy: We do not collect or store personal data. Chat conversations are not permanently stored.
                </p>
                <p tabIndex={0} data-vaul-no-drag="true">
                  Terms of Use: This application is intended for educational purposes only.
                </p>
              </div>
            </div>

            <DrawerFooter className="mt-auto border-t border-border flex-shrink-0">
              <p className="text-xs text-muted-foreground text-center" tabIndex={0} data-vaul-no-drag="true">
                © {new Date().getFullYear()} Era Composer Chat - An educational tool for exploring classical music
              </p>
              <DrawerClose asChild>
                <Button
                  ref={closeButtonRef}
                  variant="outline"
                  size="sm"
                  className="w-full bg-primary text-primary-foreground hover:bg-primary/90 hover:text-primary-foreground focus-visible:ring-2 focus-visible:ring-primary focus-visible:ring-offset-2 focus-visible:outline-none"
                  aria-label="Close about drawer"
                >
                  Close
                </Button>
              </DrawerClose>
            </DrawerFooter>
          </div>
        </DrawerContent>
      </Drawer>
    </>
  );
};

export default FooterDrawer;
