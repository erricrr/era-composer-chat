import React from "react";
import {
  Drawer,
  DrawerTrigger,
  DrawerContent,
  DrawerHeader,
  DrawerFooter,
  DrawerTitle,
  DrawerDescription,
  DrawerClose,
} from "./drawer";
import { Button } from "@/components/ui/button";
import { FontAwesomeIcon } from '@fortawesome/react-fontawesome';
import { faInfoCircle } from '@fortawesome/free-solid-svg-icons';


const FooterDrawer = () => {
  return (
    <Drawer>
      <DrawerTrigger asChild>
        <Button
          variant="ghost"
          size="sm"
          className="flex items-center gap-1 text-muted-foreground hover:bg-transparent hover:text-primary p-1"
        >
          <FontAwesomeIcon icon={faInfoCircle} className="h-3.5 w-3.5" />
        </Button>
      </DrawerTrigger>
      <DrawerContent className="h-[90vh] overflow-hidden flex flex-col">
        <div className="flex flex-col h-full">
          <DrawerHeader className="flex-none">
            <DrawerTitle className="text-center text-lg font-semibold text-primary">
              AI Composer Chat
            </DrawerTitle>
            <DrawerDescription className="text-center text-muted-foreground">
              An educational tool for exploring classical music through interactive conversations
            </DrawerDescription>
          </DrawerHeader>

          {/* Main scrollable content */}
          <div className="flex-1 overflow-y-auto px-4 min-h-0">
            <div className="py-4 grid gap-6 md:grid-cols-2 lg:grid-cols-3">
              <div className="flex flex-col gap-2">
                <h3 className="font-medium text-lg flex items-center gap-2 text-primary">
                  Educational Purpose
                </h3>
                <p className="text-sm text-muted-foreground">
                  This application was designed to make classical music more accessible and engaging
                  through interactive AI conversations with historical composers. Explore music history and discover
                  the stories behind famous works.
                </p>
              </div>
              <div className="flex flex-col gap-2">
                <h3 className="font-medium text-lg flex items-center gap-2 text-primary">
                  AI Generated Content
                </h3>
                <p className="text-sm text-muted-foreground">
                Responses are AI generated and do not represent the actual views or words of the composers.
                AI technology is used to create historically informed representations of composers.
                </p>
              </div>
              <div className="flex flex-col gap-2">
                <h3 className="font-medium text-lg flex items-center gap-2 text-primary">
                  Contact / Feedback
                </h3>
                <p className="text-sm text-muted-foreground">
                  We value your feedback and suggestions. If you have ideas for improving the app or
                  adding new composers, please contact our support team through the support portal.
                </p>
              </div>
            </div>
            <div className="py-4 text-xs text-muted-foreground text-center">
              <p className="mb-1">
                Privacy Policy: We do not collect or store personal data. Chat conversations are not permanently stored.
              </p>
              <p>
                Terms of Use: This application is intended for educational purposes only.
              </p>
            </div>
          </div>

          {/* Footer - always visible at bottom */}
          <DrawerFooter className="flex-none border-t border-border mt-auto">
            <p className="text-xs text-muted-foreground pb-2">
              &copy; {new Date().getFullYear()} AI Composer Chat - An educational tool for exploring classical music
            </p>
            <DrawerClose asChild>
              <Button variant="outline" size="sm" className="w-full bg-primary text-primary-foreground hover:bg-primary/90 hover:text-primary-foreground transition-transform duration-300 hover:scale-[1.02]">
                Close
              </Button>
            </DrawerClose>
          </DrawerFooter>
        </div>
      </DrawerContent>
    </Drawer>
  );
};

export default FooterDrawer;
