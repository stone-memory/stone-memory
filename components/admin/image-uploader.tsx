"use client"

import { useRef, useState } from "react"
import Image from "next/image"
import { Upload, X, AlertCircle, Loader2 } from "lucide-react"
import { Input } from "@/components/ui/input"
import { authedFetch } from "@/lib/authed-fetch"
import { cn } from "@/lib/utils"

type Props = {
  value: string
  onChange: (url: string) => void
  folder?: string   // optional bucket sub-folder (e.g. "stones", "projects")
  className?: string
}

export function ImageUploader({ value, onChange, folder = "misc", className }: Props) {
  const inputRef = useRef<HTMLInputElement>(null)
  const [uploading, setUploading] = useState(false)
  const [error, setError] = useState<string | null>(null)

  const trigger = () => inputRef.current?.click()

  const handleFile = async (file: File) => {
    setError(null)
    setUploading(true)
    try {
      const fd = new FormData()
      fd.append("file", file)
      const res = await authedFetch(`/api/admin/upload?folder=${encodeURIComponent(folder)}`, {
        method: "POST",
        body: fd,
      })
      const data = await res.json()
      if (!res.ok) {
        setError(data?.error || "Не вдалось завантажити")
        return
      }
      onChange(data.url)
    } catch {
      setError("Помилка мережі")
    } finally {
      setUploading(false)
    }
  }

  const onFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const f = e.target.files?.[0]
    if (f) handleFile(f)
    e.target.value = "" // allow re-uploading same file
  }

  const clear = () => onChange("")

  return (
    <div className={cn("space-y-2", className)}>
      {/* Preview + upload trigger */}
      <div
        onClick={!uploading ? trigger : undefined}
        className={cn(
          "relative flex min-h-[140px] w-full cursor-pointer items-center justify-center overflow-hidden rounded-xl border-2 border-dashed border-foreground/15 bg-foreground/[0.02] transition-colors hover:border-foreground/30 hover:bg-foreground/[0.04]",
          uploading && "pointer-events-none opacity-60"
        )}
      >
        {value ? (
          <>
            <Image
              src={value}
              alt="preview"
              fill
              sizes="(max-width: 768px) 100vw, 400px"
              className="object-cover"
              unoptimized={value.startsWith("data:") || value.endsWith(".svg")}
            />
            <button
              type="button"
              onClick={(e) => {
                e.stopPropagation()
                clear()
              }}
              className="absolute right-2 top-2 inline-flex h-8 w-8 items-center justify-center rounded-full bg-black/60 text-white hover:bg-black/80"
              aria-label="Очистити"
            >
              <X size={14} />
            </button>
          </>
        ) : (
          <div className="flex flex-col items-center gap-2 py-8 text-muted-foreground">
            {uploading ? <Loader2 className="h-6 w-6 animate-spin" /> : <Upload className="h-6 w-6" />}
            <span className="text-sm">
              {uploading ? "Завантажую…" : "Клікніть, щоб вибрати фото"}
            </span>
            <span className="text-xs text-muted-foreground/70">
              JPG / PNG / WebP · до 8 MB
            </span>
          </div>
        )}
      </div>

      <input
        ref={inputRef}
        type="file"
        accept="image/*"
        className="hidden"
        onChange={onFileChange}
      />

      {/* URL fallback — якщо хочуть вручну вставити існуючий URL */}
      <div className="flex items-center gap-2">
        <Input
          type="url"
          placeholder="або вставте URL зображення"
          value={value}
          onChange={(e) => onChange(e.target.value)}
          className="flex-1 font-mono text-xs"
        />
      </div>

      {error && (
        <p className="inline-flex items-center gap-1.5 text-xs text-destructive">
          <AlertCircle size={12} /> {error}
        </p>
      )}
    </div>
  )
}
