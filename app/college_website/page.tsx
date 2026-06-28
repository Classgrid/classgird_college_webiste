import type { Metadata } from "next";
import { headers } from "next/headers";
import { getTenantDomainFromHeaders, resolveTenantSiteData } from "@/lib/tenant-site";
import { TenantWebsiteHomeClient } from "@/components/tenant/TenantWebsiteHomeClient";

type CollegeWebsitePageProps = {
  searchParams?: Promise<Record<string, string | string[] | undefined>>;
};

function searchDomain(params: Record<string, string | string[] | undefined>) {
  const queryDomainRaw = Array.isArray(params.domain) ? params.domain[0] : params.domain;
  return typeof queryDomainRaw === "string" ? queryDomainRaw : "";
}

export async function generateMetadata({ searchParams }: CollegeWebsitePageProps): Promise<Metadata> {
  const requestHeaders = await headers();
  const params = (await searchParams) ?? {};
  const domain = getTenantDomainFromHeaders(requestHeaders, searchDomain(params));
  const data = await resolveTenantSiteData(domain);
  const title = data.globalBranding.title || data.institution.name || undefined;

  return {
    title,
    description: data.institution.tagline || undefined,
  };
}

export default async function CollegeWebsitePage({ searchParams }: CollegeWebsitePageProps) {
  const requestHeaders = await headers();
  const params = (await searchParams) ?? {};
  const domain = getTenantDomainFromHeaders(requestHeaders, searchDomain(params));
  const data = await resolveTenantSiteData(domain);

  return <TenantWebsiteHomeClient data={data} tenantSlug={domain} segments={[]} />;
}
