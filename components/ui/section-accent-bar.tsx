import { cn } from "@/lib/utils";

type SectionAccentBarProps = {
  align?: "left" | "center" | "right";
  className?: string;
};

export function SectionAccentBar({ align = "left", className }: SectionAccentBarProps) {
  return (
    <div
      className={cn(
        "h-1 w-12 rounded bg-red-500",
        align === "center" && "mx-auto",
        align === "right" && "ml-auto",
        className
      )}
    />
  );
}
