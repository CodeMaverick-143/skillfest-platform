"use client";

import { useEffect, useState } from "react";
import { useRouter, usePathname } from "next/navigation";

const BACKEND = process.env.NEXT_PUBLIC_BACKEND_URL || "http://localhost:8080";

export function EventGate({ children }: { children: React.ReactNode }) {
  const [status, setStatus] = useState<"loading" | "active" | "closed">("loading");
  const router = useRouter();
  const pathname = usePathname();

  // Pages that are exempt from the gate
  const isEventClosedPage = pathname === "/event-closed";
  const isHomePage = pathname === "/";

  useEffect(() => {
    // If we're on a page that handles its own event state (like Home or EventClosed), skip the gate
    if (isEventClosedPage || isHomePage) {
      setStatus("active"); 
      return;
    }

    fetch(`${BACKEND}/api/event/status`, { credentials: "include" })
      .then((r) => r.json())
      .then((data) => {
        const isEnded = data.phase === "ended" || data.is_event_active === false;
        
        if (isEnded) {
          setStatus("closed");
          router.replace("/event-closed");
        } else {
          setStatus("active");
        }
      })
      .catch(() => {
        // On network error, fail open so a dead API doesn't lock everyone out
        setStatus("active");
      });
  }, [router, pathname]);

  // While loading: render children transparently (avoids layout flash)
  if (status === "loading") return <>{children}</>;

  // Closed + not on an exempt page: return null (router.replace is already navigating)
  if (status === "closed") return null;

  return <>{children}</>;
}
