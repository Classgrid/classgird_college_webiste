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
import { brandBackground, buildTenantHref, formatDate, getIcon, normalizeOrgType, resolveProgramLabel, useCountdown } from "./tenant-utils";

type PageProps = { data: TenantSiteData; tenantSlug?: string; orgType?: string };
type Row = Record<string, any>;

function text(value: unknown) {
  return typeof value === "string" ? value.trim() : "";
}

function pageText(data: TenantSiteData, key: string, fallback = "") {
  return text(data.uiStrings?.pages?.[key]) || fallback;
}

function actionText(data: TenantSiteData, key: string, fallback = "") {
  return text(data.uiStrings?.actions?.[key]) || fallback;
}

function stateText(data: TenantSiteData, key: string, fallback = "") {
  return text(data.uiStrings?.states?.[key]) || fallback;
}

function formText(data: TenantSiteData, form: string, key: string) {
  return text(data.uiStrings?.forms?.[form]?.[key]);
}

function PageShell({ title, description, children }: { title?: string; description?: string; children?: React.ReactNode }) {
  return <section className="mx-auto w-full max-w-7xl px-4 pb-20 pt-14 sm:px-6 lg:px-8">{title ? <h1 className="text-4xl font-bold text-slate-900">{title}</h1> : null}{description ? <p className="mt-3 max-w-3xl text-sm text-slate-600">{description}</p> : null}{children ? <div className="mt-6">{children}</div> : null}</section>;
}

function EmptyPage({ title }: { title: string }) {
  return <PageShell title={title} />;
}

function ImagePanel({ src, alt, className = "h-48" }: { src?: string; alt: string; className?: string }) {
  if (!src) return null;
  return <div className={`relative overflow-hidden rounded-lg border border-slate-200 ${className}`}><Image src={src} alt={alt} fill className="object-cover" /></div>;
}

function Cards({ items, hrefFor, imageKey = "image", actionLabel }: { items: Row[]; hrefFor?: (item: Row) => string; imageKey?: string; actionLabel?: string }) {
  if (!items.length) return null;
  return <div className="grid gap-4 md:grid-cols-2 xl:grid-cols-3">{items.map((item, index) => { const href = hrefFor?.(item); const title = text(item.title) || text(item.name) || text(item.label) || text(item.program); return <Card key={item.id || item.slug || title || index} className="overflow-hidden border-slate-200">{item[imageKey] ? <ImagePanel src={item[imageKey]} alt={title} /> : null}<CardContent className="p-4"><div className="flex flex-wrap items-center gap-2">{item.category ? <Badge variant="secondary">{item.category}</Badge> : null}{item.date ? <span className="text-xs text-slate-500">{formatDate(item.date)}</span> : null}</div>{title ? <p className="mt-2 text-lg font-semibold text-slate-900">{title}</p> : null}{item.summary || item.description || item.excerpt ? <p className="mt-1 text-sm text-slate-600">{item.summary || item.description || item.excerpt}</p> : null}{item.designation || item.subject ? <p className="mt-1 text-sm text-slate-600">{[item.designation, item.subject].filter(Boolean).join(" - ")}</p> : null}{href ? <Button asChild size="sm" variant="outline" className="mt-4"><Link href={href}>{actionLabel ? <span>{actionLabel}</span> : null}<ArrowRight className={actionLabel ? "ml-1.5 h-4 w-4" : "h-4 w-4"} /></Link></Button> : null}</CardContent></Card>; })}</div>;
}

function Rows({ rows, columns, downloadKey }: { rows: Row[]; columns: string[]; downloadKey?: string }) {
  if (!rows.length) return null;
  return <div className="overflow-x-auto rounded-xl border border-slate-200"><table className="min-w-full text-sm"><thead className="bg-slate-100 text-left text-xs uppercase tracking-wide text-slate-600"><tr>{columns.map((column) => <th key={column} className="px-4 py-3">{column}</th>)}{downloadKey ? <th className="px-4 py-3 text-right"><span className="sr-only">Download</span></th> : null}</tr></thead><tbody>{rows.map((row, index) => <tr key={row.id || row.slug || index} className="border-t border-slate-200">{columns.map((column) => <td key={column} className="px-4 py-3 text-slate-700">{column.toLowerCase().includes("date") ? formatDate(row[column]) : row[column]}</td>)}{downloadKey ? <td className="px-4 py-3 text-right">{row[downloadKey] ? <Button asChild size="sm" variant="outline"><Link href={row[downloadKey]} aria-label="Download"><Download className="h-4 w-4" /></Link></Button> : null}</td> : null}</tr>)}</tbody></table></div>;
}

