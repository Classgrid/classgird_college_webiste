"use client";

import { useEffect, useMemo, useRef, useState, type CSSProperties } from "react";
import type { TenantSiteData } from "@/content/college_website";
import { animate, useInView } from "framer-motion";
import {
  Award,
  BookOpen,
  Briefcase,
  Building2,
  CalendarDays,
  FlaskConical,
  GraduationCap,
  Landmark,
  Trophy,
  Users,
  Users2,
  type LucideIcon,
} from "lucide-react";

export function getBrandTitle(data: TenantSiteData) {
  return data.globalBranding?.title || data.institution?.name || "";
}

export function getBrandLogo(data: TenantSiteData) {
  return data.globalBranding?.logo || data.institution?.logo || "";
}

export function getBrandColors(data: TenantSiteData) {
  const colors = data.globalBranding?.colors || {};
  return {
    primary: colors.primary || colors.primaryColor || data.theme?.primary || "",
    primaryDark: colors.primaryDark || colors.secondary || colors.secondaryColor || data.theme?.primaryDark || "",
    accent: colors.accent || colors.accentColor || data.theme?.accent || "",
    surface: colors.surface || data.theme?.surface || "",
    darkSurface: colors.darkSurface || data.theme?.darkSurface || "",
  };
}

export function brandBackground(data: TenantSiteData): CSSProperties | undefined {
  const primary = getBrandColors(data).primary;
  return primary ? { backgroundColor: primary } : undefined;
}

export function brandGradient(data: TenantSiteData): CSSProperties | undefined {
  const colors = getBrandColors(data);
  if (!colors.primary && !colors.primaryDark) return undefined;
  return { background: `linear-gradient(115deg, ${colors.primary || colors.primaryDark}, ${colors.primaryDark || colors.primary})` };
}
export const fadeUp = {
  hidden: { opacity: 0, y: 32 },
  visible: { opacity: 1, y: 0, transition: { duration: 0.55, ease: "easeOut" } },
};

export const staggerChildren = {
  hidden: {},
  visible: { transition: { delayChildren: 0.08, staggerChildren: 0.12 } },
};

const iconMap = {
  Award,
  BookOpen,
  Briefcase,
  Building2,
  CalendarDays,
  FlaskConical,
  GraduationCap,
  Landmark,
  Trophy,
  Users,
  Users2,
} as const;

export function getIcon(iconName?: string): LucideIcon {
  return (iconName ? iconMap[iconName as keyof typeof iconMap] : null) || Award;
}

export function normalizeOrgType(value: string) {
  const lowered = String(value || "").toLowerCase();
  if (lowered === "school") return "school";
  if (lowered === "junior-college" || lowered === "junior") return "junior-college";
  if (lowered === "coaching") return "coaching";
  return "junior-college";
}

export function resolveProgramLabel(orgType: string) {
  if (orgType === "school") return "Classes";
  if (orgType === "coaching") return "Batches";
  return "Programs";
}

export function resolveFacultyLabel(orgType: string) {
  if (orgType === "school") return "Teachers";
  if (orgType === "coaching") return "Mentors";
  return "Faculty";
}

export function formatDate(dateInput?: string) {
  if (!dateInput) return "";
  const parsed = new Date(dateInput);
  if (Number.isNaN(parsed.getTime())) return dateInput;
  return parsed.toLocaleDateString("en-IN", { day: "2-digit", month: "short", year: "numeric" });
}

export function buildTenantHref(path: string, tenantSlug?: string) {
  const normalized = path.startsWith("/") ? path : `/${path}`;
  if (tenantSlug) return normalized;
  if (normalized === "/") return "/college_website";
  return `/college_website${normalized}`;
}

export function decodeRouteSegment(value: string | undefined) {
  if (!value) return "";
  try {
    return decodeURIComponent(value);
  } catch {
    return value;
  }
}

function parseCounterValue(rawValue: string) {
  const match = rawValue.match(/(\d+(?:\.\d+)?)/);
  if (!match) return { prefix: "", target: 0, suffix: rawValue };
  const found = match[0];
  const start = match.index || 0;
  return {
    prefix: rawValue.slice(0, start),
    target: Number(found),
    suffix: rawValue.slice(start + found.length),
  };
}

export function AnimatedCounter({ value }: { value: string }) {
  const ref = useRef<HTMLSpanElement | null>(null);
  const inView = useInView(ref, { once: true, amount: 0.65 });
  const [display, setDisplay] = useState(0);
  const { prefix, target, suffix } = parseCounterValue(value || "");

  useEffect(() => {
    if (!inView || target <= 0) return;
    const controls = animate(0, target, {
      duration: 1.2,
      ease: "easeOut",
      onUpdate: (latest) => setDisplay(Number.isInteger(target) ? Math.round(latest) : Number(latest.toFixed(1))),
    });
    return () => controls.stop();
  }, [inView, target]);

  return (
    <span ref={ref}>
      {prefix}
      {target > 0 ? display : value}
      {target > 0 ? suffix : ""}
    </span>
  );
}

export function useCountdown(dateValue: string) {
  const target = useMemo(() => {
    const parsed = new Date(dateValue);
    return Number.isNaN(parsed.getTime()) ? null : parsed;
  }, [dateValue]);
  const [now, setNow] = useState(() => Date.now());

  useEffect(() => {
    if (!target) return;
    const timer = window.setInterval(() => setNow(Date.now()), 60_000);
    return () => window.clearInterval(timer);
  }, [target]);

  if (!target) return { days: 0, hours: 0, minutes: 0 };
  const diff = Math.max(0, target.getTime() - now);
  return {
    days: Math.floor(diff / (1000 * 60 * 60 * 24)),
    hours: Math.floor((diff / (1000 * 60 * 60)) % 24),
    minutes: Math.floor((diff / (1000 * 60)) % 60),
  };
}

function sanitizeYouTubeVideoId(value: string | null | undefined) {
  const cleaned = value?.trim() || "";
  return /^[a-zA-Z0-9_-]{11}$/.test(cleaned) ? cleaned : null;
}

export function buildYouTubeEmbedUrl(input?: string) {
  if (!input) return "";
  const asDirectId = sanitizeYouTubeVideoId(input);
  let videoId = asDirectId;

  if (!videoId) {
    try {
      const parsed = new URL(input);
      const host = parsed.hostname.replace(/^www\./, "").toLowerCase();
      if (host === "youtu.be") videoId = sanitizeYouTubeVideoId(parsed.pathname.split("/").filter(Boolean)[0]);
      if ((host === "youtube.com" || host === "m.youtube.com") && parsed.pathname === "/watch") {
        videoId = sanitizeYouTubeVideoId(parsed.searchParams.get("v"));
      }
      if ((host === "youtube.com" || host === "m.youtube.com") && parsed.pathname.startsWith("/embed/")) {
        videoId = sanitizeYouTubeVideoId(parsed.pathname.split("/").filter(Boolean)[1]);
      }
    } catch {
      videoId = null;
    }
  }

  if (!videoId) return "";
  const params = new URLSearchParams({ autoplay: "1", mute: "1", controls: "0", rel: "0", playsinline: "1", loop: "1", playlist: videoId });
  return `https://www.youtube.com/embed/${videoId}?${params.toString()}`;
}


