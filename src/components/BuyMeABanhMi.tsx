import type { MouseEvent } from "react";
import { Button } from "@/components/ui/button";

interface BuyMeABanhMiProps {
  /** When true, adds drawer-specific handlers/attributes for vaul. */
  inDrawer?: boolean;
}

export function BuyMeABanhMi({ inDrawer = false }: BuyMeABanhMiProps) {
  const handleLinkClick = inDrawer
    ? (e: MouseEvent) => e.stopPropagation()
    : undefined;

  return (
    <div
      className="rounded-lg border border-border bg-muted/50 px-4 py-3 flex flex-col items-center justify-center shadow-sm gap-2"
      {...(inDrawer ? { "data-vaul-no-drag": "true" } : {})}
    >
      <Button
        asChild
        size="sm"
        className="min-h-[36px] w-full sm:w-auto px-4 bg-[#805080] text-[#f7f6f2] hover:bg-[#735073] hover:text-[#f7f6f2] font-bold"
      >
        <a
          href="https://buymeacoffee.com/erricrr"
          target="_blank"
          rel="noopener noreferrer"
          onClick={handleLinkClick}
          {...(inDrawer
            ? {
                "data-vaul-no-drag": "true",
                "data-vaul-drawer-ignore": "true",
              }
            : {})}
          aria-label="Buy me a bánh mì (opens in a new tab)"
        >
          🥖 Buy me a bánh mì
        </a>
      </Button>
      <p className="text-xs text-muted-foreground text-center">
        A small way to support what I’m building
      </p>
    </div>
  );
}
