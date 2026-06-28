<div align="center">
  <img src="https://classgrid.in/logo.png" alt="Classgrid Logo" width="200" />
  <h1>🎓 Classgrid College Website Engine</h1>
  <p><strong>Next.js Headless CMS Frontend for Educational Institutions</strong></p>
  
  <br />
</div>

## 📖 Overview
Welcome to the **Classgrid College Website Engine**. This repository contains the Next.js frontend template used to generate custom-branded public websites for individual colleges on the Classgrid platform.

This template is fully headless and dynamically fetches its structured data (notices, faculty, merit lists, branding) from the Classgrid ERP Core API.

---

## 🛠️ Local Development Setup

### 1. Environment Variables
Create a `.env.local` file in the root directory. You must connect this frontend to the ERP Backend API.

```env
# Point this to your local or staging ERP Backend
NEXT_PUBLIC_ERP_API_URL="http://localhost:5000"
```

### 2. Installation & Run
```bash
# Install dependencies
npm install

# Start the Next.js development server
npm run dev
```

### 3. Production Deployment
When deploying to Vercel, ensure `NEXT_PUBLIC_ERP_API_URL` is set to the live EC2 backend (e.g., `https://api.classgrid.in`). Vercel will automatically handle the Edge caching and ISR routing.
