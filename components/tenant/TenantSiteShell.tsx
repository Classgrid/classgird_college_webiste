"use client";

import { useState, type FormEvent } from "react";
import Link from "next/link";
import { useRouter } from "next/navigation";
import { motion } from "framer-motion";
import { ChevronDown, Facebook, Instagram, Linkedin, Mail, MapPin, Menu, MessageCircle, Phone, Search, X, Youtube } from "lucide-react";
import { Button } from "@/components/ui/button";
import type { TenantLink, TenantSiteData } from "@/content/college_website";
import { brandBackground, buildTenantHref, fadeUp, getBrandLogo, getBrandTitle, staggerChildren } from "./tenant-utils";

type TenantShellProps = {
  data: TenantSiteData;
  tenantSlug?: string;
  isScrolled: boolean;
  isHome: boolean;
  fontScale: number;
  onFontScaleChange: (value: number) => void;
  highContrast: boolean;
  onToggleHighContrast: () => void;
};

function tenantName(data: TenantSiteData) {
  return getBrandTitle(data);
}

function tenantInitials(data: TenantSiteData) {
  if (data.institution.shortName) return data.institution.shortName;
  const parts = tenantName(data).split(" ").filter(Boolean);
  return `${parts[0]?.[0] || ""}${parts[1]?.[0] || ""}`.toUpperCase();
}

function contactItems(data: TenantSiteData) {
  return [
    data.institution.phone ? { icon: Phone, label: data.institution.phone } : null,
    data.institution.email ? { icon: Mail, label: data.institution.email } : null,
    data.institution.location ? { icon: MapPin, label: data.institution.location } : null,
  ].filter(Boolean) as Array<{ icon: typeof Phone; label: string }>;
}

function LogoMark({ data, navTextIsLight }: { data: TenantSiteData; navTextIsLight: boolean }) {
  const logo = getBrandLogo(data);
  const initials = tenantInitials(data);
  if (logo) {
    return <img src={logo} alt={tenantName(data)} className="h-10 w-10 rounded-lg object-contain" />;
  }
  if (!initials) return null;
  return (
    <div className={`flex h-10 w-10 shrink-0 items-center justify-center rounded-lg border ${navTextIsLight ? "border-white/40 bg-white/10 text-white" : "border-slate-200 bg-white text-slate-900"} font-bold`}>
      {initials}
    </div>
  );
}

