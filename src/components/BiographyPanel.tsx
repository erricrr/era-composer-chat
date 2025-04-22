import { useState } from "react";
import { Button } from "@/components/ui/button";
import { Card } from "@/components/ui/card";
import { ScrollArea } from "@/components/ui/scroll-area";
import { ImageModal } from "./ImageModal";
import { Composer } from "@/data/composers";

interface BiographyPanelProps {
  composer: Composer;
  onStartChat: (composer: Composer) => void;
  onClose: () => void;
}

export function BiographyPanel({ composer, onStartChat, onClose }: BiographyPanelProps) {
  const [imageModalOpen, setImageModalOpen] = useState(false);

  return (
    <Card className="relative w-full max-w-5xl mx-auto grid grid-cols-1 md:grid-cols-[280px_1fr] gap-6 p-6 z-10 animate-fade-in bg-card/95 backdrop-blur-sm shadow-lg">
      <div className="flex flex-col items-center">
        <img
          src={composer.image}
          alt={composer.name}
          className="w-56 h-56 rounded-full object-cover cursor-pointer border-4 border-primary/20 hover:border-primary/40 transition-colors duration-300"
          onClick={() => setImageModalOpen(true)}
        />
        <div className="mt-4 text-center">
          <h2 className="text-2xl font-bold font-serif">{composer.name}</h2>
          <p className="text-sm text-muted-foreground flex gap-2 justify-center mt-1 font-medium">
            <span>{composer.years}</span>
            <span>•</span>
            <span>{composer.country}</span>
          </p>
        </div>
      </div>

      <div className="flex flex-col h-full">
        <div className="flex justify-end mb-4">
          <Button
            variant="ghost"
            size="icon"
            className="rounded-full"
            onClick={onClose}
            aria-label="Close biography"
          >
            ×
          </Button>
        </div>

        <div className="grid grid-cols-1 lg:grid-cols-[2fr_1fr] gap-6 mb-4">
          <ScrollArea className="h-[300px] rounded-md border p-4">
            <p className="text-foreground/90">{composer.bio}</p>
          </ScrollArea>

          <div>
            <h3 className="font-semibold mb-2">Notable Works:</h3>
            <ul className="list-disc pl-5 space-y-1">
              {composer.famousWorks.slice(0, 3).map((work, index) => (
                <li key={index} className="text-foreground/80">{work}</li>
              ))}
            </ul>
          </div>
        </div>
            
        <Button 
          onClick={handleStartChat}
          className="bg-primary text-primary-foreground hover:bg-primary/90 w-full"
        >
          Start Conversation
        </Button>
      </div>

      <ImageModal
        isOpen={imageModalOpen}
        onClose={() => setImageModalOpen(false)}
        imageSrc={composer.image}
        composerName={composer.name}
      />
    </Card>
  );
}
