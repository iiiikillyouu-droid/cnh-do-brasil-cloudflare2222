import { useEffect } from "react";
export function BrowserRestrictions() {
  useEffect(() => {
    const wheel = (event: WheelEvent) => { if (event.ctrlKey || event.metaKey) event.preventDefault(); };
    const key = (event: KeyboardEvent) => { if ((event.ctrlKey || event.metaKey) && ["+", "-", "=", "0"].includes(event.key)) event.preventDefault(); };
    const gesture = (event: Event) => event.preventDefault();
    document.addEventListener("wheel", wheel, { passive: false });
    document.addEventListener("keydown", key);
    document.addEventListener("gesturestart", gesture, { passive: false });
    document.addEventListener("gesturechange", gesture, { passive: false });
    return () => { document.removeEventListener("wheel", wheel); document.removeEventListener("keydown", key); document.removeEventListener("gesturestart", gesture); document.removeEventListener("gesturechange", gesture); };
  }, []);
  return null;
}