export function TenantSiteHeader({ data, tenantSlug, isScrolled, isHome, fontScale, onFontScaleChange, highContrast, onToggleHighContrast }: TenantShellProps) {
  const [mobileOpen, setMobileOpen] = useState(false);
  const [searchValue, setSearchValue] = useState("");
  const router = useRouter();
  const navTextIsLight = isHome && !isScrolled;
  const topItems = contactItems(data);
  const showTopBar = topItems.length > 0 || data.uiStrings.header?.contrastToggle;
  const name = tenantName(data);

  const onSearchSubmit = (event: FormEvent<HTMLFormElement>) => {
    event.preventDefault();
    const trimmed = searchValue.trim();
    if (!trimmed) return;
    router.push(buildTenantHref(`/search/${encodeURIComponent(trimmed)}`, tenantSlug));
    setMobileOpen(false);
  };

  return (
    <>
      {showTopBar ? (
        <div className="fixed inset-x-0 top-0 z-[60] border-b border-white/15 px-4 py-2 text-xs text-white sm:px-6 lg:px-8" style={brandBackground(data)}>
          <div className="mx-auto flex w-full max-w-7xl flex-wrap items-center justify-between gap-2">
            <div className="flex flex-wrap items-center gap-4">
              {topItems.map((item) => {
                const Icon = item.icon;
                return <span key={item.label} className="inline-flex items-center gap-2"><Icon className="h-3.5 w-3.5" />{item.label}</span>;
              })}
            </div>
            <div className="hidden items-center gap-1 md:flex">
              <button onClick={() => onFontScaleChange(Math.max(90, fontScale - 5))} className="rounded border border-white/40 px-1.5 py-0.5 text-[11px] font-semibold hover:bg-white/10" aria-label="Decrease font size">A-</button>
              <button onClick={() => onFontScaleChange(100)} className="rounded border border-white/40 px-1.5 py-0.5 text-[11px] font-semibold hover:bg-white/10" aria-label="Reset font size">A</button>
              <button onClick={() => onFontScaleChange(Math.min(120, fontScale + 5))} className="rounded border border-white/40 px-1.5 py-0.5 text-[11px] font-semibold hover:bg-white/10" aria-label="Increase font size">A+</button>
              {data.uiStrings.header?.contrastToggle ? <button onClick={onToggleHighContrast} className={`rounded border px-2 py-0.5 text-[11px] font-semibold ${highContrast ? "border-white bg-white/20 text-white" : "border-white/40 hover:bg-white/10"}`} aria-label="Toggle high contrast mode">{data.uiStrings.header.contrastToggle}</button> : null}
            </div>
          </div>
        </div>
      ) : null}

      <header className={`fixed inset-x-0 z-50 transition-all duration-300 ${showTopBar ? "top-9" : "top-0"} ${isScrolled || !isHome ? "border-b border-slate-200/80 bg-white/90 shadow-lg backdrop-blur-xl" : "border-transparent bg-transparent"}`}>
        <div className="mx-auto flex w-full max-w-7xl items-center justify-between gap-4 px-4 py-3 sm:px-6 lg:px-8">
          <Link href={buildTenantHref("/", tenantSlug)} className="flex min-w-0 items-center gap-3" aria-label={name || "Home"}>
            <LogoMark data={data} navTextIsLight={navTextIsLight} />
            {name ? <p className={`truncate text-base font-bold leading-none ${navTextIsLight ? "text-white" : "text-slate-900"}`}>{name}</p> : null}
          </Link>

          {data.navLinks.length ? (
            <nav className="hidden items-center gap-5 xl:flex">
              {data.navLinks.map((item) => {
                const navClass = navTextIsLight ? "text-white/85 hover:text-white" : "text-slate-700 hover:text-slate-950";
                if (item.subItems?.length) {
                  return <div key={item.label} className="group relative"><button className={`flex items-center gap-1 text-sm font-medium transition ${navClass}`}>{item.label}<ChevronDown className="h-4 w-4 transition-transform group-hover:rotate-180" /></button><div className="absolute left-0 top-full hidden pt-4 group-hover:block"><div className="flex w-56 flex-col overflow-hidden rounded-xl border border-slate-100 bg-white p-2 shadow-xl">{item.subItems.map((subItem) => <Link key={subItem.href} href={buildTenantHref(subItem.href, tenantSlug)} className="rounded-lg px-4 py-2.5 text-sm font-medium text-slate-600 transition-colors hover:bg-slate-50 hover:text-slate-900">{subItem.label}</Link>)}</div></div></div>;
                }
                return <Link key={item.href} href={buildTenantHref(item.href, tenantSlug)} className={`text-sm font-medium transition ${navClass}`}>{item.label}</Link>;
              })}
            </nav>
          ) : null}

          <div className="flex items-center gap-2">
            {data.uiStrings.header?.searchPlaceholder ? <form onSubmit={onSearchSubmit} className={`hidden h-9 items-center rounded-full border pl-3 pr-1 lg:flex ${navTextIsLight ? "border-white/35 bg-white/10" : "border-slate-300 bg-white"}`} role="search" aria-label="Global site search"><input value={searchValue} onChange={(event) => setSearchValue(event.target.value)} placeholder={data.uiStrings.header.searchPlaceholder} className={`w-32 bg-transparent text-xs outline-none ${navTextIsLight ? "placeholder:text-white/75 text-white" : "placeholder:text-slate-500 text-slate-800"}`} /><button type="submit" className={`inline-flex h-7 w-7 items-center justify-center rounded-full ${navTextIsLight ? "bg-white/15 text-white hover:bg-white/25" : "bg-slate-100 text-slate-700 hover:bg-slate-200"}`} aria-label="Submit search"><Search className="h-3.5 w-3.5" /></button></form> : null}
            {data.hero.primaryCta?.label && data.hero.primaryCta?.href ? <Button asChild size="sm" className="text-white shadow-md" style={brandBackground(data)}><Link href={buildTenantHref(data.hero.primaryCta.href, tenantSlug)}>{data.hero.primaryCta.label}</Link></Button> : null}
            {data.navLinks.length ? <Button size="icon" variant="ghost" onClick={() => setMobileOpen((value) => !value)} className={`xl:hidden ${navTextIsLight ? "text-white hover:bg-white/10 hover:text-white" : "text-slate-800 hover:bg-slate-100"}`} aria-label="Open mobile menu">{mobileOpen ? <X className="h-5 w-5" /> : <Menu className="h-5 w-5" />}</Button> : null}
          </div>
        </div>
      </header>

      {mobileOpen ? <motion.div initial={{ opacity: 0, y: -8 }} animate={{ opacity: 1, y: 0 }} className="fixed inset-0 z-[70] bg-slate-950/95 p-6 text-white xl:hidden"><div className="flex items-center justify-between">{name ? <p className="text-lg font-bold">{name}</p> : null}<Button size="icon" variant="ghost" onClick={() => setMobileOpen(false)} className="text-white hover:bg-white/10"><X className="h-5 w-5" /></Button></div>{data.uiStrings.header?.searchPlaceholder ? <form onSubmit={onSearchSubmit} className="my-6 flex items-center rounded-lg border border-white/20 bg-white/10 px-3"><Search className="h-4 w-4 text-white/80" /><input value={searchValue} onChange={(event) => setSearchValue(event.target.value)} placeholder={data.uiStrings.header.searchPlaceholder} className="h-11 w-full bg-transparent px-3 text-sm text-white placeholder:text-white/70 outline-none" /></form> : null}<div className="max-h-[70vh] overflow-y-auto">{data.navLinks.map((item) => <Link key={item.href || item.label} href={buildTenantHref(item.href || "/", tenantSlug)} onClick={() => setMobileOpen(false)} className="mb-2 block rounded-lg border border-white/10 px-4 py-3 text-base font-medium hover:bg-white/10">{item.label}</Link>)}</div></motion.div> : null}
    </>
  );
}

