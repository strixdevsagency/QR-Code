-- ==============================================================================
-- STRIX QR — PRODUCTION SUPABASE POSTGRESQL SCHEMA MIGRATION
-- Run this script in your Supabase SQL Editor (Dashboard -> SQL Editor -> New Query)
-- ==============================================================================

-- 1. EXTENSIONS
CREATE EXTENSION IF NOT EXISTS "uuid-ossp";

-- 2. QR CODES TABLE
CREATE TABLE IF NOT EXISTS public.qr_codes (
    id TEXT PRIMARY KEY,
    user_id TEXT,
    title TEXT NOT NULL DEFAULT 'Untitled QR',
    qr_type TEXT NOT NULL DEFAULT 'url',
    payload TEXT NOT NULL DEFAULT '',
    design JSONB NOT NULL DEFAULT '{}'::jsonb,
    download_count INTEGER NOT NULL DEFAULT 0,
    is_dynamic BOOLEAN NOT NULL DEFAULT FALSE,
    dynamic_config JSONB,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT timezone('utc'::text, now()) NOT NULL,
    updated_at TIMESTAMP WITH TIME ZONE DEFAULT timezone('utc'::text, now()) NOT NULL
);

CREATE INDEX IF NOT EXISTS idx_qr_codes_user_id ON public.qr_codes (user_id);
CREATE INDEX IF NOT EXISTS idx_qr_codes_is_dynamic ON public.qr_codes (is_dynamic);

-- 3. PACKAGES & PRICING PLANS TABLE (Admin Editable)
CREATE TABLE IF NOT EXISTS public.packages (
    id TEXT PRIMARY KEY,
    name TEXT NOT NULL,
    tagline TEXT,
    price_monthly NUMERIC NOT NULL DEFAULT 0,
    price_annual NUMERIC NOT NULL DEFAULT 0,
    annual_billed_total NUMERIC NOT NULL DEFAULT 0,
    highlighted BOOLEAN NOT NULL DEFAULT FALSE,
    popular_badge TEXT,
    cta_label TEXT NOT NULL DEFAULT 'Get Started',
    features JSONB NOT NULL DEFAULT '[]'::jsonb,
    limits JSONB NOT NULL DEFAULT '{}'::jsonb,
    is_active BOOLEAN NOT NULL DEFAULT TRUE,
    sort_order INTEGER NOT NULL DEFAULT 0,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT timezone('utc'::text, now()) NOT NULL,
    updated_at TIMESTAMP WITH TIME ZONE DEFAULT timezone('utc'::text, now()) NOT NULL
);

-- Seed Default Packages if empty
INSERT INTO public.packages (id, name, tagline, price_monthly, price_annual, annual_billed_total, highlighted, popular_badge, cta_label, features, limits, is_active, sort_order)
VALUES 
(
    'free',
    'Free Starter',
    'Essential QR creation for individuals and standard use',
    0,
    0,
    0,
    FALSE,
    NULL,
    'Get Started Free',
    '["Unlimited static QR codes (URL, Wi-Fi, vCard, WhatsApp, etc.)", "High-resolution PNG & SVG vector downloads", "1 active Dynamic QR code (up to 250 lifetime scans)", "Basic styling (dots, corners, gradients, preset badges)", "Real-time ISO scannability verification guard", "Standard web browser redirection", "Ad-Supported Studio Experience (Standard Banners)"]'::jsonb,
    '{"dynamicQRs": 1, "monthlyScans": 250, "bulkGeneration": false, "customLogos": 0, "vectorPdf": false, "smartRouting": false, "analytics": "basic", "adFree": false}'::jsonb,
    TRUE,
    1
),
(
    'pro',
    'Strix Pro',
    'For marketers, restaurants, businesses, and power creators',
    9,
    7,
    79,
    TRUE,
    'Most Popular',
    'Upgrade to Pro',
    '["Unlimited Dynamic QR codes (update destination anytime)", "Unlimited Scans with zero rate throttles", "Smart Conditional Routing (iOS / Android / time-scheduled)", "Security: PIN code protection & one-time burnable modes", "Advanced Print Exports: CMYK EPS & 300+ DPI Vector PDF", "Personal Brand Logo Library (upload unlimited logos)", "Detailed Geolocation & Device scan analytics", "Completely Ad-Free studio experience"]'::jsonb,
    '{"dynamicQRs": "unlimited", "monthlyScans": "unlimited", "bulkGeneration": false, "customLogos": "unlimited", "vectorPdf": true, "smartRouting": true, "analytics": "advanced", "adFree": true}'::jsonb,
    TRUE,
    2
),
(
    'enterprise',
    'Agency & Scale',
    'For marketing agencies, high-volume campaigns, and teams',
    29,
    22,
    249,
    FALSE,
    'High Volume',
    'Get Enterprise',
    '["Everything in Pro tier", "Bulk QR Generator: 10,000+ codes via CSV/Excel with ZIP download", "Custom Short Domain branding (e.g. qr.yourdomain.com)", "Team multi-seat collaboration & workspace sharing", "Developer REST API access for automated programmatic generation", "Custom webhook triggers on scan events", "Dedicated priority SLA support & onboarding"]'::jsonb,
    '{"dynamicQRs": "unlimited", "monthlyScans": "unlimited", "bulkGeneration": true, "customLogos": "unlimited", "vectorPdf": true, "smartRouting": true, "analytics": "enterprise", "adFree": true}'::jsonb,
    TRUE,
    3
)
ON CONFLICT (id) DO NOTHING;

