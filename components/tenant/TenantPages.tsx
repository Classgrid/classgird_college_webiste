"use client";

import { useMemo, useState, type FormEvent } from "react";
import Image from "next/image";
import Link from "next/link";
import { ArrowRight, Download, Mail, MapPin, Phone, Search, X } from "lucide-react";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Card, CardContent } from "@/components/ui/card";
import { Textarea } from "@/components/ui/textarea";
import type { TenantSiteData } from "@/content/college_website";
import { buildTenantHref, formatDate, getIcon, normalizeOrgType, resolveProgramLabel, useCountdown } from "./tenant-utils";
import { TenantEmptyState } from "./TenantEmptyState";

type PageProps = { data: TenantSiteData; tenantSlug?: string; orgType?: string };
type Row = Record<string, any>;

function PageShell({ title, description, children }: { title: string; description?: string; children: React.ReactNode }) {
  return <section className="mx-auto w-full max-w-7xl px-4 pb-20 pt-14 sm:px-6 lg:px-8"><h1 className="text-4xl font-bold text-slate-900">{title}</h1>{description ? <p className="mt-3 max-w-3xl text-sm text-slate-600">{description}</p> : null}<div className="mt-6">{children}</div></section>;
}

function EmptyPage({ title }: { title: string }) {
  return <PageShell title={title}><TenantEmptyState title="No dynamic content has been added yet" /></PageShell>;
}

function ImagePanel({ src, alt, className = "h-48" }: { src?: string; alt: string; className?: string }) {
  if (!src) return <div className={`${className} rounded-lg border border-dashed border-slate-300 bg-slate-100`} />;
  return <div className={`relative overflow-hidden rounded-lg border border-slate-200 ${className}`}><Image src={src} alt={alt} fill className="object-cover" /></div>;
}

function Cards({ items, hrefFor, imageKey = "image" }: { items: Row[]; hrefFor?: (item: Row) => string; imageKey?: string }) {
  if (!items.length) return <TenantEmptyState title="No records published" />;
  return <div className="grid gap-4 md:grid-cols-2 xl:grid-cols-3">{items.map((item, index) => { const href = hrefFor?.(item); const title = item.title || item.name || item.label || item.program || `Item ${index + 1}`; return <Card key={item.id || item.slug || title} className="overflow-hidden border-slate-200">{item[imageKey] ? <ImagePanel src={item[imageKey]} alt={title} /> : null}<CardContent className="p-4"><div className="flex flex-wrap items-center gap-2">{item.category ? <Badge variant="secondary">{item.category}</Badge> : null}{item.date ? <span className="text-xs text-slate-500">{formatDate(item.date)}</span> : null}</div><p className="mt-2 text-lg font-semibold text-slate-900">{title}</p>{item.summary || item.description || item.excerpt ? <p className="mt-1 text-sm text-slate-600">{item.summary || item.description || item.excerpt}</p> : null}{item.designation || item.subject ? <p className="mt-1 text-sm text-slate-600">{[item.designation, item.subject].filter(Boolean).join(" - ")}</p> : null}{href ? <Button asChild size="sm" variant="outline" className="mt-4"><Link href={href}>Open<ArrowRight className="ml-1.5 h-4 w-4" /></Link></Button> : null}</CardContent></Card>; })}</div>;
}

function Rows({ rows, columns, downloadKey }: { rows: Row[]; columns: string[]; downloadKey?: string }) {
  if (!rows.length) return <TenantEmptyState title="No records published" />;
  return <div className="overflow-x-auto rounded-xl border border-slate-200"><table className="min-w-full text-sm"><thead className="bg-slate-100 text-left text-xs uppercase tracking-wide text-slate-600"><tr>{columns.map((column) => <th key={column} className="px-4 py-3">{column}</th>)}{downloadKey ? <th className="px-4 py-3 text-right">Action</th> : null}</tr></thead><tbody>{rows.map((row, index) => <tr key={row.id || row.slug || index} className="border-t border-slate-200">{columns.map((column) => <td key={column} className="px-4 py-3 text-slate-700">{column.toLowerCase().includes("date") ? formatDate(row[column]) : row[column]}</td>)}{downloadKey ? <td className="px-4 py-3 text-right"><Button asChild size="sm" variant="outline"><Link href={row[downloadKey] || "#"}><Download className="h-4 w-4" /></Link></Button></td> : null}</tr>)}</tbody></table></div>;
}

