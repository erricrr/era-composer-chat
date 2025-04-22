
import { useState } from "react";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
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
    <Card className="w-full max-w-3xl mx-auto grid grid-cols-[300px_1fr] gap-6 p-6">
      <div className="flex flex-col items-center">
        <img
          src={composer.image}
          alt={composer.name}
          className="w-64 h-64 rounded-full object-cover cursor-pointer border-4 border-primary/30 hover:border-primary transition-all"
          onClick={() => setImageModalOpen(true)}
        />
        <div className="mt-4 text-center">
          <h2 className="text-xl font-bold font-serif">{composer.name}</h2>
          <p className="text-sm text-muted-foreground flex gap-2 justify-center">
            <span>{composer.years}</span>
            <span>•</span>
            <span>{composer.country}</span>
          </p>
        </div>
      </div>

      <div className="flex flex-col">
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

        <ScrollArea className="h-[300px] rounded-md border p-4 mb-4">
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

        <div className="mt-auto text-right">
          <Button 
            onClick={() => onStartChat(composer)}
            className="bg-primary text-primary-foreground hover:bg-primary/90"
          >
            Start Conversation
          </Button>
        </div>
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
