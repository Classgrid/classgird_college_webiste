"use client";

import { useEffect, useMemo, useState } from "react";
import Image from "next/image";
import Link from "next/link";
import { motion } from "framer-motion";
import { ArrowRight, Eye, Facebook, Linkedin, Star } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Card, CardContent } from "@/components/ui/card";
import type { TenantSiteData } from "@/content/college_website";
import { AnimatedCounter, brandBackground, brandGradient, buildTenantHref, buildYouTubeEmbedUrl, fadeUp, formatDate, getBrandTitle, getIcon, staggerChildren } from "./tenant-utils";

type TenantHomePageProps = {
  data: TenantSiteData;
  tenantSlug?: string;
  orgType: string;
  programLabel: string;
  facultyLabel: string;
};

type TenantRecord = Record<string, any>;

function text(value: unknown) {
  return typeof value === "string" ? value.trim() : "";
}

function actionLabel(data: TenantSiteData, key: string) {
  return text(data.uiStrings?.actions?.[key]);
}

function sectionHeading(title?: string, description?: string) {
  if (!title && !description) return null;
  return (
    <div>
      {title ? <h2 className="text-3xl font-semibold text-slate-900">{title}</h2> : null}
      {description ? <p className="mt-2 text-slate-600">{description}</p> : null}
    </div>
  );
}

function collectHeroImages(data: TenantSiteData) {
  const images = Array.isArray(data.hero.fallbackImages) ? data.hero.fallbackImages.filter(Boolean) : [];
  if (data.hero.fallbackImage) images.push(data.hero.fallbackImage);
  if (data.institution.heroImage) images.push(data.institution.heroImage);
  return Array.from(new Set(images));
}

function HeroSection({ data, tenantSlug }: { data: TenantSiteData; tenantSlug?: string }) {
  const youtubeEmbedUrl = buildYouTubeEmbedUrl(data.hero.videoUrl);
  const heroImages = useMemo(() => collectHeroImages(data), [data]);
  const [heroImageIndex, setHeroImageIndex] = useState(0);

  useEffect(() => {
    if (heroImages.length <= 1) return;
    const timer = window.setInterval(() => setHeroImageIndex((current) => (current + 1) % heroImages.length), 4500);
    return () => window.clearInterval(timer);
  }, [heroImages.length]);

  const activeHeroImage = heroImages[heroImageIndex];
  const headline = text(data.hero.headline) || getBrandTitle(data);
  const description = text(data.hero.description) || text(data.institution.tagline);
  const hasHeroContent = headline || data.hero.badge || data.hero.subHeadline || description || activeHeroImage || data.hero.videoUrl || data.hero.primaryCta?.label || data.hero.secondaryCta?.label || data.hero.stats?.length;

  if (!hasHeroContent) return null;

  return (
    <section className="relative min-h-screen overflow-hidden">
      <div className="absolute inset-0 hidden md:block" style={!activeHeroImage && !data.hero.videoUrl ? brandGradient(data) : undefined}>
        {youtubeEmbedUrl ? (
          <iframe title={headline || getBrandTitle(data)} src={youtubeEmbedUrl} className="h-full w-full object-cover" allow="autoplay; encrypted-media; picture-in-picture" referrerPolicy="strict-origin-when-cross-origin" />
        ) : data.hero.videoUrl ? (
          <video autoPlay muted loop playsInline preload="metadata" className="h-full w-full object-cover"><source src={data.hero.videoUrl} type="video/mp4" /></video>
        ) : activeHeroImage ? (
          <Image key={activeHeroImage} src={activeHeroImage} alt={headline} fill className="object-cover" priority />
        ) : (
          <div className="h-full w-full bg-neutral-950" />
        )}
      </div>
      <div className="absolute inset-0 md:hidden" style={!activeHeroImage ? brandGradient(data) : undefined}>
        {activeHeroImage ? <Image key={activeHeroImage} src={activeHeroImage} alt={headline} fill className="object-cover" priority /> : <div className="h-full w-full bg-neutral-950" />}
      </div>
      <div className="absolute inset-0 bg-gradient-to-b from-black/50 via-black/60 to-black/85" />
      <div className="relative z-10 mx-auto flex min-h-screen w-full max-w-7xl flex-col justify-center px-4 pb-36 pt-36 text-white sm:px-6 lg:px-8">
        {data.hero.badge ? <p className="mb-4 w-fit rounded-full border border-white/25 bg-white/10 px-4 py-1 text-sm font-semibold">{data.hero.badge}</p> : null}
        {headline ? <h1 className="max-w-4xl text-5xl font-bold tracking-tight sm:text-6xl lg:text-7xl">{headline}</h1> : null}
        {data.hero.subHeadline ? <p className="mt-4 max-w-3xl text-xl text-white/90">{data.hero.subHeadline}</p> : null}
        {description ? <p className="mt-4 max-w-2xl text-base leading-7 text-white/78">{description}</p> : null}
        <div className="mt-7 flex flex-wrap gap-3">
          {data.hero.primaryCta?.label && data.hero.primaryCta?.href ? <Button asChild className="rounded-full bg-white px-6 text-slate-950 hover:bg-white/90"><Link href={buildTenantHref(data.hero.primaryCta.href, tenantSlug)}>{data.hero.primaryCta.label}</Link></Button> : null}
          {data.hero.secondaryCta?.label && data.hero.secondaryCta?.href ? <Button asChild variant="outline" className="rounded-full border-white/40 bg-transparent px-6 text-white hover:bg-white/10"><Link href={buildTenantHref(data.hero.secondaryCta.href, tenantSlug)}>{data.hero.secondaryCta.label}</Link></Button> : null}
        </div>
      </div>
      {data.hero.stats?.length ? <HeroStats data={data} /> : null}
    </section>
  );
}

