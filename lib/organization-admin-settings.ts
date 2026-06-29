import { unstable_cache } from "next/cache";
import { ObjectId, type Document, type Filter } from "mongodb";
import { getMongoDb, hasMongoConnectionConfig } from "@/lib/mongodb";
import {
  fetchOrganizationBrandingByDomain,
  getTenantSlugFromDomain,
  normalizeTenantDomain,
} from "@/lib/api";
import { normalizeThemeColors, type TenantThemeColors } from "@/lib/theme";

export type OrganizationAdminSettings = {
  name: string;
  siteTitle: string;
  logoUrl: string;
  orgType: string;
  tagline: string;
  themeColors: TenantThemeColors;
};

type SettingsRecord = Record<string, unknown>;

function isRecord(value: unknown): value is SettingsRecord {
  return Boolean(value && typeof value === "object" && !Array.isArray(value));
}

function record(value: unknown): SettingsRecord {
  return isRecord(value) ? value : {};
}

function text(value: unknown) {
  return typeof value === "string" ? value.trim() : "";
}

function cleanSiteTitle(value: unknown) {
  const title = text(value);
  return title.toLowerCase() === "classgrid erp" ? "" : title;
}

function organizationCollectionName() {
  return process.env.MONGODB_ORGANIZATION_COLLECTION?.trim() || "organizations";
}

function buildOrganizationQuery(domain: string): Filter<Document> | null {
  const normalizedDomain = normalizeTenantDomain(domain);
  const slug =
    getTenantSlugFromDomain(normalizedDomain) ||
    text(process.env.ERP_TENANT_SLUG) ||
    text(process.env.NEXT_PUBLIC_TENANT_SLUG);

  const conditions: Filter<Document>[] = [];
  if (normalizedDomain && normalizedDomain !== "localhost") {
    conditions.push({ "custom_domain.domain": normalizedDomain });
  }

  if (slug) {
    conditions.push({ subdomain: slug.toLowerCase() });
    if (ObjectId.isValid(slug)) {
      conditions.push({ _id: new ObjectId(slug) });
    }
  }

  if (!conditions.length) return null;
  return conditions.length === 1 ? conditions[0] : { $or: conditions };
}

function hasAnyThemeColor(colors: TenantThemeColors) {
  return Boolean(colors.primary || colors.secondary || colors.accent || colors.surface || colors.darkSurface);
}

function mapOrganizationDocument(org: Document | null): OrganizationAdminSettings | null {
  if (!org) return null;
  if (text(org.status) && text(org.status).toLowerCase() !== "active") return null;

  const branding = record(org.branding);
  const themeColors = normalizeThemeColors(branding.theme_colors || branding.themeColors || {});

  const settings = {
    name: text(org.name),
    siteTitle: cleanSiteTitle(org.site_title),
    logoUrl: text(org.logo_url),
    orgType: text(org.org_type) || text(org.structure_type),
    tagline: text(branding.tagline),
    themeColors,
  };

  return settings.name || settings.siteTitle || settings.logoUrl || hasAnyThemeColor(settings.themeColors)
    ? settings
    : null;
}

function mapRemoteBrandingPayload(payload: unknown): OrganizationAdminSettings | null {
  const payloadRecord = record(payload);
  const dataRecord = record(payloadRecord.data);
  const branding = record(payloadRecord.branding || dataRecord.branding || payloadRecord);
  const themeColors = normalizeThemeColors(
    branding.theme_colors ||
      branding.themeColors ||
      payloadRecord.theme ||
      dataRecord.theme ||
      {}
  );

  const settings = {
    name: text(branding.name || payloadRecord.name),
    siteTitle: cleanSiteTitle(branding.siteTitle || branding.site_title || payloadRecord.site_title),
    logoUrl: text(branding.logoUrl || branding.logo || payloadRecord.logo || payloadRecord.logo_url),
    orgType: text(branding.orgType || payloadRecord.org_type || payloadRecord.structure_type),
    tagline: text(branding.tagline || record(payloadRecord.branding).tagline),
    themeColors,
  };

  return settings.name || settings.siteTitle || settings.logoUrl || hasAnyThemeColor(settings.themeColors)
    ? settings
    : null;
}

async function readOrganizationAdminSettings(domain: string): Promise<OrganizationAdminSettings | null> {
  if (hasMongoConnectionConfig()) {
    try {
      const query = buildOrganizationQuery(domain);
      const db = await getMongoDb();
      if (db && query) {
        const org = await db.collection(organizationCollectionName()).findOne(query, {
          projection: {
            name: 1,
            site_title: 1,
            logo_url: 1,
            branding: 1,
            org_type: 1,
            structure_type: 1,
            status: 1,
            subdomain: 1,
            custom_domain: 1,
          },
        });
        const settings = mapOrganizationDocument(org);
        if (settings) return settings;
      }
    } catch (error) {
      console.error("[OrganizationAdminSettings] Mongo lookup failed", error instanceof Error ? error.message : error);
    }
  }

  const remotePayload = await fetchOrganizationBrandingByDomain(domain);
  return mapRemoteBrandingPayload(remotePayload);
}

export async function fetchOrganizationAdminSettings(domain?: string | null) {
  const normalizedDomain = normalizeTenantDomain(domain);
  if (!normalizedDomain) return null;

  return unstable_cache(
    () => readOrganizationAdminSettings(normalizedDomain),
    ["organization-admin-settings", normalizedDomain],
    {
      revalidate: 60,
      tags: [`organization-admin-settings:${normalizedDomain}`],
    }
  )();
}
