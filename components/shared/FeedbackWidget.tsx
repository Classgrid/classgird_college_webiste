import React, { useState } from "react";
import { Button } from "@/components/ui/button";
import { ThumbsUp, ThumbsDown, CheckCircle2 } from "lucide-react";

type FeedbackWidgetProps = {
  pageTitle: string;
  pageType: string;
};

export function FeedbackWidget({ pageTitle, pageType }: FeedbackWidgetProps) {
  const [submitted, setSubmitted] = useState(false);
  const [feedbackType, setFeedbackType] = useState<"helpful" | "unhelpful" | null>(null);

  const handleFeedback = (type: "helpful" | "unhelpful") => {
    setFeedbackType(type);
    setSubmitted(true);
    // In production, we'd send this to the analytics endpoint or database
    console.log(`Feedback submitted: ${type} for page: ${pageTitle} (${pageType})`);
  };

  if (submitted) {
    return (
      <div className="flex items-center gap-3 text-red-500 bg-red-500/5 border border-red-500/20 rounded-xl px-5 py-4">
        <CheckCircle2 className="h-5 w-5 shrink-0" />
        <div className="text-sm font-medium">
          Thank you for your feedback! It helps us improve our documentation.
        </div>
      </div>
    );
  }

  return (
    <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4 rounded-xl border border-border/80 bg-muted/10 p-5">
      <div>
        <p className="text-sm font-semibold text-foreground">Was this page helpful?</p>
        <p className="text-xs text-muted-foreground mt-0.5">Let us know how we can make it better.</p>
      </div>
      <div className="flex items-center gap-2">
        <Button
          variant="outline"
          size="sm"
          onClick={() => handleFeedback("helpful")}
          className="h-9 gap-1.5 border-border/80 text-muted-foreground hover:bg-red-500/10 hover:text-red-500 hover:border-red-500/30"
        >
          <ThumbsUp className="h-3.5 w-3.5" />
          Yes
        </Button>
        <Button
          variant="outline"
          size="sm"
          onClick={() => handleFeedback("unhelpful")}
          className="h-9 gap-1.5 border-border/80 text-muted-foreground hover:bg-red-500/10 hover:text-red-500 hover:border-red-500/30"
        >
          <ThumbsDown className="h-3.5 w-3.5" />
          No
        </Button>
      </div>
    </div>
  );
}
