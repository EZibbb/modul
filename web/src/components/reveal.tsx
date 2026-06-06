"use client";

import { useEffect, useRef, useState } from "react";

// Появление блока при скролле (fade + лёгкий подъём). Уважает prefers-reduced-motion.
// Контент, попавший во вьюпорт на загрузке, проявляется сразу — без «провала» над сгибом.
export function Reveal({ children, className, delay = 0 }: { children: React.ReactNode; className?: string; delay?: number }) {
  const ref = useRef<HTMLDivElement>(null);
  const [shown, setShown] = useState(false);

  useEffect(() => {
    const el = ref.current;
    if (!el) return;
    if (window.matchMedia("(prefers-reduced-motion: reduce)").matches) {
      setShown(true);
      return;
    }
    const io = new IntersectionObserver(
      ([e]) => {
        if (e.isIntersecting) {
          setShown(true);
          io.disconnect();
        }
      },
      // большой top-margin: секции, мимо которых проскролили вверх (или прыжок по якорю), тоже считаются «в зоне» и проявляются
      { threshold: 0.1, rootMargin: "2000px 0px -6% 0px" },
    );
    io.observe(el);
    return () => io.disconnect();
  }, []);

  return (
    <div ref={ref} className={`reveal ${shown ? "reveal-in" : ""} ${className ?? ""}`} style={delay ? { transitionDelay: `${delay}ms` } : undefined}>
      {children}
    </div>
  );
}
