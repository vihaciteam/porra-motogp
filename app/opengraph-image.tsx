import { ImageResponse } from "next/og";

export const runtime = "edge";
export const alt = "Podium MotoGP 2026";
export const size = { width: 1200, height: 630 };
export const contentType = "image/png";

export default async function Image() {
  return new ImageResponse(
    (
      <div
        style={{
          background: "#000000",
          width: "100%",
          height: "100%",
          display: "flex",
          flexDirection: "column",
          alignItems: "center",
          justifyContent: "center",
          fontFamily: "Arial Black, Arial",
          position: "relative",
        }}
      >
        {/* Franja roja superior */}
        <div
          style={{
            position: "absolute",
            top: 0,
            left: 0,
            right: 0,
            height: 10,
            background: "#dc2626",
          }}
        />

        {/* Franja roja inferior */}
        <div
          style={{
            position: "absolute",
            bottom: 0,
            left: 0,
            right: 0,
            height: 10,
            background: "#dc2626",
          }}
        />

        {/* PODIUM texto */}
        <div
          style={{
            fontSize: 160,
            fontWeight: 900,
            color: "#dc2626",
            letterSpacing: "-6px",
            lineHeight: 1,
            marginBottom: 10,
          }}
        >
          PODIUM
        </div>

        {/* Podio gráfico */}
        <div
          style={{
            display: "flex",
            alignItems: "flex-end",
            gap: 6,
            marginBottom: 24,
          }}
        >
          {/* P2 */}
          <div
            style={{
              width: 90,
              height: 70,
              background: "#dc2626",
              borderRadius: 8,
              display: "flex",
              alignItems: "center",
              justifyContent: "center",
              fontSize: 36,
              fontWeight: 900,
              color: "#fff",
            }}
          >
            2
          </div>
          {/* P1 */}
          <div
            style={{
              width: 90,
              height: 100,
              background: "#ffffff",
              borderRadius: 8,
              display: "flex",
              alignItems: "center",
              justifyContent: "center",
              fontSize: 42,
              fontWeight: 900,
              color: "#000",
            }}
          >
            1
          </div>
          {/* P3 */}
          <div
            style={{
              width: 90,
              height: 52,
              background: "#71717a",
              borderRadius: 8,
              display: "flex",
              alignItems: "center",
              justifyContent: "center",
              fontSize: 30,
              fontWeight: 900,
              color: "#fff",
            }}
          >
            3
          </div>
        </div>

        {/* MOTOGP 2026 */}
        <div
          style={{
            display: "flex",
            gap: 16,
            fontSize: 72,
            fontWeight: 900,
            letterSpacing: "2px",
          }}
        >
          <span style={{ color: "#ffffff" }}>MOTOGP</span>
          <span style={{ color: "#dc2626" }}>2026</span>
        </div>
      </div>
    ),
    { ...size }
  );
}
