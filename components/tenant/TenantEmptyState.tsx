import { Button } from "@/components/ui/button";
import Link from "next/link";

type TenantEmptyStateProps = {
  title: string;
  description?: string;
  actionHref?: string;
  actionLabel?: string;
};

export function TenantEmptyState({ title, description, actionHref, actionLabel }: TenantEmptyStateProps) {
  return (
    <div className="rounded-xl border border-dashed border-slate-300 bg-slate-50 px-5 py-10 text-center">
      <p className="text-base font-semibold text-slate-900">{title}</p>
      {description ? <p className="mx-auto mt-2 max-w-2xl text-sm text-slate-600">{description}</p> : null}
      {actionHref && actionLabel ? (
        <Button asChild variant="outline" className="mt-4">
          <Link href={actionHref}>{actionLabel}</Link>
        </Button>
      ) : null}
    </div>
  );
}
