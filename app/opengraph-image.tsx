import { ImageResponse } from "next/og"

export const runtime = "edge"
export const alt = "Stone Memory — natural stone for memory and home"
export const size = { width: 1200, height: 630 }
export const contentType = "image/png"

export default async function OG() {
  return new ImageResponse(
    (
      <div
        style={{
          width: "100%",
          height: "100%",
          display: "flex",
          flexDirection: "column",
          justifyContent: "space-between",
          padding: "72px",
          background:
            "linear-gradient(135deg, #0a0a0a 0%, #1a1a1a 50%, #2a2a2a 100%)",
          color: "#fafafa",
          fontFamily: "system-ui, sans-serif",
        }}
      >
        <div style={{ display: "flex", alignItems: "center", gap: 16 }}>
          <div
            style={{
              width: 48,
              height: 48,
              borderRadius: 12,
              background: "#fafafa",
              color: "#0a0a0a",
              display: "flex",
              alignItems: "center",
              justifyContent: "center",
              fontSize: 24,
              fontWeight: 800,
              letterSpacing: "-0.03em",
            }}
          >
            SM
          </div>
          <div style={{ fontSize: 24, fontWeight: 600, letterSpacing: "-0.02em" }}>
            Stone Memory
          </div>
        </div>

        <div style={{ display: "flex", flexDirection: "column" }}>
          <div
            style={{
              fontSize: 96,
              fontWeight: 700,
              letterSpacing: "-0.045em",
              lineHeight: 1.02,
              maxWidth: 1000,
            }}
          >
            Натуральний камінь
          </div>
          <div
            style={{
              marginTop: 28,
              fontSize: 28,
              color: "#bbb",
              letterSpacing: "-0.01em",
              maxWidth: 900,
              lineHeight: 1.35,
            }}
          >
            Пам'ятники · Стільниці · Сходи · Каміни · Бруківка · Костопіль, Україна
          </div>
        </div>

        <div
          style={{
            display: "flex",
            gap: 12,
            fontSize: 18,
            color: "#888",
          }}
        >
          <span
            style={{
              padding: "8px 16px",
              border: "1px solid #333",
              borderRadius: 999,
            }}
          >
            5 років гарантії
          </span>
          <span
            style={{
              padding: "8px 16px",
              border: "1px solid #333",
              borderRadius: 999,
            }}
          >
            Монтаж по ЄС
          </span>
          <span
            style={{
              padding: "8px 16px",
              border: "1px solid #333",
              borderRadius: 999,
            }}
          >
            Власне виробництво
          </span>
        </div>
      </div>
    ),
    size
  )
}
