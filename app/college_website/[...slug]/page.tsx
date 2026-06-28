import type { Metadata } from "next";
import { headers } from "next/headers";
import { resolveTenantSiteData } from "@/lib/tenant-site";
import { TenantWebsiteHomeClient } from "@/components/tenant/TenantWebsiteHomeClient";

type Props = {
  params: Promise<{ slug: string[] }>;
  searchParams?: Promise<Record<string, string | string[] | undefined>>;
};

export async function generateMetadata({ params, searchParams }: Props): Promise<Metadata> {
  const resolvedParams = await params;
  const resolvedSearchParams = (await searchParams) ?? {};

  const requestHeaders = await headers();
  const tenantFromHeader = requestHeaders.get("x-tenant-slug");
  const tenantFromQueryRaw = Array.isArray(resolvedSearchParams.tenant)
    ? resolvedSearchParams.tenant[0]
    : resolvedSearchParams.tenant;
  const tenantFromQuery = typeof tenantFromQueryRaw === "string" ? tenantFromQueryRaw : "";
  const tenantSlug = (tenantFromHeader || tenantFromQuery || "").trim().toLowerCase();
  const data = await resolveTenantSiteData(tenantSlug);

  const primarySlug = resolvedParams.slug[0] || "";
  const titlePart = primarySlug.charAt(0).toUpperCase() + primarySlug.slice(1);

  return {
    title: `${titlePart} | ${data.institution.name}`,
    description: data.institution.tagline,
  };
}

export default async function CollegeWebsiteSubpage({ params, searchParams }: Props) {
  const requestHeaders = await headers();
  const resolvedParams = await params;
  const resolvedSearchParams = (await searchParams) ?? {};

  const tenantFromHeader = requestHeaders.get("x-tenant-slug");
  const tenantFromQueryRaw = Array.isArray(resolvedSearchParams.tenant)
    ? resolvedSearchParams.tenant[0]
    : resolvedSearchParams.tenant;
  const tenantFromQuery = typeof tenantFromQueryRaw === "string" ? tenantFromQueryRaw : "";
  const tenantSlug = (tenantFromHeader || tenantFromQuery || "").trim().toLowerCase();
  const data = await resolveTenantSiteData(tenantSlug);

  return <TenantWebsiteHomeClient data={data} tenantSlug={tenantSlug} segments={resolvedParams.slug} />;
}
