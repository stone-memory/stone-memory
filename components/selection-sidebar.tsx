"use client"

import Image from "next/image"
import { ShoppingBag, X } from "lucide-react"
import { motion, AnimatePresence } from "framer-motion"
import {
  Sheet,
  SheetContent,
  SheetHeader,
  SheetTitle,
  SheetDescription,
} from "@/components/ui/sheet"
import { Button } from "@/components/ui/button"
import { ScrollArea } from "@/components/ui/scroll-area"
import { SelectionForm } from "@/components/selection-form"
import { SelectionSuccess } from "@/components/selection-success"
import { useSelectionStore } from "@/lib/store/selection"
import { useTranslation } from "@/lib/i18n/context"
import { cn } from "@/lib/utils"

const clearLabels = {
  uk: "Очистити все",
  pl: "Wyczyść wszystko",
  en: "Clear all",
  de: "Alles leeren",
  lt: "Išvalyti viską",
} as const

export function SelectionSidebar() {
  const { items, isOpen, closeSidebar, removeItem, clearAll, orderSubmitted } =
    useSelectionStore()
  const { t, locale, formatPrice } = useTranslation()
  const clearLabel = clearLabels[locale as keyof typeof clearLabels] || clearLabels.en

  return (
    <Sheet open={isOpen} onOpenChange={(open) => !open && closeSidebar()}>
      <SheetContent
        side="right"
        className={cn(
          "flex w-full flex-col gap-0 p-0 sm:w-[480px] sm:max-w-[480px]",
          "[&>button]:hidden"
        )}
      >
        <AnimatePresence mode="wait">
          {orderSubmitted ? (
            <motion.div
              key="success"
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              exit={{ opacity: 0 }}
              className="flex h-full flex-col"
            >
              <SheetTitle className="sr-only">{t.selection.title}</SheetTitle>
              <SheetDescription className="sr-only">{t.selection.subtitle}</SheetDescription>
              <SelectionSuccess />
            </motion.div>
          ) : (
            <motion.div
              key="content"
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              exit={{ opacity: 0 }}
              className="flex h-full flex-col"
            >
              {/* Header */}
              <SheetHeader className="flex-shrink-0 border-b p-6">
                <div className="flex items-center justify-between">
                  <div>
                    <SheetTitle className="text-2xl font-semibold">
                      {t.selection.title}
                    </SheetTitle>
                    <SheetDescription className="mt-1 text-sm text-muted-foreground">
                      {items.length} {t.selection.subtitle}
                    </SheetDescription>
                  </div>
                  <div className="flex items-center gap-2">
                    {items.length > 0 && (
                      <Button
                        variant="ghost"
                        size="sm"
                        onClick={clearAll}
                        className="rounded-full text-sm text-muted-foreground hover:text-foreground"
                      >
                        {clearLabel}
                      </Button>
                    )}
                    <Button
                      variant="ghost"
                      size="icon"
                      onClick={closeSidebar}
                      className="h-10 w-10 text-muted-foreground hover:text-foreground"
                    >
                      <X className="h-5 w-5" />
                      <span className="sr-only">Close</span>
                    </Button>
                  </div>
                </div>
              </SheetHeader>

              {/* Body */}
              <ScrollArea className="flex-1">
                <div className="p-6">
                  {items.length === 0 ? (
                    /* Empty State */
                    <div className="flex flex-col items-center py-16 text-center">
                      <ShoppingBag
                        className="h-12 w-12 text-muted-foreground/50"
                        strokeWidth={1}
                      />
                      <p className="mt-4 text-muted-foreground">
                        {t.selection.empty}
                      </p>
                      <p className="mt-1 text-sm text-muted-foreground/70">
                        {t.selection.emptyHint}
                      </p>
                    </div>
                  ) : (
                    /* Item List */
                    <div className="space-y-4">
                      <AnimatePresence mode="popLayout">
                        {items.map((item) => (
                          <motion.div
                            key={item.id}
                            layout
                            initial={{ opacity: 0, x: 20 }}
                            animate={{ opacity: 1, x: 0 }}
                            exit={{ opacity: 0, x: -20, height: 0 }}
                            transition={{
                              type: "spring",
                              stiffness: 500,
                              damping: 35,
                            }}
                            className="flex items-start gap-4"
                          >
                            {/* Thumbnail */}
                            <div className="relative h-24 w-20 flex-shrink-0 overflow-hidden rounded-lg bg-foreground/5">
                              <Image
                                src={item.imagePath || "/logo-512.png"}
                                alt={`№ ${item.id}`}
                                fill
                                className="object-cover"
                                sizes="80px"
                              />
                            </div>

                            {/* Info */}
                            <div className="flex-1">
                              <p className="font-mono text-sm tabular-nums">№ {item.id}</p>
                              <p className="mt-1 text-sm text-muted-foreground">
                                {t.catalog.fromPrice} {formatPrice(item.priceFrom)}
                              </p>
                            </div>

                            {/* Remove Button */}
                            <Button
                              variant="ghost"
                              size="icon"
                              onClick={() => removeItem(item.id)}
                              className="h-8 w-8 flex-shrink-0 text-muted-foreground hover:text-foreground"
                              aria-label={t.selection.remove}
                            >
                              <X className="h-4 w-4" />
                              <span className="sr-only">
                                Remove item {item.id}
                              </span>
                            </Button>
                          </motion.div>
                        ))}
                      </AnimatePresence>
                    </div>
                  )}
                </div>
              </ScrollArea>

              {/* Form Footer */}
              <div className="flex-shrink-0 border-t bg-card p-6">
                <SelectionForm />
              </div>
            </motion.div>
          )}
        </AnimatePresence>
      </SheetContent>
    </Sheet>
  )
}
