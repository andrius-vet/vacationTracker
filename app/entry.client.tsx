/**
 * By default, Remix will handle hydrating your app on the client for you.
 * You are free to delete this file if you'd like to, but if you ever want it revealed again, you can run `npx remix reveal` ✨
 * For more information, see https://remix.run/file-conventions/entry.client
 */

import { RemixBrowser } from "@remix-run/react";
import { startTransition, StrictMode } from "react";
import { hydrateRoot } from "react-dom/client";

startTransition(() => {
  hydrateRoot(
    document,
    <StrictMode>
      <RemixBrowser />
    </StrictMode>
  );
});

window.addEventListener('error', (event) => {
  alert(`Error: ${event.message}`);
});

window.addEventListener('unhandledrejection', (event) => {
  alert(`Unhandled Promise Rejection: ${event.reason}`);
});

const originalConsoleError = console.error;
console.error = function (...args) {
  originalConsoleError.apply(console, args);
  alert(`Console Error: ${args.join(" ")}`);
};