function HeroStats({ data }: { data: TenantSiteData }) {
  return (
    <motion.div initial={{ opacity: 0, y: 30 }} whileInView={{ opacity: 1, y: 0 }} viewport={{ once: true, amount: 0.35 }} transition={{ duration: 0.6 }} className="absolute bottom-4 left-1/2 z-10 w-[calc(100%-2rem)] -translate-x-1/2 rounded-xl border border-slate-200/50 bg-white/95 p-4 shadow-xl backdrop-blur md:bottom-8 md:w-[calc(100%-4rem)] md:p-5">
      <div className="grid grid-cols-2 gap-4 md:grid-cols-4">
        {data.hero.stats.map((stat: TenantRecord, index: number) => {
          const Icon = getIcon(stat.icon);
          const label = text(stat.labels?.[data.institution.type]) || text(stat.label);
          const value = text(stat.value);
          if (!label && !value) return null;
          return (
            <div key={stat.key || label || index} className="rounded-xl border border-slate-100 bg-white p-3 shadow-sm">
              {value ? <div className="mb-1 flex items-center gap-2 text-slate-900"><Icon className="h-4 w-4" /><p className="text-xl font-bold"><AnimatedCounter value={value} /></p></div> : null}
              {label ? <p className="text-xs text-slate-600">{label}</p> : null}
            </div>
          );
        })}
      </div>
    </motion.div>
  );
}

function HighlightsSection({ data }: { data: TenantSiteData }) {
  if (!data.home.highlights?.length) return null;
  return (
    <section className="bg-white py-16">
      <div className="mx-auto w-full max-w-7xl px-4 sm:px-6 lg:px-8">
        <motion.div initial="hidden" whileInView="visible" viewport={{ once: true, amount: 0.25 }} variants={staggerChildren} className="grid gap-4 md:grid-cols-2 lg:grid-cols-4">
          {data.home.highlights.map((item: TenantRecord, index: number) => {
            const Icon = getIcon(item.icon);
            return (
              <motion.div key={item.label || index} variants={fadeUp}>
                <Card className="h-full border-slate-200/80"><CardContent className="p-5 text-center"><div className="mx-auto mb-3 inline-flex h-11 w-11 items-center justify-center rounded-full bg-slate-100 text-slate-800"><Icon className="h-5 w-5" /></div>{item.value ? <p className="text-2xl font-bold text-slate-900"><AnimatedCounter value={String(item.value)} /></p> : null}{item.label ? <p className="mt-1 text-sm font-semibold text-slate-800">{item.label}</p> : null}{item.description ? <p className="mt-1 text-xs text-slate-500">{item.description}</p> : null}</CardContent></Card>
              </motion.div>
            );
          })}
        </motion.div>
      </div>
    </section>
  );
}

