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

-- 3. USER PROFILES & ROLES TABLE (Mirrors Supabase auth.users & app users)
CREATE TABLE IF NOT EXISTS public.profiles (
    id TEXT PRIMARY KEY,
    email TEXT NOT NULL UNIQUE,
    name TEXT,
    role TEXT NOT NULL DEFAULT 'user', -- 'admin' | 'user'
    tier TEXT NOT NULL DEFAULT 'free', -- 'free' | 'pro' | 'enterprise'
    avatar_url TEXT,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT timezone('utc'::text, now()) NOT NULL,
    updated_at TIMESTAMP WITH TIME ZONE DEFAULT timezone('utc'::text, now()) NOT NULL
);

CREATE INDEX IF NOT EXISTS idx_profiles_email ON public.profiles (email);
CREATE INDEX IF NOT EXISTS idx_profiles_role ON public.profiles (role);
CREATE INDEX IF NOT EXISTS idx_profiles_tier ON public.profiles (tier);

-- Auto-replicate new Supabase auth.users into public.profiles
CREATE OR REPLACE FUNCTION public.handle_new_user()
RETURNS trigger AS $$
BEGIN
    INSERT INTO public.profiles (id, email, name, role, tier, avatar_url, created_at, updated_at)
    VALUES (
        new.id::text,
        new.email,
        COALESCE(new.raw_user_meta_data->>'full_name', new.raw_user_meta_data->>'name', split_part(new.email, '@', 1)),
        COALESCE(new.raw_user_meta_data->>'role', CASE WHEN new.email ILIKE '%@strixdevs.com' THEN 'admin' ELSE 'user' END),
        COALESCE(new.raw_user_meta_data->>'tier', CASE WHEN new.email ILIKE '%@strixdevs.com' THEN 'enterprise' ELSE 'free' END),
        new.raw_user_meta_data->>'avatar_url',
        now(),
        now()
    )
    ON CONFLICT (id) DO UPDATE SET
        email = EXCLUDED.email,
        name = COALESCE(EXCLUDED.name, public.profiles.name),
        avatar_url = COALESCE(EXCLUDED.avatar_url, public.profiles.avatar_url),
        updated_at = now();
    RETURN NEW;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

-- Safe trigger setup for auth.users
DO $$
BEGIN
    IF EXISTS (SELECT 1 FROM information_schema.tables WHERE table_schema = 'auth' AND table_name = 'users') THEN
        DROP TRIGGER IF EXISTS on_auth_user_created ON auth.users;
        CREATE TRIGGER on_auth_user_created
            AFTER INSERT OR UPDATE ON auth.users
            FOR EACH ROW EXECUTE PROCEDURE public.handle_new_user();
    END IF;
END $$;

-- Seed Default User Profiles
INSERT INTO public.profiles (id, email, name, role, tier, created_at)
VALUES 
('usr_strix_admin', 'admin@strixdevs.com', 'StrixDevs Lead Admin', 'admin', 'enterprise', now()),
('usr_sarah_enterprise', 'sarah.m@enterprise.io', 'Sarah Connor', 'user', 'enterprise', now()),
('usr_david_pro', 'david@bistroqr.com', 'David Kim', 'user', 'pro', now()),
('usr_alex_starter', 'alex.creator@gmail.com', 'Alex Vance', 'user', 'free', now())
ON CONFLICT (id) DO NOTHING;

-- 4. PACKAGES & PRICING PLANS TABLE (Admin Editable)
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

-- 5. LICENSE CODES & TEAM VOUCHERS TABLE
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

-- 6. PACKAGE PURCHASE ORDERS & INQUIRIES TABLE
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

-- 7. AD SLOTS CONFIGURATION TABLE
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

-- 8. PLATFORM SETTINGS & ANALYTICS CONFIG
CREATE TABLE IF NOT EXISTS public.platform_config (
    key TEXT PRIMARY KEY,
    value JSONB NOT NULL,
    updated_at TIMESTAMP WITH TIME ZONE DEFAULT timezone('utc'::text, now()) NOT NULL
);

