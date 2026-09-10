/**
 * Ключ, під яким supabase-js тримає сесію в localStorage.
 *
 * Винесено окремо від client.ts навмисно: authed-fetch.ts має знати ключ,
 * не імпортуючи сам клієнт — інакше supabase-js (≈58 КБ gzip) потрапляє в
 * бандл кожної публічної сторінки.
 */
export const SUPABASE_AUTH_STORAGE_KEY = "stone-memory-auth"
