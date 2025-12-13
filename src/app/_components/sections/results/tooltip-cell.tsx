// src/app/_components/sections/results/tooltip-cell.tsx

interface TooltipCellProps {
  count: number;
  tooltip?: string;
}

export function TooltipCell({ count, tooltip }: TooltipCellProps) {
  return (
    <div className="relative group h-10 w-full">
      <div
        className={`flex h-full items-center rounded-lg px-3 text-xs font-medium ${
          count === 0
            ? "bg-slate-50 text-slate-300"
            : "bg-indigo-100 text-slate-900"
        }`}
      >
        {count > 0 ? `${count} student${count > 1 ? "s" : ""}` : "—"}
      </div>

      {tooltip && count > 0 && (
        <div
          className="
            absolute left-0 top-full 
            hidden group-hover:block 
            z-20 mt-1 w-full
            rounded-md bg-black/80 px-2 py-2 
            text-[11px] text-white leading-normal
            whitespace-normal break-words
          "
        >
          {tooltip}
        </div>
      )}
    </div>
  );
}