import { AnimatePresence, motion, useReducedMotion } from "motion/react";
import { useState } from "react";

import { Dashboard } from "./components/dashboard/Dashboard";
import { Footer } from "./components/layout/Footer";
import { Nav, type Section } from "./components/layout/Nav";
import { ProteinTool } from "./components/protein/ProteinTool";
import { Reveal } from "./motion/Reveal";
import { sectionFade, sectionShift } from "./motion/variants";

// Placeholder for the DNA tool until items 19–21 build it.
function Placeholder({ eyebrow, title }: { eyebrow: string; title: string }) {
  return (
    <section className="mx-auto max-w-5xl px-6 py-24 md:py-32">
      <Reveal className="max-w-xl">
        <p className="font-mono text-xs uppercase tracking-[0.2em] text-ash-500">
          {eyebrow}
        </p>
        <h2 className="mt-6 font-display text-4xl text-ink md:text-5xl">{title}</h2>
        <p className="mt-4 font-sans text-lg text-ash-500">
          This tool is being wired up in the next batch of work.
        </p>
      </Reveal>
    </section>
  );
}

function renderSection(section: Section, onNavigate: (s: Section) => void) {
  switch (section) {
    case "protein":
      return <ProteinTool />;
    case "dna":
      return <Placeholder eyebrow="Tool" title="DNA & the central dogma." />;
    case "dashboard":
    default:
      return <Dashboard onLaunch={onNavigate} />;
  }
}

export default function App() {
  const [section, setSection] = useState<Section>("dashboard");
  const reduce = useReducedMotion();

  return (
    <div className="flex min-h-screen flex-col">
      <Nav active={section} onNavigate={setSection} />

      <main className="flex-grow">
        <AnimatePresence mode="wait" initial={false}>
          <motion.div
            key={section}
            variants={reduce ? sectionFade : sectionShift}
            initial="hidden"
            animate="visible"
            exit="exit"
          >
            {renderSection(section, setSection)}
          </motion.div>
        </AnimatePresence>
      </main>

      <Footer />
    </div>
  );
}