function SearchBox({ value, onChange, placeholder }: { value: string; onChange: (value: string) => void; placeholder: string }) {
  return <div className="relative mb-5"><Search className="absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-slate-400" /><input value={value} onChange={(event) => onChange(event.target.value)} placeholder={placeholder} className="h-11 w-full rounded-lg border border-slate-300 pl-10 pr-3 text-sm" /></div>;
}

export function AboutPage({ data }: PageProps) {
  const orgType = normalizeOrgType(data.institution.type);
  const typeSpecific = data.aboutPage.typeSpecific?.[orgType] || {};
  const hasAbout = data.aboutPage.story || data.aboutPage.vision || data.aboutPage.mission || data.faculty.length;
  if (!hasAbout) return <EmptyPage title="About" />;
  return <PageShell title="About" description={data.aboutPage.storyTitle}><div className="grid gap-8 lg:grid-cols-2"><ImagePanel src={data.aboutPage.storyImage || data.aboutPage.bannerImage} alt="About" className="min-h-[320px]" /><div><p className="text-slate-700">{data.aboutPage.story}</p><div className="mt-5 grid gap-4 sm:grid-cols-2">{data.aboutPage.vision ? <Card><CardContent className="p-5"><p className="font-semibold">Vision</p><p className="mt-2 text-sm text-slate-600">{data.aboutPage.vision}</p></CardContent></Card> : null}{data.aboutPage.mission ? <Card><CardContent className="p-5"><p className="font-semibold">Mission</p><p className="mt-2 text-sm text-slate-600">{data.aboutPage.mission}</p></CardContent></Card> : null}</div>{typeSpecific.title || typeSpecific.text ? <Card className="mt-5"><CardContent className="p-5"><p className="font-semibold">{typeSpecific.title}</p><p className="mt-2 text-sm text-slate-600">{typeSpecific.text}</p></CardContent></Card> : null}</div></div>{data.faculty.length ? <div className="mt-10"><h2 className="mb-4 text-2xl font-semibold">Faculty Directory</h2><Cards items={data.faculty} /></div> : null}</PageShell>;
}

export function ProgramsPage({ data, tenantSlug }: PageProps) {
  const title = data.programsPage.title || resolveProgramLabel(normalizeOrgType(data.institution.type));
  if (!data.programs.length) return <EmptyPage title={title} />;
  return <PageShell title={title} description={data.programsPage.description}><div className="grid gap-4 md:grid-cols-2 xl:grid-cols-3">{data.programs.map((program) => { const Icon = getIcon(program.icon); return <Card key={program.id || program.name}><CardContent className="p-5"><div className="mb-3 inline-flex h-10 w-10 items-center justify-center rounded-full bg-slate-100"><Icon className="h-5 w-5" /></div><p className="text-xl font-semibold">{program.name}</p><p className="mt-1 text-sm text-slate-500">{program.duration}</p><p className="mt-3 text-sm text-slate-600">{program.description}</p>{program.subjects?.length ? <p className="mt-3 text-xs text-slate-500">{program.subjects.join(" / ")}</p> : null}</CardContent></Card>; })}</div><Button asChild className="mt-8" style={{ backgroundColor: data.theme.primary }}><Link href={buildTenantHref("/apply", tenantSlug)}>Apply Now</Link></Button></PageShell>;
}

export function NoticesPage({ data, tenantSlug }: PageProps) {
  const [query, setQuery] = useState("");
  const rows = data.notices.filter((notice) => `${notice.title} ${notice.summary}`.toLowerCase().includes(query.toLowerCase()));
  if (!data.notices.length) return <EmptyPage title="Notice Board" />;
  return <PageShell title="Notice Board"><SearchBox value={query} onChange={setQuery} placeholder="Search notices" /><Rows rows={rows} columns={["category", "title", "date"]} downloadKey="pdfUrl" /><div className="mt-4 grid gap-3 md:grid-cols-2">{rows.map((notice) => <Link key={notice.id} href={buildTenantHref(`/notices/${notice.id}`, tenantSlug)} className="rounded-lg border border-slate-200 px-4 py-3 text-sm font-medium hover:bg-slate-50">{notice.title}</Link>)}</div></PageShell>;
}