-- 4. LICENSE CODES & TEAM VOUCHERS TABLE
CREATE TABLE IF NOT EXISTS public.license_codes (
    id TEXT PRIMARY KEY,
    code TEXT NOT NULL UNIQUE,
    tier TEXT NOT NULL DEFAULT 'pro',
    max_uses INTEGER NOT NULL DEFAULT 1, -- 1 for one-time, N for team seats
    used_count INTEGER NOT NULL DEFAULT 0,
    used_by_emails JSONB NOT NULL DEFAULT '[]'::jsonb,
    customer_email TEXT,
    customer_name TEXT,
    notes TEXT,
    is_active BOOLEAN NOT NULL DEFAULT TRUE,
    expires_at TIMESTAMP WITH TIME ZONE,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT timezone('utc'::text, now()) NOT NULL
);

CREATE INDEX IF NOT EXISTS idx_license_codes_code ON public.license_codes (code);

-- Seed Initial Universal License Keys
INSERT INTO public.license_codes (id, code, tier, max_uses, used_count, used_by_emails, customer_email, customer_name, notes, is_active)
VALUES
('lic_init_1', 'STRIX-PRO', 'pro', 9999, 0, '[]'::jsonb, 'admin@strixdevs.com', 'Admin Demo VIP', 'Initial Master Demo Pro Key', TRUE),
('lic_init_2', 'STRIX2026', 'pro', 9999, 0, '[]'::jsonb, 'admin@strixdevs.com', 'Promo 2026', 'Yearly Campaign Master Key', TRUE),
('lic_init_3', 'PRO-PASS', 'pro', 9999, 0, '[]'::jsonb, 'admin@strixdevs.com', 'Pro Pass', 'Standard Pass Key', TRUE)
ON CONFLICT (code) DO NOTHING;

-- 5. PACKAGE PURCHASE ORDERS & INQUIRIES TABLE
CREATE TABLE IF NOT EXISTS public.package_orders (
    id TEXT PRIMARY KEY,
    customer_name TEXT NOT NULL,
    customer_email TEXT NOT NULL,
    phone_or_whatsapp TEXT,
    plan_id TEXT NOT NULL,
    plan_name TEXT NOT NULL,
    billing_interval TEXT NOT NULL DEFAULT 'annual',
    team_seats INTEGER NOT NULL DEFAULT 1,
    price_formatted TEXT,
    notes TEXT,
    status TEXT NOT NULL DEFAULT 'pending', -- 'pending' | 'contacted' | 'code_issued' | 'completed' | 'cancelled'
    issued_code TEXT,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT timezone('utc'::text, now()) NOT NULL,
    updated_at TIMESTAMP WITH TIME ZONE DEFAULT timezone('utc'::text, now()) NOT NULL
);

CREATE INDEX IF NOT EXISTS idx_package_orders_status ON public.package_orders (status);
CREATE INDEX IF NOT EXISTS idx_package_orders_email ON public.package_orders (customer_email);

