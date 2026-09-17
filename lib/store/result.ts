/**
 * Результат збереження зі store: сторінка адмінки показує «Збережено» лише
 * після `ok: true`, а на `ok: false` — toast з текстом помилки (HTTP-статус,
 * повідомлення сервера). Раніше store мовчки відкочував state, і 403/500
 * виглядали як успіх.
 */
export type SaveResult = { ok: true } | { ok: false; error: string }

export const fail = (e: unknown, fallback = "Не вдалось зберегти"): SaveResult => ({
  ok: false,
  error: e instanceof Error && e.message ? e.message : fallback,
})

/** Помилка з HTTP-статусом і, якщо є, `error` з JSON-відповіді сервера. */
export async function httpError(res: Response, what: string): Promise<Error> {
  let detail = ""
  try {
    const j = (await res.clone().json()) as { error?: unknown }
    if (j && typeof j.error === "string") detail = j.error
  } catch {
    /* тіло не JSON — лишаємо тільки статус */
  }
  return new Error(`${what} (HTTP ${res.status})${detail ? `: ${detail}` : ""}`)
}
