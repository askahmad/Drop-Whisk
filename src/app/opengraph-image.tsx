import { ImageResponse } from "next/og";

export const runtime = "nodejs";
export const alt = "Drop Whisk — Instant Cross-Device File & Text Sharing";
export const size = {
  width: 1200,
  height: 630,
};
export const contentType = "image/png";

export default async function Image() {
  return new ImageResponse(
    (
      <div
        style={{
          height: "100%",
          width: "100%",
          display: "flex",
          flexDirection: "column",
          alignItems: "center",
          justifyContent: "center",
          backgroundColor: "#09090b",
          backgroundImage:
            "radial-gradient(circle at 50% 30%, rgba(99, 102, 241, 0.25) 0%, rgba(9, 9, 11, 1) 70%)",
          color: "#ffffff",
          fontFamily: "system-ui, -apple-system, sans-serif",
          padding: "48px 64px",
          textAlign: "center",
        }}
      >
        <div
          style={{
            display: "flex",
            alignItems: "center",
            gap: "14px",
            marginBottom: "24px",
            padding: "10px 24px",
            borderRadius: "9999px",
            border: "1px solid rgba(255, 255, 255, 0.15)",
            backgroundColor: "rgba(255, 255, 255, 0.05)",
          }}
        >
          <span
            style={{
              fontSize: "28px",
            }}
          >
            ⚡
          </span>
          <span
            style={{
              fontSize: "22px",
              fontWeight: 700,
              letterSpacing: "0.05em",
              textTransform: "uppercase",
              color: "#a5b4fc",
            }}
          >
            Drop Whisk
          </span>
        </div>

        <h1
          style={{
            fontSize: "64px",
            fontWeight: 800,
            letterSpacing: "-0.03em",
            lineHeight: 1.1,
            margin: "0 0 20px 0",
            maxWidth: "960px",
            background:
              "linear-gradient(135deg, #ffffff 0%, #cbd5e1 50%, #818cf8 100%)",
            backgroundClip: "text",
            WebkitBackgroundClip: "text",
            color: "transparent",
          }}
        >
          Share anything, anywhere, in seconds.
        </h1>

        <p
          style={{
            fontSize: "26px",
            color: "#94a3b8",
            margin: "0 0 36px 0",
            maxWidth: "800px",
            lineHeight: 1.4,
          }}
        >
          Cross-device transfer between iPhone, Android, PC, and Mac without
          accounts, cables, or apps.
        </p>

        <div
          style={{
            display: "flex",
            alignItems: "center",
            gap: "24px",
            fontSize: "20px",
            color: "#64748b",
          }}
        >
          <span>📱 Mobile & PC</span>
          <span>•</span>
          <span>⚡ 500MB / File</span>
          <span>•</span>
          <span>🔒 24h Auto-Expiring</span>
          <span>•</span>
          <span>📷 Instant QR Scan</span>
        </div>
      </div>
    ),
    {
      ...size,
    }
  );
}
