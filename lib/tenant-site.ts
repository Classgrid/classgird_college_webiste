import { createEmptyTenantSiteData, type TenantSiteData } from "@/content/college_website";
import { fetchTenantWebsiteByDomain, normalizeTenantDomain } from "@/lib/api";
import { fetchOrganizationAdminSettings, type OrganizationAdminSettings } from "@/lib/organization-admin-settings";
import { normalizeThemeColors, type TenantThemeColors } from "@/lib/theme";

type HeaderReader = { get(name: string): string | null };
type TenantRecord = Record<string, unknown>;

type DeepPartial<T> = {
  [K in keyof T]?: T[K] extends Array<infer U>
    ? Array<U>
    : T[K] extends object
    ? DeepPartial<T[K]>
    : T[K];
};

function isRecord(value: unknown): value is TenantRecord {
  return Boolean(value && typeof value === "object" && !Array.isArray(value));
}

function record(value: unknown): TenantRecord {
  return isRecord(value) ? value : {};
}

function cloneBaseData(): TenantSiteData {
  return JSON.parse(JSON.stringify(createEmptyTenantSiteData())) as TenantSiteData;
}

function applyPartial<T extends object>(base: T, patch: DeepPartial<T>): T {
  const output = { ...base } as T;
  for (const key in patch) {
    if (!Object.prototype.hasOwnProperty.call(patch, key)) continue;
    const patchValue = patch[key];
    if (patchValue === undefined) continue;
    const baseValue = output[key as keyof T];

    if (
      patchValue &&
      typeof patchValue === "object" &&
      !Array.isArray(patchValue) &&
      baseValue &&
      typeof baseValue === "object" &&
      !Array.isArray(baseValue)
    ) {
      output[key as keyof T] = applyPartial(baseValue as object, patchValue as object) as T[keyof T];
      continue;
    }

    output[key as keyof T] = patchValue as T[keyof T];
  }
  return output;
}

function firstString(...values: unknown[]) {
  for (const value of values) {
    if (typeof value === "string" && value.trim()) return value.trim();
  }
  return "";
}

function arrayOrEmpty(value: unknown) {
  return Array.isArray(value) ? value : [];
}

function compactColors(colors: TenantThemeColors) {
  const output: Record<string, string> = {};
  if (colors.primary) output.primary = colors.primary;
  if (colors.secondary) {
    output.secondary = colors.secondary;
    output.primaryDark = colors.secondary;
  }
  if (colors.accent) output.accent = colors.accent;
  if (colors.surface) output.surface = colors.surface;
  if (colors.darkSurface) output.darkSurface = colors.darkSurface;
  return output;
}

function mapColors(globalBranding: TenantRecord, content: TenantRecord, tenant: TenantRecord) {
  const colors = record(
    globalBranding.colors ||
      globalBranding.theme_colors ||
      globalBranding.themeColors ||
      content.colors ||
      tenant.colors ||
      record(tenant.branding).theme_colors ||
      {}
  );
  const theme = record(content.theme || tenant.theme || {});
  return compactColors(normalizeThemeColors({ ...colors, ...theme }));
}

