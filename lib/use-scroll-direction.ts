"use client"

import { useEffect, useRef, useState } from "react"

/**
 * Чи ховати плаваючі елементи: `true` під час прокрутки вниз, `false` вгору.
 *
 * Використовується мобільною панеллю дій і панеллю пошуку в каталозі, щоб
 * обидві зникали й поверталися синхронно — інакше вони стрибають окремо
 * й це помітно.
 *
 * Три деталі, без яких патерн дратує:
 *
 * • `THRESHOLD` — рух менший за 8 px ігнорується. Інерційна прокрутка на
 *   iOS постійно дає дрібні коливання в обидва боки, і без порога панелі
 *   мерехтять.
 *
 * • `TOP_ZONE` — у верхніх 80 px завжди показуємо. Інакше після різкого
 *   свайпу вгору сторінка вже на початку, а панель ще прихована.
 *
 * • читання позиції в rAF — `scroll` спрацьовує частіше за кадр, і
 *   робити роботу на кожній події немає сенсу.
 */
const THRESHOLD = 8
const TOP_ZONE = 80

export function useHideOnScroll(): boolean {
  const [hidden, setHidden] = useState(false)

  useEffect(() => {
    let last = window.scrollY
    let ticking = false

    const update = () => {
      const y = window.scrollY
      const delta = y - last

      if (y < TOP_ZONE) {
        setHidden(false)
        last = y
      } else if (Math.abs(delta) > THRESHOLD) {
        setHidden(delta > 0)
        last = y
      }
      ticking = false
    }

    const onScroll = () => {
      if (ticking) return
      ticking = true
      requestAnimationFrame(update)
    }

    window.addEventListener("scroll", onScroll, { passive: true })
    return () => window.removeEventListener("scroll", onScroll)
  }, [])

  return hidden
}

/**
 * Чи вартовий уже пішов вище лінії `offset` від верху вікна.
 *
 * Ставиться на початок сітки товарів і вирішує, чи можна ховати панель
 * фільтрів. Два попередні підходи не спрацювали:
 *
 * • ховати за самим фактом прокрутки вниз — панель з'їжджала на заголовок,
 *   бо на початку сторінки вона ще в звичайному потоці;
 * • ховати щойно вона прилипла — `sticky` зберігає своє місце в потоці, тому
 *   під нею одразу лишалась порожня смуга: контент знизу нікуди не рухається.
 *
 * Тому чекаємо, поки перша картка піде під шапку. З цього моменту під
 * панеллю справді є що ховати, і її зникнення нічого не залишає порожнім.
 *
 * Позицію не рахуємо через `offsetTop` — він збився б від будь-якої зміни
 * висоти контенту вище.
 *
 * @param offset висота шапки (`top-14` → 56)
 */
export function usePassedTop(offset: number): {
  ref: React.RefObject<HTMLDivElement | null>
  passed: boolean
} {
  const ref = useRef<HTMLDivElement>(null)
  const [passed, setPassed] = useState(false)

  useEffect(() => {
    const el = ref.current
    if (!el) return
    const io = new IntersectionObserver(
      ([entry]) => setPassed(!entry.isIntersecting),
      { rootMargin: `-${offset}px 0px 0px 0px`, threshold: 0 }
    )
    io.observe(el)
    return () => io.disconnect()
  }, [offset])

  return { ref, passed }
}
