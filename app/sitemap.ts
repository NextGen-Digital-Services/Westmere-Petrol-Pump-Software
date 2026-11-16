import { MetadataRoute } from "next";

export default function sitemap(): MetadataRoute.Sitemap {
  const baseUrl = "https://petroflow.vercel.app";
  const routes = [
    "",
    "/sales",
    "/shifts",
    "/dispensers",
    "/inventory",
    "/purchases",
    "/customers",
    "/suppliers",
    "/expenses",
    "/employees",
    "/reports",
    "/financials",
    "/reconciliation",
    "/notifications",
    "/permissions",
    "/audit",
    "/settings",
  ];

  return routes.map((route) => ({
    url: `${baseUrl}${route}`,
    lastModified: new Date(),
    changeFrequency: "hourly",
    priority: route === "" ? 1.0 : 0.8,
  }));
}