export function NoticeDetailPage({ data, tenantSlug, noticeId }: PageProps & { noticeId: string }) {
  const notice = data.notices.find((item) => item.id === noticeId);
  if (!notice) return <SystemMessagePage title="Notice Not Found" description="The requested notice is not available." tenantSlug={tenantSlug} />;
  return <PageShell title={notice.title} description={notice.summary}><Badge>{notice.category}</Badge><span className="ml-3 text-sm text-slate-500">{formatDate(notice.date)}</span><p className="mt-5 text-slate-700">{notice.body}</p>{notice.pdfUrl ? <Button asChild className="mt-6"><Link href={notice.pdfUrl}><Download className="mr-2 h-4 w-4" />Download PDF</Link></Button> : null}</PageShell>;
}

export function MeritPage({ data }: PageProps) { return data.meritLists.length || data.toppers.length ? <PageShell title="Merit Lists & Results"><Cards items={data.toppers} /><div className="mt-8"><Rows rows={data.meritLists} columns={["title", "program", "round", "date"]} downloadKey="pdfUrl" /></div></PageShell> : <EmptyPage title="Merit Lists & Results" />; }
export function FeesPage({ data }: PageProps) { return data.fees.length ? <PageShell title="Fee Structure & Admission" description={data.feesPage.scholarshipText}><Rows rows={data.fees} columns={["program", "intake", "annualFees", "oneTimeFees", "total"]} /></PageShell> : <EmptyPage title="Fee Structure & Admission" />; }
export function GalleryPage({ data }: PageProps) { return data.gallery.images?.length ? <PageShell title="Gallery"><Cards items={data.gallery.images} /></PageShell> : <EmptyPage title="Gallery" />; }

export function EventsPage({ data, tenantSlug }: PageProps) {
  const featured = data.events.find((event) => event.status === "Upcoming") || data.events[0];
  const countdown = useCountdown(featured?.date || "");
  if (!data.events.length) return <EmptyPage title="Events" />;
  return <PageShell title="Events">{featured ? <Card className="mb-6"><CardContent className="p-5"><p className="text-2xl font-semibold">{featured.title}</p><p className="mt-2 text-sm text-slate-600">{featured.summary}</p><p className="mt-3 text-sm text-slate-700">{countdown.days}d {countdown.hours}h {countdown.minutes}m</p></CardContent></Card> : null}<Cards items={data.events} hrefFor={(event) => buildTenantHref(`/events/${event.slug}`, tenantSlug)} /></PageShell>;
}

export function EventDetailPage({ data, tenantSlug, eventSlug }: PageProps & { eventSlug: string }) {
  const event = data.events.find((item) => item.slug === eventSlug);
  if (!event) return <SystemMessagePage title="Event Not Found" description="The requested event is not available." tenantSlug={tenantSlug} />;
  return <PageShell title={event.title} description={event.description}><ImagePanel src={event.image} alt={event.title} className="h-[360px]" /><p className="mt-4 text-sm text-slate-600">{formatDate(event.date)} | {event.time} | {event.venue}</p><Rows rows={event.schedule || []} columns={["time", "title"]} /></PageShell>;
}

export function AlumniPage({ data }: PageProps) { const [query, setQuery] = useState(""); const rows = data.alumni.filter((item) => `${item.name} ${item.batchYear}`.toLowerCase().includes(query.toLowerCase())); return data.alumni.length ? <PageShell title={data.alumniPage.heading || "Alumni"}><SearchBox value={query} onChange={setQuery} placeholder="Search alumni" /><Cards items={rows} /></PageShell> : <EmptyPage title="Alumni" />; }
export function BlogPage({ data, tenantSlug }: PageProps) { return data.blogPosts.length ? <PageShell title="News & Updates"><Cards items={data.blogPosts} hrefFor={(post) => buildTenantHref(`/blog/${post.slug}`, tenantSlug)} /></PageShell> : <EmptyPage title="News & Updates" />; }
export function BlogDetailPage({ data, tenantSlug, blogSlug }: PageProps & { blogSlug: string }) { const post = data.blogPosts.find((item) => item.slug === blogSlug); return post ? <PageShell title={post.title} description={post.excerpt}><ImagePanel src={post.image} alt={post.title} className="h-[320px]" />{post.content?.map((paragraph: string) => <p key={paragraph} className="mt-4 leading-7 text-slate-700">{paragraph}</p>)}</PageShell> : <SystemMessagePage title="Article Not Found" description="The requested article is not available." tenantSlug={tenantSlug} />; }