INSERT INTO public.platform_config (key, value)
VALUES
('analytics', '{"googleAnalyticsId": "", "googleAnalyticsEnabled": false, "googleTagManagerId": "", "googleTagManagerEnabled": false, "adSensePublisherId": "", "adSenseEnabled": false}'::jsonb)
ON CONFLICT (key) DO NOTHING;

-- 9. USER BRAND LOGOS & UPLOADED ASSETS TABLE
CREATE TABLE IF NOT EXISTS public.user_logos (
    id TEXT PRIMARY KEY,
    user_id TEXT NOT NULL,
    name TEXT NOT NULL,
    url TEXT NOT NULL,
    storage_path TEXT,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT timezone('utc'::text, now()) NOT NULL
);

CREATE INDEX IF NOT EXISTS idx_user_logos_user_id ON public.user_logos (user_id);

-- Safe creation of 'logos' storage bucket
DO $$
BEGIN
    IF EXISTS (SELECT 1 FROM information_schema.tables WHERE table_schema = 'storage' AND table_name = 'buckets') THEN
        INSERT INTO storage.buckets (id, name, public)
        VALUES ('logos', 'logos', true)
        ON CONFLICT (id) DO UPDATE SET public = true;
    END IF;
END $$;

-- 10. ROW LEVEL SECURITY (RLS) POLICIES & ACCESS CONTROL
-- Helper function to check if the caller is an administrator
CREATE OR REPLACE FUNCTION public.is_admin()
RETURNS boolean AS $$
BEGIN
    RETURN (
        (COALESCE(auth.jwt() ->> 'role', '') = 'admin') OR
        (COALESCE(auth.jwt() -> 'app_metadata' ->> 'role', '') = 'admin') OR
        (COALESCE(auth.jwt() -> 'user_metadata' ->> 'role', '') = 'admin') OR
        EXISTS (
            SELECT 1 FROM public.profiles 
            WHERE id = auth.uid()::text AND role = 'admin'
        )
    );
END;
$$ LANGUAGE plpgsql SECURITY DEFINER STABLE;

-- Secure License Code Redemption RPC
CREATE OR REPLACE FUNCTION public.redeem_license_code(p_code TEXT, p_user_id TEXT)
RETURNS JSONB AS $$
DECLARE
    v_code RECORD;
BEGIN
    SELECT * INTO v_code FROM public.license_codes
    WHERE upper(trim(code)) = upper(trim(p_code)) AND is_active = TRUE;

    IF NOT FOUND THEN
        RETURN jsonb_build_object('success', false, 'error', 'Invalid or inactive license key.');
    END IF;

    IF v_code.expires_at IS NOT NULL AND v_code.expires_at < now() THEN
        RETURN jsonb_build_object('success', false, 'error', 'This license code has expired.');
    END IF;

    IF v_code.max_uses > 0 AND v_code.used_count >= v_code.max_uses THEN
        RETURN jsonb_build_object('success', false, 'error', 'This license code has reached its maximum redemptions.');
    END IF;

    -- Update user profile tier
    UPDATE public.profiles
    SET tier = v_code.tier, updated_at = now()
    WHERE id = p_user_id OR email = p_user_id;

    -- Increment usage
    UPDATE public.license_codes
    SET used_count = used_count + 1,
        used_by_emails = v_code.used_by_emails || to_jsonb(p_user_id)
    WHERE id = v_code.id;

    RETURN jsonb_build_object(
        'success', true,
        'tier', v_code.tier,
        'isTeam', (v_code.max_uses > 1),
        'remaining', GREATEST(0, v_code.max_uses - (v_code.used_count + 1))
    );
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

-- Enable RLS on all tables
ALTER TABLE public.profiles ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.qr_codes ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.user_logos ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.packages ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.license_codes ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.package_orders ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.ad_slots ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.platform_config ENABLE ROW LEVEL SECURITY;

-- 10.1 Profiles Table Policies
DROP POLICY IF EXISTS "Public profiles are readable" ON public.profiles;
CREATE POLICY "Public profiles are readable" ON public.profiles FOR SELECT USING (TRUE);

