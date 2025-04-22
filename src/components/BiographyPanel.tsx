
import { useState } from "react";
import { Button } from "@/components/ui/button";
import { Card } from "@/components/ui/card";
import { ScrollArea } from "@/components/ui/scroll-area";
import { Badge } from "@/components/ui/badge";
import { Composer } from "@/data/composers";
import { ImageModal } from "@/components/ImageModal";

interface BiographyPanelProps {
  composer: Composer;
  onStartChat: (composer: Composer) => void;
}

export function BiographyPanel({ composer, onStartChat }: BiographyPanelProps) {
  const [imageModalOpen, setImageModalOpen] = useState(false);

  const handleStartChat = () => {
    onStartChat(composer);
  };

  return (
    <Card className="w-full mx-auto grid grid-cols-1 md:grid-cols-[180px_1fr] gap-4 p-4">
      <div className="flex flex-col items-center">
        <div 
          className="cursor-pointer hover:opacity-90 transition-opacity relative"
          onClick={() => setImageModalOpen(true)}
          title="Click to view larger image"
        >
          <img
            src={composer.image}
            alt={composer.name}
            className="w-32 h-32 rounded-full object-cover border-4 border-primary/30"
          />
          <div className="absolute inset-0 flex items-center justify-center bg-black/10 rounded-full opacity-0 hover:opacity-100 transition-opacity">
            <svg 
              xmlns="http://www.w3.org/2000/svg" 
              width="24" 
              height="24" 
              viewBox="0 0 24 24" 
              fill="none" 
              stroke="currentColor" 
              strokeWidth="2" 
              strokeLinecap="round" 
              strokeLinejoin="round" 
              className="text-white"
            >
              <path d="M15 3h6v6"></path>
              <path d="m10 14 11-11"></path>
              <path d="M21 12v7a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2V5a2 2 0 0 1 2-2h7"></path>
            </svg>
          </div>
        </div>
        <div className="mt-3 text-center">
          <h2 className="text-xl font-bold font-serif mb-1">{composer.name}</h2>
          <div className="flex flex-wrap gap-2 justify-center mb-1">
            <Badge variant="outline" className="bg-primary/10 text-primary border-primary/30">
              {composer.era} Era
            </Badge>
          </div>
          <p className="text-sm text-muted-foreground flex gap-2 justify-center">
            <span>{composer.years}</span>
            <span>•</span>
            <span>{composer.country}</span>
          </p>
        </div>
      </div>

      <div className="flex flex-col h-full">
        <div className="grid grid-cols-1 lg:grid-cols-[1.5fr_1fr] gap-4 mb-4 h-[250px]">
          <ScrollArea className="h-full rounded-md border p-4">
            <div className="pr-2">
              <p className="text-foreground/90 text-sm">{composer.bio}</p>
            </div>
          </ScrollArea>

          <div className="border rounded-md p-4 h-full">
            <h3 className="font-semibold mb-2 text-sm">Notable Works:</h3>
            <ScrollArea className="h-[calc(100%-30px)]">
              <ul className="list-disc pl-5 space-y-1">
                {composer.famousWorks.map((work, index) => (
                  <li key={index} className="text-foreground/80 text-sm">{work}</li>
                ))}
              </ul>
            </ScrollArea>
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