-- 6. AD SLOTS CONFIGURATION TABLE
CREATE TABLE IF NOT EXISTS public.ad_slots (
    id TEXT PRIMARY KEY,
    name TEXT NOT NULL,
    description TEXT,
    dimensions TEXT NOT NULL DEFAULT '728x90',
    enabled BOOLEAN NOT NULL DEFAULT TRUE,
    ad_client TEXT NOT NULL DEFAULT '',
    ad_slot TEXT NOT NULL DEFAULT '',
    custom_html TEXT NOT NULL DEFAULT '',
    direct_sponsor JSONB,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT timezone('utc'::text, now()) NOT NULL
);

-- Seed Default Ad Slots
INSERT INTO public.ad_slots (id, name, description, dimensions, enabled, ad_client, ad_slot, custom_html)
VALUES
('leaderboard', 'Top Header Leaderboard', 'Displays above the main fold (728x90 desktop / 320x50 mobile)', '728x90', TRUE, '', '', ''),
('sidebar', 'Preview Canvas Sticky Sidebar', 'Sticky banner next to the live QR canvas (300x250 or 300x600)', '300x250', TRUE, '', '', ''),
('infeed', 'Mid-Page In-Feed Banner', 'Positioned between the generator and the partnership section', 'Responsive (max 800px)', TRUE, '', '', ''),
('modal', 'Download Countdown Interstitial', 'Displayed for 3 seconds while files compile for download', '300x250', TRUE, '', '', '')
ON CONFLICT (id) DO NOTHING;

-- 7. PLATFORM SETTINGS & ANALYTICS CONFIG
CREATE TABLE IF NOT EXISTS public.platform_config (
    key TEXT PRIMARY KEY,
    value JSONB NOT NULL,
    updated_at TIMESTAMP WITH TIME ZONE DEFAULT timezone('utc'::text, now()) NOT NULL
);

INSERT INTO public.platform_config (key, value)
VALUES
('analytics', '{"googleAnalyticsId": "", "googleAnalyticsEnabled": false, "googleTagManagerId": "", "googleTagManagerEnabled": false, "adSensePublisherId": "", "adSenseEnabled": false}'::jsonb)
ON CONFLICT (key) DO NOTHING;

-- 8. ROW LEVEL SECURITY (RLS) POLICIES
-- Enable RLS on all tables
ALTER TABLE public.qr_codes ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.packages ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.license_codes ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.package_orders ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.ad_slots ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.platform_config ENABLE ROW LEVEL SECURITY;

-- Allow Public/Anon Read Access to Packages, Ad Slots, and Analytics Config
CREATE POLICY "Public can view active packages" ON public.packages FOR SELECT USING (is_active = TRUE);
CREATE POLICY "Public can view ad slots" ON public.ad_slots FOR SELECT USING (TRUE);
CREATE POLICY "Public can view platform config" ON public.platform_config FOR SELECT USING (TRUE);

-- Allow Public/Anon to Query and Update QR codes (Used for redirection and saving)
CREATE POLICY "Public can read and write qr_codes" ON public.qr_codes FOR ALL USING (TRUE) WITH CHECK (TRUE);

-- Allow Public/Anon to submit package purchase orders
CREATE POLICY "Public can insert package orders" ON public.package_orders FOR INSERT WITH CHECK (TRUE);
CREATE POLICY "Public can read package orders" ON public.package_orders FOR SELECT USING (TRUE);
CREATE POLICY "Public can update package orders" ON public.package_orders FOR UPDATE USING (TRUE);

-- Allow Public/Anon to redeem license codes
CREATE POLICY "Public can read license codes" ON public.license_codes FOR SELECT USING (TRUE);
CREATE POLICY "Public can update license codes" ON public.license_codes FOR UPDATE USING (TRUE);
CREATE POLICY "Public can insert license codes" ON public.license_codes FOR INSERT WITH CHECK (TRUE);
CREATE POLICY "Public can manage packages" ON public.packages FOR ALL USING (TRUE) WITH CHECK (TRUE);
CREATE POLICY "Public can manage ad slots" ON public.ad_slots FOR ALL USING (TRUE) WITH CHECK (TRUE);
CREATE POLICY "Public can manage platform config" ON public.platform_config FOR ALL USING (TRUE) WITH CHECK (TRUE);
