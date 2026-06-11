import { Polar } from "@polar-sh/sdk";

let polar: Polar | null = null;

export function getPolarServer(): "sandbox" | "production" {
  return process.env.POLAR_SERVER === "production" ? "production" : "sandbox";
}

export function getPolar(): Polar | null {
  const accessToken = process.env.POLAR_ACCESS_TOKEN?.trim();
  if (!accessToken) return null;
  if (!polar) {
    polar = new Polar({
      accessToken,
      server: getPolarServer(),
    });
  }
  return polar;
}

export function getSiteUrl(): string {
  return process.env.NEXT_PUBLIC_SITE_URL ?? "http://localhost:3000";
}
