import Link from "next/link"

export default function NotFound() {
  return (
    <main className="flex min-h-screen flex-col items-center justify-center bg-background px-6 text-center">
      <div className="text-[11px] font-medium uppercase tracking-[0.24em] text-muted-foreground">
        404
      </div>
      <h1 className="mt-4 text-5xl font-semibold tracking-tight-custom md:text-7xl">
        Page not found
      </h1>
      <p className="mt-4 max-w-md text-lg text-muted-foreground">
        The page you are looking for may have been moved or no longer exists.
      </p>
      <div className="mt-8 flex flex-wrap items-center justify-center gap-3">
        <Link
          href="/"
          className="inline-flex items-center gap-2 rounded-full bg-foreground px-5 py-2.5 text-sm font-medium text-background transition-transform hover:-translate-y-[1px]"
        >
          Go home
        </Link>
        <Link
          href="/blog"
          className="inline-flex items-center gap-2 rounded-full border border-foreground/15 px-5 py-2.5 text-sm font-medium text-foreground transition-all hover:bg-foreground/5"
        >
          Read the journal
        </Link>
      </div>
    </main>
  )
}
