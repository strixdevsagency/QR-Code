import type { AnalyticsConfig } from '../types';

class AnalyticsService {
  private isGAInitialized = false;
  private isGTMInitialized = false;

  public initialize(config: AnalyticsConfig): void {
    if (typeof window === 'undefined') return;

    // 1. Google Analytics (GA4)
    if (config.googleAnalyticsEnabled && config.googleAnalyticsId && !this.isGAInitialized) {
      try {
        const script = document.createElement('script');
        script.async = true;
        script.src = `https://www.googletagmanager.com/gtag/js?id=${config.googleAnalyticsId}`;
        document.head.appendChild(script);

        const inlineScript = document.createElement('script');
        inlineScript.innerHTML = `
          window.dataLayer = window.dataLayer || [];
          function gtag(){dataLayer.push(arguments);}
          gtag('js', new Date());
          gtag('config', '${config.googleAnalyticsId}', { page_path: window.location.pathname });
        `;
        document.head.appendChild(inlineScript);
        this.isGAInitialized = true;
        console.log('[Strix Analytics] GA4 initialized:', config.googleAnalyticsId);
      } catch (err) {
        console.error('[Strix Analytics] Error loading GA4', err);
      }
    }

    // 2. Google Tag Manager (GTM)
    if (config.googleTagManagerEnabled && config.googleTagManagerId && !this.isGTMInitialized) {
      try {
        const gtmScript = document.createElement('script');
        gtmScript.innerHTML = `(function(w,d,s,l,i){w[l]=w[l]||[];w[l].push({'gtm.start':
          new Date().getTime(),event:'gtm.js'});var f=d.getElementsByTagName(s)[0],
          j=d.createElement(s),dl=l!='dataLayer'?'&l='+l:'';j.async=true;j.src=
          'https://www.googletagmanager.com/gtm.js?id='+i+dl;f.parentNode.insertBefore(j,f);
          })(window,document,'script','dataLayer','${config.googleTagManagerId}');`;
        document.head.appendChild(gtmScript);
        this.isGTMInitialized = true;
        console.log('[Strix Analytics] GTM initialized:', config.googleTagManagerId);
      } catch (err) {
        console.error('[Strix Analytics] Error loading GTM', err);
      }
    }

    // 3. Google AdSense Global Client Script
    if (config.adSenseEnabled && config.adSensePublisherId) {
      const existingScript = document.querySelector('script[src*="adsbygoogle"]');
      if (!existingScript) {
        try {
          const adScript = document.createElement('script');
          adScript.async = true;
          adScript.crossOrigin = 'anonymous';
          adScript.src = `https://pagead2.googlesyndication.com/pagead/js/adsbygoogle.js?client=${config.adSensePublisherId}`;
          document.head.appendChild(adScript);
          console.log('[Strix Monetization] AdSense initialized with publisher:', config.adSensePublisherId);
        } catch (err) {
          console.error('[Strix Monetization] Error loading AdSense script', err);
        }
      }
    }
  }

  public trackEvent(eventName: string, params: Record<string, unknown> = {}): void {
    if (typeof window !== 'undefined' && (window as unknown as { gtag?: (...args: unknown[]) => void }).gtag) {
      (window as unknown as { gtag: (...args: unknown[]) => void }).gtag('event', eventName, params);
    }
  }
}

export const analytics = new AnalyticsService();

