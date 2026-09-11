'use client'

import { useCallback, useEffect, useState } from 'react'
import Image from 'next/image'
import * as Dialog from '@radix-ui/react-dialog'
import { ChevronLeft, ChevronRight, X, Maximize2 } from 'lucide-react'

export type GalleryItem = { src: string; alt: string }

/**
 * Галерея колекції з переглядом на весь екран. Три знімки (макро, сляб,
 * застосування) відкриваються в лайтбоксі; стрілки й клавіші ←/→ гортають.
 */
export function GalleryLightbox({ items }: { items: GalleryItem[] }) {
  const [index, setIndex] = useState<number | null>(null)
  const open = index !== null
  const count = items.length

  const step = useCallback(
    (d: number) => setIndex((i) => (i === null ? i : (i + d + count) % count)),
    [count]
  )

  useEffect(() => {
    if (!open) return
    const onKey = (e: KeyboardEvent) => {
      if (e.key === 'ArrowRight') step(1)
      if (e.key === 'ArrowLeft') step(-1)
    }
    window.addEventListener('keydown', onKey)
    return () => window.removeEventListener('keydown', onKey)
  }, [open, step])

  return (
    <>
      <div className="grid gap-3 sm:grid-cols-2">
        {items.map((item, i) => (
          <button
            key={item.src}
            type="button"
            onClick={() => setIndex(i)}
            aria-label={`Відкрити на весь екран: ${item.alt}`}
            className={`group relative overflow-hidden rounded-xl text-left ${i === 0 ? 'aspect-square sm:col-span-2' : 'aspect-[4/3]'}`}
          >
            <Image
              src={item.src}
              alt={item.alt}
              fill
              priority={i === 0}
              sizes="(max-width:1024px) 100vw, 50vw"
              className="object-cover transition-transform duration-500 group-hover:scale-[1.02]"
            />
            <span className="absolute bottom-3 right-3 flex h-9 w-9 items-center justify-center rounded-full bg-background/85 text-foreground opacity-0 shadow-sm backdrop-blur transition-opacity group-hover:opacity-100 group-focus-visible:opacity-100">
              <Maximize2 className="h-4 w-4" strokeWidth={2} />
            </span>
          </button>
        ))}
      </div>

      <Dialog.Root open={open} onOpenChange={(o) => !o && setIndex(null)}>
        <Dialog.Portal>
          <Dialog.Overlay className="fixed inset-0 z-[95] bg-black/92 data-[state=open]:animate-in data-[state=open]:fade-in-0 data-[state=closed]:animate-out data-[state=closed]:fade-out-0" />
          <Dialog.Content className="fixed inset-0 z-[95] flex flex-col outline-none">
            <Dialog.Title className="sr-only">{index !== null ? items[index].alt : 'Фото'}</Dialog.Title>
            <Dialog.Description className="sr-only">Перегляд фото на весь екран. Стрілки гортають, Esc закриває.</Dialog.Description>

            <div className="flex items-center justify-between px-4 py-3 text-white/80 md:px-6">
              <p className="truncate text-sm">{index !== null ? items[index].alt : ''}</p>
              <div className="flex items-center gap-3">
                <span className="text-xs tabular-nums text-white/60">
                  {index !== null ? index + 1 : 0} / {count}
                </span>
                <Dialog.Close
                  className="flex h-10 w-10 items-center justify-center rounded-full text-white/80 transition-colors hover:bg-white/10 hover:text-white"
                  aria-label="Закрити"
                >
                  <X className="h-5 w-5" strokeWidth={2} />
                </Dialog.Close>
              </div>
            </div>

            <div className="relative min-h-0 flex-1">
              {index !== null ? (
                <Image
                  key={items[index].src}
                  src={items[index].src}
                  alt={items[index].alt}
                  fill
                  sizes="100vw"
                  className="object-contain"
                  priority
                />
              ) : null}
              {count > 1 ? (
                <>
                  <button
                    type="button"
                    onClick={() => step(-1)}
                    aria-label="Попереднє фото"
                    className="absolute left-3 top-1/2 flex h-11 w-11 -translate-y-1/2 items-center justify-center rounded-full bg-black/40 text-white transition-colors hover:bg-black/60 md:left-6"
                  >
                    <ChevronLeft className="h-6 w-6" strokeWidth={2} />
                  </button>
                  <button
                    type="button"
                    onClick={() => step(1)}
                    aria-label="Наступне фото"
                    className="absolute right-3 top-1/2 flex h-11 w-11 -translate-y-1/2 items-center justify-center rounded-full bg-black/40 text-white transition-colors hover:bg-black/60 md:right-6"
                  >
                    <ChevronRight className="h-6 w-6" strokeWidth={2} />
                  </button>
                </>
              ) : null}
            </div>

            <div className="flex justify-center gap-2 px-4 py-3">
              {items.map((item, i) => (
                <button
                  key={item.src}
                  type="button"
                  onClick={() => setIndex(i)}
                  aria-label={item.alt}
                  className={`relative h-14 w-20 overflow-hidden rounded-md ring-2 transition ${i === index ? 'ring-white' : 'ring-transparent opacity-60 hover:opacity-100'}`}
                >
                  <Image src={item.src} alt="" fill sizes="80px" className="object-cover" />
                </button>
              ))}
            </div>
          </Dialog.Content>
        </Dialog.Portal>
      </Dialog.Root>
    </>
  )
}
