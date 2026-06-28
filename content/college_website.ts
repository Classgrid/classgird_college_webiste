type TenantDict = Record<string, any>;

export type TenantOrgType = "school" | "junior-college" | "coaching";

export type TenantLink = {
  label: string;
  href: string;
  subItems?: TenantLink[];
};

export type TenantSiteData = {
  globalBranding: {
    logo: string;
    title: string;
    colors: TenantDict;
  };
  theme: TenantDict;
  institution: TenantDict;
  hero: TenantDict;
  navLinks: TenantLink[];
  home: TenantDict;
  aboutPage: TenantDict;
  programsPage: TenantDict;
  programs: TenantDict[];
  admissionBanner: TenantDict;
  notices: TenantDict[];
  meritPage: TenantDict;
  toppers: TenantDict[];
  meritLists: TenantDict[];
  feesPage: TenantDict;
  fees: TenantDict[];
  faculty: TenantDict[];
  gallery: TenantDict;
  testimonials: TenantDict[];
  eventsPage: TenantDict;
  events: TenantDict[];
  alumniPage: TenantDict;
  alumni: TenantDict[];
  blogPage: TenantDict;
  blogPosts: TenantDict[];
  contactPage: TenantDict;
  applyPage: TenantDict;
  mandatoryDisclosurePage: TenantDict;
  committeesPage: TenantDict;
  infrastructurePage: TenantDict;
  academicCalendarPage: TenantDict;
  syllabusPage: TenantDict;
  examinationsPage: TenantDict;
  studentsPage: TenantDict;
  downloadsPage: TenantDict;
  quickEnquiry: TenantDict;
  socialLinks: TenantDict[];
  footer: TenantDict;
  uiStrings: TenantDict;
};

/**
 * Template scope lock (do not remove): this public website template is only for
 * school, junior-college, and coaching organizations. Engineering colleges use
 * BYOW onboarding because their legacy sites are usually accreditation-heavy.
 */
export const tenantWebsiteTemplateScope = {
  supportedOrgTypes: ["school", "junior-college", "coaching"],
  excludedOrgTypes: ["engineering-college"],
  exclusionReason:
    "Engineering colleges use BYOW flow due to their large legacy websites and accreditation-heavy content needs.",
} as const;

export function createEmptyTenantSiteData(): TenantSiteData {
  return {
    globalBranding: { logo: "", title: "", colors: {} },
    theme: { primary: "", primaryDark: "", accent: "", surface: "", darkSurface: "" },
    institution: { name: "", shortName: "", type: "", tagline: "", location: "", address: "", email: "", phone: "", whatsapp: "", establishedYear: null, logoText: "", heroImage: "" },
    hero: { badge: "", headline: "", subHeadline: "", description: "", videoUrl: "", fallbackImages: [], fallbackImage: "", primaryCta: { label: "", href: "" }, secondaryCta: { label: "", href: "" }, stats: [] },
    navLinks: [],
    home: { highlights: [], programsPreviewHeading: "", noticesHeading: "", facultyHeading: "", galleryHeading: "", testimonialsHeading: "", showQuickEnquiryFor: [] },
    aboutPage: { bannerImage: "", storyTitle: "", story: "", storyImage: "", vision: "", mission: "", principal: { name: "", designation: "", message: "", image: "" }, accreditations: [], typeSpecific: { school: {}, "junior-college": {}, coaching: {} } },
    programsPage: { title: "", description: "", eligibilitySteps: [] },
    programs: [],
    admissionBanner: { title: "", description: "", importantDates: [], cta: { label: "", href: "" } },
    notices: [],
    meritPage: { years: [], resultStats: [] },
    toppers: [],
    meritLists: [],
    feesPage: { academicYear: "", scholarshipTitle: "", scholarshipText: "", policies: [] },
    fees: [],
    faculty: [],
    gallery: { categories: [], images: [], videos: [] },
    testimonials: [],
    eventsPage: { categories: [] },
    events: [],
    alumniPage: { heading: "", successStoriesHeading: "", connectHeading: "" },
    alumni: [],
    blogPage: { categories: [] },
    blogPosts: [],
    contactPage: { officeHours: "", mapEmbedUrl: "" },
    applyPage: { heading: "", confirmationPrefix: "", stepTitles: [] },
    mandatoryDisclosurePage: { institutionDetails: [], trustDetails: [], affiliationDetails: [], infrastructureDetails: [], staffDetails: [], committees: [], documents: [] },
    committeesPage: { description: "", committees: [] },
    infrastructurePage: { description: "", facilities: [] },
    academicCalendarPage: { year: "", description: "", entries: [], downloads: [] },
    syllabusPage: { description: "", groups: [] },
    examinationsPage: { description: "", patterns: [], assessments: [], schedules: [], downloads: [] },
    studentsPage: { description: "", quickLinks: [], parentCorner: [], studentPolicies: [] },
    downloadsPage: { description: "", categories: [], resources: [] },
    quickEnquiry: { heading: "", description: "" },
    socialLinks: [],
    footer: { importantLinks: [], legalLinks: [], newsletterCta: "" },
    uiStrings: { header: {}, footer: {}, pages: {}, actions: {}, states: {} },
  };
}

export const collegeWebsiteData = createEmptyTenantSiteData();

// Preserve the historical misspelled export during migration.
export const collgeWebsiteData = collegeWebsiteData;