function ProgramsPreview({ data, tenantSlug, programLabel }: { data: TenantSiteData; tenantSlug?: string; programLabel: string }) {
  if (!data.programs.length) return null;
  const viewAllLabel = actionLabel(data, "viewAllPrograms");
  const detailsLabel = actionLabel(data, "programDetails");
  return (
    <section className="py-16 text-white" style={brandBackground(data)}>
      <div className="mx-auto w-full max-w-7xl px-4 sm:px-6 lg:px-8">
        <div className="mb-6 flex items-end justify-between gap-4">
          <div>{sectionHeading(data.home.programsPreviewHeading || programLabel, data.programsPage.description)}</div>
          {viewAllLabel ? <Button asChild variant="outline" className="border-white/40 bg-transparent text-white hover:bg-white/10"><Link href={buildTenantHref("/programs", tenantSlug)}>{viewAllLabel}</Link></Button> : null}
        </div>
        <div className="grid gap-4 md:grid-cols-3">
          {data.programs.slice(0, 3).map((program: TenantRecord) => {
            const Icon = getIcon(program.icon);
            return (
              <Card key={program.id || program.name} className="group border-white/20 bg-white/10 text-white transition hover:-translate-y-1 hover:shadow-xl"><CardContent className="p-5"><div className="mb-3 inline-flex h-10 w-10 items-center justify-center rounded-full bg-white/20"><Icon className="h-5 w-5" /></div>{program.name ? <p className="text-lg font-semibold">{program.name}</p> : null}{program.duration ? <p className="mt-1 text-sm text-white/75">{program.duration}</p> : null}{program.description ? <p className="mt-3 text-sm text-white/85">{program.description}</p> : null}{detailsLabel ? <Link href={buildTenantHref("/programs", tenantSlug)} className="mt-4 inline-flex items-center text-sm font-semibold text-white">{detailsLabel}<ArrowRight className="ml-1 h-4 w-4" /></Link> : null}</CardContent></Card>
            );
          })}
        </div>
      </div>
    </section>
  );
}

function AdmissionBanner({ data, tenantSlug }: { data: TenantSiteData; tenantSlug?: string }) {
  if (!data.admissionBanner.title && !data.admissionBanner.description) return null;
  return (
    <section className="py-14 text-white" style={brandGradient(data)}>
      <div className="mx-auto flex w-full max-w-7xl flex-col items-start justify-between gap-6 px-4 sm:px-6 lg:flex-row lg:items-center lg:px-8">
        <div>{data.admissionBanner.title ? <h2 className="text-3xl font-semibold">{data.admissionBanner.title}</h2> : null}{data.admissionBanner.description ? <p className="mt-2 text-white/85">{data.admissionBanner.description}</p> : null}<div className="mt-4 flex flex-wrap gap-4 text-sm">{data.admissionBanner.importantDates?.map((item: TenantRecord) => item.label || item.date ? <div key={item.label || item.date} className="rounded-full border border-white/25 px-4 py-1 text-white/90">{[item.label, item.date].filter(Boolean).join(": ")}</div> : null)}</div></div>
        {data.admissionBanner.cta?.label && data.admissionBanner.cta?.href ? <Button asChild className="h-11 rounded-full bg-white px-7 text-slate-900 hover:bg-slate-100"><Link href={buildTenantHref(data.admissionBanner.cta.href, tenantSlug)}>{data.admissionBanner.cta.label}<ArrowRight className="ml-2 h-4 w-4" /></Link></Button> : null}
      </div>
    </section>
  );
}

