import { useEffect, useState } from "react";
import { MascotHead } from "../assets/MascotHead";
import { PIXEL } from "../lib/text";

/** PixelMascot's head + the title screen's glitching DRILL MODE wordmark. */
export function Logo() {
  // Same timing as TitleScreen.tsx: a 120 ms glitch every 3 s.
  const [glitch, setGlitch] = useState(false);
  useEffect(() => {
    let off: number | undefined;
    const timer = window.setInterval(() => {
      setGlitch(true);
      off = window.setTimeout(() => setGlitch(false), 120);
    }, 3000);
    return () => { window.clearInterval(timer); window.clearTimeout(off); };
  }, []);

  return (
    <div className="logo" aria-label="Drill Mode">
      <MascotHead size={34} />
      <div
        className="logo-text"
        style={{
          fontFamily: PIXEL,
          color: "#00ff88",
          textShadow: glitch ? "3px 0 #ff2d55, -3px 0 #4ecdc4" : "3px 3px 0 #006633, 0 0 16px rgba(0,255,136,0.5)",
          transform: glitch ? "translateX(1px) skewX(-4deg)" : "none",
        }}
      >
        DRILL MODE
      </div>
    </div>
  );
}
