import Link from "next/link"
import { supabaseAdmin } from "@/lib/supabase/admin"

export const dynamic = "force-dynamic"

type SP = { token?: string }

export default async function UnsubscribePage({ searchParams }: { searchParams: Promise<SP> }) {
  const { token } = await searchParams
  let state: "ok" | "invalid" | "missing" = "missing"
  let email: string | null = null

  if (token) {
    const { data } = await supabaseAdmin
      .from("subscribers")
      .update({ status: "unsubscribed", unsubscribed_at: new Date().toISOString() })
      .eq("unsubscribe_token", token)
      .select("email")
      .maybeSingle()
    if (data?.email) {
      state = "ok"
      email = data.email as string
    } else {
      state = "invalid"
    }
  }

  return (
    <main className="min-h-screen flex items-center justify-center px-6 bg-background">
      <div className="max-w-md w-full rounded-2xl border border-foreground/10 bg-card p-8 text-center shadow-soft">
        <div className="text-sm font-semibold uppercase tracking-widest text-muted-foreground mb-4">
          Stone Memory
        </div>
        {state === "ok" && (
          <>
            <h1 className="text-2xl font-semibold tracking-tight">Ви відписалися</h1>
            <p className="mt-3 text-muted-foreground">
              {email ? <>Email <b>{email}</b> більше не буде отримувати розсилку.</> : "Підписку скасовано."}
            </p>
          </>
        )}
        {state === "invalid" && (
          <>
            <h1 className="text-2xl font-semibold tracking-tight">Посилання недійсне</h1>
            <p className="mt-3 text-muted-foreground">
              Можливо, ви вже відписалися, або термін дії посилання минув.
            </p>
          </>
        )}
        {state === "missing" && (
          <>
            <h1 className="text-2xl font-semibold tracking-tight">Відписка від розсилки</h1>
            <p className="mt-3 text-muted-foreground">
              Щоб відписатися, скористайтесь посиланням із нашого листа.
            </p>
          </>
        )}
        <Link
          href="/"
          className="mt-6 inline-flex items-center gap-2 rounded-full bg-foreground px-5 py-2.5 text-sm font-medium text-background"
        >
          На головну
        </Link>
      </div>
    </main>
  )
}
