import type { TenantSiteData } from "@/content/college_website";

export type TenantWebsiteApiPayload = TenantSiteData | {
  tenant?: unknown;
  data?: unknown;
  globalBranding?: unknown;
  org_website_content?: unknown;
};

type JsonObject = Record<string, unknown>;

const DEFAULT_TENANT_WEBSITE_PATH = "/api/public/tenant/resolve";
const DEFAULT_ORGANIZATION_BRANDING_PATH = "/api/organization/branding";
const DEFAULT_PUBLIC_AUTH_BRANDING_PATH = "/api/public/auth-branding";

const RESERVED_SUBDOMAINS = new Set([
  "admin",
  "api",
  "app",
  "classgrid",
  "localhost",
  "staging",
  "www",
]);

function isObjectRecord(value: unknown): value is JsonObject {
  return Boolean(value && typeof value === "object" && !Array.isArray(value));
}

function objectValue(value: unknown, key: string) {
  return isObjectRecord(value) ? value[key] : undefined;
}

function objectSpread(value: unknown) {
  return isObjectRecord(value) ? value : {};
}

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

function envPath(name: string, fallback: string) {
  const configuredPath = process.env[name]?.trim();
  if (!configuredPath) return fallback;
  return configuredPath.startsWith("/") ? configuredPath : `/${configuredPath}`;
}

function getTenantWebsitePath() {
  return envPath("ERP_TENANT_WEBSITE_PATH", DEFAULT_TENANT_WEBSITE_PATH);
}

function getOrganizationBrandingPath() {
  return envPath("ERP_ORGANIZATION_BRANDING_PATH", DEFAULT_ORGANIZATION_BRANDING_PATH);
}

function getPublicAuthBrandingPath() {
  return envPath("ERP_PUBLIC_AUTH_BRANDING_PATH", DEFAULT_PUBLIC_AUTH_BRANDING_PATH);
}

export function normalizeTenantDomain(input?: string | null) {
  const raw = (input || "").trim().toLowerCase();
  if (!raw) return "";
  const withoutProtocol = raw.replace(/^https?:\/\//, "");
  const host = withoutProtocol.split("/")[0] || "";
  return host.replace(/:\d+$/, "");
}

export function getTenantSlugFromDomain(input?: string | null) {
  const domain = normalizeTenantDomain(input);
  if (!domain || domain === "localhost") return "";
  if (!domain.includes(".")) return RESERVED_SUBDOMAINS.has(domain) ? "" : domain;

  const [firstLabel] = domain.split(".");
  if (!firstLabel || RESERVED_SUBDOMAINS.has(firstLabel)) return "";
  return firstLabel;
}

async function fetchJson(url: URL) {
  const response = await fetch(url, {
    next: { revalidate: 60 },
    headers: { Accept: "application/json" },
  });

  return response.ok ? response.json() : null;
}

export async function fetchTenantWebsiteByDomain(domain: string): Promise<TenantWebsiteApiPayload | null> {
  const backendBaseUrl = getBackendBaseUrl();
  const normalizedDomain = normalizeTenantDomain(domain);
  const slug = getTenantSlugFromDomain(normalizedDomain);
  if (!backendBaseUrl || !normalizedDomain) return null;

  const url = new URL(`${trimTrailingSlash(backendBaseUrl)}${getTenantWebsitePath()}`);
  url.searchParams.set("slug", slug || normalizedDomain);
  url.searchParams.set("domain", normalizedDomain);

  return fetchJson(url) as Promise<TenantWebsiteApiPayload | null>;
}

export async function fetchOrganizationBrandingByDomain(domain: string): Promise<unknown | null> {
  const backendBaseUrl = getBackendBaseUrl();
  const normalizedDomain = normalizeTenantDomain(domain);
  const slug = getTenantSlugFromDomain(normalizedDomain);
  if (!backendBaseUrl || !normalizedDomain) return null;

  const brandingUrl = slug
    ? new URL(`${trimTrailingSlash(backendBaseUrl)}${getOrganizationBrandingPath()}`)
    : null;
  if (brandingUrl) brandingUrl.searchParams.set("slug", slug);

  const authBrandingUrl = new URL(`${trimTrailingSlash(backendBaseUrl)}${getPublicAuthBrandingPath()}`);
  if (slug) authBrandingUrl.searchParams.set("slug", slug);
  authBrandingUrl.searchParams.set("domain", normalizedDomain);

  const [branding, authBranding] = await Promise.all([
    brandingUrl ? fetchJson(brandingUrl) : Promise.resolve(null),
    fetchJson(authBrandingUrl),
  ]);

  if (!branding && !authBranding) return null;

  return {
    ...objectSpread(branding),
    authBranding,
    branding: {
      ...objectSpread(objectValue(branding, "branding")),
      ...objectSpread(objectValue(authBranding, "branding")),
    },
  };
}
