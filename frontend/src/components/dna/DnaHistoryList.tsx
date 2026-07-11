import { motion } from "motion/react";

import { Reveal } from "../../motion/Reveal";
import { fadeUp } from "../../motion/variants";
import type { DnaHistoryItem } from "../../types/dna";

type DnaHistoryListProps = {
  items: DnaHistoryItem[];
  onSelect: (id: number) => void;
  activeId?: number | null;
};

const shortDate = (iso: string) =>
  new Date(iso).toLocaleDateString(undefined, {
    month: "short",
    day: "numeric",
    hour: "2-digit",
    minute: "2-digit",
  });

const snippet = (sequence: string) =>
  sequence.length > 28 ? `${sequence.slice(0, 28)}…` : sequence;

/** Past DNA analyses for this browser. Selecting a row reloads it into the tool. */
export function DnaHistoryList({
  items,
  onSelect,
  activeId = null,
}: DnaHistoryListProps) {
  if (items.length === 0) return null;

  return (
    <Reveal stagger className="flex flex-col gap-4">
      <motion.h3
        variants={fadeUp}
        className="font-mono text-xs uppercase tracking-[0.2em] text-ash-500"
      >
        History
      </motion.h3>
      <ul className="flex flex-col">
        {items.map((item) => {
          const isActive = item.id === activeId;
          return (
            <motion.li key={item.id} variants={fadeUp}>
              <button
                type="button"
                onClick={() => onSelect(item.id)}
                className={`flex w-full items-baseline justify-between gap-4 border-t border-hairline py-3 text-left transition-colors ${
                  isActive ? "text-ink" : "text-ash-500 hover:text-ink"
                }`}
              >
                <span className="truncate font-mono text-sm">
                  {snippet(item.sequence)}
                </span>
                <span className="shrink-0 font-sans text-xs text-ash-300">
                  {item.length} bp · {item.gc_content.toFixed(1)}% GC ·{" "}
                  {shortDate(item.created_at)}
                </span>
              </button>
            </motion.li>
          );
        })}
      </ul>
    </Reveal>
  );
}
