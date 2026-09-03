"use client"

import Link from "next/link"
import { motion, useScroll, useTransform } from "framer-motion"
import { ChevronDown, ArrowRight } from "lucide-react"
import Image from "next/image"
import { useEffect, useRef, useState } from "react"
import { useTranslation } from "@/lib/i18n/context"

const EASE = [0.22, 1, 0.36, 1] as const

export function Hero() {
  const containerRef = useRef<HTMLDivElement>(null)
  const videoRef = useRef<HTMLVideoElement>(null)
  /**
   * The hero video is desktop-only.
   *
   * hero.mp4 is 3.4 MB — 79% of the page's entire 4.3 MB transfer — and on
   * mobile it was also the LCP element, so phones paid for the whole file
   * before anything scored. Desktop measures 99 with it and has the bandwidth,
   * so it keeps the video; phones get the 46 KB poster and nothing else.
   *
   * Gated behind mount + matchMedia rather than CSS: `display: none` would
   * still download the file.
   */
  const [showVideo, setShowVideo] = useState(false)
  const { t } = useTranslation()
  const { scrollYProgress } = useScroll({
    target: containerRef,
    offset: ["start start", "end start"],
  })

  const mediaY = useTransform(scrollYProgress, [0, 1], ["0%", "18%"])
  const mediaScale = useTransform(scrollYProgress, [0, 1], [1, 1.08])
  const contentOpacity = useTransform(scrollYProgress, [0, 0.6], [1, 0])
  const contentY = useTransform(scrollYProgress, [0, 1], ["0%", "-8%"])

  useEffect(() => {
    const mq = window.matchMedia("(min-width: 768px)")
    const sync = () => setShowVideo(mq.matches)
    sync()
    mq.addEventListener("change", sync)
    return () => mq.removeEventListener("change", sync)
  }, [])

  useEffect(() => {
    const video = videoRef.current
    if (!video) return
    video.muted = true
    video.playsInline = true
    const tryPlay = () => {
      const p = video.play()
      if (p && typeof p.catch === "function") p.catch(() => {})
    }
    tryPlay()
    const onVisible = () => {
      if (document.visibilityState === "visible") tryPlay()
    }
    document.addEventListener("visibilitychange", onVisible)
    return () => document.removeEventListener("visibilitychange", onVisible)
  }, [showVideo])

  return (
    <section
      ref={containerRef}
      className="relative h-screen min-h-[720px] w-full overflow-hidden bg-black"
    >
      <motion.div
        style={{ y: mediaY, scale: mediaScale }}
        className="absolute inset-0 will-change-transform"
      >
        {/*
          The source used to be a 38 MB / 20 Mbps 1080p file with an unused AAC
          track, fetched eagerly via preload="auto" — it dominated LCP and burned
          mobile data before a single word of copy was readable. Re-encoded to
          ~3.4 MB (video-only, CRF 28, faststart) and preloaded as metadata only;
          the poster is now a real first frame instead of an SVG placeholder, so
          something representative paints immediately.
        */}
        {/* Poster as a real <Image>: it is the LCP element on mobile, so it
            needs priority (which emits fetchpriority="high" — PSI flagged its
            absence). On desktop the video paints over it once mounted. */}
        <Image
          src="/hero/hero-poster.jpg"
          alt=""
          fill
          priority
          // PSI's LCP audit asks for fetchpriority=high explicitly; `priority`
          // alone emits the preload link but not this attribute in this version.
          fetchPriority="high"
          sizes="100vw"
          className="object-cover"
        />
        {showVideo && (
          <video
            ref={videoRef}
            className="absolute inset-0 h-full w-full object-cover"
            src="/hero/hero.mp4"
            poster="/hero/hero-poster.jpg"
            autoPlay
            loop
            muted
            playsInline
            preload="metadata"
            disablePictureInPicture
            disableRemotePlayback
            controls={false}
            aria-hidden="true"
          />
        )}
      </motion.div>

      <div className="pointer-events-none absolute inset-0 bg-gradient-to-b from-black/55 via-black/20 to-black/75" />
      <div className="pointer-events-none absolute inset-0 bg-[radial-gradient(ellipse_at_center,_transparent_35%,_rgba(0,0,0,0.55)_100%)]" />

      <motion.div
        style={{ opacity: contentOpacity, y: contentY }}
        className="absolute inset-0 flex flex-col items-center justify-center px-6 text-center"
      >
        <motion.div
          initial={{ opacity: 0, y: 12 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.35, delay: 0.05, ease: EASE }}
          className="rounded-full border border-white/25 bg-white/10 px-4 py-1.5 text-[11px] font-medium uppercase tracking-[0.22em] text-white/95 backdrop-blur-md"
        >
          {t.hero.badge}
        </motion.div>

        <motion.h1
          initial={{ opacity: 0, y: 16 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.4, delay: 0.1, ease: EASE }}
          className="mt-6 max-w-[18ch] text-[clamp(36px,8vw,104px)] font-semibold leading-[1.02] tracking-tight-custom text-balance text-white drop-shadow-[0_2px_24px_rgba(0,0,0,0.45)]"
        >
          {t.hero.title}
        </motion.h1>

        <motion.p
          initial={{ opacity: 0, y: 16 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.4, delay: 0.18, ease: EASE }}
          className="mt-6 max-w-xl text-balance text-lg md:text-xl text-white/85 drop-shadow-[0_1px_12px_rgba(0,0,0,0.35)]"
        >
          {t.hero.subtitle}
        </motion.p>

        <motion.div
          initial={{ opacity: 0, y: 12 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.4, delay: 0.25, ease: EASE }}
          className="mt-10 flex flex-wrap items-center justify-center gap-3"
        >
          <Link
            href="/memorial/pamyatnyky"
            prefetch
            className="group inline-flex items-center gap-2 rounded-full bg-white px-6 py-3 text-sm font-medium text-black transition-transform hover:-translate-y-[1px] active:scale-[0.98]"
          >
            {t.hero.ctaPrimary}
            <ArrowRight className="h-4 w-4 transition-transform group-hover:translate-x-0.5" strokeWidth={2} />
          </Link>
          <Link
            href="/posluhy"
            prefetch
            className="inline-flex items-center gap-2 rounded-full border border-white/30 bg-white/5 px-6 py-3 text-sm font-medium text-white backdrop-blur-md transition-all hover:bg-white/10 hover:-translate-y-[1px] active:scale-[0.98]"
          >
            {t.hero.ctaSecondary}
          </Link>
        </motion.div>
      </motion.div>

      <motion.div
        initial={{ opacity: 0 }}
        animate={{ opacity: 0.7 }}
        transition={{ duration: 0.4, delay: 0.4 }}
        className="absolute bottom-8 left-1/2 -translate-x-1/2"
      >
        <ChevronDown
          className="h-8 w-8 animate-bounce-gentle text-white"
          strokeWidth={1.25}
        />
      </motion.div>
    </section>
  )
}
