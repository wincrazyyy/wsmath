// src/app/_components/sections/results/column-stack.tsx

import { ExpandCell } from "./expand-cell";

export type ColumnCell = {
  id: string;
  gradeLabel: string;
  count: number;
  items: string[];
};

export function ColumnStack({
  cells,
  pinnedCellId,
  setPinnedCellId,
  hoveredCellId,
  setHoveredCellId,
}: {
  cells: ColumnCell[];
  pinnedCellId: string | null;
  setPinnedCellId: (id: string | null) => void;
  hoveredCellId: string | null;
  setHoveredCellId: (id: string | null) => void;
}) {
  // Adjust once and all columns behave consistently.
  const STACK_H = "h-[360px] md:h-[420px]";

  return (
    <div className={["min-h-0", STACK_H, "flex flex-col gap-2"].join(" ")}>
      {cells.map((c) => {
        const pinned = pinnedCellId === c.id;
        const active = pinned || hoveredCellId === c.id;

        return (
          <div
            key={c.id}
            className={[
              "min-h-0",
              // active cell gets more height, siblings shrink — within this column only
              active ? "flex-[4] md:flex-[5]" : "flex-1",
              "transition-[flex-grow] duration-200",
            ].join(" ")}
            onPointerEnter={() => setHoveredCellId(c.id)}
            onPointerLeave={() => setHoveredCellId(null)}
          >
            <ExpandCell
              count={c.count}
              items={c.items}
              gradeLabel={c.gradeLabel}
              pinned={pinned}
              active={active}
              onPinChange={(nextPinned) => setPinnedCellId(nextPinned ? c.id : null)}
            />
          </div>
        );
      })}
    </div>
  );
}