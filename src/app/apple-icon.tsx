import { ImageResponse } from "next/og";

export const size = { width: 180, height: 180 };
export const contentType = "image/png";

export default function AppleIcon() {
  return new ImageResponse(
    (
      <div
        style={{
          width: "100%",
          height: "100%",
          display: "flex",
          alignItems: "center",
          justifyContent: "center",
          background: "linear-gradient(135deg, #2563eb 0%, #7c3aed 100%)",
          borderRadius: 40,
        }}
      >
        <svg viewBox="0 0 36 36" width="120" height="120" fill="none">
          <path
            d="M11 9h10l4 4v14a1.5 1.5 0 0 1-1.5 1.5h-12A1.5 1.5 0 0 1 10 27V10.5A1.5 1.5 0 0 1 11.5 9H11Z"
            fill="white"
            fillOpacity="0.92"
          />
          <path d="M21 9v4h4" stroke="white" strokeOpacity="0.5" strokeWidth="1" />
          <rect x="12" y="16" width="12" height="1.5" rx="0.75" fill="#2563eb" />
          <rect x="12" y="20" width="8" height="1" rx="0.5" fill="#2563eb" fillOpacity="0.5" />
          <circle cx="26" cy="26" r="5" fill="white" fillOpacity="0.95" />
          <circle cx="26" cy="26" r="2" fill="#2563eb" />
        </svg>
      </div>
    ),
    { ...size }
  );
}
