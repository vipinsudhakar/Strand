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

  function renderSection() {
    switch (section) {
      case "protein":
        // The section remounts on every switch (AnimatePresence key), so the
        // seed is read fresh as the initial sequence each time protein opens.
        return <ProteinTool initialSequence={proteinSeed} />;
      case "dna":
        return <DnaTool onTransfer={handleTransfer} />;
      case "dashboard":
      default:
        return <Dashboard onLaunch={setSection} />;
    }
  }

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
            {renderSection()}
          </motion.div>
        </AnimatePresence>
      </main>

      <Footer />
    </div>
  );
}
