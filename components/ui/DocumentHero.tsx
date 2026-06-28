import React from "react";
import { Badge } from "@/components/ui/badge";

type DocumentHeroProps = {
  badgeLabel?: string;
  title: string;
  lang?: string;
  subtitles?: string[];
  description?: string;
  showAccentBar?: boolean;
};

export function DocumentHero({
  badgeLabel,
  title,
  lang,
  subtitles = [],
  description,
  showAccentBar = false,
}: DocumentHeroProps) {
  return (
    <div className="space-y-6 pb-8">
      {badgeLabel && (
        <Badge className="bg-red-500/15 text-red-500 hover:bg-red-500/15 border-transparent uppercase tracking-wider text-[11px] font-bold">
          {badgeLabel}
        </Badge>
      )}
      <h1 className="text-4xl font-extrabold tracking-tight text-foreground sm:text-5xl">
        {title}
      </h1>
      {subtitles.length > 0 && (
        <div className="flex flex-wrap items-center gap-4 text-xs text-muted-foreground font-medium">
          {subtitles.map((sub, i) => (
            <span key={i} className="flex items-center gap-2">
              {i > 0 && <span className="h-1 w-1 rounded-full bg-border" />}
              {sub}
            </span>
          ))}
        </div>
      )}
      {description && (
        <p className="text-lg leading-relaxed text-muted-foreground max-w-3xl">
          {description}
        </p>
      )}
      {showAccentBar && (
        <div className="h-1 w-12 rounded bg-red-500 mt-6" />
      )}
    </div>
  );
}