const socialIconByPlatform = { facebook: Facebook, instagram: Instagram, linkedin: Linkedin, youtube: Youtube, whatsapp: MessageCircle } as const;

export function FloatingRails({ data }: { data: TenantSiteData }) {
  if (!data.socialLinks.length) return null;
  return <div className="fixed right-3 top-1/3 z-40 hidden -translate-y-1/2 flex-col overflow-hidden rounded-xl border border-slate-200 bg-white shadow-lg lg:flex">{data.socialLinks.map((item) => { const Icon = socialIconByPlatform[item.platform as keyof typeof socialIconByPlatform]; if (!Icon || !item.href) return null; return <Link key={item.platform || item.label} href={item.href} className="group flex items-center gap-2 border-b border-slate-100 px-3 py-2 text-slate-600 transition last:border-b-0 hover:bg-slate-900 hover:text-white" aria-label={item.label}><Icon className="h-4 w-4" /><span className="w-0 overflow-hidden whitespace-nowrap text-xs transition-all duration-200 group-hover:w-20">{item.label}</span></Link>; })}</div>;
}

export function TenantSiteFooter({ data, tenantSlug }: { data: TenantSiteData; tenantSlug?: string }) {
  const year = new Date().getFullYear();
  const hasMap = Boolean(data.contactPage.mapEmbedUrl);
  const hasContact = data.institution.address || data.institution.phone || data.institution.email;
  const name = tenantName(data);

  return <>{hasMap ? <section className="w-full border-t border-slate-200 bg-white"><iframe title="Institution map" src={data.contactPage.mapEmbedUrl} loading="lazy" referrerPolicy="no-referrer-when-downgrade" className="h-[350px] w-full border-0" /></section> : null}<footer className="bg-neutral-950 text-neutral-100"><div className="mx-auto w-full max-w-7xl px-4 py-14 sm:px-6 lg:px-8"><motion.div initial="hidden" whileInView="visible" viewport={{ once: true, amount: 0.25 }} variants={staggerChildren} className="grid gap-8 md:grid-cols-2 lg:grid-cols-3"><motion.div variants={fadeUp} className="space-y-2">{name ? <p className="text-lg font-bold">{name}</p> : null}{hasContact ? <div className="space-y-1 text-sm text-slate-300">{data.institution.address ? <p>{data.institution.address}</p> : null}{data.institution.phone ? <p>{data.institution.phone}</p> : null}{data.institution.email ? <p>{data.institution.email}</p> : null}</div> : null}{data.institution.whatsapp ? <Link href={`https://wa.me/${String(data.institution.whatsapp).replace(/[^0-9]/g, "")}`} className="inline-flex items-center gap-2 pt-2 text-sm font-semibold text-white"><MessageCircle className="h-4 w-4" />{data.institution.whatsapp}</Link> : null}</motion.div>{data.footer.importantLinks?.length ? <motion.div variants={fadeUp} className="space-y-2 text-sm">{data.uiStrings.footer?.importantLinksTitle ? <p className="mb-4 font-semibold text-neutral-400">{data.uiStrings.footer.importantLinksTitle}</p> : null}{data.footer.importantLinks.map((item: TenantLink) => <Link key={item.label} href={buildTenantHref(item.href, tenantSlug)} className="block pb-2 text-neutral-300 hover:text-white">{item.label}</Link>)}</motion.div> : null}<motion.div variants={fadeUp} className="space-y-3 text-sm">{data.uiStrings.footer?.connectTitle ? <p className="text-base font-semibold">{data.uiStrings.footer.connectTitle}</p> : null}<div className="flex flex-wrap gap-2">{data.socialLinks.map((item) => { const Icon = socialIconByPlatform[item.platform as keyof typeof socialIconByPlatform]; if (!Icon || !item.href) return null; return <Link key={item.platform || item.label} href={item.href} aria-label={item.label} className="inline-flex h-9 w-9 items-center justify-center rounded-full border border-slate-700 text-slate-300 transition hover:scale-110 hover:border-white hover:text-white"><Icon className="h-4 w-4" /></Link>; })}</div></motion.div></motion.div></div><div className="border-t border-slate-800 py-4"><div className="mx-auto flex w-full max-w-7xl flex-wrap items-center justify-between gap-3 px-4 text-xs text-slate-400 sm:px-6 lg:px-8">{name ? <p>{data.uiStrings.footer?.copyrightPrefix ? `${data.uiStrings.footer.copyrightPrefix} ` : ""}{year} {name}</p> : null}{data.uiStrings.footer?.poweredBy ? <p>{data.uiStrings.footer.poweredBy}</p> : null}<div className="flex items-center gap-4">{data.footer.legalLinks?.map((item: TenantLink) => <Link key={item.label} href={buildTenantHref(item.href, tenantSlug)} className="hover:text-white">{item.label}</Link>)}</div></div></div></footer></>;
}
