"use client"

import Link from "next/link"
import { Box, PenTool, Settings, Truck, Sparkles, Shield, MapPin, Palette, Layers, ArrowRight } from "lucide-react"
import { motion } from "framer-motion"
import { type Service } from "@/lib/data/services"
import { useServices } from "@/lib/store/services"
import { useTranslation } from "@/lib/i18n/context"

const iconMap: Record<Service["icon"], typeof Box> = {
  drafting: Box,
  engrave: PenTool,
  chisel: Settings,
  truck: Truck,
  sparkles: Sparkles,
  shield: Shield,
  landscape: MapPin,
  palette: Palette,
}

export function ServicesSection() {
  const { t, locale } = useTranslation()
  const services = useServices()
  const featured = services.slice(0, 6)

  return (
    <section id="services" className="bg-secondary/50 py-24 md:py-32">
      <div className="mx-auto max-w-7xl px-6">
        <div className="mb-12 text-center md:mb-16">
          <span className="text-[11px] font-medium uppercase tracking-[0.24em] text-muted-foreground">
            {t.services.label}
          </span>
          <h2 className="mt-3 text-4xl font-semibold tracking-tight-custom md:text-6xl text-balance">
            {t.services.heading}
          </h2>
        </div>

        <div className="grid grid-cols-1 gap-4 sm:grid-cols-2 lg:grid-cols-3">
          {featured.map((svc, i) => {
            const Icon = iconMap[svc.icon] ?? Layers
            return (
              <motion.div
                key={svc.slug}
                initial={{ opacity: 0, y: 10 }}
                whileInView={{ opacity: 1, y: 0 }}
                viewport={{ once: true, amount: 0.01 }}
                transition={{ duration: 0.25, delay: i * 0.02, ease: [0.22, 1, 0.36, 1] }}
              >
                <Link
                  href={`/services#${svc.slug}`}
                  className="group flex h-full flex-col rounded-2xl bg-card p-7 ring-1 ring-black/[0.04] shadow-soft transition-[box-shadow,transform] duration-500 ease-[cubic-bezier(0.32,0.72,0,1)] hover:shadow-hover hover:-translate-y-0.5"
                >
                  <div className="flex h-12 w-12 items-center justify-center rounded-xl bg-foreground/[0.05]">
                    <Icon className="h-5 w-5 text-foreground" strokeWidth={1.75} />
                  </div>

                  <h3 className="mt-6 text-xl font-semibold tracking-tight-custom">
                    {svc.title[locale]}
                  </h3>
                  <p className="mt-3 text-[15px] leading-relaxed text-muted-foreground">
                    {svc.shortDesc[locale]}
                  </p>

                  <span className="mt-auto pt-6 inline-flex items-center gap-1.5 text-sm font-medium text-accent opacity-0 transition-opacity group-hover:opacity-100">
                    {t.services.learnMore}
                    <ArrowRight className="h-4 w-4 transition-transform group-hover:translate-x-0.5" strokeWidth={2} />
                  </span>
                </Link>
              </motion.div>
            )
          })}
        </div>
      </div>
    </section>
  )
}
