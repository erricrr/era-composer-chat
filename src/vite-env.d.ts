/// <reference types="vite/client" />
/// <reference types="vite-plugin-pwa/client" />

import "react";

declare module "react" {
  interface HTMLAttributes<T> {
    /** Prevents focus and interaction on the element and its descendants. */
    inert?: boolean;
  }
}
