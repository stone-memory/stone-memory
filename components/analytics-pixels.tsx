"use client"

import Script from "next/script"
import { useEffect, useState } from "react"

const GA_ID = process.env.NEXT_PUBLIC_GA_ID
const FB_PIXEL_ID = process.env.NEXT_PUBLIC_FB_PIXEL_ID
const CLARITY_ID = "wol8xdpeuc"

const LS_KEY = "sm-cookie-consent"

type ConsentState = {
  choice: "accepted" | "rejected" | "customized"
  necessary: true
  analytics: boolean
  marketing: boolean
  timestamp: number
}

function readAnalyticsConsent(): boolean {
  if (typeof window === "undefined") return false
  try {
    const raw = localStorage.getItem(LS_KEY)
    if (!raw) return false
    const state = JSON.parse(raw) as ConsentState
    return state.analytics === true
  } catch {
    return false
  }
}

export function AnalyticsPixels() {
  const enabled = process.env.NODE_ENV === "production"
  const [analyticsConsent, setAnalyticsConsent] = useState(false)

  useEffect(() => {
    setAnalyticsConsent(readAnalyticsConsent())
    const onUpdate = (e: Event) => {
      const detail = (e as CustomEvent<ConsentState>).detail
      setAnalyticsConsent(detail?.analytics === true)
    }
    window.addEventListener("cookie-consent-updated", onUpdate)
    return () => window.removeEventListener("cookie-consent-updated", onUpdate)
  }, [])

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
      {analyticsConsent && (
        <Script id="ms-clarity" strategy="afterInteractive">
          {`
            (function(c,l,a,r,i,t,y){
              c[a]=c[a]||function(){(c[a].q=c[a].q||[]).push(arguments)};
              t=l.createElement(r);t.async=1;t.src="https://www.clarity.ms/tag/"+i;
              y=l.getElementsByTagName(r)[0];y.parentNode.insertBefore(t,y);
            })(window, document, "clarity", "script", "${CLARITY_ID}");
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
