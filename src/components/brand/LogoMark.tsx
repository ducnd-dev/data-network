import { cn } from "@/lib/utils";

export function LogoMark({
  className,
  size = 36,
}: {
  className?: string;
  size?: number;
}) {
  return (
    <svg
      viewBox="0 0 36 36"
      width={size}
      height={size}
      fill="none"
      xmlns="http://www.w3.org/2000/svg"
      className={cn("shrink-0", className)}
      aria-hidden
    >
      <defs>
        <linearGradient id="dn-gradient" x1="6" y1="4" x2="30" y2="32">
          <stop stopColor="oklch(0.48 0.2 255)" />
          <stop offset="1" stopColor="oklch(0.58 0.2 285)" />
        </linearGradient>
      </defs>
      <rect width="36" height="36" rx="10" fill="url(#dn-gradient)" />
      {/* Document outline */}
      <path
        d="M11 9h10l4 4v14a1.5 1.5 0 0 1-1.5 1.5h-12A1.5 1.5 0 0 1 10 27V10.5A1.5 1.5 0 0 1 11.5 9H11Z"
        fill="white"
        fillOpacity="0.92"
      />
      <path d="M21 9v4h4" stroke="white" strokeOpacity="0.5" strokeWidth="1" />
      {/* Scan line */}
      <rect x="12" y="16" width="12" height="1.5" rx="0.75" fill="oklch(0.48 0.2 255)" />
      <rect x="12" y="20" width="8" height="1" rx="0.5" fill="oklch(0.48 0.2 255)" fillOpacity="0.5" />
      {/* Data node */}
      <circle cx="26" cy="26" r="5" fill="white" fillOpacity="0.95" />
      <circle cx="26" cy="26" r="2" fill="url(#dn-gradient)" />
    </svg>
  );
}
