"use client"

import { useState } from "react"
import Image from "next/image"
import { Phone, X } from "lucide-react"
import { Button } from "@/components/ui/button"
import { Sheet, SheetContent, SheetHeader, SheetTitle, SheetDescription } from "@/components/ui/sheet"
import { Textarea } from "@/components/ui/textarea"
import { StatusChanger } from "./status-changer"
import { NotesLog } from "./notes-log"
import { useOrdersStore } from "@/lib/store/orders"
import type { Order } from "@/lib/types"

interface OrderDetailSheetProps {
  order: Order
  onClose: () => void
}

function formatPrice(price: number): string {
  return `€${price.toLocaleString("en-US", { minimumFractionDigits: 0 })}`
}

function formatDate(date: Date): string {
  return new Date(date).toLocaleDateString("en-US", {
    month: "short",
    day: "numeric",
    year: "numeric",
    hour: "2-digit",
    minute: "2-digit",
  })
}

export function OrderDetailSheet({ order, onClose }: OrderDetailSheetProps) {
  const [noteText, setNoteText] = useState("")
  const updateStatus = useOrdersStore((state) => state.updateStatus)
  const addNote = useOrdersStore((state) => state.addNote)
  const markContacted = useOrdersStore((state) => state.markContacted)

  const totalPrice = order.items.reduce((sum, item) => sum + item.priceFrom, 0)

  const handleAddNote = () => {
    if (noteText.trim()) {
      addNote(order.id, {
        author: "You",
        text: noteText,
        createdAt: new Date(),
      })
      setNoteText("")
    }
  }

  const handleStatusChange = (status: Parameters<typeof updateStatus>[1]) => {
    updateStatus(order.id, status)
  }

  const handleMarkContacted = () => {
    markContacted(order.id)
  }

  return (
    <Sheet open={true} onOpenChange={onClose}>
      <SheetContent className="w-full sm:w-[560px] flex flex-col p-0 [&>button]:hidden">
        <SheetHeader className="flex flex-row justify-between items-start px-6 pt-6 pb-6 border-b">
          <div className="flex-1 min-w-0 pr-4">
            <SheetTitle className="text-xl font-semibold break-all">{order.id}</SheetTitle>
            <SheetDescription className="text-xs text-muted-foreground mt-1">
              {formatDate(order.createdAt)}
            </SheetDescription>
          </div>
          <button onClick={onClose} className="shrink-0 text-muted-foreground hover:text-foreground">
            <X size={20} />
          </button>
        </SheetHeader>

        <div className="flex-1 overflow-y-auto px-6">
          <div className="space-y-8 py-6">
            {/* Client Section */}
            <section>
              <h3 className="text-xs uppercase tracking-widest font-semibold text-muted-foreground mb-4">
                Client
              </h3>
              <p className="font-medium mb-2">{order.name}</p>
              <a
                href={`tel:${order.phone}`}
                className="text-accent hover:underline flex items-center gap-2 text-sm mb-4"
              >
                <Phone size={16} />
                {order.phone}
              </a>
              <Button className="w-full rounded-xl h-11">Call Client</Button>
            </section>

            {/* Selected Items Section */}
            <section>
              <h3 className="text-xs uppercase tracking-widest font-semibold text-muted-foreground mb-4">
                Selected Items
              </h3>
              <div className="space-y-3">
                {order.items.map((item) => (
                  <div key={item.id} className="flex gap-3 py-3 border-b last:border-0">
                    <div className="relative w-14 h-16 bg-black/5 rounded-md flex-shrink-0 overflow-hidden">
                      {item.imagePath ? (
                        <Image
                          src={item.imagePath}
                          alt={`№ ${item.id}`}
                          fill
                          sizes="56px"
                          className="object-cover"
                          unoptimized={item.imagePath.endsWith(".svg")}
                        />
                      ) : null}
                    </div>
                    <div className="flex-1 min-w-0">
                      <p className="font-mono text-sm font-medium">№ {item.id}</p>
                      <p className="text-xs text-muted-foreground mt-1">
                        from {formatPrice(item.priceFrom)}
                      </p>
                    </div>
                  </div>
                ))}
              </div>
              <div className="flex justify-between items-center pt-4 font-medium">
                <span>Estimated Total</span>
                <span>{formatPrice(totalPrice)}</span>
              </div>
            </section>

            {/* Status Section */}
            <section>
              <h3 className="text-xs uppercase tracking-widest font-semibold text-muted-foreground mb-4">
                Status
              </h3>
              <StatusChanger currentStatus={order.status} onChange={handleStatusChange} />
            </section>

            {/* Internal Notes Section */}
            <section>
              <h3 className="text-xs uppercase tracking-widest font-semibold text-muted-foreground mb-4">
                Internal Notes
              </h3>
              <Textarea
                placeholder="Add a note (visible only to team)…"
                value={noteText}
                onChange={(e) => setNoteText(e.target.value)}
                className="rounded-xl bg-black/[0.04] border-0 min-h-[100px] mb-2"
              />
              <Button
                variant="ghost"
                size="sm"
                onClick={handleAddNote}
                disabled={!noteText.trim()}
                className="ml-auto"
              >
                Add Note
              </Button>
              <div className="mt-6">
                <NotesLog notes={order.notes} />
              </div>
            </section>
          </div>
        </div>

        {/* Footer */}
        <div className="border-t px-6 py-4 flex gap-3">
          <Button
            variant="outline"
            className="rounded-xl"
            onClick={handleMarkContacted}
            disabled={order.contacted}
          >
            {order.contacted ? "Contacted" : "Mark as Contacted"}
          </Button>
          <Button className="flex-1 rounded-xl" onClick={onClose}>
            Done
          </Button>
        </div>
      </SheetContent>
    </Sheet>
  )
}