function mapRemoteTenantPayload(raw: unknown): TenantSiteData | null {
  const rawRecord = record(raw);
  const tenantValue = rawRecord.tenant ?? rawRecord.data ?? raw;
  if (!isRecord(tenantValue)) return null;

  const tenant = tenantValue;
  const content = record(tenant.org_website_content || tenant.websiteContent || tenant.website || tenant);
  const globalBranding = record(rawRecord.globalBranding || tenant.globalBranding || content.globalBranding || {});
  const theme = mapColors(globalBranding, content, tenant);
  const title = firstString(
    globalBranding.site_title,
    globalBranding.siteTitle,
    globalBranding.title,
    content.site_title,
    content.siteTitle,
    content.title,
    tenant.site_title,
    tenant.siteTitle,
    tenant.title,
    tenant.name,
    content.name
  );
  const logo = firstString(
    globalBranding.logo_url,
    globalBranding.logoUrl,
    globalBranding.logo,
    content.logo_url,
    content.logoUrl,
    content.logo,
    tenant.logo_url,
    tenant.logoUrl,
    tenant.logo
  );
  const base = cloneBaseData();

  return applyPartial(base, {
    globalBranding: {
      logo,
      title,
      colors: theme,
    },
    theme: {
      primary: theme.primary,
      primaryDark: theme.primaryDark || theme.secondary,
      secondary: theme.secondary,
      accent: theme.accent,
      surface: theme.surface,
      darkSurface: theme.darkSurface,
    },
    institution: {
      name: firstString(tenant.name, content.name, title),
      shortName: firstString(tenant.shortName, content.shortName),
      type: firstString(tenant.orgType, content.orgType, tenant.type, content.type),
      tagline: firstString(tenant.tagline, content.tagline),
      location: firstString(tenant.location, content.location),
      address: firstString(tenant.address, content.address),
      email: firstString(tenant.email, content.email),
      phone: firstString(tenant.phone, content.phone),
      whatsapp: firstString(tenant.whatsapp, content.whatsapp),
      establishedYear: tenant.establishedYear ?? content.establishedYear ?? null,
      logo,
      logoText: firstString(content.logoText, tenant.logoText, title),
      heroImage: firstString(tenant.heroImage, content.heroImage),
    },
    hero: record(content.hero || base.hero),
    navLinks: arrayOrEmpty(content.navLinks),
    home: record(content.home || base.home),
    aboutPage: record(content.aboutPage || base.aboutPage),
    programsPage: record(content.programsPage || base.programsPage),
    programs: arrayOrEmpty(content.programs),
    admissionBanner: record(content.admissionBanner || base.admissionBanner),
    notices: arrayOrEmpty(content.notices),
    meritPage: record(content.meritPage || base.meritPage),
    toppers: arrayOrEmpty(content.toppers),
    meritLists: arrayOrEmpty(content.meritLists),
    feesPage: record(content.feesPage || base.feesPage),
    fees: arrayOrEmpty(content.fees),
    faculty: arrayOrEmpty(content.faculty),
    gallery: record(content.gallery || base.gallery),
    testimonials: arrayOrEmpty(content.testimonials),
    eventsPage: record(content.eventsPage || base.eventsPage),
    events: arrayOrEmpty(content.events),
    alumniPage: record(content.alumniPage || base.alumniPage),
    alumni: arrayOrEmpty(content.alumni),
    blogPage: record(content.blogPage || base.blogPage),
    blogPosts: arrayOrEmpty(content.blogPosts),
    contactPage: record(content.contactPage || base.contactPage),
    applyPage: record(content.applyPage || base.applyPage),
    mandatoryDisclosurePage: record(content.mandatoryDisclosurePage || content.mandatoryDisclosure || base.mandatoryDisclosurePage),
    committeesPage: record(content.committeesPage || base.committeesPage),
    infrastructurePage: record(content.infrastructurePage || base.infrastructurePage),
    academicCalendarPage: record(content.academicCalendarPage || base.academicCalendarPage),
    syllabusPage: record(content.syllabusPage || base.syllabusPage),
    examinationsPage: record(content.examinationsPage || base.examinationsPage),
    studentsPage: record(content.studentsPage || base.studentsPage),
    downloadsPage: record(content.downloadsPage || base.downloadsPage),
    quickEnquiry: record(content.quickEnquiry || base.quickEnquiry),
    socialLinks: arrayOrEmpty(content.socialLinks),
    footer: record(content.footer || base.footer),
    uiStrings: record(content.uiStrings || base.uiStrings),
  });
}

function buildSettingsPatch(settings: OrganizationAdminSettings): DeepPartial<TenantSiteData> {
  const colors = compactColors(normalizeThemeColors(settings.themeColors));
  const title = firstString(settings.siteTitle, settings.name);
  const patch: DeepPartial<TenantSiteData> = {};

  if (title || settings.logoUrl || Object.keys(colors).length) {
    patch.globalBranding = {};
    if (title) patch.globalBranding.title = title;
    if (settings.logoUrl) patch.globalBranding.logo = settings.logoUrl;
    if (Object.keys(colors).length) patch.globalBranding.colors = colors;
  }

  if (Object.keys(colors).length) {
    patch.theme = {};
    if (colors.primary) patch.theme.primary = colors.primary;
    if (colors.secondary) patch.theme.secondary = colors.secondary;
    if (colors.primaryDark) patch.theme.primaryDark = colors.primaryDark;
    if (colors.accent) patch.theme.accent = colors.accent;
    if (colors.surface) patch.theme.surface = colors.surface;
    if (colors.darkSurface) patch.theme.darkSurface = colors.darkSurface;
  }

  if (settings.name || settings.logoUrl || settings.orgType || settings.tagline) {
    patch.institution = {};
    if (settings.name) patch.institution.name = settings.name;
    if (settings.logoUrl) patch.institution.logo = settings.logoUrl;
    if (settings.orgType) patch.institution.type = settings.orgType;
    if (settings.tagline) patch.institution.tagline = settings.tagline;
  }

  return patch;
}

function applyOrganizationAdminSettings(data: TenantSiteData, settings: OrganizationAdminSettings | null) {
  if (!settings) return data;
  return applyPartial(data, buildSettingsPatch(settings));
}

export function getTenantDomainFromHeaders(headers: HeaderReader, queryDomain?: string | null) {
  return normalizeTenantDomain(
    queryDomain ||
      headers.get("x-tenant-domain") ||
      headers.get("x-forwarded-host") ||
      headers.get("host") ||
      ""
  );
}

export async function resolveTenantSiteData(domain?: string | null): Promise<TenantSiteData> {
  const normalizedDomain = normalizeTenantDomain(domain);
  const [payload, adminSettings] = normalizedDomain
    ? await Promise.all([
        fetchTenantWebsiteByDomain(normalizedDomain),
        fetchOrganizationAdminSettings(normalizedDomain),
      ])
    : [null, null];
  const remoteData = payload ? mapRemoteTenantPayload(payload) : null;
  return applyOrganizationAdminSettings(remoteData || cloneBaseData(), adminSettings);
}
