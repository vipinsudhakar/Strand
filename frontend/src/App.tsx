import { AnimatePresence, motion, useReducedMotion } from "motion/react";
import { useState } from "react";

import { Dashboard } from "./components/dashboard/Dashboard";
import { DnaTool } from "./components/dna/DnaTool";
import { Footer } from "./components/layout/Footer";
import { Nav, type Section } from "./components/layout/Nav";
import { ProteinTool } from "./components/protein/ProteinTool";
import { sectionFade, sectionShift } from "./motion/variants";

export default function App() {
  const [section, setSection] = useState<Section>("dashboard");
  // Seed handed from the DNA tool's translate output to the protein tool.
  const [proteinSeed, setProteinSeed] = useState("");
  const reduce = useReducedMotion();

  const handleTransfer = (translated: string) => {
    setProteinSeed(translated);
    setSection("protein");
  };

  // Sections remount on every switch (AnimatePresence key), so ProteinTool
  // re-reads the seed each time it opens. Clear it on any *manual* navigation,
  // or a past transfer would keep re-injecting its stale sequence forever.
  const handleNavigate = (next: Section) => {
    setProteinSeed("");
    setSection(next);
  };

  function renderSection() {
    switch (section) {
      case "protein":
        return <ProteinTool initialSequence={proteinSeed} />;
      case "dna":
        return <DnaTool onTransfer={handleTransfer} />;
      case "dashboard":
      default:
        return <Dashboard onLaunch={handleNavigate} />;
    }
  }

  return (
    <div className="flex min-h-screen flex-col">
      <Nav active={section} onNavigate={handleNavigate} />

      <main className="flex-grow">
        <AnimatePresence mode="wait" initial={false}>
          <motion.div
            key={section}
            variants={reduce ? sectionFade : sectionShift}
            initial="hidden"
            animate="visible"
            exit="exit"
          >
            {renderSection()}
          </motion.div>
        </AnimatePresence>
      </main>

      <Footer />
    </div>
  );
}
