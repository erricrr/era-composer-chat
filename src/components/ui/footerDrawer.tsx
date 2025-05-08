import React, { useState } from "react";
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
import { faInfoCircle } from '@fortawesome/free-solid-svg-icons';
import { Tooltip, TooltipTrigger, TooltipContent } from "@/components/ui/tooltip";

const FooterDrawer: React.FC = () => {
  const [isOpen, setIsOpen] = useState(false);

  // Toggle drawer open/close on info-icon click
  const toggleDrawer = (e: React.MouseEvent) => {
    e.stopPropagation();
    setIsOpen(prev => !prev);
  };

  return (
    <>
      <Tooltip>
        <TooltipTrigger asChild>
          <Button
            variant="ghost"
            size="sm"
            className="p-2 rounded-md hover:bg-muted transition-colors duration-200 text-muted-foreground hover:text-muted-foreground"
            onClick={toggleDrawer}
            aria-label="About"
          >
            <FontAwesomeIcon icon={faInfoCircle} className="h-5 w-5" />
          </Button>
        </TooltipTrigger>
        <TooltipContent side="bottom" className="text-xs">
          About
        </TooltipContent>
      </Tooltip>

      <Drawer open={isOpen} onOpenChange={setIsOpen}>
        {/* close drawer when transparent background is touched */}
        <DrawerContent className="z-[150]" onOverlayClick={() => setIsOpen(false)}>
          <div className="flex flex-col max-h-[85vh]">
            <DrawerHeader className="pb-2">
              <DrawerTitle className="text-center text-lg font-semibold text-primary">
                Composer AI Chat
              </DrawerTitle>
              <DrawerDescription className="text-center text-muted-foreground">
                An educational tool for exploring classical music through interactive conversations
              </DrawerDescription>
            </DrawerHeader>

            <div className="px-4 overflow-y-auto">
              <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-3">
                <div className="space-y-1">
                  <h3 className="font-medium text-lg text-primary">
                    Educational Purpose
                  </h3>
                  <p className="text-sm text-muted-foreground">
                    This application was designed to make classical music more accessible and engaging
                    through interactive AI conversations with historical composers. Explore music history and discover
                    the stories behind famous works.
                  </p>
                </div>
                <div className="space-y-1">
                  <h3 className="font-medium text-lg text-primary">
                    AI Generated Content
                  </h3>
                  <p className="text-sm text-muted-foreground">
                    Responses are AI generated and do not represent the actual views or words of the composers.
                    AI technology is used to create historically informed representations of composers.
                  </p>
                </div>
                <div className="space-y-1">
                  <h3 className="font-medium text-lg text-primary">
                    Contact / Feedback
                  </h3>
                  <p className="text-sm text-muted-foreground">
                    We value your feedback and suggestions. If you have ideas for improving the app or
                    adding new composers, please contact our support team through the support portal.
                  </p>
                </div>
              </div>

              <div className="mt-4 mb-2 text-xs text-muted-foreground text-center">
                <p>
                  Privacy Policy: We do not collect or store personal data. Chat conversations are not permanently stored.
                </p>
                <p>
                  Terms of Use: This application is intended for educational purposes only.
                </p>
              </div>
            </div>

            <DrawerFooter className="mt-auto border-t border-border">
              <p className="text-xs text-muted-foreground text-center">
                © {new Date().getFullYear()} AI Composer Chat - An educational tool for exploring classical music
              </p>
              <DrawerClose asChild>
                <Button
                  variant="outline"
                  size="sm"
                  className="w-full bg-primary text-primary-foreground hover:bg-primary/90 hover:text-primary-foreground"
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
