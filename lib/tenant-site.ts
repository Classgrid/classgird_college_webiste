import { createEmptyTenantSiteData, type TenantSiteData } from "@/content/college_website";
import { fetchTenantWebsiteByDomain, normalizeTenantDomain } from "@/lib/api";

type HeaderReader = { get(name: string): string | null };

type DeepPartial<T> = {
  [K in keyof T]?: T[K] extends Array<infer U>
    ? Array<U>
    : T[K] extends object
    ? DeepPartial<T[K]>
    : T[K];
};

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

function mapColors(globalBranding: any, content: any, tenant: any) {
  const colors = globalBranding?.colors || content?.colors || tenant?.colors || {};
  const theme = content?.theme || tenant?.theme || {};
  return {
    primary: firstString(colors.primary, colors.primaryColor, theme.primary),
    primaryDark: firstString(colors.primaryDark, colors.secondary, colors.secondaryColor, theme.primaryDark, theme.primary_dark),
    accent: firstString(colors.accent, colors.accentColor, theme.accent),
    surface: firstString(colors.surface, theme.surface),
    darkSurface: firstString(colors.darkSurface, theme.darkSurface),
  };
}

function mapRemoteTenantPayload(raw: any): TenantSiteData | null {
  const tenant = raw?.tenant ?? raw?.data ?? raw;
  if (!tenant || typeof tenant !== "object") return null;

  const content = tenant.org_website_content || tenant.websiteContent || tenant.website || tenant;
  const globalBranding = raw?.globalBranding || tenant.globalBranding || content.globalBranding || {};
  const theme = mapColors(globalBranding, content, tenant);
  const title = firstString(globalBranding.title, content.title, tenant.title, tenant.name, content.name);
  const logo = firstString(globalBranding.logo, globalBranding.logoUrl, content.logo, tenant.logo);
  const base = cloneBaseData();

  return applyPartial(base, {
    globalBranding: {
      logo,
      title,
      colors: globalBranding.colors || {},
    },
    theme,
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
      logoText: firstString(content.logoText, title),
      heroImage: firstString(tenant.heroImage, content.heroImage),
    },
    hero: content.hero || base.hero,
    navLinks: arrayOrEmpty(content.navLinks),
    home: content.home || base.home,
    aboutPage: content.aboutPage || base.aboutPage,
    programsPage: content.programsPage || base.programsPage,
    programs: arrayOrEmpty(content.programs),
    admissionBanner: content.admissionBanner || base.admissionBanner,
    notices: arrayOrEmpty(content.notices),
    meritPage: content.meritPage || base.meritPage,
    toppers: arrayOrEmpty(content.toppers),
    meritLists: arrayOrEmpty(content.meritLists),
    feesPage: content.feesPage || base.feesPage,
    fees: arrayOrEmpty(content.fees),
    faculty: arrayOrEmpty(content.faculty),
    gallery: content.gallery || base.gallery,
    testimonials: arrayOrEmpty(content.testimonials),
    eventsPage: content.eventsPage || base.eventsPage,
    events: arrayOrEmpty(content.events),
    alumniPage: content.alumniPage || base.alumniPage,
    alumni: arrayOrEmpty(content.alumni),
    blogPage: content.blogPage || base.blogPage,
    blogPosts: arrayOrEmpty(content.blogPosts),
    contactPage: content.contactPage || base.contactPage,
    applyPage: content.applyPage || base.applyPage,
    mandatoryDisclosurePage: content.mandatoryDisclosurePage || content.mandatoryDisclosure || base.mandatoryDisclosurePage,
    committeesPage: content.committeesPage || base.committeesPage,
    infrastructurePage: content.infrastructurePage || base.infrastructurePage,
    academicCalendarPage: content.academicCalendarPage || base.academicCalendarPage,
    syllabusPage: content.syllabusPage || base.syllabusPage,
    examinationsPage: content.examinationsPage || base.examinationsPage,
    studentsPage: content.studentsPage || base.studentsPage,
    downloadsPage: content.downloadsPage || base.downloadsPage,
    quickEnquiry: content.quickEnquiry || base.quickEnquiry,
    socialLinks: arrayOrEmpty(content.socialLinks),
    footer: content.footer || base.footer,
    uiStrings: content.uiStrings || base.uiStrings,
  });
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
  const payload = normalizedDomain ? await fetchTenantWebsiteByDomain(normalizedDomain) : null;
  const remoteData = payload ? mapRemoteTenantPayload(payload) : null;
  return remoteData || cloneBaseData();
}
