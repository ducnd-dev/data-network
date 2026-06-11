import { ImageResponse } from "next/og";
import { BRAND_NAME, BRAND_TAGLINE } from "@/lib/copy";

export const alt = `${BRAND_NAME} — ${BRAND_TAGLINE}`;
export const size = { width: 1200, height: 630 };
export const contentType = "image/png";

export default async function OpenGraphImage() {
  return new ImageResponse(
    (
      <div
        style={{
          width: "100%",
          height: "100%",
          display: "flex",
          flexDirection: "column",
          justifyContent: "center",
          padding: "64px 80px",
          background: "linear-gradient(135deg, #eff6ff 0%, #f5f3ff 50%, #ecfeff 100%)",
          position: "relative",
        }}
      >
        <div
          style={{
            position: "absolute",
            top: -80,
            right: -80,
            width: 400,
            height: 400,
            borderRadius: "50%",
            background: "rgba(37, 99, 235, 0.12)",
          }}
        />
        <div
          style={{
            position: "absolute",
            bottom: -60,
            left: 200,
            width: 300,
            height: 300,
            borderRadius: "50%",
            background: "rgba(124, 58, 237, 0.1)",
          }}
        />
        <div style={{ display: "flex", alignItems: "center", gap: 20, marginBottom: 32 }}>
          <div
            style={{
              width: 64,
              height: 64,
              borderRadius: 18,
              background: "linear-gradient(135deg, #2563eb, #7c3aed)",
              display: "flex",
              alignItems: "center",
              justifyContent: "center",
            }}
          >
            <svg viewBox="0 0 36 36" width="40" height="40" fill="none">
              <path
                d="M11 9h10l4 4v14a1.5 1.5 0 0 1-1.5 1.5h-12A1.5 1.5 0 0 1 10 27V10.5A1.5 1.5 0 0 1 11.5 9H11Z"
                fill="white"
                fillOpacity="0.92"
              />
              <rect x="12" y="16" width="12" height="1.5" rx="0.75" fill="#2563eb" />
              <circle cx="26" cy="26" r="5" fill="white" fillOpacity="0.95" />
              <circle cx="26" cy="26" r="2" fill="#2563eb" />
            </svg>
          </div>
          <span
            style={{
              fontSize: 48,
              fontWeight: 700,
              color: "#0f172a",
              letterSpacing: "-0.02em",
            }}
          >
            {BRAND_NAME}
          </span>
        </div>
        <p
          style={{
            fontSize: 36,
            fontWeight: 600,
            color: "#1e293b",
            lineHeight: 1.3,
            maxWidth: 900,
            margin: 0,
          }}
        >
          {BRAND_TAGLINE}
        </p>
        <p
          style={{
            fontSize: 22,
            color: "#64748b",
            marginTop: 20,
            margin: "20px 0 0",
          }}
        >
          Upload · Extract · Export JSON or CSV
        </p>
      </div>
    ),
    { ...size }
  );
}
