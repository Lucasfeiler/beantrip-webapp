import { useEffect, useState } from 'react';

const FADE_OUT_AT_MS = 1400;
const UNMOUNT_AT_MS = 1900;

export default function SplashScreen() {
  const [visible, setVisible] = useState(true);
  const [fadingOut, setFadingOut] = useState(false);

  useEffect(() => {
    const fadeTimer = setTimeout(() => setFadingOut(true), FADE_OUT_AT_MS);
    const removeTimer = setTimeout(() => setVisible(false), UNMOUNT_AT_MS);
    return () => {
      clearTimeout(fadeTimer);
      clearTimeout(removeTimer);
    };
  }, []);

  if (!visible) return null;

  return (
    <div
      className={`fixed inset-0 z-[100] flex flex-col items-center justify-center gap-4 bg-[var(--color-bg)] transition-opacity duration-500 ${
        fadingOut ? 'opacity-0 pointer-events-none' : 'opacity-100'
      }`}
    >
      <div className="relative w-16 h-16 flex items-center justify-center">
        <div className="absolute -top-2 left-1/2 -translate-x-1/2 flex gap-2">
          {[0, 220, 440].map((delay) => (
            <span
              key={delay}
              className="w-1 h-3.5 rounded-full bg-[var(--color-accent)]"
              style={{ animation: 'splash-steam 1.6s ease-in-out infinite', animationDelay: `${delay}ms` }}
            />
          ))}
        </div>

        <svg viewBox="0 0 64 64" className="w-16 h-16">
          <defs>
            <clipPath id="splashCupClip">
              <rect x="18" y="24" width="26" height="24" rx="6" />
            </clipPath>
          </defs>
          <rect
            x="18" y="24" width="26" height="24"
            fill="var(--color-accent)"
            clipPath="url(#splashCupClip)"
            style={{ transformBox: 'fill-box', transformOrigin: 'bottom', animation: 'splash-fill 1s ease-out forwards' }}
          />
          <rect x="16" y="22" width="30" height="28" rx="8" fill="none" stroke="var(--color-primary)" strokeWidth="2.5" />
          <path d="M46 28 q9 0 9 8 t-9 8" fill="none" stroke="var(--color-primary)" strokeWidth="2.5" />
          <rect x="12" y="52" width="38" height="3" rx="1.5" fill="var(--color-primary)" />
        </svg>
      </div>

      <p
        className="font-display text-2xl font-semibold text-[var(--color-fg)]"
        style={{ animation: 'splash-fade-in 0.6s ease-out 0.4s both' }}
      >
        Bean<span className="text-[var(--color-accent)]">trip</span>
      </p>
    </div>
  );
}
