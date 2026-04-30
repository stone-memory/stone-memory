"use client"

import { Check } from "lucide-react"
import { motion } from "framer-motion"
import { Button } from "@/components/ui/button"
import { useSelectionStore } from "@/lib/store/selection"
import { useTranslation } from "@/lib/i18n/context"

export function SelectionSuccess() {
  const { orderReference, resetOrder, closeSidebar } = useSelectionStore()
  const { t } = useTranslation()

  const handleContinue = () => {
    closeSidebar()
    // Delay reset to allow sheet close animation
    setTimeout(() => {
      resetOrder()
    }, 400)
  }

  return (
    <div className="flex h-full flex-col items-center justify-center p-12 text-center">
      {/* Animated Check Icon */}
      <motion.div
        initial={{ scale: 0 }}
        animate={{ scale: 1 }}
        transition={{
          type: "spring",
          stiffness: 300,
          damping: 20,
          delay: 0.1,
        }}
        className="flex h-16 w-16 items-center justify-center rounded-full bg-success/10"
      >
        <motion.div
          initial={{ scale: 0, rotate: -180 }}
          animate={{ scale: 1, rotate: 0 }}
          transition={{
            type: "spring",
            stiffness: 400,
            damping: 25,
            delay: 0.2,
          }}
        >
          <Check className="h-8 w-8 text-success" strokeWidth={2.5} />
        </motion.div>
      </motion.div>

      {/* Success Message */}
      <motion.h3
        initial={{ opacity: 0, y: 10 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ delay: 0.3 }}
        className="mt-6 text-2xl font-semibold"
      >
        {t.success.title}
      </motion.h3>

      <motion.p
        initial={{ opacity: 0, y: 10 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ delay: 0.4 }}
        className="mt-3 text-muted-foreground"
      >
        {t.success.body}
      </motion.p>

      {/* Order Reference */}
      <motion.div
        initial={{ opacity: 0, y: 10 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ delay: 0.5 }}
        className="mt-6 inline-block rounded-full bg-foreground/5 px-4 py-2 font-mono text-sm"
      >
        {t.success.reference}: {orderReference}
      </motion.div>

      {/* Continue Button */}
      <motion.div
        initial={{ opacity: 0, y: 10 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ delay: 0.6 }}
        className="mt-8"
      >
        <Button
          variant="ghost"
          onClick={handleContinue}
          className="text-muted-foreground hover:text-foreground"
        >
          {t.success.continueBrowsing}
        </Button>
      </motion.div>
    </div>
  )
}