function SearchBox({ value, onChange, placeholder }: { value: string; onChange: (value: string) => void; placeholder?: string }) {
  return <div className="relative mb-5"><Search className="absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-slate-400" /><input value={value} onChange={(event) => onChange(event.target.value)} placeholder={placeholder} className="h-11 w-full rounded-lg border border-slate-300 pl-10 pr-3 text-sm" /></div>;
}

export function AboutPage({ data }: PageProps) {
  const orgType = normalizeOrgType(data.institution.type);
  const typeSpecific = data.aboutPage.typeSpecific?.[orgType] || {};
  const hasAbout = data.aboutPage.story || data.aboutPage.vision || data.aboutPage.mission || data.faculty.length;
  const title = pageText(data, "aboutTitle", "About");
  if (!hasAbout) return <EmptyPage title={title} />;
  return <PageShell title={title} description={data.aboutPage.storyTitle}><div className="grid gap-8 lg:grid-cols-2"><ImagePanel src={data.aboutPage.storyImage || data.aboutPage.bannerImage} alt={title} className="min-h-[320px]" /><div><p className="text-slate-700">{data.aboutPage.story}</p><div className="mt-5 grid gap-4 sm:grid-cols-2">{data.aboutPage.vision ? <Card><CardContent className="p-5"><p className="font-semibold">{pageText(data, "visionTitle", "Vision")}</p><p className="mt-2 text-sm text-slate-600">{data.aboutPage.vision}</p></CardContent></Card> : null}{data.aboutPage.mission ? <Card><CardContent className="p-5"><p className="font-semibold">{pageText(data, "missionTitle", "Mission")}</p><p className="mt-2 text-sm text-slate-600">{data.aboutPage.mission}</p></CardContent></Card> : null}</div>{typeSpecific.title || typeSpecific.text ? <Card className="mt-5"><CardContent className="p-5">{typeSpecific.title ? <p className="font-semibold">{typeSpecific.title}</p> : null}{typeSpecific.text ? <p className="mt-2 text-sm text-slate-600">{typeSpecific.text}</p> : null}</CardContent></Card> : null}</div></div>{data.faculty.length ? <div className="mt-10"><h2 className="mb-4 text-2xl font-semibold">{pageText(data, "facultyDirectoryTitle", "Faculty Directory")}</h2><Cards items={data.faculty} /></div> : null}</PageShell>;
}

export function ProgramsPage({ data, tenantSlug }: PageProps) {
  const title = data.programsPage.title || pageText(data, "programsTitle", resolveProgramLabel(normalizeOrgType(data.institution.type)));
  const applyLabel = actionText(data, "applyNow");
  if (!data.programs.length) return <EmptyPage title={title} />;
  return <PageShell title={title} description={data.programsPage.description}><div className="grid gap-4 md:grid-cols-2 xl:grid-cols-3">{data.programs.map((program: Row) => { const Icon = getIcon(program.icon); return <Card key={program.id || program.name}><CardContent className="p-5"><div className="mb-3 inline-flex h-10 w-10 items-center justify-center rounded-full bg-slate-100"><Icon className="h-5 w-5" /></div>{program.name ? <p className="text-xl font-semibold">{program.name}</p> : null}{program.duration ? <p className="mt-1 text-sm text-slate-500">{program.duration}</p> : null}{program.description ? <p className="mt-3 text-sm text-slate-600">{program.description}</p> : null}{program.subjects?.length ? <p className="mt-3 text-xs text-slate-500">{program.subjects.join(" / ")}</p> : null}</CardContent></Card>; })}</div>{applyLabel ? <Button asChild className="mt-8" style={brandBackground(data)}><Link href={buildTenantHref("/apply", tenantSlug)}>{applyLabel}</Link></Button> : null}</PageShell>;
}

