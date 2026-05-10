"use client"

export default function GlobalError({ reset }: { error: Error; reset: () => void }) {
  return (
    <main className="flex min-h-screen flex-col items-center justify-center bg-background px-6 text-center">
      <div className="text-[11px] font-medium uppercase tracking-[0.24em] text-muted-foreground">
        Error
      </div>
      <h1 className="mt-4 text-4xl font-semibold tracking-tight-custom md:text-6xl">
        Something went wrong
      </h1>
      <p className="mt-4 max-w-md text-muted-foreground">
        Please try again. If the issue persists, contact us at sttonememory@gmail.com.
      </p>
      <button
        onClick={reset}
        className="mt-8 inline-flex items-center gap-2 rounded-full bg-foreground px-5 py-2.5 text-sm font-medium text-background"
      >
        Try again
      </button>
    </main>
  )
}
