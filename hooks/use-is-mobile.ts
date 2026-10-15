"use client";

import { useEffect, useState } from "react";

const MOBILE_BREAKPOINT = 768;

/** `null` until mounted — avoids SSR/client layout mismatch. */
export function useIsMobile(breakpoint = MOBILE_BREAKPOINT): boolean | null {
  const [isMobile, setIsMobile] = useState<boolean | null>(null);

  useEffect(() => {
    const mediaQuery = window.matchMedia(`(max-width: ${breakpoint - 1}px)`);

    const update = () => {
      setIsMobile(mediaQuery.matches);
    };

    update();
    mediaQuery.addEventListener("change", update);

    return () => {
      mediaQuery.removeEventListener("change", update);
    };
  }, [breakpoint]);

  return isMobile;
}
