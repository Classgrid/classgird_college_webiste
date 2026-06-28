"use client";

import { useEffect, useMemo, useState } from "react";
import Image from "next/image";
import Link from "next/link";
import { motion } from "framer-motion";
import { ArrowRight, Eye, Facebook, Linkedin, Star } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Card, CardContent } from "@/components/ui/card";
import type { TenantSiteData } from "@/content/college_website";
import { AnimatedCounter, buildTenantHref, buildYouTubeEmbedUrl, fadeUp, formatDate, getIcon, staggerChildren } from "./tenant-utils";
import { TenantEmptyState } from "./TenantEmptyState";

type TenantHomePageProps = {
  data: TenantSiteData;
  tenantSlug?: string;
  orgType: string;
  programLabel: string;
  facultyLabel: string;
};

function sectionHeading(title: string, fallback: string, description?: string) {
  return (
    <div>
      <h2 className="text-3xl font-semibold text-slate-900">{title || fallback}</h2>
      {description ? <p className="mt-2 text-slate-600">{description}</p> : null}
    </div>
  );
}

function HeroSection({ data, tenantSlug }: { data: TenantSiteData; tenantSlug?: string }) {
  const youtubeEmbedUrl = buildYouTubeEmbedUrl(data.hero.videoUrl);
  const heroImages = useMemo(() => {
    const images = Array.isArray(data.hero.fallbackImages) ? data.hero.fallbackImages.filter(Boolean) : [];
    if (data.hero.fallbackImage) images.push(data.hero.fallbackImage);
    if (data.institution.heroImage) images.push(data.institution.heroImage);
    return Array.from(new Set(images));
  }, [data.hero.fallbackImage, data.hero.fallbackImages, data.institution.heroImage]);
  const [heroImageIndex, setHeroImageIndex] = useState(0);

  useEffect(() => {
    if (heroImages.length <= 1) return;
    const timer = window.setInterval(() => setHeroImageIndex((current) => (current + 1) % heroImages.length), 4500);
    return () => window.clearInterval(timer);
  }, [heroImages.length]);

  const activeHeroImage = heroImages[heroImageIndex];
  const headline = data.hero.headline || data.institution.name || "Institution Website";

  return (
    <section className="relative min-h-screen overflow-hidden">
      <div className="absolute inset-0 hidden md:block">
        {youtubeEmbedUrl ? (
          <iframe title="Hero video" src={youtubeEmbedUrl} className="h-full w-full object-cover" allow="autoplay; encrypted-media; picture-in-picture" referrerPolicy="strict-origin-when-cross-origin" />
        ) : data.hero.videoUrl ? (
          <video autoPlay muted loop playsInline preload="metadata" className="h-full w-full object-cover"><source src={data.hero.videoUrl} type="video/mp4" /></video>
        ) : activeHeroImage ? (
          <Image key={activeHeroImage} src={activeHeroImage} alt={headline} fill className="object-cover" priority />
        ) : (
          <div className="h-full w-full bg-neutral-950" />
        )}
      </div>
      <div className="absolute inset-0 md:hidden">
        {activeHeroImage ? <Image key={activeHeroImage} src={activeHeroImage} alt={headline} fill className="object-cover" priority /> : <div className="h-full w-full bg-neutral-950" />}
      </div>
      <div className="absolute inset-0 bg-gradient-to-b from-black/50 via-black/60 to-black/85" />
      <div className="relative z-10 mx-auto flex min-h-screen w-full max-w-7xl flex-col justify-center px-4 pb-36 pt-36 text-white sm:px-6 lg:px-8">
        {data.hero.badge ? <p className="mb-4 w-fit rounded-full border border-white/25 bg-white/10 px-4 py-1 text-sm font-semibold">{data.hero.badge}</p> : null}
        <h1 className="max-w-4xl text-5xl font-bold tracking-tight sm:text-6xl lg:text-7xl">{headline}</h1>
        {data.hero.subHeadline ? <p className="mt-4 max-w-3xl text-xl text-white/90">{data.hero.subHeadline}</p> : null}
        {data.hero.description || data.institution.tagline ? <p className="mt-4 max-w-2xl text-base leading-7 text-white/78">{data.hero.description || data.institution.tagline}</p> : null}
        <div className="mt-7 flex flex-wrap gap-3">
          {data.hero.primaryCta?.label ? <Button asChild className="rounded-full bg-white px-6 text-slate-950 hover:bg-white/90"><Link href={buildTenantHref(data.hero.primaryCta.href || "/apply", tenantSlug)}>{data.hero.primaryCta.label}</Link></Button> : null}
          {data.hero.secondaryCta?.label ? <Button asChild variant="outline" className="rounded-full border-white/40 bg-transparent px-6 text-white hover:bg-white/10"><Link href={buildTenantHref(data.hero.secondaryCta.href || "/programs", tenantSlug)}>{data.hero.secondaryCta.label}</Link></Button> : null}
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
        {data.hero.stats.map((stat) => {
          const Icon = getIcon(stat.icon);
          const label = stat.labels?.[data.institution.type] || stat.labels?.["junior-college"] || stat.label || "Metric";
          return (
            <div key={stat.key || label} className="rounded-xl border border-slate-100 bg-white p-3 shadow-sm">
              <div className="mb-1 flex items-center gap-2 text-slate-900"><Icon className="h-4 w-4" /><p className="text-xl font-bold"><AnimatedCounter value={stat.value || "0"} /></p></div>
              <p className="text-xs text-slate-600">{label}</p>
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
          {data.home.highlights.map((item) => {
            const Icon = getIcon(item.icon);
            return (
              <motion.div key={item.label} variants={fadeUp}>
                <Card className="h-full border-slate-200/80"><CardContent className="p-5 text-center"><div className="mx-auto mb-3 inline-flex h-11 w-11 items-center justify-center rounded-full bg-slate-100 text-slate-800"><Icon className="h-5 w-5" /></div><p className="text-2xl font-bold text-slate-900"><AnimatedCounter value={item.value || "0"} /></p><p className="mt-1 text-sm font-semibold text-slate-800">{item.label}</p><p className="mt-1 text-xs text-slate-500">{item.description}</p></CardContent></Card>
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
  return (
    <section className="py-16 text-white" style={{ backgroundColor: data.theme.primary }}>
      <div className="mx-auto w-full max-w-7xl px-4 sm:px-6 lg:px-8">
        <div className="mb-6 flex items-end justify-between gap-4">
          <div><h2 className="text-3xl font-semibold">{data.home.programsPreviewHeading || programLabel}</h2>{data.programsPage.description ? <p className="mt-2 text-white/80">{data.programsPage.description}</p> : null}</div>
          <Button asChild variant="outline" className="border-white/40 bg-transparent text-white hover:bg-white/10"><Link href={buildTenantHref("/programs", tenantSlug)}>View All</Link></Button>
        </div>
        <div className="grid gap-4 md:grid-cols-3">
          {data.programs.slice(0, 3).map((program) => {
            const Icon = getIcon(program.icon);
            return (
              <Card key={program.id || program.name} className="group border-white/20 bg-white/10 text-white transition hover:-translate-y-1 hover:shadow-xl"><CardContent className="p-5"><div className="mb-3 inline-flex h-10 w-10 items-center justify-center rounded-full bg-white/20"><Icon className="h-5 w-5" /></div><p className="text-lg font-semibold">{program.name}</p>{program.duration ? <p className="mt-1 text-sm text-white/75">{program.duration}</p> : null}<p className="mt-3 text-sm text-white/85">{program.description}</p><Link href={buildTenantHref("/programs", tenantSlug)} className="mt-4 inline-flex items-center text-sm font-semibold text-white">Know More<ArrowRight className="ml-1 h-4 w-4" /></Link></CardContent></Card>
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
    <section className="py-14 text-white" style={{ background: `linear-gradient(115deg, ${data.theme.primary} 0%, ${data.theme.primaryDark} 100%)` }}>
      <div className="mx-auto flex w-full max-w-7xl flex-col items-start justify-between gap-6 px-4 sm:px-6 lg:flex-row lg:items-center lg:px-8">
        <div><h2 className="text-3xl font-semibold">{data.admissionBanner.title}</h2>{data.admissionBanner.description ? <p className="mt-2 text-white/85">{data.admissionBanner.description}</p> : null}<div className="mt-4 flex flex-wrap gap-4 text-sm">{data.admissionBanner.importantDates?.map((item: any) => <div key={item.label} className="rounded-full border border-white/25 px-4 py-1 text-white/90">{item.label}: {item.date}</div>)}</div></div>
        {data.admissionBanner.cta?.label ? <Button asChild className="h-11 rounded-full bg-white px-7 text-slate-900 hover:bg-slate-100"><Link href={buildTenantHref(data.admissionBanner.cta.href || "/apply", tenantSlug)}>{data.admissionBanner.cta.label}<ArrowRight className="ml-2 h-4 w-4" /></Link></Button> : null}
      </div>
    </section>
  );
}

function NoticesPreview({ data, tenantSlug }: { data: TenantSiteData; tenantSlug?: string }) {
  if (!data.notices.length) return null;
  return (
    <section className="bg-white py-16">
      <div className="mx-auto grid w-full max-w-7xl gap-6 px-4 sm:px-6 lg:grid-cols-5 lg:px-8">
        <div className="rounded-xl border border-slate-200 bg-slate-950 p-6 text-white lg:col-span-2"><p className="text-2xl font-semibold">{data.home.noticesHeading || "Latest Notices"}</p><Button asChild className="mt-4 w-fit rounded-full bg-white text-slate-900 hover:bg-slate-100"><Link href={buildTenantHref("/notices", tenantSlug)}>View All Notices</Link></Button></div>
        <div className="group relative h-[360px] overflow-hidden rounded-xl border border-slate-200 bg-slate-50 lg:col-span-3"><div className="cg-notice-scroll group-hover:[animation-play-state:paused] space-y-3 p-4">{[...data.notices, ...data.notices].map((notice, index) => <div key={`${notice.id}-${index}`} className="flex items-center justify-between gap-3 rounded-xl border border-slate-200 bg-white px-4 py-3"><div className="min-w-0"><p className="text-xs font-semibold uppercase tracking-wide text-slate-500">{formatDate(notice.date)}</p><p className="truncate text-sm font-semibold text-slate-800">{notice.title}</p></div><Button asChild size="sm" variant="outline" className="shrink-0"><Link href={buildTenantHref(`/notices/${notice.id}`, tenantSlug)}><Eye className="h-3.5 w-3.5" /></Link></Button></div>)}</div></div>
      </div>
    </section>
  );
}

function FacultyPreview({ data, tenantSlug, facultyLabel }: { data: TenantSiteData; tenantSlug?: string; facultyLabel: string }) {
  if (!data.faculty.length) return null;
  return (
    <section className="bg-white py-16"><div className="mx-auto w-full max-w-7xl px-4 sm:px-6 lg:px-8"><div className="mb-6 flex items-end justify-between gap-4">{sectionHeading(data.home.facultyHeading, facultyLabel)}<Button asChild variant="outline"><Link href={buildTenantHref("/about", tenantSlug)}>View All</Link></Button></div><div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-4">{data.faculty.slice(0, 4).map((member) => <motion.div key={member.id || member.name} whileHover={{ scale: 1.03 }}><Card className="overflow-hidden border-slate-200">{member.image ? <div className="relative h-52 bg-slate-100"><Image src={member.image} alt={member.name} fill className="object-cover" /></div> : null}<CardContent className="p-4"><p className="text-base font-semibold text-slate-900">{member.name}</p><p className="text-sm text-slate-600">{member.designation}</p><p className="text-xs text-slate-500">{member.subject}</p></CardContent></Card></motion.div>)}</div></div></section>
  );
}

function GalleryPreview({ data, tenantSlug }: { data: TenantSiteData; tenantSlug?: string }) {
  if (!data.gallery.images?.length) return null;
  return (
    <section className="bg-slate-100 py-16"><div className="mx-auto w-full max-w-7xl px-4 sm:px-6 lg:px-8"><div className="mb-6 flex items-end justify-between gap-4">{sectionHeading(data.home.galleryHeading, "Gallery")}<Button asChild variant="outline"><Link href={buildTenantHref("/gallery", tenantSlug)}>View Gallery</Link></Button></div><div className="grid grid-cols-2 gap-3 md:grid-cols-4">{data.gallery.images.slice(0, 6).map((item: any, index: number) => <div key={item.id || item.image} className={`group relative overflow-hidden rounded-xl border border-slate-200 ${index === 2 ? "row-span-2 md:col-span-2" : ""}`}><div className="relative h-36 md:h-44"><Image src={item.image} alt={item.title || "Gallery image"} fill className="object-cover transition duration-300 group-hover:scale-105" /></div><div className="absolute inset-0 bg-slate-950/0 transition group-hover:bg-slate-950/40" /></div>)}</div></div></section>
  );
}

function TestimonialsPreview({ data }: { data: TenantSiteData }) {
  if (!data.testimonials.length) return null;
  return (
    <section className="bg-white py-16"><div className="mx-auto w-full max-w-7xl px-4 sm:px-6 lg:px-8"><div className="mb-6">{sectionHeading(data.home.testimonialsHeading, "Testimonials")}</div><div className="group overflow-hidden"><div className="cg-testimonial-scroll group-hover:[animation-play-state:paused] flex w-max gap-4 pb-4">{[...data.testimonials, ...data.testimonials].map((item, index) => <Card key={`${item.id}-${index}`} className="w-[320px] overflow-hidden border-slate-200"><div className="h-16" style={{ background: `linear-gradient(120deg, ${data.theme.primary}, ${data.theme.primaryDark})` }} /><CardContent className="p-4">{item.image ? <div className="-mt-10 mb-3 h-16 w-16 overflow-hidden rounded-full border-4 border-white bg-slate-100"><div className="relative h-full w-full"><Image src={item.image} alt={item.name} fill className="object-cover" /></div></div> : null}<div className="mb-2 flex items-center gap-1 text-amber-500">{Array.from({ length: Number(item.rating) || 0 }).map((_, starIndex) => <Star key={`${item.id}-star-${starIndex}`} className="h-4 w-4 fill-current" />)}</div><p className="text-base font-semibold text-slate-900">{item.name}</p><p className="text-xs text-slate-500">{[item.batch, item.program].filter(Boolean).join(" - ")}</p><p className="mt-3 text-sm text-slate-600">{item.text}</p><div className="mt-3 flex gap-2 text-slate-500">{item.facebook ? <Link href={item.facebook} className="rounded-full border border-slate-200 p-1.5 hover:text-slate-900"><Facebook className="h-4 w-4" /></Link> : null}{item.linkedin ? <Link href={item.linkedin} className="rounded-full border border-slate-200 p-1.5 hover:text-slate-900"><Linkedin className="h-4 w-4" /></Link> : null}</div></CardContent></Card>)}</div></div></div></section>
  );
}

function QuickEnquiry({ data, orgType }: { data: TenantSiteData; orgType: string }) {
  if (!data.home.showQuickEnquiryFor?.includes(orgType)) return null;
  return (
    <section className="py-14 text-white" style={{ backgroundColor: data.theme.primary }}><div className="mx-auto w-full max-w-7xl px-4 sm:px-6 lg:px-8"><h2 className="text-3xl font-semibold">{data.quickEnquiry.heading || "Quick Enquiry"}</h2>{data.quickEnquiry.description ? <p className="mt-2 text-white/85">{data.quickEnquiry.description}</p> : null}<form className="mt-6 grid gap-3 md:grid-cols-4"><input className="h-11 rounded-lg border border-white/40 bg-white/10 px-3 text-sm text-white placeholder:text-white/75" placeholder="Full Name" /><input className="h-11 rounded-lg border border-white/40 bg-white/10 px-3 text-sm text-white placeholder:text-white/75" placeholder="Phone Number" />{data.programs.length ? <select className="h-11 rounded-lg border border-white/40 bg-white/10 px-3 text-sm text-white">{data.programs.map((program) => <option key={program.id || program.name} value={program.id || program.name} className="text-slate-900">{program.name}</option>)}</select> : <input className="h-11 rounded-lg border border-white/40 bg-white/10 px-3 text-sm text-white placeholder:text-white/75" placeholder="Program" />}<Button className="h-11 rounded-lg bg-white text-slate-900 hover:bg-slate-100">Submit</Button></form></div></section>
  );
}

export function TenantHomePage({ data, tenantSlug, orgType, programLabel, facultyLabel }: TenantHomePageProps) {
  const hasHomeData = data.hero.headline || data.institution.name || data.programs.length || data.notices.length || data.faculty.length || data.gallery.images?.length;
  return (
    <>
      <HeroSection data={data} tenantSlug={tenantSlug} />
      {!hasHomeData ? <section className="mx-auto max-w-5xl px-4 py-14 sm:px-6 lg:px-8"><TenantEmptyState title="Tenant content is ready for dynamic data" description="Connect tenant website content from the backend to populate this template." /></section> : null}
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