export function ContactPage({ data }: PageProps) {
  return <PageShell title="Contact" description={data.contactPage.officeHours}><div className="grid gap-4 md:grid-cols-3"><ContactCard icon={MapPin} text={data.institution.address} /><ContactCard icon={Phone} text={[data.institution.phone, data.institution.whatsapp].filter(Boolean).join(" / ")} /><ContactCard icon={Mail} text={data.institution.email} /></div>{data.contactPage.mapEmbedUrl ? <div className="mt-6 overflow-hidden rounded-xl border"><iframe title="Campus location" src={data.contactPage.mapEmbedUrl} className="h-[400px] w-full border-0" loading="lazy" /></div> : null}<Card className="mt-6"><CardContent className="p-5"><p className="text-xl font-semibold">Quick Inquiry</p><form className="mt-4 grid gap-3"><input placeholder="Name" className="h-11 rounded-lg border px-3 text-sm" /><input placeholder="Phone" className="h-11 rounded-lg border px-3 text-sm" /><input placeholder="Email" className="h-11 rounded-lg border px-3 text-sm" /><Textarea placeholder="Message" className="min-h-[130px]" /><Button style={{ backgroundColor: data.theme.primary }}>Send Message</Button></form></CardContent></Card></PageShell>;
}

function ContactCard({ icon: Icon, text }: { icon: typeof MapPin; text: string }) { return <Card><CardContent className="p-5"><Icon className="h-5 w-5 text-slate-700" /><p className="mt-2 text-sm text-slate-700">{text || "Not published"}</p></CardContent></Card>; }

export function ApplyPage({ data }: PageProps) {
  const [submittedId, setSubmittedId] = useState("");
  const onSubmit = (event: FormEvent<HTMLFormElement>) => { event.preventDefault(); setSubmittedId(`${data.applyPage.confirmationPrefix || "APP"}-${Math.floor(1000 + Math.random() * 9000)}`); };
  if (submittedId) return <SystemMessagePage title="Application Received" description={`Application ID: ${submittedId}`} />;
  return <PageShell title={data.applyPage.heading || "Apply for Admission"}><form onSubmit={onSubmit} className="grid gap-3 rounded-xl border bg-white p-5 sm:grid-cols-2"><input placeholder="Full Name" className="h-11 rounded-lg border px-3 text-sm" required /><input placeholder="Phone" className="h-11 rounded-lg border px-3 text-sm" required /><input type="email" placeholder="Email" className="h-11 rounded-lg border px-3 text-sm" /><Textarea placeholder="Message" className="sm:col-span-2" /><Button className="w-fit" style={{ backgroundColor: data.theme.primary }}>Submit Application</Button></form></PageShell>;
}