function NoticesPreview({ data, tenantSlug }: { data: TenantSiteData; tenantSlug?: string }) {
  if (!data.notices.length) return null;
  const viewAllLabel = actionLabel(data, "viewAllNotices");
  return (
    <section className="bg-white py-16">
      <div className="mx-auto grid w-full max-w-7xl gap-6 px-4 sm:px-6 lg:grid-cols-5 lg:px-8">
        <div className="rounded-xl border border-slate-200 bg-slate-950 p-6 text-white lg:col-span-2">{data.home.noticesHeading ? <p className="text-2xl font-semibold">{data.home.noticesHeading}</p> : null}{viewAllLabel ? <Button asChild className="mt-4 w-fit rounded-full bg-white text-slate-900 hover:bg-slate-100"><Link href={buildTenantHref("/notices", tenantSlug)}>{viewAllLabel}</Link></Button> : null}</div>
        <div className="group relative h-[360px] overflow-hidden rounded-xl border border-slate-200 bg-slate-50 lg:col-span-3"><div className="cg-notice-scroll group-hover:[animation-play-state:paused] space-y-3 p-4">{[...data.notices, ...data.notices].map((notice: TenantRecord, index: number) => <div key={`${notice.id || notice.title}-${index}`} className="flex items-center justify-between gap-3 rounded-xl border border-slate-200 bg-white px-4 py-3"><div className="min-w-0">{notice.date ? <p className="text-xs font-semibold uppercase tracking-wide text-slate-500">{formatDate(notice.date)}</p> : null}{notice.title ? <p className="truncate text-sm font-semibold text-slate-800">{notice.title}</p> : null}</div>{notice.id ? <Button asChild size="sm" variant="outline" className="shrink-0"><Link href={buildTenantHref(`/notices/${notice.id}`, tenantSlug)}><Eye className="h-3.5 w-3.5" /></Link></Button> : null}</div>)}</div></div>
      </div>
    </section>
  );
}

function FacultyPreview({ data, tenantSlug, facultyLabel }: { data: TenantSiteData; tenantSlug?: string; facultyLabel: string }) {
  if (!data.faculty.length) return null;
  const viewAllLabel = actionLabel(data, "viewFaculty");
  return (
    <section className="bg-white py-16"><div className="mx-auto w-full max-w-7xl px-4 sm:px-6 lg:px-8"><div className="mb-6 flex items-end justify-between gap-4">{sectionHeading(data.home.facultyHeading || facultyLabel)}{viewAllLabel ? <Button asChild variant="outline"><Link href={buildTenantHref("/about", tenantSlug)}>{viewAllLabel}</Link></Button> : null}</div><div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-4">{data.faculty.slice(0, 4).map((member: TenantRecord) => <motion.div key={member.id || member.name} whileHover={{ scale: 1.03 }}><Card className="overflow-hidden border-slate-200">{member.image ? <div className="relative h-52 bg-slate-100"><Image src={member.image} alt={member.name || ""} fill className="object-cover" /></div> : null}<CardContent className="p-4">{member.name ? <p className="text-base font-semibold text-slate-900">{member.name}</p> : null}{member.designation ? <p className="text-sm text-slate-600">{member.designation}</p> : null}{member.subject ? <p className="text-xs text-slate-500">{member.subject}</p> : null}</CardContent></Card></motion.div>)}</div></div></section>
  );
}

function GalleryPreview({ data, tenantSlug }: { data: TenantSiteData; tenantSlug?: string }) {
  if (!data.gallery.images?.length) return null;
  const viewGalleryLabel = actionLabel(data, "viewGallery");
  return (
    <section className="bg-slate-100 py-16"><div className="mx-auto w-full max-w-7xl px-4 sm:px-6 lg:px-8"><div className="mb-6 flex items-end justify-between gap-4">{sectionHeading(data.home.galleryHeading)}{viewGalleryLabel ? <Button asChild variant="outline"><Link href={buildTenantHref("/gallery", tenantSlug)}>{viewGalleryLabel}</Link></Button> : null}</div><div className="grid grid-cols-2 gap-3 md:grid-cols-4">{data.gallery.images.slice(0, 6).map((item: TenantRecord, index: number) => <div key={item.id || item.image || index} className={`group relative overflow-hidden rounded-xl border border-slate-200 ${index === 2 ? "row-span-2 md:col-span-2" : ""}`}><div className="relative h-36 md:h-44"><Image src={item.image} alt={item.title || ""} fill className="object-cover transition duration-300 group-hover:scale-105" /></div><div className="absolute inset-0 bg-slate-950/0 transition group-hover:bg-slate-950/40" /></div>)}</div></div></section>
  );
}