export function NoticesPage({ data, tenantSlug }: PageProps) {
  const [query, setQuery] = useState("");
  const rows = data.notices.filter((notice: Row) => `${notice.title} ${notice.summary}`.toLowerCase().includes(query.toLowerCase()));
  const title = pageText(data, "noticesTitle", "Notice Board");
  if (!data.notices.length) return <EmptyPage title={title} />;
  return <PageShell title={title}><SearchBox value={query} onChange={setQuery} placeholder={pageText(data, "noticesSearchPlaceholder")} /><Rows rows={rows} columns={["category", "title", "date"]} downloadKey="pdfUrl" /><div className="mt-4 grid gap-3 md:grid-cols-2">{rows.map((notice: Row) => <Link key={notice.id || notice.title} href={buildTenantHref(`/notices/${notice.id}`, tenantSlug)} className="rounded-lg border border-slate-200 px-4 py-3 text-sm font-medium hover:bg-slate-50">{notice.title}</Link>)}</div></PageShell>;
}

export function NoticeDetailPage({ data, tenantSlug, noticeId }: PageProps & { noticeId: string }) {
  const notice = data.notices.find((item: Row) => item.id === noticeId);
  if (!notice) return <SystemMessagePage title={stateText(data, "noticeNotFoundTitle", "Notice Not Found")} description={stateText(data, "noticeNotFoundDescription", "The requested notice is not available.")} tenantSlug={tenantSlug} />;
  return <PageShell title={notice.title} description={notice.summary}>{notice.category ? <Badge>{notice.category}</Badge> : null}{notice.date ? <span className="ml-3 text-sm text-slate-500">{formatDate(notice.date)}</span> : null}{notice.body ? <p className="mt-5 text-slate-700">{notice.body}</p> : null}{notice.pdfUrl ? <Button asChild className="mt-6"><Link href={notice.pdfUrl}><Download className="mr-2 h-4 w-4" />{actionText(data, "downloadPdf", "Download PDF")}</Link></Button> : null}</PageShell>;
}

export function MeritPage({ data }: PageProps) { const title = pageText(data, "meritTitle", "Merit Lists & Results"); return data.meritLists.length || data.toppers.length ? <PageShell title={title}><Cards items={data.toppers} /><div className="mt-8"><Rows rows={data.meritLists} columns={["title", "program", "round", "date"]} downloadKey="pdfUrl" /></div></PageShell> : <EmptyPage title={title} />; }
export function FeesPage({ data }: PageProps) { const title = pageText(data, "feesTitle", "Fee Structure & Admission"); return data.fees.length ? <PageShell title={title} description={data.feesPage.scholarshipText}><Rows rows={data.fees} columns={["program", "intake", "annualFees", "oneTimeFees", "total"]} /></PageShell> : <EmptyPage title={title} />; }
export function GalleryPage({ data }: PageProps) { const title = pageText(data, "galleryTitle", "Gallery"); return data.gallery.images?.length ? <PageShell title={title}><Cards items={data.gallery.images} /></PageShell> : <EmptyPage title={title} />; }

export function EventsPage({ data, tenantSlug }: PageProps) {
  const featured = data.events.find((event: Row) => event.status === "Upcoming") || data.events[0];
  const countdown = useCountdown(featured?.date || "");
  const title = pageText(data, "eventsTitle", "Events");
  if (!data.events.length) return <EmptyPage title={title} />;
  return <PageShell title={title}>{featured ? <Card className="mb-6"><CardContent className="p-5">{featured.title ? <p className="text-2xl font-semibold">{featured.title}</p> : null}{featured.summary ? <p className="mt-2 text-sm text-slate-600">{featured.summary}</p> : null}{featured.date ? <p className="mt-3 text-sm text-slate-700">{countdown.days}d {countdown.hours}h {countdown.minutes}m</p> : null}</CardContent></Card> : null}<Cards items={data.events} hrefFor={(event) => buildTenantHref(`/events/${event.slug}`, tenantSlug)} actionLabel={actionText(data, "openEvent")} /></PageShell>;
}

