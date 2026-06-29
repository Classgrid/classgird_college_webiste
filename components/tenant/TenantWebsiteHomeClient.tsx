"use client";

import { useEffect, useMemo, useState } from "react";
import type { CSSProperties } from "react";
import type { TenantSiteData } from "@/content/college_website";
import { FloatingRails, TenantSiteFooter, TenantSiteHeader } from "./TenantSiteShell";
import { TenantHomePage } from "./TenantHomeSections";
import {
  AboutPage,
  AcademicCalendarPage,
  AlumniPage,
  ApplyPage,
  BlogDetailPage,
  BlogPage,
  CommitteesPage,
  ContactPage,
  DownloadsPage,
  EventDetailPage,
  EventsPage,
  ExaminationsPage,
  FeesPage,
  GalleryPage,
  GlobalSearchPage,
  InfrastructurePage,
  MandatoryDisclosurePage,
  MeritPage,
  NoticeDetailPage,
  NoticesPage,
  NotFoundRoute,
  ProgramsPage,
  StudentsCornerPage,
  SyllabusPage,
  SystemMessagePage,
} from "./TenantPages";
import { decodeRouteSegment, getBrandColors, getBrandLogo, getBrandTitle, normalizeOrgType, resolveFacultyLabel, resolveProgramLabel } from "./tenant-utils";

type TenantWebsiteHomeClientProps = {
  data: TenantSiteData;
  tenantSlug?: string;
  segments?: string[];
};

function buildSchema(data: TenantSiteData, tenantSlug?: string) {
  const brandTitle = getBrandTitle(data);
  return {
    "@context": "https://schema.org",
    "@type": "EducationalOrganization",
    name: brandTitle || undefined,
    email: data.institution.email || undefined,
    telephone: data.institution.phone || undefined,
    address: data.institution.address || undefined,
    url: tenantSlug ? `https://${tenantSlug}` : undefined,
  };
}

function hasTenantWebsiteData(data: TenantSiteData) {
  return Boolean(
    getBrandTitle(data) ||
      getBrandLogo(data) ||
      data.institution.tagline ||
      data.hero.headline ||
      data.hero.description ||
      data.hero.fallbackImage ||
      data.navLinks.length ||
      data.home.highlights?.length ||
      data.programs.length ||
      data.notices.length ||
      data.faculty.length ||
      data.gallery.images?.length ||
      data.events.length
  );
}

