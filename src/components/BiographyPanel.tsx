
import { useState } from "react";
import { Button } from "@/components/ui/button";
import { ScrollArea } from "@/components/ui/scroll-area";
import { Badge } from "@/components/ui/badge";
import { ImageModal } from "./ImageModal";
import { Composer } from "@/data/composers";
import {
  Drawer,
  DrawerContent,
  DrawerHeader,
  DrawerFooter,
} from "@/components/ui/drawer";

interface BiographyPanelProps {
  composer: Composer;
  onStartChat: (composer: Composer) => void;
  onClose: () => void;
  isOpen: boolean;
}

export function BiographyPanel({ composer, onStartChat, onClose, isOpen }: BiographyPanelProps) {
  const [imageModalOpen, setImageModalOpen] = useState(false);

  const handleStartChat = () => {
    onStartChat(composer);
  };

  return (
    <Drawer open={isOpen} onOpenChange={onClose}>
      <DrawerContent className="max-h-[85vh]">
        <div className="mx-auto w-full max-w-5xl">
          <DrawerHeader className="grid grid-cols-1 md:grid-cols-[300px_1fr] gap-6 px-6">
            <div className="flex flex-col items-center">
              <img
                src={composer.image}
                alt={composer.name}
                className="w-64 h-64 rounded-full object-cover cursor-pointer border-4 border-primary/30 hover:border-primary transition-all"
                onClick={() => setImageModalOpen(true)}
              />
              <div className="mt-4 text-center">
                <h2 className="text-xl font-bold font-serif mb-2">{composer.name}</h2>
                <div className="flex flex-wrap gap-2 justify-center mb-2">
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
            </div>
          </DrawerHeader>

          <DrawerFooter className="px-6">
            <Button 
              onClick={handleStartChat}
              className="bg-primary text-primary-foreground hover:bg-primary/90 w-full"
            >
              Start Conversation
            </Button>
          </DrawerFooter>
        </div>
      </DrawerContent>

      <ImageModal
        isOpen={imageModalOpen}
        onClose={() => setImageModalOpen(false)}
        imageSrc={composer.image}
        composerName={composer.name}
      />
    </Drawer>
  );
}
