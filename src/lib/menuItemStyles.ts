/**
 * Shared focus/highlight styles for Radix roving-focus menus.
 * Use data-[highlighted] for the active row (pointer + keyboard).
 * Roving-focus items intentionally omit focus rings — the highlight
 * background is the visible focus indicator (WCAG 2.4.7 for menus).
 */

export const radixMenuItemHighlightClassName =
  "outline-none ring-0 transition-colors data-[highlighted]:bg-accent data-[highlighted]:text-accent-foreground focus:ring-0 focus-visible:ring-0 data-[disabled]:pointer-events-none data-[disabled]:opacity-50";

/** Standard menu item (dropdown, context, menubar). */
export const radixMenuItemClassName = [
  "relative flex cursor-default select-none items-center rounded-sm px-2 py-1.5 text-sm",
  radixMenuItemHighlightClassName,
].join(" ");

/** Checkbox/radio menu items with leading indicator slot. */
export const radixMenuCheckboxRadioItemClassName = [
  "relative flex cursor-default select-none items-center rounded-sm py-1.5 pl-8 pr-2 text-sm",
  radixMenuItemHighlightClassName,
].join(" ");

/** Submenu trigger inside an open menu (roving focus). */
export const radixMenuSubTriggerClassName =
  "flex cursor-default select-none items-center rounded-sm px-2 py-1.5 text-sm outline-none ring-0 data-[highlighted]:bg-accent data-[state=open]:bg-accent focus:ring-0 focus-visible:ring-0";

/** Menubar top-level trigger (standalone tab stop — keeps keyboard ring). */
export const radixMenubarTriggerClassName =
  "flex cursor-default select-none items-center rounded-sm px-3 py-1.5 text-sm font-medium outline-none data-[highlighted]:bg-accent data-[highlighted]:text-accent-foreground data-[state=open]:bg-accent data-[state=open]:text-accent-foreground focus-visible:ring-2 focus-visible:ring-primary focus-visible:ring-offset-0";

/** Chat actions ⋮ trigger (44×44 touch target, circular hover). */
export const chatActionsTriggerClassName =
  "inline-flex h-11 w-11 min-h-[44px] min-w-[44px] items-center justify-center rounded-full text-foreground/70 hover:text-foreground/90 hover:bg-primary/20 focus:outline-none focus:ring-0 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-primary focus-visible:ring-offset-0 transition-colors aria-disabled:opacity-50 aria-disabled:cursor-not-allowed aria-disabled:hover:bg-transparent aria-disabled:hover:text-foreground/70";

/** Native button rows in the mobile chat actions sheet. */
export const chatActionsSheetItemClassName =
  "flex min-h-11 w-full items-center rounded-md px-3 py-3 text-left text-base font-medium text-foreground hover:bg-accent focus:outline-none focus:ring-0 focus-visible:outline-none focus-visible:bg-accent focus-visible:ring-2 focus-visible:ring-primary";