DROP POLICY IF EXISTS "Users can insert own profile" ON public.profiles;
CREATE POLICY "Users can insert own profile" ON public.profiles FOR INSERT WITH CHECK (
    auth.uid()::text = id OR public.is_admin()
);

DROP POLICY IF EXISTS "Users can update own profile or admin" ON public.profiles;
CREATE POLICY "Users can update own profile or admin" ON public.profiles FOR UPDATE USING (
    auth.uid()::text = id OR public.is_admin()
) WITH CHECK (
    auth.uid()::text = id OR public.is_admin()
);

DROP POLICY IF EXISTS "Admins can delete profiles" ON public.profiles;
CREATE POLICY "Admins can delete profiles" ON public.profiles FOR DELETE USING (public.is_admin());

-- 10.2 Packages Table Policies
DROP POLICY IF EXISTS "Public can view active packages" ON public.packages;
CREATE POLICY "Public can view active packages" ON public.packages FOR SELECT USING (
    is_active = TRUE OR public.is_admin()
);

DROP POLICY IF EXISTS "Admins can insert packages" ON public.packages;
CREATE POLICY "Admins can insert packages" ON public.packages FOR INSERT WITH CHECK (public.is_admin());

DROP POLICY IF EXISTS "Admins can update packages" ON public.packages;
CREATE POLICY "Admins can update packages" ON public.packages FOR UPDATE USING (public.is_admin()) WITH CHECK (public.is_admin());

DROP POLICY IF EXISTS "Admins can delete packages" ON public.packages;
CREATE POLICY "Admins can delete packages" ON public.packages FOR DELETE USING (public.is_admin());

-- 10.3 Ad Slots Policies
DROP POLICY IF EXISTS "Public can view ad slots" ON public.ad_slots;
CREATE POLICY "Public can view ad slots" ON public.ad_slots FOR SELECT USING (TRUE);

DROP POLICY IF EXISTS "Admins can manage ad slots" ON public.ad_slots;
CREATE POLICY "Admins can manage ad slots" ON public.ad_slots FOR ALL USING (public.is_admin()) WITH CHECK (public.is_admin());

-- 10.4 Platform Config Policies
DROP POLICY IF EXISTS "Public can view platform config" ON public.platform_config;
CREATE POLICY "Public can view platform config" ON public.platform_config FOR SELECT USING (TRUE);

DROP POLICY IF EXISTS "Admins can manage platform config" ON public.platform_config;
CREATE POLICY "Admins can manage platform config" ON public.platform_config FOR ALL USING (public.is_admin()) WITH CHECK (public.is_admin());

-- 10.5 QR Codes Policies (Public read for scanner resolution; owner/admin for writes)
DROP POLICY IF EXISTS "Public can view qr_codes" ON public.qr_codes;
CREATE POLICY "Public can view qr_codes" ON public.qr_codes FOR SELECT USING (TRUE);

DROP POLICY IF EXISTS "Users can insert qr_codes" ON public.qr_codes;
CREATE POLICY "Users can insert qr_codes" ON public.qr_codes FOR INSERT WITH CHECK (
    auth.uid()::text = user_id OR user_id IS NULL OR auth.role() = 'anon' OR public.is_admin()
);

DROP POLICY IF EXISTS "Users can update own qr_codes or admin" ON public.qr_codes;
CREATE POLICY "Users can update own qr_codes or admin" ON public.qr_codes FOR UPDATE USING (
    auth.uid()::text = user_id OR public.is_admin()
) WITH CHECK (
    auth.uid()::text = user_id OR public.is_admin()
);

DROP POLICY IF EXISTS "Users can delete own qr_codes or admin" ON public.qr_codes;
CREATE POLICY "Users can delete own qr_codes or admin" ON public.qr_codes FOR DELETE USING (
    auth.uid()::text = user_id OR public.is_admin()
);

-- 10.6 User Brand Logos Policies
DROP POLICY IF EXISTS "Public can read user logos" ON public.user_logos;
CREATE POLICY "Public can read user logos" ON public.user_logos FOR SELECT USING (TRUE);

DROP POLICY IF EXISTS "Users can insert own logos" ON public.user_logos;
CREATE POLICY "Users can insert own logos" ON public.user_logos FOR INSERT WITH CHECK (
    auth.uid()::text = user_id OR public.is_admin()
);

