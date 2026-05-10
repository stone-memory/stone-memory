"use client"

import Image from "next/image"
import Link from "next/link"
import { ArrowRight, Compass, Hammer, Truck, Sparkles, ShieldCheck, Trees, Palette, FileText } from "lucide-react"
import { motion } from "framer-motion"
import { Header } from "@/components/header"
import { Footer } from "@/components/footer"
import { SelectionSidebar } from "@/components/selection-sidebar"
import { type Service } from "@/lib/data/services"
import { useServices } from "@/lib/store/services"
import { useTranslation } from "@/lib/i18n/context"

const iconMap = {
  drafting: Compass,
  chisel: Hammer,
  truck: Truck,
  sparkles: Sparkles,
  shield: ShieldCheck,
  landscape: Trees,
  engrave: FileText,
  palette: Palette,
}

export default function ServicesPage() {
  const { t, locale } = useTranslation()
  const services = useServices()

  return (
    <>
      <Header />
      <main id="main-content">
        <section className="relative overflow-hidden bg-black">
          <Image
            src="/services/hero.jpg"
            alt=""
            fill
            sizes="100vw"
            className="object-cover opacity-75"
            priority
          />
          <div className="absolute inset-0 bg-gradient-to-b from-black/55 via-black/35 to-black/85" />
          <div className="relative mx-auto max-w-7xl px-6 pt-24 pb-16 md:pt-32 md:pb-20">
            <h1 className="max-w-3xl text-5xl font-semibold tracking-tight-custom text-white md:text-7xl text-balance drop-shadow-[0_2px_20px_rgba(0,0,0,0.5)]">
              {t.services.heading}
            </h1>
          </div>
        </section>

        <section className="mx-auto max-w-7xl px-6 pt-12 pb-20 md:pt-16 md:pb-28">
          <div className="grid grid-cols-1 gap-5 sm:grid-cols-2 lg:grid-cols-3 md:gap-6">
            {services.map((svc: Service, i) => {
              const Icon = iconMap[svc.icon] || Compass
              return (
                <motion.article
                  key={svc.slug}
                  id={svc.slug}
                  initial={{ opacity: 0, y: 10 }}
                  whileInView={{ opacity: 1, y: 0 }}
                  viewport={{ once: true, amount: 0.05 }}
                  transition={{ duration: 0.3, delay: i * 0.04, ease: [0.22, 1, 0.36, 1] }}
                  className="group relative flex flex-col rounded-3xl bg-card p-7 ring-1 ring-black/[0.04] shadow-soft transition-[box-shadow,transform] duration-300 hover:shadow-hover hover:-translate-y-0.5 md:p-8"
                >
                  <div className="inline-flex h-12 w-12 items-center justify-center rounded-2xl bg-foreground/[0.06]">
                    <Icon className="h-5 w-5 text-foreground" strokeWidth={1.75} />
                  </div>
                  <h3 className="mt-10 text-xl font-semibold tracking-tight-custom md:text-2xl">
                    {svc.title[locale]}
                  </h3>
                  <p className="mt-3 text-[15px] leading-relaxed text-muted-foreground md:text-base">
                    {svc.shortDesc[locale]}
                  </p>
                </motion.article>
              )
            })}
          </div>

          <div className="mt-16 rounded-3xl bg-foreground p-8 text-background md:mt-24 md:p-14">
            <h3 className="max-w-2xl text-3xl font-semibold tracking-tight-custom md:text-5xl text-balance">
              {t.services.subheading}
            </h3>
            <div className="mt-8 flex flex-wrap gap-3">
              <Link
                href="/catalog"
                prefetch
                className="group inline-flex items-center gap-2 rounded-full bg-background px-6 py-3 text-sm font-medium text-foreground transition-transform hover:-translate-y-[1px]"
              >
                {t.hero.ctaPrimary}
                <ArrowRight className="h-4 w-4 transition-transform group-hover:translate-x-0.5" strokeWidth={2} />
              </Link>
              <Link
                href="/#contact"
                className="inline-flex items-center gap-2 rounded-full border border-background/30 px-6 py-3 text-sm font-medium text-background transition-all hover:bg-background/10"
              >
                {t.nav.contact}
              </Link>
            </div>
          </div>
        </section>
      </main>
      <Footer />
      <SelectionSidebar />
    </>
  )
}
