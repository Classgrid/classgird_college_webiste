import type { Metadata } from "next";
import { headers } from "next/headers";
import { getTenantDomainFromHeaders, resolveTenantSiteData } from "@/lib/tenant-site";
import { TenantWebsiteHomeClient } from "@/components/tenant/TenantWebsiteHomeClient";

type Props = {
  params: Promise<{ slug: string[] }>;
  searchParams?: Promise<Record<string, string | string[] | undefined>>;
};

export async function generateMetadata({ params, searchParams }: Props): Promise<Metadata> {
  const resolvedParams = await params;
  const resolvedSearchParams = (await searchParams) ?? {};
  const requestHeaders = await headers();
  const queryDomainRaw = Array.isArray(resolvedSearchParams.domain) ? resolvedSearchParams.domain[0] : resolvedSearchParams.domain;
  const domain = getTenantDomainFromHeaders(requestHeaders, typeof queryDomainRaw === "string" ? queryDomainRaw : "");
  const data = await resolveTenantSiteData(domain);
  const primarySlug = resolvedParams.slug[0] || "";
  const titlePart = primarySlug.charAt(0).toUpperCase() + primarySlug.slice(1);
  const brandTitle = data.globalBranding.title || data.institution.name;

  return {
    title: [titlePart, brandTitle].filter(Boolean).join(" | "),
    description: data.institution.tagline || undefined,
  };
}

export default async function CollegeWebsiteSubpage({ params, searchParams }: Props) {
  const requestHeaders = await headers();
  const resolvedParams = await params;
  const resolvedSearchParams = (await searchParams) ?? {};
  const queryDomainRaw = Array.isArray(resolvedSearchParams.domain) ? resolvedSearchParams.domain[0] : resolvedSearchParams.domain;
  const domain = getTenantDomainFromHeaders(requestHeaders, typeof queryDomainRaw === "string" ? queryDomainRaw : "");
  const data = await resolveTenantSiteData(domain);

  return <TenantWebsiteHomeClient data={data} tenantSlug={domain} segments={resolvedParams.slug} />;
}
