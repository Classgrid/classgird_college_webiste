import React from "react";
import { cn } from "@/lib/utils";

type Column = {
  key: string;
  header: string;
  accent?: boolean;
  width?: string;
};

type VercelTableProps = {
  columns: Column[];
  rows: any[];
  className?: string;
};

export function VercelTable({ columns, rows, className }: VercelTableProps) {
  if (!rows || rows.length === 0) {
    return <p className="text-sm text-muted-foreground">No data available.</p>;
  }

  return (
    <div className={cn("overflow-hidden rounded-xl border border-border/80 bg-card/50", className)}>
      <div className="overflow-x-auto">
        <table className="w-full border-collapse text-left text-sm">
          <thead>
            <tr className="border-b border-border/80 bg-muted/40 text-xs font-semibold uppercase tracking-wider text-muted-foreground">
              {columns.map((col) => (
                <th key={col.key} className={cn("px-6 py-4 font-bold", col.width)}>
                  {col.header}
                </th>
              ))}
            </tr>
          </thead>
          <tbody className="divide-y divide-border/60">
            {rows.map((row, rowIndex) => (
              <tr
                key={rowIndex}
                className="transition-colors hover:bg-muted/20"
              >
                {columns.map((col) => {
                  const val = row[col.key];
                  return (
                    <td
                      key={col.key}
                      className={cn(
                        "px-6 py-4 leading-relaxed",
                        col.accent ? "font-semibold text-foreground" : "text-muted-foreground"
                      )}
                    >
                      {val}
                    </td>
                  );
                })}
              </tr>
            ))}
          </tbody>
        </table>
      </div>
    </div>
  );
}
