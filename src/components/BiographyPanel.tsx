
import { useState } from "react";
import { Button } from "@/components/ui/button";
import { Card } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { ImageModal } from "./ImageModal";
import { Composer } from "@/data/composers";

interface BiographyPanelProps {
  composer: Composer;
  onStartChat: (composer: Composer) => void;
  onClose: () => void;
}

export function BiographyPanel({
  composer,
  onStartChat,
  onClose
}: BiographyPanelProps) {
  const [imageModalOpen, setImageModalOpen] = useState(false);
  const handleStartChat = () => {
    onStartChat(composer);
  };

  return <Card className="relative w-full max-w-[900px] mx-auto min-h-[65vh] md:min-h-[55vh] bg-card dark:bg-[#1A1F2C] flex flex-col justify-between py-8 px-4 md:px-8 animate-fade-in border-none shadow-none">
      {/* Top area: avatar, name, subtitle, badge */}
      <div>
        <div className="flex flex-col items-center md:flex-row md:items-center md:justify-start gap-4 mb-4">
          <img src={composer.image} alt={composer.name} className="w-20 h-20 md:w-24 md:h-24 rounded-full object-cover border-4 border-background dark:border-[#403E43] shadow-md cursor-pointer" onClick={() => setImageModalOpen(true)} style={{
          background: "dark:bg-[#221F26]"
        }} />
          <div className="flex flex-col items-center md:items-start">
            <h2 className="text-2xl font-bold font-serif mb-1 text-[#232834] dark:text-white md:text-2xl">{composer.name}</h2>
            <div className="flex flex-wrap items-center gap-2 text-base md:text-lg">
              <span className="text-[#907C5C] dark:text-gray-300 text-base">{composer.country}</span>
              <span className="text-[#907C5C] dark:text-gray-300 text-base">, {composer.years}</span>
              <Badge variant="outline" className="px-3 py-1 shadow-none text-sm font-semibold border-primary/30">
                {composer.era} Era
              </Badge>
            </div>
          </div>
        </div>

        {/* Biography */}
        <p className="text-base text-[#46495D] dark:text-gray-300 text-center max-w-4xl mx-auto md:mx-0 mb-8 mt-3 my-[13px] md:text-base md:text-left">
          {composer.bio}
        </p>

        {/* Notable Works */}
        <div className="mt-6 md:mt-8">
          <h3 className="text-lg font-bold font-serif mb-2 text-[#232834] dark:text-white md:text-xl">Notable Works</h3>
          <ul className="list-disc pl-4 space-y-1">
            {composer.famousWorks.slice(0, 3).map((work, index) => <li key={index} className="text-base text-[#63687B] dark:text-gray-300">{work}</li>)}
          </ul>
        </div>
      </div>
      
      {/* Spacer grows to push button down */}
      <div className="flex-1" />

      {/* Start Conversation Button */}
      <div className="mt-6 md:mt-8">
        <Button onClick={handleStartChat} className="bg-baroque text-white dark:bg-baroque/80 font-semibold text-base w-full py-3 rounded-xl shadow-md hover:bg-baroque/90 dark:hover:bg-baroque/70 transition-all duration-200">
          Start Conversation
        </Button>
      </div>

      {/* Image Modal */}
      <ImageModal isOpen={imageModalOpen} onClose={() => setImageModalOpen(false)} imageSrc={composer.image} composerName={composer.name} />
    </Card>;
}
