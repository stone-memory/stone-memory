"use client"

import { useState } from "react"
import { Plus, Trash2, RotateCcw, Save } from "lucide-react"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { useBusinessProfileStore, type Weekday } from "@/lib/store/business-profile"
import { cn } from "@/lib/utils"

const WEEKDAYS: { key: Weekday; label: string }[] = [
  { key: "mon", label: "Понеділок" },
  { key: "tue", label: "Вівторок" },
  { key: "wed", label: "Середа" },
  { key: "thu", label: "Четвер" },
  { key: "fri", label: "П'ятниця" },
  { key: "sat", label: "Субота" },
  { key: "sun", label: "Неділя" },
]

export default function AdminBusinessPage() {
  const profile = useBusinessProfileStore((s) => s.profile)
  const update = useBusinessProfileStore((s) => s.update)
  const updateHours = useBusinessProfileStore((s) => s.updateHours)
  const addHoliday = useBusinessProfileStore((s) => s.addHoliday)
  const removeHoliday = useBusinessProfileStore((s) => s.removeHoliday)
  const reset = useBusinessProfileStore((s) => s.reset)

  const [saved, setSaved] = useState(false)
  const [newHolidayDate, setNewHolidayDate] = useState("")
  const [newHolidayLabel, setNewHolidayLabel] = useState("")

  const save = () => {
    setSaved(true)
    setTimeout(() => setSaved(false), 1500)
  }

  const addHol = () => {
    if (!newHolidayDate || !newHolidayLabel.trim()) return
    addHoliday({ date: newHolidayDate, label: newHolidayLabel.trim() })
    setNewHolidayDate("")
    setNewHolidayLabel("")
  }

  return (
    <div className="space-y-6">
      <header className="flex flex-wrap items-center justify-between gap-3">
        <div>
          <h1 className="text-3xl font-semibold tracking-tight-custom">Профіль бізнесу</h1>
          <p className="mt-1 text-sm text-muted-foreground">
            Юридичні реквізити, графік, вихідні дні, регіони обслуговування. Використовується у футері, контактах і структурованих даних для Google.
          </p>
        </div>
        <div className="flex gap-2">
          <Button variant="outline" onClick={reset} className="rounded-xl gap-2">
            <RotateCcw size={16} /> Скинути
          </Button>
          <Button onClick={save} className="rounded-xl gap-2">
            <Save size={16} /> {saved ? "Збережено" : "Зберегти"}
          </Button>
        </div>
      </header>

      <section className="rounded-2xl border border-foreground/10 bg-card p-5 space-y-4">
        <h2 className="text-sm font-semibold uppercase tracking-wide text-muted-foreground">
          Основне
        </h2>
        <div className="grid grid-cols-1 gap-4 md:grid-cols-2">
          <Field label="Юридична назва">
            <Input value={profile.legalName} onChange={(e) => update({ legalName: e.target.value })} />
          </Field>
          <Field label="Публічна назва">
            <Input value={profile.displayName} onChange={(e) => update({ displayName: e.target.value })} />
          </Field>
          <Field label="Email">
            <Input type="email" value={profile.email} onChange={(e) => update({ email: e.target.value })} />
          </Field>
          <Field label="Телефон">
            <Input value={profile.phone} onChange={(e) => update({ phone: e.target.value })} />
          </Field>
          <Field label="ІПН / VAT ID">
            <Input value={profile.vatId} onChange={(e) => update({ vatId: e.target.value })} />
          </Field>
          <Field label="IBAN">
            <Input value={profile.bankingIban || ""} onChange={(e) => update({ bankingIban: e.target.value })} />
          </Field>
          <Field label="Адреса">
            <Input value={profile.address} onChange={(e) => update({ address: e.target.value })} />
          </Field>
          <Field label="Місто">
            <Input value={profile.city} onChange={(e) => update({ city: e.target.value })} />
          </Field>
          <Field label="Область">
            <Input value={profile.region} onChange={(e) => update({ region: e.target.value })} />
          </Field>
          <Field label="Поштовий індекс">
            <Input value={profile.postalCode} onChange={(e) => update({ postalCode: e.target.value })} />
          </Field>
          <Field label="Країна">
            <Input value={profile.country} onChange={(e) => update({ country: e.target.value })} />
          </Field>
          <Field label="Валюта">
            <select
              value={profile.currency}
              onChange={(e) => update({ currency: e.target.value })}
              className="h-10 w-full rounded-xl border border-foreground/10 bg-background px-3 text-sm"
            >
              <option>EUR</option>
              <option>UAH</option>
              <option>USD</option>
              <option>PLN</option>
            </select>
          </Field>
        </div>
      </section>

      <section className="rounded-2xl border border-foreground/10 bg-card p-5 space-y-3">
        <h2 className="text-sm font-semibold uppercase tracking-wide text-muted-foreground">
          Графік роботи
        </h2>
        <div className="space-y-2">
          {WEEKDAYS.map(({ key, label }) => {
            const h = profile.hours[key]
            return (
              <div key={key} className="flex flex-wrap items-center gap-3 rounded-xl bg-foreground/[0.02] p-3">
                <div className="w-24 text-sm font-medium">{label}</div>
                <label className="inline-flex items-center gap-2 text-sm">
                  <input
                    type="checkbox"
                    checked={!h.closed}
                    onChange={(e) => updateHours(key, { closed: !e.target.checked })}
                    className="h-4 w-4 accent-foreground"
                  />
                  {h.closed ? "Вихідний" : "Відкрито"}
                </label>
                {!h.closed && (
                  <>
                    <input
                      type="time"
                      value={h.open}
                      onChange={(e) => updateHours(key, { open: e.target.value })}
                      className="h-9 rounded-lg border border-foreground/10 bg-background px-2 text-sm"
                    />
                    <span className="text-muted-foreground">—</span>
                    <input
                      type="time"
                      value={h.close}
                      onChange={(e) => updateHours(key, { close: e.target.value })}
                      className="h-9 rounded-lg border border-foreground/10 bg-background px-2 text-sm"
                    />
                  </>
                )}
              </div>
            )
          })}
        </div>
      </section>

      <section className="rounded-2xl border border-foreground/10 bg-card p-5 space-y-3">
        <h2 className="text-sm font-semibold uppercase tracking-wide text-muted-foreground">
          Вихідні дні та свята
        </h2>
        <div className="flex flex-wrap items-center gap-2">
          <Input
            type="date"
            value={newHolidayDate}
            onChange={(e) => setNewHolidayDate(e.target.value)}
            className="w-44"
          />
          <Input
            placeholder="Назва (напр. Різдво)"
            value={newHolidayLabel}
            onChange={(e) => setNewHolidayLabel(e.target.value)}
            className="flex-1 max-w-xs"
          />
          <Button onClick={addHol} className="rounded-xl gap-2">
            <Plus size={16} /> Додати
          </Button>
        </div>
        {profile.holidays.length > 0 && (
          <div className="space-y-1">
            {profile.holidays
              .sort((a, b) => a.date.localeCompare(b.date))
              .map((h) => (
                <div key={h.id} className="flex items-center justify-between rounded-lg bg-foreground/[0.02] px-3 py-2 text-sm">
                  <span className="tabular-nums text-muted-foreground">{h.date}</span>
                  <span className="flex-1 px-3">{h.label}</span>
                  <button
                    onClick={() => removeHoliday(h.id)}
                    className="rounded-md p-1 text-destructive/70 hover:bg-destructive/10"
                    aria-label="Видалити"
                  >
                    <Trash2 size={14} />
                  </button>
                </div>
              ))}
          </div>
        )}
      </section>

      <section className="rounded-2xl border border-foreground/10 bg-card p-5 space-y-3">
        <h2 className="text-sm font-semibold uppercase tracking-wide text-muted-foreground">
          Регіони обслуговування
        </h2>
        <div className="flex flex-wrap gap-2">
          {["UA", "PL", "DE", "LT", "CZ", "SK", "HU", "RO", "EU"].map((code) => {
            const on = profile.serviceAreas.includes(code)
            return (
              <button
                key={code}
                onClick={() =>
                  update({
                    serviceAreas: on
                      ? profile.serviceAreas.filter((x) => x !== code)
                      : [...profile.serviceAreas, code],
                  })
                }
                className={cn(
                  "rounded-full px-4 py-1.5 text-sm font-medium transition-colors",
                  on
                    ? "bg-foreground text-background"
                    : "bg-foreground/5 text-muted-foreground hover:bg-foreground/10"
                )}
              >
                {code}
              </button>
            )
          })}
        </div>
      </section>
    </div>
  )
}

function Field({ label, children }: { label: string; children: React.ReactNode }) {
  return (
    <label className="block">
      <span className="mb-1 block text-xs font-medium uppercase tracking-wide text-muted-foreground">{label}</span>
      {children}
    </label>
  )
}