export function MandatoryDisclosurePage({ data }: PageProps) { return data.mandatoryDisclosurePage.institutionDetails?.length ? <PageShell title="Mandatory Disclosure"><Rows rows={data.mandatoryDisclosurePage.institutionDetails} columns={["label", "value"]} /></PageShell> : <EmptyPage title="Mandatory Disclosure" />; }
export function CommitteesPage({ data }: PageProps) { return data.committeesPage.committees?.length ? <PageShell title="Committees" description={data.committeesPage.description}><Cards items={data.committeesPage.committees} /></PageShell> : <EmptyPage title="Committees" />; }
export function InfrastructurePage({ data }: PageProps) { return data.infrastructurePage.facilities?.length ? <PageShell title="Infrastructure & Facilities" description={data.infrastructurePage.description}><Cards items={data.infrastructurePage.facilities} /></PageShell> : <EmptyPage title="Infrastructure & Facilities" />; }
export function AcademicCalendarPage({ data }: PageProps) { return data.academicCalendarPage.entries?.length ? <PageShell title="Academic Calendar" description={data.academicCalendarPage.description}><Rows rows={data.academicCalendarPage.entries} columns={["title", "category", "startDate", "endDate"]} /></PageShell> : <EmptyPage title="Academic Calendar" />; }
export function SyllabusPage({ data, orgType }: PageProps) { const groups = data.syllabusPage.groups?.filter((group: Row) => group.orgTypes?.includes(orgType)) || []; return groups.length ? <PageShell title="Syllabus & Curriculum" description={data.syllabusPage.description}><Cards items={groups} /></PageShell> : <EmptyPage title="Syllabus & Curriculum" />; }
export function ExaminationsPage({ data }: PageProps) { return data.examinationsPage.patterns?.length ? <PageShell title="Examinations & Assessment" description={data.examinationsPage.description}><Cards items={data.examinationsPage.patterns} /></PageShell> : <EmptyPage title="Examinations & Assessment" />; }
export function StudentsCornerPage({ data, tenantSlug }: PageProps) { return data.studentsPage.quickLinks?.length ? <PageShell title="Student Corner" description={data.studentsPage.description}><Cards items={data.studentsPage.quickLinks} hrefFor={(item) => buildTenantHref(item.href, tenantSlug)} /></PageShell> : <EmptyPage title="Student Corner" />; }
export function DownloadsPage({ data }: PageProps) { return data.downloadsPage.resources?.length ? <PageShell title="Downloads & Resources" description={data.downloadsPage.description}><Rows rows={data.downloadsPage.resources} columns={["title", "category", "date"]} downloadKey="url" /></PageShell> : <EmptyPage title="Downloads & Resources" />; }

export function GlobalSearchPage({ data, tenantSlug, initialQuery }: PageProps & { initialQuery?: string }) {
  const [query, setQuery] = useState(initialQuery || "");
  const rows = useMemo(() => [...data.notices.map((item) => ({ id: `notice-${item.id}`, type: "Notice", title: item.title, description: item.summary, href: buildTenantHref(`/notices/${item.id}`, tenantSlug) })), ...data.events.map((item) => ({ id: `event-${item.slug}`, type: "Event", title: item.title, description: item.summary, href: buildTenantHref(`/events/${item.slug}`, tenantSlug) })), ...data.blogPosts.map((item) => ({ id: `blog-${item.slug}`, type: "Blog", title: item.title, description: item.excerpt, href: buildTenantHref(`/blog/${item.slug}`, tenantSlug) })), ...data.programs.map((item) => ({ id: `program-${item.id}`, type: "Program", title: item.name, description: item.description, href: buildTenantHref("/programs", tenantSlug) }))].filter((row) => !query.trim() || `${row.title} ${row.description}`.toLowerCase().includes(query.toLowerCase())), [data, query, tenantSlug]);
  return <PageShell title="Search"><SearchBox value={query} onChange={setQuery} placeholder="Search site" /><Cards items={rows} hrefFor={(item) => item.href} /></PageShell>;
}

export function SystemMessagePage({ title, description, tenantSlug }: { title: string; description: string; tenantSlug?: string }) { return <section className="mx-auto w-full max-w-4xl px-4 pb-20 pt-16 text-center sm:px-6 lg:px-8"><div className="mx-auto mb-4 inline-flex h-12 w-12 items-center justify-center rounded-full bg-slate-100 text-slate-700"><X className="h-6 w-6" /></div><h1 className="text-4xl font-bold text-slate-900">{title}</h1><p className="mt-3 text-slate-600">{description}</p><div className="mt-5 flex justify-center gap-3"><Button asChild><Link href={buildTenantHref("/", tenantSlug)}>Back to Home</Link></Button><Button asChild variant="outline"><Link href={buildTenantHref("/contact", tenantSlug)}>Contact</Link></Button></div></section>; }
export function NotFoundRoute({ tenantSlug }: { tenantSlug?: string }) { return <SystemMessagePage title="Page Not Found" description="The requested website page could not be found." tenantSlug={tenantSlug} />; }