export function EventDetailPage({ data, tenantSlug, eventSlug }: PageProps & { eventSlug: string }) {
  const event = data.events.find((item: Row) => item.slug === eventSlug);
  if (!event) return <SystemMessagePage title={stateText(data, "eventNotFoundTitle", "Event Not Found")} description={stateText(data, "eventNotFoundDescription", "The requested event is not available.")} tenantSlug={tenantSlug} />;
  return <PageShell title={event.title} description={event.description}><ImagePanel src={event.image} alt={event.title} className="h-[360px]" />{event.date || event.time || event.venue ? <p className="mt-4 text-sm text-slate-600">{[formatDate(event.date), event.time, event.venue].filter(Boolean).join(" | ")}</p> : null}<Rows rows={event.schedule || []} columns={["time", "title"]} /></PageShell>;
}

export function AlumniPage({ data }: PageProps) { const [query, setQuery] = useState(""); const rows = data.alumni.filter((item: Row) => `${item.name} ${item.batchYear}`.toLowerCase().includes(query.toLowerCase())); const title = data.alumniPage.heading || pageText(data, "alumniTitle", "Alumni"); return data.alumni.length ? <PageShell title={title}><SearchBox value={query} onChange={setQuery} placeholder={pageText(data, "alumniSearchPlaceholder")} /><Cards items={rows} /></PageShell> : <EmptyPage title={title} />; }
export function BlogPage({ data, tenantSlug }: PageProps) { const title = pageText(data, "blogTitle", "News & Updates"); return data.blogPosts.length ? <PageShell title={title}><Cards items={data.blogPosts} hrefFor={(post) => buildTenantHref(`/blog/${post.slug}`, tenantSlug)} actionLabel={actionText(data, "openArticle")} /></PageShell> : <EmptyPage title={title} />; }
export function BlogDetailPage({ data, tenantSlug, blogSlug }: PageProps & { blogSlug: string }) { const post = data.blogPosts.find((item: Row) => item.slug === blogSlug); return post ? <PageShell title={post.title} description={post.excerpt}><ImagePanel src={post.image} alt={post.title} className="h-[320px]" />{post.content?.map((paragraph: string) => <p key={paragraph} className="mt-4 leading-7 text-slate-700">{paragraph}</p>)}</PageShell> : <SystemMessagePage title={stateText(data, "articleNotFoundTitle", "Article Not Found")} description={stateText(data, "articleNotFoundDescription", "The requested article is not available.")} tenantSlug={tenantSlug} />; }

export function ContactPage({ data }: PageProps) {
  const title = pageText(data, "contactTitle", "Contact");
  const contactCards = [<ContactCard key="address" icon={MapPin} text={data.institution.address} />, <ContactCard key="phone" icon={Phone} text={[data.institution.phone, data.institution.whatsapp].filter(Boolean).join(" / ")} />, <ContactCard key="email" icon={Mail} text={data.institution.email} />].filter(Boolean);
  const fields = data.contactPage.fields || data.uiStrings?.forms?.contact || {};
  const formHeading = text(data.contactPage.formHeading) || formText(data, "contact", "heading");
  const submitLabel = text(fields.submitLabel) || actionText(data, "sendMessage");
  const showForm = formHeading || fields.namePlaceholder || fields.phonePlaceholder || fields.emailPlaceholder || fields.messagePlaceholder || submitLabel;
  return <PageShell title={title} description={data.contactPage.officeHours}>{contactCards.length ? <div className="grid gap-4 md:grid-cols-3">{contactCards}</div> : null}{data.contactPage.mapEmbedUrl ? <div className="mt-6 overflow-hidden rounded-xl border"><iframe title={title} src={data.contactPage.mapEmbedUrl} className="h-[400px] w-full border-0" loading="lazy" /></div> : null}{showForm ? <Card className="mt-6"><CardContent className="p-5">{formHeading ? <p className="text-xl font-semibold">{formHeading}</p> : null}<form className="mt-4 grid gap-3">{fields.namePlaceholder ? <input placeholder={fields.namePlaceholder} className="h-11 rounded-lg border px-3 text-sm" /> : null}{fields.phonePlaceholder ? <input placeholder={fields.phonePlaceholder} className="h-11 rounded-lg border px-3 text-sm" /> : null}{fields.emailPlaceholder ? <input placeholder={fields.emailPlaceholder} className="h-11 rounded-lg border px-3 text-sm" /> : null}{fields.messagePlaceholder ? <Textarea placeholder={fields.messagePlaceholder} className="min-h-[130px]" /> : null}{submitLabel ? <Button style={brandBackground(data)}>{submitLabel}</Button> : null}</form></CardContent></Card> : null}</PageShell>;
}

