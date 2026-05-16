"use client"

import Link from "next/link"
import { ArrowRight, Users } from "lucide-react"
import { Button } from "@/components/ui/button"

/**
 * @deprecated The old "Ролі та доступ" page only toggled which sidebar
 * sections appeared on YOUR own browser session — it didn't invite anyone
 * or restrict anyone server-side. Real team management with email-based
 * invitations and Supabase Auth-backed roles lives at /admin/team.
 *
 * Page kept as a redirect notice so any bookmarks still resolve.
 */
export default function LegacyRolesPage() {
  return (
    <div className="mx-auto max-w-2xl space-y-6 py-12">
      <div className="rounded-2xl border border-amber-300/40 bg-amber-50/60 p-6 dark:bg-amber-900/10">
        <div className="text-xs font-medium uppercase tracking-wide text-amber-700">
          Розділ застарів
        </div>
        <h1 className="mt-2 text-2xl font-semibold tracking-tight-custom">
          Цей розділ більше не потрібен
        </h1>
        <p className="mt-2 text-sm text-muted-foreground">
          Стара сторінка «Ролі та доступ» лише перемикала які розділи показувати
          у твоєму ж сайдбарі — вона нікого не запрошувала і нічого не обмежувала
          серверно. Запрошення колег по email і ролі (з реальним RLS у Supabase)
          живуть у новій сторінці «Команда і ролі».
        </p>
        <div className="mt-5 flex flex-wrap gap-3">
          <Button asChild className="rounded-xl gap-2">
            <Link href="/admin/team">
              <Users size={16} />
              Перейти у «Команда і ролі»
              <ArrowRight size={14} />
            </Link>
          </Button>
        </div>
      </div>

      <details className="rounded-2xl border border-foreground/10 bg-card p-5 text-sm text-muted-foreground">
        <summary className="cursor-pointer font-medium text-foreground">
          Як тепер запрошувати людину?
        </summary>
        <ol className="mt-3 list-decimal space-y-2 pl-5">
          <li>Відкрий <Link className="underline" href="/admin/team">Команда і ролі</Link>.</li>
          <li>Натисни «Додати учасника», впиши email і вибери роль (Адмін / Менеджер / Майстер / Продажі).</li>
          <li>
            Після цього зареєструй цей email у{" "}
            <a
              href="https://supabase.com/dashboard"
              target="_blank"
              rel="noopener noreferrer"
              className="underline"
            >
              Supabase Auth
            </a>{" "}
            (Authentication → Users → Add user) — людина зможе ввійти у /admin зі своїм паролем.
          </li>
          <li>RLS у Supabase автоматично обмежить що ця роль може бачити і змінювати.</li>
        </ol>
      </details>
    </div>
  )
}
