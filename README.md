# Strix QR — Free Lifetime QR Suite by StrixDevs (strix-devs)

> **100% Free, Non-Expiring QR Code Generator & In-Browser Camera Scanner**  
> Built by **StrixDevs** to serve business owners, restaurants, and agencies across **Chicago, New York, Canada**, and worldwide without subscription traps.

---

## 🚀 Key Features

* **Never-Expire Guarantee**: Direct static encoding with zero intermediary redirect servers. QR codes work forever (6 months, 1 year, or lifetime).
* **Live In-Browser Camera Scanner**: Decodes QR codes directly using device cameras (webcam/phone) or image file upload with zero server uploads.
* **Smart Optical Safety Guard**: Real-time scanner simulator (`jsQR`) checks scannability and warns against low contrast with 1-click Auto-Fix.
* **Print-Shop Ready Vector Exports**: Instant downloads in **Vector SVG, Print-Ready PDF, and 300 DPI High-Res PNG**.
* **Rich Styling Engine**: Custom dot matrix patterns, corner eye shapes, linear/radial color gradients, and center company logo insertion with auto-enforced Level H (30%) Error Correction.
* **Supported QR Formats**:
  * URLs & Web Links
  * WiFi Auto-Connect (WPA/WPA2/WPA3)
  * vCard 3.0 Digital Business Cards
  * WhatsApp Direct Messages
  * SMS & Email Pre-fills
  * Crypto Payments (Bitcoin, Ethereum, Solana)
  * Plain Text & Serial Codes

---

## 💰 Monetization Architecture

### 1. Google AdSense (Display Ads)
Ad placements are wrapped inside fixed-dimension containers to guarantee **Cumulative Layout Shift (CLS = 0)**:
* **Leaderboard**: Top `728x90` / `320x50` banner above the tool.
* **Sidebar**: Sticky `300x250` / `300x600` rail next to the live preview canvas.
* **In-Feed**: Banner between the tool and the educational FAQ.
* **Download Modal**: 3-second countdown modal while files compile.

*To activate your live AdSense ads:*
Pass your `adClient="ca-pub-XXXXXXXXXXXXXXXX"` and `adSlot="XXXXXXXXXX"` to `<AdBanner />` in `src/App.tsx`.

### 2. Direct Corporate Sponsorships
A dedicated **"Partner & Sponsor with StrixDevs"** intake section at the bottom of the page allows local print shops, POS providers, and B2B SaaS companies targeting Chicago, NY, and Canadian businesses to submit sponsorship inquiries directly to StrixDevs.

---

## 🤖 SEO & LLM Friendliness (GEO)

* **`/llms.txt`**: Clean markdown standard for AI web scrapers (ChatGPT / GPTBot, PerplexityBot, ClaudeBot).
* **Rich JSON-LD Schema**: Embedded `SoftwareApplication` and `FAQPage` schemas for Google Rich Snippets and AI citation engines.
* **"Why Competitors Expire" Factual Comparison**: Dedicated educational table directly answering the search query *"Why did my QR code stop working after 14 days?"*.

---

## 🛠️ Tech Stack & Development

* **Framework**: React 19 + TypeScript + Vite
* **Styling**: Tailwind CSS v4
* **QR Engine**: `qr-code-styling` (100% client-side)
* **Decoder Engine**: `jsqr`
* **PDF Vector Engine**: `jspdf`
* **Icons**: `lucide-react`
* **Package Manager / Runtime**: Bun

### Running Locally:
```bash
# Install dependencies
bun install

# Start local dev server
bun run dev

# Build production bundle
bun run build

# Preview production build
bun run preview
```

---

## 🌐 Deploying to Production

The build generates a completely static `/dist` directory that costs **$0/month** to host on:
* **Cloudflare Pages**: Link repo and set build command to `bun run build`, output directory `dist`.
* **Vercel**: Framework preset `Vite`, output directory `dist`.
* **Netlify**: Build command `bun run build`, publish directory `dist`.

---

© 2026 **StrixDevs** (`strix-devs`). Built for business reliability.