export function TenantWebsiteHomeClient({ data, tenantSlug, segments = [] }: TenantWebsiteHomeClientProps) {
  const orgType = normalizeOrgType(data.institution.type);
  const programLabel = resolveProgramLabel(orgType);
  const facultyLabel = resolveFacultyLabel(orgType);
  const routeKey = segments.join("/");
  const isHome = routeKey.length === 0;
  const [isScrolled, setIsScrolled] = useState(false);
  const [fontScale, setFontScale] = useState(100);
  const [highContrast, setHighContrast] = useState(false);
  const brandColors = getBrandColors(data);
  const mainStyle = {
    fontFamily: "var(--font-tenant-body), sans-serif",
    fontSize: `${fontScale}%`,
    "--tenant-primary": brandColors.primary || undefined,
    "--tenant-secondary": brandColors.secondary || undefined,
    "--tenant-accent": brandColors.accent || undefined,
  } as CSSProperties;

  useEffect(() => {
    const onScroll = () => setIsScrolled(window.scrollY > 80);
    onScroll();
    window.addEventListener("scroll", onScroll, { passive: true });
    return () => window.removeEventListener("scroll", onScroll);
  }, []);

  const content = useMemo(() => {
    const primary = segments[0];
    const secondary = segments[1];
    const decodedSecondary = decodeRouteSegment(secondary);
    const common = { data, tenantSlug, orgType };

    if (!primary) return <TenantHomePage data={data} tenantSlug={tenantSlug} orgType={orgType} programLabel={programLabel} facultyLabel={facultyLabel} />;
    if (primary === "about") return <AboutPage {...common} />;
    if (primary === "programs") return <ProgramsPage {...common} />;
    if (primary === "notices" && secondary) return <NoticeDetailPage {...common} noticeId={secondary} />;
    if (primary === "notices") return <NoticesPage {...common} />;
    if (primary === "merit-list") return <MeritPage {...common} />;
    if (primary === "fees") return <FeesPage {...common} />;
    if (primary === "gallery") return <GalleryPage {...common} />;
    if (primary === "events" && secondary) return <EventDetailPage {...common} eventSlug={secondary} />;
    if (primary === "events") return <EventsPage {...common} />;
    if (primary === "alumni") return <AlumniPage {...common} />;
    if (primary === "blog" && secondary) return <BlogDetailPage {...common} blogSlug={secondary} />;
    if (primary === "blog") return <BlogPage {...common} />;
    if (primary === "contact") return <ContactPage {...common} />;
    if (primary === "apply") return <ApplyPage {...common} />;
    if (primary === "mandatory-disclosure") return <MandatoryDisclosurePage {...common} />;
    if (primary === "committees") return <CommitteesPage {...common} />;
    if (primary === "infrastructure") return <InfrastructurePage {...common} />;
    if (primary === "academic-calendar") return <AcademicCalendarPage {...common} />;
    if (primary === "syllabus") return <SyllabusPage {...common} />;
    if (primary === "examinations") return <ExaminationsPage {...common} />;
    if (primary === "students") return <StudentsCornerPage {...common} />;
    if (primary === "downloads") return <DownloadsPage {...common} />;
    if (primary === "search") return <GlobalSearchPage {...common} initialQuery={decodedSecondary} />;
    if (primary === "500") return <SystemMessagePage title="Server Error" description="The page encountered an internal error. Please try again in a moment." tenantSlug={tenantSlug} />;
    if (primary === "maintenance") return <SystemMessagePage title="Scheduled Maintenance" description="This website section is temporarily under maintenance. Please check again shortly." tenantSlug={tenantSlug} />;
    if (primary === "offline") return <SystemMessagePage title="Service Temporarily Unavailable" description="The service appears to be offline right now. Please retry or contact the institution." tenantSlug={tenantSlug} />;
    return <NotFoundRoute tenantSlug={tenantSlug} />;
  }, [data, facultyLabel, orgType, programLabel, segments, tenantSlug]);

  if (!hasTenantWebsiteData(data)) {
    return (
      <main className="min-h-screen bg-white text-slate-900" style={mainStyle}>
        <section className="mx-auto flex min-h-screen w-full max-w-3xl flex-col justify-center px-6 py-16">
          <div className="border-l-4 border-slate-900 pl-5">
            <p className="text-sm font-semibold uppercase text-slate-500">Tenant website</p>
            <h1 className="mt-3 text-3xl font-bold tracking-tight">No organization website data found</h1>
            <p className="mt-3 text-sm leading-6 text-slate-600">
              This host did not resolve to an active Organization record or published website content.
            </p>
          </div>
        </section>
      </main>
    );
  }

  return (
    <main className={`min-h-screen bg-white text-slate-900 ${highContrast ? "cg-high-contrast" : ""}`} style={mainStyle}>
      <a href="#tenant-main-content" className="sr-only z-[90] rounded-md bg-slate-900 px-3 py-2 text-xs font-semibold text-white focus:not-sr-only focus:fixed focus:left-4 focus:top-4">Skip to main content</a>
      <style jsx global>{`
        @keyframes cgNoticeScroll { 0% { transform: translateY(0); } 100% { transform: translateY(-50%); } }
        @keyframes cgTestimonialScroll { 0% { transform: translateX(0); } 100% { transform: translateX(calc(-50% - 1rem)); } }
        .cg-notice-scroll { animation: cgNoticeScroll 20s linear infinite; }
        .cg-testimonial-scroll { animation: cgTestimonialScroll 28s linear infinite; }
        .cg-high-contrast { filter: contrast(1.18); }
        .cg-high-contrast a { text-decoration-thickness: 2px; }
        *:focus-visible { outline: 2px solid var(--tenant-primary, CanvasText); outline-offset: 2px; }
      `}</style>
      <script type="application/ld+json" dangerouslySetInnerHTML={{ __html: JSON.stringify(buildSchema(data, tenantSlug)) }} />
      <TenantSiteHeader data={data} tenantSlug={tenantSlug} isScrolled={isScrolled} isHome={isHome} fontScale={fontScale} onFontScaleChange={setFontScale} highContrast={highContrast} onToggleHighContrast={() => setHighContrast((value) => !value)} />
      <div id="tenant-main-content" className={isHome ? "" : "pt-28"}>{content}</div>
      <TenantSiteFooter data={data} tenantSlug={tenantSlug} />
      <FloatingRails data={data} />
    </main>
  );
}