function TestimonialsPreview({ data }: { data: TenantSiteData }) {
  if (!data.testimonials.length) return null;
  return (
    <section className="bg-white py-16"><div className="mx-auto w-full max-w-7xl px-4 sm:px-6 lg:px-8"><div className="mb-6">{sectionHeading(data.home.testimonialsHeading)}</div><div className="group overflow-hidden"><div className="cg-testimonial-scroll group-hover:[animation-play-state:paused] flex w-max gap-4 pb-4">{[...data.testimonials, ...data.testimonials].map((item: TenantRecord, index: number) => <Card key={`${item.id || item.name}-${index}`} className="w-[320px] overflow-hidden border-slate-200"><div className="h-16" style={brandGradient(data)} /><CardContent className="p-4">{item.image ? <div className="-mt-10 mb-3 h-16 w-16 overflow-hidden rounded-full border-4 border-white bg-slate-100"><div className="relative h-full w-full"><Image src={item.image} alt={item.name || ""} fill className="object-cover" /></div></div> : null}<div className="mb-2 flex items-center gap-1 text-amber-500">{Array.from({ length: Number(item.rating) || 0 }).map((_, starIndex) => <Star key={`${item.id || item.name}-star-${starIndex}`} className="h-4 w-4 fill-current" />)}</div>{item.name ? <p className="text-base font-semibold text-slate-900">{item.name}</p> : null}<p className="text-xs text-slate-500">{[item.batch, item.program].filter(Boolean).join(" - ")}</p>{item.text ? <p className="mt-3 text-sm text-slate-600">{item.text}</p> : null}<div className="mt-3 flex gap-2 text-slate-500">{item.facebook ? <Link href={item.facebook} className="rounded-full border border-slate-200 p-1.5 hover:text-slate-900"><Facebook className="h-4 w-4" /></Link> : null}{item.linkedin ? <Link href={item.linkedin} className="rounded-full border border-slate-200 p-1.5 hover:text-slate-900"><Linkedin className="h-4 w-4" /></Link> : null}</div></CardContent></Card>)}</div></div></div></section>
  );
}

function QuickEnquiry({ data, orgType }: { data: TenantSiteData; orgType: string }) {
  if (!data.home.showQuickEnquiryFor?.includes(orgType)) return null;
  const fields = data.quickEnquiry.fields || data.uiStrings?.forms?.quickEnquiry || {};
  const submitLabel = text(fields.submitLabel) || actionLabel(data, "submitEnquiry");
  const showForm = fields.namePlaceholder || fields.phonePlaceholder || fields.programPlaceholder || submitLabel;
  return (
    <section className="py-14 text-white" style={brandBackground(data)}><div className="mx-auto w-full max-w-7xl px-4 sm:px-6 lg:px-8">{data.quickEnquiry.heading ? <h2 className="text-3xl font-semibold">{data.quickEnquiry.heading}</h2> : null}{data.quickEnquiry.description ? <p className="mt-2 text-white/85">{data.quickEnquiry.description}</p> : null}{showForm ? <form className="mt-6 grid gap-3 md:grid-cols-4">{fields.namePlaceholder ? <input className="h-11 rounded-lg border border-white/40 bg-white/10 px-3 text-sm text-white placeholder:text-white/75" placeholder={fields.namePlaceholder} /> : null}{fields.phonePlaceholder ? <input className="h-11 rounded-lg border border-white/40 bg-white/10 px-3 text-sm text-white placeholder:text-white/75" placeholder={fields.phonePlaceholder} /> : null}{data.programs.length ? <select className="h-11 rounded-lg border border-white/40 bg-white/10 px-3 text-sm text-white">{data.programs.map((program: TenantRecord) => <option key={program.id || program.name} value={program.id || program.name} className="text-slate-900">{program.name}</option>)}</select> : fields.programPlaceholder ? <input className="h-11 rounded-lg border border-white/40 bg-white/10 px-3 text-sm text-white placeholder:text-white/75" placeholder={fields.programPlaceholder} /> : null}{submitLabel ? <Button className="h-11 rounded-lg bg-white text-slate-900 hover:bg-slate-100">{submitLabel}</Button> : null}</form> : null}</div></section>
  );
}

export function TenantHomePage({ data, tenantSlug, orgType, programLabel, facultyLabel }: TenantHomePageProps) {
  return (
    <>
      <HeroSection data={data} tenantSlug={tenantSlug} />
      <HighlightsSection data={data} />
      <ProgramsPreview data={data} tenantSlug={tenantSlug} programLabel={programLabel} />
      <AdmissionBanner data={data} tenantSlug={tenantSlug} />
      <NoticesPreview data={data} tenantSlug={tenantSlug} />
      <FacultyPreview data={data} tenantSlug={tenantSlug} facultyLabel={facultyLabel} />
      <GalleryPreview data={data} tenantSlug={tenantSlug} />
      <TestimonialsPreview data={data} />
      <QuickEnquiry data={data} orgType={orgType} />
    </>
  );
}
