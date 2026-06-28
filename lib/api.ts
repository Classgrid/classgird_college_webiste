import type { TenantSiteData } from "@/content/college_website";

export type TenantWebsiteApiPayload = TenantSiteData | {
  tenant?: unknown;
  data?: unknown;
  globalBranding?: unknown;
  org_website_content?: unknown;
};

const DEFAULT_TENANT_WEBSITE_PATH = "/tenant/resolve";

function trimTrailingSlash(value: string) {
  return value.replace(/\/+$/, "");
}

function getBackendBaseUrl() {
  return (
    process.env.ERP_BACKEND_URL ||
    process.env.NEXT_PUBLIC_ERP_BACKEND_URL ||
    process.env.TENANT_RESOLVER_API_BASE_URL ||
    ""
  ).trim();
}

function getTenantWebsitePath() {
  const configuredPath = process.env.ERP_TENANT_WEBSITE_PATH?.trim();
  if (!configuredPath) return DEFAULT_TENANT_WEBSITE_PATH;
  return configuredPath.startsWith("/") ? configuredPath : `/${configuredPath}`;
}

export function normalizeTenantDomain(input?: string | null) {
  const raw = (input || "").trim().toLowerCase();
  if (!raw) return "";
  const withoutProtocol = raw.replace(/^https?:\/\//, "");
  const host = withoutProtocol.split("/")[0] || "";
  return host.replace(/:\d+$/, "");
}

export async function fetchTenantWebsiteByDomain(domain: string): Promise<TenantWebsiteApiPayload | null> {
  const backendBaseUrl = getBackendBaseUrl();
  const normalizedDomain = normalizeTenantDomain(domain);
  if (!backendBaseUrl || !normalizedDomain) return null;

  const url = new URL(`${trimTrailingSlash(backendBaseUrl)}${getTenantWebsitePath()}`);
  url.searchParams.set("domain", normalizedDomain);

  const response = await fetch(url, {
    next: { revalidate: 60 },
    headers: { Accept: "application/json" },
  });

  if (!response.ok) return null;
  return response.json() as Promise<TenantWebsiteApiPayload>;
}
