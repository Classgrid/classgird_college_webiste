# Internal Development Plan & Architecture Guidelines

**CONFIDENTIAL:** This file contains internal architecture guidelines for developers and agents working on the Classgrid College Website Engine.

## ⚡ Architecture & Performance (ISR)
To protect the main ERP's EC2 infrastructure from traffic spikes (e.g., Admissions Result Day DDoS), this repository relies heavily on **Next.js Incremental Static Regeneration (ISR)**.

- **Edge Caching:** Vercel fetches data from the EC2 server *once* and caches the static HTML globally.
- **Revalidation:** Fetches must use `next: { revalidate: 60 }` (or similar webhook triggers) to refresh data without overloading the backend database.

---

## 🤖 Developer Guidelines & Master Plan
If you are a developer or agent working in this repository, you are restricted to frontend templating and API consumption. **DO NOT** attempt to build backend controllers, databases, or CMS dashboards in this repository.

### 🎯 Phase 1: Modularization (Kill the Monolith)
The previous codebase contains massive, 3,000+ line monolithic `page.tsx` files. 
- **Action:** Break these massive files into clean, decoupled React components inside `components/`.
- **Target Structure:** `<Hero />`, `<NoticesList />`, `<FacultyGrid />`, `<Footer />`.

### 🎯 Phase 2: Purge Placeholders & Wire API
- **Action:** Delete all hardcoded "Lorem Ipsum" text, placeholder avatars, and fake campus photos.
- **Action:** Create `lib/api.ts` to execute `fetch()` requests against the ERP backend.
- **Action:** Inject the fetched JSON data as `props` into your new modular components.

### 🎯 Phase 3: Single Source of Truth (Branding)
Colleges configure their logo and brand colors inside the ERP Admin Settings. 
- **Action:** The API will return a `globalBranding` object containing `logo_url`, `site_title`, and `theme_colors`.
- **Action:** Dynamically map these colors to Tailwind CSS variables or inline styles so the website perfectly matches the college's brand.
