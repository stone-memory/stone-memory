import type { OrderNote } from "@/lib/types"

interface NotesLogProps {
  notes: OrderNote[] | undefined
}

function formatDate(date: Date): string {
  const d = new Date(date)
  const now = new Date()
  const diff = now.getTime() - d.getTime()
  const minutes = Math.floor(diff / 60000)
  const hours = Math.floor(diff / 3600000)
  const days = Math.floor(diff / 86400000)

  if (minutes < 1) return "just now"
  if (minutes < 60) return `${minutes}m ago`
  if (hours < 24) return `${hours}h ago`
  if (days < 7) return `${days}d ago`

  return d.toLocaleDateString("en-US", { month: "short", day: "numeric", year: "numeric" })
}

export function NotesLog({ notes }: NotesLogProps) {
  if (!notes || notes.length === 0) {
    return (
      <div className="py-6 text-center">
        <p className="text-sm text-muted-foreground">No notes yet</p>
      </div>
    )
  }

  return (
    <div className="space-y-2">
      {notes.map((note) => (
        <div key={note.id} className="bg-black/3 rounded-xl p-4">
          <div className="flex justify-between items-start mb-1">
            <p className="text-sm font-medium">{note.author}</p>
            <p className="text-xs text-muted-foreground">{formatDate(note.createdAt)}</p>
          </div>
          <p className="text-sm text-foreground/80">{note.text}</p>
        </div>
      ))}
    </div>
  )
}