function ContactCard({ icon: Icon, text }: { icon: typeof MapPin; text: string }) { if (!text) return null; return <Card><CardContent className="p-5"><Icon className="h-5 w-5 text-slate-700" /><p className="mt-2 text-sm text-slate-700">{text}</p></CardContent></Card>; }

export function ApplyPage({ data }: PageProps) {
  const [submittedId, setSubmittedId] = useState("");
  const fields = data.applyPage.fields || data.uiStrings?.forms?.apply || {};
  const title = data.applyPage.heading || pageText(data, "applyTitle", "Apply for Admission");
  const submitLabel = text(fields.submitLabel) || actionText(data, "submitApplication");
  const onSubmit = (event: FormEvent<HTMLFormElement>) => { event.preventDefault(); const prefix = text(data.applyPage.confirmationPrefix); setSubmittedId(`${prefix ? `${prefix}-` : ""}${Math.floor(1000 + Math.random() * 9000)}`); };
  if (submittedId) return <SystemMessagePage title={stateText(data, "applicationReceivedTitle", "Application Received")} description={`${stateText(data, "applicationIdLabel", "Application ID")}: ${submittedId}`} />;
  return <PageShell title={title}><form onSubmit={onSubmit} className="grid gap-3 rounded-xl border bg-white p-5 sm:grid-cols-2">{fields.namePlaceholder ? <input placeholder={fields.namePlaceholder} className="h-11 rounded-lg border px-3 text-sm" required /> : null}{fields.phonePlaceholder ? <input placeholder={fields.phonePlaceholder} className="h-11 rounded-lg border px-3 text-sm" required /> : null}{fields.emailPlaceholder ? <input type="email" placeholder={fields.emailPlaceholder} className="h-11 rounded-lg border px-3 text-sm" /> : null}{fields.messagePlaceholder ? <Textarea placeholder={fields.messagePlaceholder} className="sm:col-span-2" /> : null}{submitLabel ? <Button className="w-fit" style={brandBackground(data)}>{submitLabel}</Button> : null}</form></PageShell>;
}

