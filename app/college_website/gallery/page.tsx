import type { Metadata } from "next";
import { headers } from "next/headers";
import { getTenantDomainFromHeaders, resolveTenantSiteData } from "@/lib/tenant-site";
import { TenantWebsiteHomeClient } from "@/components/tenant/TenantWebsiteHomeClient";

export const metadata: Metadata = { title: "Gallery" };

type GalleryPageProps = { searchParams?: Promise<Record<string, string | string[] | undefined>> };

export default async function GalleryPage({ searchParams }: GalleryPageProps) {
  const requestHeaders = await headers();
  const params = (await searchParams) ?? {};
  const queryDomainRaw = Array.isArray(params.domain) ? params.domain[0] : params.domain;
  const domain = getTenantDomainFromHeaders(requestHeaders, typeof queryDomainRaw === "string" ? queryDomainRaw : "");
  const data = await resolveTenantSiteData(domain);

  return <TenantWebsiteHomeClient data={data} tenantSlug={domain} segments={["gallery"]} />;
}
