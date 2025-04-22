
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
    <Card className="w-full max-w-3xl mx-auto">
      <CardHeader className="flex flex-row items-start justify-between space-y-0">
        <div>
          <CardTitle className="text-2xl font-serif mb-2">{composer.name}</CardTitle>
          <div className="flex gap-2 text-sm text-muted-foreground">
            <span>{composer.years}</span>
            <span>•</span>
            <span>{composer.country}</span>
          </div>
        </div>
        <Button
          variant="ghost"
          size="icon"
          className="rounded-full"
          onClick={onClose}
          aria-label="Close biography"
        >
          ×
        </Button>
      </CardHeader>
      <CardContent className="space-y-4">
        <div className="flex justify-center mb-6">
          <img
            src={composer.image}
            alt={composer.name}
            className="w-48 h-48 rounded-full object-cover cursor-pointer border-2 border-primary hover:border-primary/80 transition-colors"
            onClick={() => setImageModalOpen(true)}
          />
        </div>

        <ScrollArea className="h-[200px] rounded-md border p-4">
          <p className="text-foreground/90">{composer.bio}</p>
        </ScrollArea>
        
        <div className="space-y-2">
          <h3 className="font-semibold">Notable Works:</h3>
          <ul className="list-disc pl-5 space-y-1">
            {composer.famousWorks.slice(0, 3).map((work, index) => (
              <li key={index} className="text-foreground/80">{work}</li>
            ))}
          </ul>
        </div>

        <div className="flex justify-end mt-6">
          <Button 
            onClick={() => onStartChat(composer)}
            className="bg-primary text-primary-foreground hover:bg-primary/90"
          >
            Start Conversation
          </Button>
        </div>
      </CardContent>

      <ImageModal
        isOpen={imageModalOpen}
        onClose={() => setImageModalOpen(false)}
        imageSrc={composer.image}
        composerName={composer.name}
      />
    </Card>
  );
}
