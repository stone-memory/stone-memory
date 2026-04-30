"use client"

import { useEffect } from "react"
import { AlertTriangle, RotateCcw } from "lucide-react"
import { Button } from "@/components/ui/button"

// Admin-scoped error boundary. If any admin page throws, Next.js catches it
// here instead of crashing the whole CRM; user gets a recovery button.
export default function AdminError({
  error,
  reset,
}: {
  error: Error & { digest?: string }
  reset: () => void
}) {
  useEffect(() => {
    console.error("[admin] unhandled error:", error)
  }, [error])

  return (
    <div className="flex min-h-[60vh] flex-col items-center justify-center p-8">
      <div className="max-w-md text-center">
        <div className="mx-auto mb-4 flex h-12 w-12 items-center justify-center rounded-full bg-destructive/10 text-destructive">
          <AlertTriangle className="h-6 w-6" />
        </div>
        <h1 className="text-xl font-semibold">Щось пішло не так</h1>
        <p className="mt-2 text-sm text-muted-foreground">
          Сталася помилка при відкритті цього розділу CRM. Спробуйте перезавантажити сторінку.
        </p>
        {error.digest && (
          <p className="mt-3 text-xs text-muted-foreground">
            Код помилки: <code className="rounded bg-foreground/5 px-1.5 py-0.5 font-mono">{error.digest}</code>
          </p>
        )}
        <div className="mt-6 flex justify-center gap-2">
          <Button onClick={reset} className="gap-2 rounded-xl">
            <RotateCcw size={16} /> Спробувати знову
          </Button>
          <Button variant="outline" className="rounded-xl" onClick={() => (window.location.href = "/admin")}>
            На головну CRM
          </Button>
        </div>
      </div>
    </div>
  )
}
