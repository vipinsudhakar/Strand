import { motion, useReducedMotion } from "motion/react";

import { EASE_EXPO } from "../../motion/variants";

export type Section = "dashboard" | "protein" | "dna";

const LINKS: { id: Section; label: string }[] = [
  { id: "protein", label: "Protein" },
  { id: "dna", label: "DNA" },
];

type NavProps = {
  active: Section;
  onNavigate: (section: Section) => void;
};

/**
 * Sticky top nav: wordmark returns to the dashboard; the two tool links share a
 * single underline that slides between them via a `layoutId`. The slide is
 * disabled (snaps instantly) under `prefers-reduced-motion`.
 */
export function Nav({ active, onNavigate }: NavProps) {
  const reduce = useReducedMotion();

  return (
    <header className="sticky top-0 z-50 border-b border-hairline bg-paper/90 backdrop-blur-none">
      <nav className="mx-auto flex max-w-5xl items-center justify-between px-6 py-5">
        <button
          type="button"
          onClick={() => onNavigate("dashboard")}
          className="font-display text-xl font-medium tracking-tight text-ink"
        >
          Strand
        </button>

        <ul className="flex items-center gap-8">
          {LINKS.map((link) => {
            const isActive = active === link.id;
            return (
              <li key={link.id} className="relative">
                <button
                  type="button"
                  onClick={() => onNavigate(link.id)}
                  className={`font-sans text-sm transition-colors ${
                    isActive ? "text-ink" : "text-ash-500 hover:text-ink"
                  }`}
                >
                  {link.label}
                </button>
                {isActive && (
                  <motion.span
                    layoutId="nav-underline"
                    className="absolute -bottom-1.5 left-0 right-0 h-px bg-accent"
                    transition={
                      reduce
                        ? { duration: 0 }
                        : { duration: 0.4, ease: EASE_EXPO }
                    }
                  />
                )}
              </li>
            );
          })}
        </ul>
      </nav>
    </header>
  );
}
