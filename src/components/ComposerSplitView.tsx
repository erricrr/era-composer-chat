import React, { ReactNode, useState, useEffect } from "react";
import { Composer } from "@/data/composers";
import {
  ResizablePanelGroup,
  ResizablePanel,
  ResizableHandle,
} from "@/components/ui/resizable";
import { useIsMobile } from "@/hooks/use-mobile";
import {
  activeChatsLayoutTransitionClass,
  getActiveChatsShellLayout,
} from "@/lib/activeChatsLayout";
import { cn } from "@/lib/utils";
import { Badge } from "@/components/ui/badge";
import { ContentScrollAffordanceArea } from "@/components/ui/scroll-affordance-area";
import { MusicNoteDecoration } from "@/components/MusicNoteDecoration";
import { ImageModal } from "@/components/ImageModal";
import { PortraitImage } from "./PortraitImage";
import { ChatActionsMenu } from "./ChatActionsMenu";

interface ComposerSplitViewProps {
  composer: Composer;
  isOpen: boolean;
  onClose: () => void;
  onReset?: () => void;
  onCloseChat?: () => void;
  children: ReactNode;
  isActiveChatsOpen?: boolean;
}

export function ComposerSplitView({
  composer,
  isOpen,
  onClose,
  onReset,
  onCloseChat,
  children,
  isActiveChatsOpen = false,
}: ComposerSplitViewProps) {
  const isMobile = useIsMobile();
  const splitTransitionStyle = { transitionDuration: "220ms" };

  // SIMPLIFIED: Don't use localStorage at all, just a simple state
  const [imageModalOpen, setImageModalOpen] = useState(false);
  // Add ref to image button for focus management
  const imageButtonRef = React.useRef<HTMLButtonElement>(null);
  // Ref for header composer name focus management
  const nameButtonRef = React.useRef<HTMLDivElement>(null);

  // IMPORTANT: This effect ensures the image modal is ALWAYS closed when the split view closes
  useEffect(() => {
    if (!isOpen) {
      setImageModalOpen(false);
    }
  }, [isOpen]);

  // Close split view on Escape; ImageModal handles Escape while the image is open
  useEffect(() => {
    const handleKeyDown = (e: KeyboardEvent) => {
      if (e.key === "Escape" && !imageModalOpen) {
        onClose();
      }
    };
    if (isOpen) {
      window.addEventListener("keydown", handleKeyDown);
    }
    return () => {
      window.removeEventListener("keydown", handleKeyDown);
    };
  }, [isOpen, onClose, imageModalOpen]);

  // Clean early return - don't render anything when closed
  if (!isOpen) return null;

  const handleCloseImageModal = () => setImageModalOpen(false);
  const handleOpenImageModal = () => setImageModalOpen(true);

  const composerContent = (
    // Add relative positioning context for the modal
    <div className="relative h-full flex flex-col pt-2">
      {/* Background Music Notes */}
      <div className="absolute inset-0 overflow-hidden -z-10">
        <MusicNoteDecoration />
      </div>

      {/* Fixed Header - Now outside ScrollArea */}
      <div
        className="relative flex items-center justify-center border-b py-7 bg-primary-foreground backdrop-blur-sm shadow-md z-[20] flex-shrink-0 group w-full cursor-pointer focus-ring-inset focus:rounded-none ComposerSplitView-header"
        tabIndex={0}
        role="button"
        aria-label="Hide composer biography"
        onClick={(e) => {
          e.stopPropagation();
          onClose();
        }}
        onKeyDown={(e) => {
          if (e.key === "Enter" || e.key === " ") {
            e.preventDefault();
            onClose();
          }
        }}
      >
        <div className="absolute inset-0 flex items-center justify-center">
          <div
            ref={nameButtonRef}
            onClick={(e) => {
              e.stopPropagation();
              onClose();
            }}
            className="cursor-pointer font-bold font-serif text-lg md:text-xl truncate max-w-[calc(100%-6.5rem)] px-4"
          >
            {composer.name}
          </div>
        </div>
        <div
          data-chat-actions-menu
          className="absolute right-4 z-10 isolate"
          onClick={(e) => e.stopPropagation()}
          onPointerDown={(e) => e.stopPropagation()}
        >
          <ChatActionsMenu
            isSplitView={true}
            onToggleView={onClose}
            onReset={onReset ?? (() => {})}
            onCloseChat={onCloseChat}
            isMobile={isMobile}
            stopPropagation={true}
            triggerClassName="group-hover:bg-primary/20"
          />
        </div>
      </div>

      {/* Scrollable Content Area */}
      <div className="flex-1 overflow-hidden">
        <ContentScrollAffordanceArea
          bgVar="primary-foreground"
          className="h-full"
        >
          <div
            className={`space-y-4 md:space-y-6 ${
              isMobile
                ? "p-3" // Compact padding for mobile
                : isActiveChatsOpen
                  ? "p-3 md:p-4"
                  : "p-4 md:p-6"
            }`}
          >
            <div
              className={`flex flex-col items-center text-center ${isMobile ? "space-y-2" : "space-y-3"}`}
            >
              <button
                ref={imageButtonRef}
                type="button"
                onClick={handleOpenImageModal}
                className={`transform transition-transform duration-200 hover:scale-105 appearance-none focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-primary focus-visible:ring-offset-2 focus-visible:z-10 relative cursor-pointer rounded-full overflow-hidden border-2 border-primary flex-shrink-0 ${
                  isMobile
                    ? "w-32 h-32"
                    : isActiveChatsOpen
                      ? "w-20 h-20 md:w-32 md:h-32 lg:w-40 lg:h-40 xl:w-48 xl:h-48"
                      : "w-32 h-32 md:w-48 md:h-48 lg:w-56 lg:h-56 xl:w-64 xl:h-64"
                }`}
                aria-label={`View full image of ${composer.name}`}
              >
                <PortraitImage
                  composerId={composer.id}
                  src={composer.imageUrl}
                  alt={composer.name}
                />
              </button>

              {/* Composer info (nationality, years, era badges) */}
              <div
                tabIndex={0}
                className="focus-ring-inset focus:rounded-none flex flex-col md:flex-col items-center gap-2 mt-2 text-center"
              >
                <span
                  className={`text-muted-foreground ${
                    isMobile
                      ? "text-base"
                      : isActiveChatsOpen
                        ? "text-sm"
                        : "text-base"
                  }`}
                >
                  {composer.nationality}, {composer.birthYear}-
                  {composer.deathYear || "present"}
                </span>
                <div className="flex flex-wrap justify-center gap-1">
                  {Array.isArray(composer.era) ? (
                    composer.era.map((era, idx) => (
                      <Badge
                        key={era + idx}
                        variant="badge"
                        className={
                          isMobile
                            ? "text-sm px-2 py-0.5"
                            : isActiveChatsOpen
                              ? "text-[10px] px-1.5 py-0.5"
                              : ""
                        }
                      >
                        {era}
                      </Badge>
                    ))
                  ) : (
                    <Badge
                      variant="badge"
                      className={
                        isMobile
                          ? "text-sm px-2 py-0.5"
                          : isActiveChatsOpen
                            ? "text-[10px] px-1.5 py-0.5"
                            : ""
                      }
                    >
                      {composer.era}
                    </Badge>
                  )}
                </div>
              </div>
            </div>

            <div
              tabIndex={0}
              className="focus-ring-inset focus:rounded-none space-y-4 md:space-y-6 max-w-prose mx-auto"
            >
              <div>
                <p
                  className={`text-foreground/90 bio-text ${
                    isMobile
                      ? "text-base"
                      : isActiveChatsOpen
                        ? "text-sm md:text-base"
                        : "text-base"
                  }`}
                >
                  {composer.longBio}
                </p>
              </div>

              <div>
                <h3
                  className={`font-semibold mb-2 ${
                    isMobile
                      ? "text-lg"
                      : isActiveChatsOpen
                        ? "text-base"
                        : "text-lg"
                  }`}
                >
                  Notable Works
                </h3>
                <ul className="list-disc pl-5 mb-5 space-y-1">
                  {composer.famousWorks.map((work, index) => (
                    <li
                      key={index}
                      className={`text-foreground/80 ${
                        isMobile
                          ? "text-base"
                          : isActiveChatsOpen
                            ? "text-sm md:text-base"
                            : "text-base"
                      }`}
                    >
                      {work}
                    </li>
                  ))}
                </ul>
              </div>
            </div>
          </div>
          {/* Scroll shadow for all screen sizes */}
          <div className="pointer-events-none absolute bottom-0 left-0 w-full h-6 bg-gradient-to-t from-background to-transparent z-10" />
        </ContentScrollAffordanceArea>
      </div>

      <ImageModal
        variant="panel"
        isOpen={imageModalOpen}
        onClose={handleCloseImageModal}
        imageSrc={composer.imageUrl}
        composerName={composer.name}
        composerId={composer.id}
        returnFocusRef={imageButtonRef}
      />
    </div>
  );

  const activeChatsShell = getActiveChatsShellLayout(isActiveChatsOpen, {
    isMobile,
  });

  if (isMobile) {
    return (
      <div
        {...activeChatsShell.dataAttribute}
        className={cn(
          "fixed inset-0 z-40",
          activeChatsLayoutTransitionClass,
          activeChatsShell.shellClass,
        )}
        style={activeChatsShell.insetStyle}
      >
        <ResizablePanelGroup
          direction="vertical"
          className="h-full transition-opacity duration-200 ease-in-out"
        >
          {/* Composer Panel */}
          <ResizablePanel
            defaultSize={50}
            minSize={30}
            maxSize={60}
            className={cn(
              "bg-secondary/50 backdrop-blur-sm flex flex-col ease-in-out p-0 overflow-hidden transition-[opacity,transform] motion-reduce:!transition-none motion-reduce:duration-0",
              isOpen
                ? "opacity-100 scale-100"
                : "opacity-0 scale-95 pointer-events-none",
            )}
            style={splitTransitionStyle}
            id="composer-panel-mobile"
            aria-label="Composer Panel"
          >
            {composerContent}
          </ResizablePanel>

          <ResizableHandle
            withHandle
            className={`transition-opacity duration-200 ease-in-out ${
              isOpen ? "opacity-100" : "opacity-0 pointer-events-none"
            }`}
            aria-controls="composer-panel-mobile chat-panel-mobile"
          />

          {/* Chat Panel */}
          <ResizablePanel
            defaultSize={50}
            minSize={40}
            maxSize={70}
            className={cn(
              "bg-background ease-in-out transition-[opacity,transform] motion-reduce:!transition-none motion-reduce:duration-0",
              isOpen
                ? "opacity-100 scale-100"
                : "opacity-0 scale-105 pointer-events-none",
            )}
            style={splitTransitionStyle}
            id="chat-panel-mobile"
            aria-label="Chat Panel"
          >
            {/* min-h-0 + overflow-hidden: single scroll surface stays on ChatInterface main (not a nested overflow-auto). */}
            <div className="flex h-full min-h-0 flex-col overflow-hidden">
              {children}
            </div>
          </ResizablePanel>
        </ResizablePanelGroup>
      </div>
    );
  }

  return (
    <div
      {...activeChatsShell.dataAttribute}
      className={cn(
        "fixed inset-0 z-40",
        activeChatsLayoutTransitionClass,
        activeChatsShell.shellClass,
      )}
      style={activeChatsShell.insetStyle}
    >
      <div
        className={`absolute inset-0 bg-background/80 backdrop-blur-sm transition-opacity duration-200 ease-in-out ${
          isOpen ? "opacity-100" : "opacity-0"
        }`}
      ></div>
      <ResizablePanelGroup
        direction={isMobile ? "vertical" : "horizontal"}
        className={cn(
          "h-full w-full ease-in-out transition-[opacity,transform] motion-reduce:!transition-none motion-reduce:duration-0",
          isOpen
            ? "opacity-100 scale-100"
            : "opacity-0 scale-95 pointer-events-none",
        )}
        style={splitTransitionStyle}
      >
        {/* Composer Panel */}
        <ResizablePanel
          defaultSize={isMobile ? 40 : 38}
          minSize={isMobile ? 30 : 35}
          maxSize={isMobile ? 60 : 65}
          className="bg-primary-foreground/50 backdrop-blur-sm flex flex-col p-0 overflow-hidden"
          id={isMobile ? "composer-panel-mobile" : "composer-panel-desktop"}
          aria-label="Composer Panel"
          order={1}
        >
          {composerContent}
        </ResizablePanel>

        <ResizableHandle
          withHandle
          className={`transition-opacity duration-500 ${isOpen ? "opacity-100" : "opacity-0"}`}
          aria-controls={
            isMobile
              ? "composer-panel-mobile chat-panel-mobile"
              : "composer-panel-desktop chat-panel-desktop"
          }
        />

        {/* Chat Panel */}
        <ResizablePanel
          defaultSize={isMobile ? 60 : 62}
          minSize={isMobile ? 40 : 35}
          maxSize={isMobile ? 70 : 65}
          className="bg-background"
          id={isMobile ? "chat-panel-mobile" : "chat-panel-desktop"}
          aria-label="Chat Panel"
          order={2}
        >
          <div className="flex h-full min-h-0 flex-col overflow-hidden">
            {children}
          </div>
        </ResizablePanel>
      </ResizablePanelGroup>
    </div>
  );
}
