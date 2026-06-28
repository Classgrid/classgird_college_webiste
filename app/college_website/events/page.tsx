import type { Metadata } from "next";
import { headers } from "next/headers";
import { resolveTenantSiteData } from "@/lib/tenant-site";
import { TenantWebsiteHomeClient } from "@/components/tenant/TenantWebsiteHomeClient";

export const metadata: Metadata = {
  title: "Events | Institution Website",
  description: "Dynamic tenant events page for the institution website template.",
};

type EventsPageProps = {
  searchParams?: Promise<Record<string, string | string[] | undefined>>;
};

export default async function EventsPage({ searchParams }: EventsPageProps) {
  const requestHeaders = await headers();
  const params = (await searchParams) ?? {};
  const tenantFromHeader = requestHeaders.get("x-tenant-slug");
  const tenantFromQueryRaw = Array.isArray(params.tenant) ? params.tenant[0] : params.tenant;
  const tenantFromQuery = typeof tenantFromQueryRaw === "string" ? tenantFromQueryRaw : "";
  const tenantSlug = (tenantFromHeader || tenantFromQuery || "").trim().toLowerCase();
  const data = await resolveTenantSiteData(tenantSlug);

  return <TenantWebsiteHomeClient data={data} tenantSlug={tenantSlug} segments={["events"]} />;
}