export function MandatoryDisclosurePage({ data }: PageProps) { const title = pageText(data, "mandatoryDisclosureTitle", "Mandatory Disclosure"); return data.mandatoryDisclosurePage.institutionDetails?.length ? <PageShell title={title}><Rows rows={data.mandatoryDisclosurePage.institutionDetails} columns={["label", "value"]} /></PageShell> : <EmptyPage title={title} />; }
export function CommitteesPage({ data }: PageProps) { const title = pageText(data, "committeesTitle", "Committees"); return data.committeesPage.committees?.length ? <PageShell title={title} description={data.committeesPage.description}><Cards items={data.committeesPage.committees} /></PageShell> : <EmptyPage title={title} />; }
export function InfrastructurePage({ data }: PageProps) { const title = pageText(data, "infrastructureTitle", "Infrastructure & Facilities"); return data.infrastructurePage.facilities?.length ? <PageShell title={title} description={data.infrastructurePage.description}><Cards items={data.infrastructurePage.facilities} /></PageShell> : <EmptyPage title={title} />; }
export function AcademicCalendarPage({ data }: PageProps) { const title = pageText(data, "academicCalendarTitle", "Academic Calendar"); return data.academicCalendarPage.entries?.length ? <PageShell title={title} description={data.academicCalendarPage.description}><Rows rows={data.academicCalendarPage.entries} columns={["title", "category", "startDate", "endDate"]} /></PageShell> : <EmptyPage title={title} />; }
export function SyllabusPage({ data, orgType }: PageProps) { const title = pageText(data, "syllabusTitle", "Syllabus & Curriculum"); const groups = data.syllabusPage.groups?.filter((group: Row) => group.orgTypes?.includes(orgType)) || []; return groups.length ? <PageShell title={title} description={data.syllabusPage.description}><Cards items={groups} /></PageShell> : <EmptyPage title={title} />; }
export function ExaminationsPage({ data }: PageProps) { const title = pageText(data, "examinationsTitle", "Examinations & Assessment"); return data.examinationsPage.patterns?.length ? <PageShell title={title} description={data.examinationsPage.description}><Cards items={data.examinationsPage.patterns} /></PageShell> : <EmptyPage title={title} />; }
export function StudentsCornerPage({ data, tenantSlug }: PageProps) { const title = pageText(data, "studentsTitle", "Student Corner"); return data.studentsPage.quickLinks?.length ? <PageShell title={title} description={data.studentsPage.description}><Cards items={data.studentsPage.quickLinks} hrefFor={(item) => buildTenantHref(item.href, tenantSlug)} actionLabel={actionText(data, "openLink")} /></PageShell> : <EmptyPage title={title} />; }
export function DownloadsPage({ data }: PageProps) { const title = pageText(data, "downloadsTitle", "Downloads & Resources"); return data.downloadsPage.resources?.length ? <PageShell title={title} description={data.downloadsPage.description}><Rows rows={data.downloadsPage.resources} columns={["title", "category", "date"]} downloadKey="url" /></PageShell> : <EmptyPage title={title} />; }

export function GlobalSearchPage({ data, tenantSlug, initialQuery }: PageProps & { initialQuery?: string }) {
  const [query, setQuery] = useState(initialQuery || "");
  const rows = useMemo(() => [...data.notices.map((item: Row) => ({ id: `notice-${item.id}`, title: item.title, description: item.summary, href: buildTenantHref(`/notices/${item.id}`, tenantSlug) })), ...data.events.map((item: Row) => ({ id: `event-${item.slug}`, title: item.title, description: item.summary, href: buildTenantHref(`/events/${item.slug}`, tenantSlug) })), ...data.blogPosts.map((item: Row) => ({ id: `blog-${item.slug}`, title: item.title, description: item.excerpt, href: buildTenantHref(`/blog/${item.slug}`, tenantSlug) })), ...data.programs.map((item: Row) => ({ id: `program-${item.id}`, title: item.name, description: item.description, href: buildTenantHref("/programs", tenantSlug) }))].filter((row) => !query.trim() || `${row.title} ${row.description}`.toLowerCase().includes(query.toLowerCase())), [data, query, tenantSlug]);
  return <PageShell title={pageText(data, "searchTitle", "Search")}><SearchBox value={query} onChange={setQuery} placeholder={pageText(data, "siteSearchPlaceholder")} /><Cards items={rows} hrefFor={(item) => item.href} actionLabel={actionText(data, "openSearchResult")} /></PageShell>;
}

export function SystemMessagePage({ title, description, tenantSlug }: { title: string; description: string; tenantSlug?: string }) { return <section className="mx-auto w-full max-w-4xl px-4 pb-20 pt-16 text-center sm:px-6 lg:px-8"><div className="mx-auto mb-4 inline-flex h-12 w-12 items-center justify-center rounded-full bg-slate-100 text-slate-700"><X className="h-6 w-6" /></div><h1 className="text-4xl font-bold text-slate-900">{title}</h1><p className="mt-3 text-slate-600">{description}</p><div className="mt-5 flex justify-center gap-3"><Button asChild><Link href={buildTenantHref("/", tenantSlug)}>Back to Home</Link></Button><Button asChild variant="outline"><Link href={buildTenantHref("/contact", tenantSlug)}>Contact</Link></Button></div></section>; }
export function NotFoundRoute({ tenantSlug }: { tenantSlug?: string }) { return <SystemMessagePage title="Page Not Found" description="The requested website page could not be found." tenantSlug={tenantSlug} />; }
