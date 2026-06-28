import React from "react";
import { Badge } from "@/components/ui/badge";

type PageMetadataBoxProps = {
  updatedAt?: string;
  category: string;
  availableFor?: string[];
};

export function PageMetadataBox({ updatedAt, category, availableFor = [] }: PageMetadataBoxProps) {
  return (
    <div className="mb-10 rounded-xl border border-border/80 bg-muted/20 p-5 text-sm">
      <div className="grid gap-4 sm:grid-cols-2 md:grid-cols-3">
        <div>
          <p className="text-xs font-semibold uppercase tracking-wider text-muted-foreground">Category</p>
          <p className="mt-1 font-medium text-foreground">{category}</p>
        </div>
        {updatedAt && (
          <div>
            <p className="text-xs font-semibold uppercase tracking-wider text-muted-foreground">Last Updated</p>
            <p className="mt-1 font-medium text-foreground">
              {new Date(updatedAt).toLocaleDateString("en-US", {
                month: "long",
                day: "numeric",
                year: "numeric",
              })}
            </p>
          </div>
        )}
        {availableFor.length > 0 && (
          <div className="sm:col-span-2 md:col-span-1">
            <p className="text-xs font-semibold uppercase tracking-wider text-muted-foreground">Available For</p>
            <div className="mt-1.5 flex flex-wrap gap-1">
              {availableFor.map((item) => (
                <Badge
                  key={item}
                  variant="outline"
                  className="bg-background/80 text-[10px] font-semibold tracking-wider text-muted-foreground border-border/80"
                >
                  {item}
                </Badge>
              ))}
            </div>
          </div>
        )}
      </div>
    </div>
  );
}
