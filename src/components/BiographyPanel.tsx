
import { useState } from "react";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { ImageModal } from "./ImageModal";
import { Composer } from "@/data/composers";
import { 
  Drawer,
  DrawerClose,
  DrawerContent,
  DrawerFooter,
  DrawerHeader,
  DrawerTitle,
  DrawerDescription,
} from "@/components/ui/drawer";

interface BiographyPanelProps {
  composer: Composer;
  onStartChat: (composer: Composer) => void;
  onClose: () => void;
  isOpen: boolean;
}

export function BiographyPanel({
  composer,
  onStartChat,
  onClose,
  isOpen
}: BiographyPanelProps) {
  const [imageModalOpen, setImageModalOpen] = useState(false);

  const handleStartChat = () => {
    onStartChat(composer);
  };

  return (
    <>
      <Drawer open={isOpen} onOpenChange={(open) => {
        if (!open) onClose();
      }}>
        <DrawerContent
          className="
            max-h-[40vh]  /* Take only ~40% of viewport height */
            md:max-h-[36vh]
            overflow-y-auto
            shadow-lg
            border-none
            bg-card dark:bg-[#1A1F2C]
            px-4 py-5 md:px-8
            rounded-t-2xl
            flex flex-col
            !border-none
          "
          style={{
            boxShadow: "0px -2px 30px 0 rgba(0,0,0,0.12)",
            border: "none"
          }}
        >
          <div className="mx-auto w-full max-w-[900px] min-h-[20vh] flex flex-col justify-between transition-all bg-transparent p-0">
            {/* Top area: avatar, name, badge */}
            <div>
              <div className="flex flex-col items-center md:flex-row md:items-center md:justify-start gap-4 mb-1">
                <img 
                  src={composer.image} 
                  alt={composer.name} 
                  className="w-16 h-16 md:w-20 md:h-20 rounded-full object-cover border-4 border-background dark:border-[#403E43] shadow-md cursor-pointer" 
                  onClick={() => setImageModalOpen(true)} 
                  style={{background: "dark:bg-[#221F26]"}} 
                />
                <div className="flex flex-col items-center md:items-start">
                  <h2 className="text-lg font-bold font-serif mb-0.5 text-[#232834] dark:text-white md:text-xl">{composer.name}</h2>
                  <div className="flex flex-wrap items-center gap-2 text-base md:text-lg">
                    <span className="text-[#907C5C] dark:text-gray-300 text-base">{composer.country}</span>
                    <span className="text-[#907C5C] dark:text-gray-300 text-base">, {composer.years}</span>
                    <Badge variant="outline" className="bg-primary/10 text-primary border-primary/30">
                      {composer.era}
                    </Badge>
                  </div>
                </div>
              </div>

              {/* Biography */}
              <p className="text-sm text-[#46495D] dark:text-gray-300 text-center max-w-3xl mx-auto md:mx-0 mb-2 mt-2 md:text-base md:text-left leading-snug">
                {composer.bio}
              </p>

              {/* Notable Works */}
              <div className="mt-2">
                <h3 className="text-base font-bold font-serif mb-1 text-[#232834] dark:text-white md:text-base">Notable Works</h3>
                <ul className="list-disc pl-4 space-y-0.5">
                  {composer.famousWorks.slice(0, 3).map((work, index) => (
                    <li key={index} className="text-sm text-[#63687B] dark:text-gray-300">{work}</li>
                  ))}
                </ul>
              </div>
            </div>
            
            {/* Spacer grows to push button down */}
            <div className="flex-1" />

            {/* Start Conversation Button */}
            <div className="mt-2">
              <Button 
                onClick={handleStartChat} 
                className="bg-baroque text-white dark:bg-baroque/80 font-semibold text-base w-full py-2 rounded-xl shadow-md hover:bg-baroque/90 dark:hover:bg-baroque/70 transition-all duration-200"
              >
                Start Conversation
              </Button>
            </div>
          </div>
        </DrawerContent>
      </Drawer>

      {/* Image Modal */}
      <ImageModal 
        isOpen={imageModalOpen} 
        onClose={() => setImageModalOpen(false)} 
        imageSrc={composer.image} 
        composerName={composer.name} 
      />
    </>
  );
}

