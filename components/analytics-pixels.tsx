import Script from "next/script"

const GA_ID = process.env.NEXT_PUBLIC_GA_ID
const FB_PIXEL_ID = process.env.NEXT_PUBLIC_FB_PIXEL_ID

export function AnalyticsPixels() {
  const enabled = process.env.NODE_ENV === "production"
  if (!enabled) return null

  return (
    <>
      {GA_ID && (
        <>
          <Script
            id="ga-loader"
            strategy="afterInteractive"
            src={`https://www.googletagmanager.com/gtag/js?id=${GA_ID}`}
          />
          <Script id="ga-init" strategy="afterInteractive">
            {`
              window.dataLayer = window.dataLayer || [];
              function gtag(){dataLayer.push(arguments);}
              gtag('js', new Date());
              gtag('config', '${GA_ID}', { anonymize_ip: true });
            `}
          </Script>
        </>
      )}
      {FB_PIXEL_ID && (
        <Script id="fb-pixel" strategy="afterInteractive">
          {`
            !function(f,b,e,v,n,t,s){if(f.fbq)return;n=f.fbq=function(){n.callMethod?n.callMethod.apply(n,arguments):n.queue.push(arguments)};if(!f._fbq)f._fbq=n;n.push=n;n.loaded=!0;n.version='2.0';n.queue=[];t=b.createElement(e);t.async=!0;t.src=v;s=b.getElementsByTagName(e)[0];s.parentNode.insertBefore(t,s)}(window,document,'script','https://connect.facebook.net/en_US/fbevents.js');
            fbq('init', '${FB_PIXEL_ID}');
            fbq('track', 'PageView');
          `}
        </Script>
      )}
    </>
  )
}

// Optional client helper for custom events
export function trackEvent(name: string, params?: Record<string, unknown>) {
  if (typeof window === "undefined") return
  const w = window as unknown as {
    gtag?: (...args: unknown[]) => void
    fbq?: (...args: unknown[]) => void
  }
  try {
    w.gtag?.("event", name, params || {})
    w.fbq?.("trackCustom", name, params || {})
  } catch {
    /* ignore */
  }
}
