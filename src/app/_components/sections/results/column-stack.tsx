// src/app/_components/sections/results/column-stack.tsx
import { useRef, useState } from "react";

import { ExpandCell } from "./expand-cell";

export type ColCell = {
  id: string;
  count: number;
  items: string[];
};

export function ColumnStack({
  cells,
  pinnedCellId,
  setPinnedCellId,
  colIndex,
}: {
  cells: ColCell[];
  pinnedCellId: string | null;
  setPinnedCellId: (v: string | null) => void;
  colIndex: number;
}) {
  const [hoveredId, setHoveredId] = useState<string | null>(null);
  const lockUntil = useRef(0);

  const pinnedInThisCol = pinnedCellId?.endsWith(`-${colIndex}`) ?? false;
  const activeId = pinnedInThisCol ? pinnedCellId : hoveredId;

  function tryHover(id: string) {
    if (pinnedInThisCol) return; // pin wins in this column
    const now = Date.now();
    if (now < lockUntil.current) return; // prevent bounce during reflow
    lockUntil.current = now + 220;
    setHoveredId(id);
  }

  return (
    <div
      className="h-full min-h-0 overflow-hidden flex flex-col divide-y divide-slate-100"
      onPointerLeave={() => setHoveredId(null)}
    >
      {cells.map((c) => {
        const isActive = activeId === c.id;
        const isPinned = pinnedCellId === c.id;

        return (
          <div
            key={c.id}
            onPointerEnter={() => tryHover(c.id)}
            className="min-h-0 overflow-hidden transition-[flex-grow] duration-200"
            style={{ flexGrow: isActive ? 6 : 1, flexBasis: 0 }}
          >
            <div className="h-full min-h-0 p-2">
              <ExpandCell
                count={c.count}
                items={c.items}
                pinned={isPinned}
                active={isActive || isPinned}
                onPinChange={(nextPinned) => setPinnedCellId(nextPinned ? c.id : null)}
              />
            </div>
          </div>
        );
      })}
    </div>
  );
}