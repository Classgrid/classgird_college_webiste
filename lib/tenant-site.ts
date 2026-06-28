import { createEmptyTenantSiteData, type TenantSiteData } from "@/content/college_website";

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

function normalizeSlug(input: string): string {
  return input.trim().toLowerCase().replace(/[^a-z0-9-]/g, "");
}

function mapRemoteTenantPayload(raw: any): TenantSiteData | null {
  const tenant = raw?.tenant ?? raw?.data ?? raw;
  if (!tenant || typeof tenant !== "object") return null;

  const content = tenant.org_website_content || tenant;
  const base = cloneBaseData();
  const theme = content.theme || tenant.theme || {};

  return applyPartial(base, {
    theme: {
      primary: theme.primary || base.theme.primary,
      primaryDark: theme.primary_dark || theme.primaryDark || base.theme.primaryDark,
      accent: theme.accent || base.theme.accent,
      surface: theme.surface || base.theme.surface,
      darkSurface: theme.darkSurface || base.theme.darkSurface,
    },
    institution: {
      name: tenant.name || content.name || base.institution.name,
      shortName: tenant.shortName || content.shortName || base.institution.shortName,
      type: tenant.orgType || content.orgType || base.institution.type,
      tagline: tenant.tagline || content.tagline || base.institution.tagline,
      location: tenant.location || content.location || base.institution.location,
      address: tenant.address || content.address || base.institution.address,
      email: tenant.email || content.email || base.institution.email,
      phone: tenant.phone || content.phone || base.institution.phone,
      whatsapp: tenant.whatsapp || content.whatsapp || base.institution.whatsapp,
      establishedYear: tenant.establishedYear || content.establishedYear || base.institution.establishedYear,
      logoText: tenant.logoText || content.logoText || base.institution.logoText,
      heroImage: tenant.heroImage || content.heroImage || base.institution.heroImage,
    },
    hero: content.hero || base.hero,
    navLinks: Array.isArray(content.navLinks) && content.navLinks.length ? content.navLinks : base.navLinks,
    home: content.home || base.home,
    aboutPage: content.aboutPage || base.aboutPage,
    programsPage: content.programsPage || base.programsPage,
    programs: Array.isArray(content.programs) ? content.programs : base.programs,
    admissionBanner: content.admissionBanner || base.admissionBanner,
    notices: Array.isArray(content.notices) ? content.notices : base.notices,
    meritPage: content.meritPage || base.meritPage,
    toppers: Array.isArray(content.toppers) ? content.toppers : base.toppers,
    meritLists: Array.isArray(content.meritLists) ? content.meritLists : base.meritLists,
    feesPage: content.feesPage || base.feesPage,
    fees: Array.isArray(content.fees) ? content.fees : base.fees,
    faculty: Array.isArray(content.faculty) ? content.faculty : base.faculty,
    gallery: content.gallery || base.gallery,
    testimonials: Array.isArray(content.testimonials) ? content.testimonials : base.testimonials,
    eventsPage: content.eventsPage || base.eventsPage,
    events: Array.isArray(content.events) ? content.events : base.events,
    alumniPage: content.alumniPage || base.alumniPage,
    alumni: Array.isArray(content.alumni) ? content.alumni : base.alumni,
    blogPage: content.blogPage || base.blogPage,
    blogPosts: Array.isArray(content.blogPosts) ? content.blogPosts : base.blogPosts,
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
    socialLinks: Array.isArray(content.socialLinks) ? content.socialLinks : base.socialLinks,
    footer: content.footer || base.footer,
    uiStrings: content.uiStrings || base.uiStrings,
  });
}

async function resolveTenantFromRemote(slug: string): Promise<TenantSiteData | null> {
  const resolverBaseUrl = process.env.TENANT_RESOLVER_API_BASE_URL?.trim();
  if (!resolverBaseUrl || !slug) return null;

  try {
    const url = `${resolverBaseUrl.replace(/\/$/, "")}/api/public/tenant/resolve?slug=${encodeURIComponent(slug)}`;
    const response = await fetch(url, { next: { revalidate: 60 }, headers: { Accept: "application/json" } });
    if (!response.ok) return null;
    return mapRemoteTenantPayload(await response.json());
  } catch {
    return null;
  }
}

export async function resolveTenantSiteData(rawSlug?: string | null): Promise<TenantSiteData> {
  const normalizedSlug = rawSlug ? normalizeSlug(rawSlug) : "";
  const remoteData = await resolveTenantFromRemote(normalizedSlug);
  return remoteData || cloneBaseData();
}
