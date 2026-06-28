import React from "react";

type PortableTextBlockProps = {
  value: any[];
  showAccentBars?: boolean;
};

export function PortableTextBlock({ value, showAccentBars = false }: PortableTextBlockProps) {
  if (!Array.isArray(value) || value.length === 0) {
    return null;
  }

  return (
    <div className="space-y-4">
      {value.map((block, index) => {
        // If it's a standard Sanity block
        if (block._type === "block") {
          const style = block.style || "normal";
          const text = block.children?.map((c: any) => c.text).join("") || "";

          if (style === "h1") {
            return (
              <h1 key={index} className="text-3xl font-extrabold tracking-tight mt-6 mb-2">
                {text}
              </h1>
            );
          }
          if (style === "h2") {
            return (
              <h2 key={index} className="text-2xl font-bold tracking-tight mt-5 mb-2">
                {text}
              </h2>
            );
          }
          if (style === "h3") {
            return (
              <h3 key={index} className="text-xl font-semibold mt-4 mb-2">
                {text}
              </h3>
            );
          }
          if (style === "h4") {
            return (
              <h4 key={index} className="text-lg font-medium mt-3 mb-1">
                {text}
              </h4>
            );
          }
          if (style === "blockquote") {
            return (
              <blockquote key={index} className="border-l-4 border-red-500 pl-4 italic my-4 text-muted-foreground">
                {text}
              </blockquote>
            );
          }
          // Default normal text
          return (
            <p key={index} className="leading-relaxed text-muted-foreground">
              {text}
            </p>
          );
        }

        // Fallback for raw text strings or un-structured blocks
        if (typeof block === "string") {
          return (
            <p key={index} className="leading-relaxed text-muted-foreground">
              {block}
            </p>
          );
        }

        return null;
      })}
    </div>
  );
}