DROP POLICY IF EXISTS "Users can update own logos or admin" ON public.user_logos;
CREATE POLICY "Users can update own logos or admin" ON public.user_logos FOR UPDATE USING (
    auth.uid()::text = user_id OR public.is_admin()
) WITH CHECK (
    auth.uid()::text = user_id OR public.is_admin()
);

DROP POLICY IF EXISTS "Users can delete own logos or admin" ON public.user_logos;
CREATE POLICY "Users can delete own logos or admin" ON public.user_logos FOR DELETE USING (
    auth.uid()::text = user_id OR public.is_admin()
);

-- 10.7 Package Orders Policies
DROP POLICY IF EXISTS "Users or admins can read package orders" ON public.package_orders;
CREATE POLICY "Users or admins can read package orders" ON public.package_orders FOR SELECT USING (
    customer_email = auth.jwt() ->> 'email' OR public.is_admin()
);

DROP POLICY IF EXISTS "Public can submit package orders" ON public.package_orders;
CREATE POLICY "Public can submit package orders" ON public.package_orders FOR INSERT WITH CHECK (TRUE);

DROP POLICY IF EXISTS "Admins can update package orders" ON public.package_orders;
CREATE POLICY "Admins can update package orders" ON public.package_orders FOR UPDATE USING (public.is_admin()) WITH CHECK (public.is_admin());

DROP POLICY IF EXISTS "Admins can delete package orders" ON public.package_orders;
CREATE POLICY "Admins can delete package orders" ON public.package_orders FOR DELETE USING (public.is_admin());

-- 10.8 License Codes Policies (Restricted to Admins; redemption via RPC)
DROP POLICY IF EXISTS "Admins can read license codes" ON public.license_codes;
CREATE POLICY "Admins can read license codes" ON public.license_codes FOR SELECT USING (public.is_admin());

DROP POLICY IF EXISTS "Admins can insert license codes" ON public.license_codes;
CREATE POLICY "Admins can insert license codes" ON public.license_codes FOR INSERT WITH CHECK (public.is_admin());

DROP POLICY IF EXISTS "Admins can update license codes" ON public.license_codes;
CREATE POLICY "Admins can update license codes" ON public.license_codes FOR UPDATE USING (public.is_admin()) WITH CHECK (public.is_admin());

DROP POLICY IF EXISTS "Admins can delete license codes" ON public.license_codes;
CREATE POLICY "Admins can delete license codes" ON public.license_codes FOR DELETE USING (public.is_admin());

-- 10.9 Storage Objects Policies for 'logos' bucket
DO $$
BEGIN
    IF EXISTS (SELECT 1 FROM information_schema.tables WHERE table_schema = 'storage' AND table_name = 'objects') THEN
        DROP POLICY IF EXISTS "Public can view logos bucket" ON storage.objects;
        CREATE POLICY "Public can view logos bucket" ON storage.objects FOR SELECT USING (bucket_id = 'logos');

        DROP POLICY IF EXISTS "Authenticated users or admin can upload to logos bucket" ON storage.objects;
        CREATE POLICY "Authenticated users or admin can upload to logos bucket" ON storage.objects FOR INSERT WITH CHECK (
            bucket_id = 'logos' AND (
                auth.uid()::text = (storage.foldername(name))[1] OR
                public.is_admin() OR
                auth.role() = 'anon'
            )
        );

        DROP POLICY IF EXISTS "Users can update own logos in bucket" ON storage.objects;
        CREATE POLICY "Users can update own logos in bucket" ON storage.objects FOR UPDATE USING (
            bucket_id = 'logos' AND (
                auth.uid()::text = (storage.foldername(name))[1] OR
                public.is_admin()
            )
        );

        DROP POLICY IF EXISTS "Users can delete own logos in bucket" ON storage.objects;
        CREATE POLICY "Users can delete own logos in bucket" ON storage.objects FOR DELETE USING (
            bucket_id = 'logos' AND (
                auth.uid()::text = (storage.foldername(name))[1] OR
                public.is_admin()
            )
        );
    END IF;
END $$;
