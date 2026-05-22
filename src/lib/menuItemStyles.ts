/**
 * Shared focus/highlight styles for Radix roving-focus menus.
 * Use data-[highlighted] for the active row (pointer + keyboard);
 * use focus-visible for keyboard-only rings.
 */

export const radixMenuItemHighlightClassName =
  "outline-none transition-colors data-[highlighted]:bg-accent data-[highlighted]:text-accent-foreground focus-visible:ring-2 focus-visible:ring-primary focus-visible:ring-offset-0 data-[disabled]:pointer-events-none data-[disabled]:opacity-50";

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

/** Submenu trigger (dropdown/context/menubar sub). */
export const radixMenuSubTriggerClassName =
  "flex cursor-default select-none items-center rounded-sm px-2 py-1.5 text-sm outline-none data-[highlighted]:bg-accent data-[state=open]:bg-accent focus-visible:ring-2 focus-visible:ring-primary focus-visible:ring-offset-0";

/** Menubar top-level trigger. */
export const radixMenubarTriggerClassName =
  "flex cursor-default select-none items-center rounded-sm px-3 py-1.5 text-sm font-medium outline-none data-[highlighted]:bg-accent data-[highlighted]:text-accent-foreground data-[state=open]:bg-accent data-[state=open]:text-accent-foreground focus-visible:ring-2 focus-visible:ring-primary focus-visible:ring-offset-0";

/** Chat actions ⋮ trigger (44×44 touch target). */
export const chatActionsTriggerClassName =
  "inline-flex h-11 w-11 min-h-[44px] min-w-[44px] items-center justify-center rounded-md text-muted-foreground hover:text-foreground hover:bg-muted focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-primary focus-visible:ring-offset-0 transition-colors disabled:opacity-50 disabled:cursor-not-allowed";

/** Native button rows in the mobile chat actions sheet. */
export const chatActionsSheetItemClassName =
  "flex min-h-11 w-full items-center rounded-md px-3 py-3 text-left text-base font-medium text-foreground hover:bg-accent focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-primary";
