import type { MetadataRoute } from "next";
import { getSiteUrl } from "@/lib/copy";

const routes = ["/", "/pricing", "/about", "/contact", "/privacy", "/terms", "/signup", "/login"];

export default function sitemap(): MetadataRoute.Sitemap {
  const base = getSiteUrl();
  const now = new Date();

  return routes.map((path) => ({
    url: `${base}${path}`,
    lastModified: now,
    changeFrequency: path === "/" ? "weekly" : "monthly",
    priority: path === "/" ? 1 : path === "/pricing" || path === "/about" ? 0.9 : 0.6,
  }));
}
