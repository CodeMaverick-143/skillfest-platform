"use client";

import { Navbar } from "@/components/navbar";
import { Footer } from "@/components/footer";

/**
 * Renders Navbar + Footer for all pages.
 * Previously this excluded /event-closed, but since that page
 * now matches the home design language it should have the full site chrome.
 */
export function ConditionalChrome({ children }: { children: React.ReactNode }) {
  return (
    <>
      <Navbar />
      {children}
      <Footer />
    </>
  );
}
