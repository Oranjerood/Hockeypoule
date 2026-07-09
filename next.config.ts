import type { NextConfig } from "next";
import createNextIntlPlugin from "next-intl/plugin";

const withNextIntl = createNextIntlPlugin("./src/i18n/request.ts");

// Security headers applied to every response. These are the standard
// defense-in-depth headers recommended for any public web app: they don't
// require a backend and cost nothing, but they close off a whole class of
// browser-side attacks (clickjacking, MIME sniffing, leaking full referrer
// URLs to third parties, unwanted camera/mic/geolocation access, etc.).
const securityHeaders = [
  // Prevent the site from being framed by another origin (clickjacking).
  { key: "X-Frame-Options", value: "DENY" },
  // Stop browsers from guessing ("sniffing") content types.
  { key: "X-Content-Type-Options", value: "nosniff" },
  // Only send the origin (not the full URL/path) as referrer to other sites.
  { key: "Referrer-Policy", value: "strict-origin-when-cross-origin" },
  // This app never needs camera/mic/geolocation/USB access - disable it.
  { key: "Permissions-Policy", value: "camera=(), microphone=(), geolocation=(), usb=()" },
  // Force HTTPS for a full year, including subdomains.
  { key: "Strict-Transport-Security", value: "max-age=63072000; includeSubDomains; preload" },
];

const nextConfig: NextConfig = {
  async headers() {
    return [
      {
        source: "/:path*",
        headers: securityHeaders,
      },
    ];
  },
};

export default withNextIntl(nextConfig);
