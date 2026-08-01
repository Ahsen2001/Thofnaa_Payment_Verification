/** @type {import('next').NextConfig} */
const nextConfig = {
  reactStrictMode: true,

  // ── Security Headers ────────────────────────────────────────────────────────
  // Applied to every response. Harden the browser's trust model.
  async headers() {
    return [
      {
        source: "/(.*)",
        headers: [
          // Prevent browsers from MIME-sniffing away from declared Content-Type
          { key: "X-Content-Type-Options", value: "nosniff" },

          // Disallow embedding this site in iframes (clickjacking protection)
          { key: "X-Frame-Options", value: "DENY" },

          // Stop leaking the referrer URL when navigating to external sites
          { key: "Referrer-Policy", value: "strict-origin-when-cross-origin" },

          // Only allow HTTPS in production (1 year + preload)
          {
            key: "Strict-Transport-Security",
            value: "max-age=31536000; includeSubDomains; preload",
          },

          // Disable browser features that THOFNAA doesn't use
          {
            key: "Permissions-Policy",
            value: "camera=(), microphone=(), geolocation=(), payment=()",
          },

          // Content Security Policy — restricts where scripts/styles/fonts can load from
          {
            key: "Content-Security-Policy",
            value: [
              "default-src 'self'",
              // Allow Next.js inline scripts and Supabase SSR
              "script-src 'self' 'unsafe-inline' 'unsafe-eval'",
              // Allow Tailwind inline styles
              "style-src 'self' 'unsafe-inline' https://fonts.googleapis.com",
              // Google Fonts
              "font-src 'self' https://fonts.gstatic.com",
              // Supabase storage for proof images + placeholder images
              "img-src 'self' data: blob: https://*.supabase.co https://images.unsplash.com",
              // Supabase API + auth
              "connect-src 'self' https://*.supabase.co wss://*.supabase.co",
              // Resend (email delivery — server-to-server, no browser connection needed)
              "frame-src 'none'",
              "object-src 'none'",
              "base-uri 'self'",
              "form-action 'self'",
            ].join("; "),
          },
        ],
      },

      // ── Extra headers for admin proof images served from Supabase Storage ──
      {
        source: "/api/:path*",
        headers: [
          { key: "X-Content-Type-Options", value: "nosniff" },
          { key: "Cache-Control", value: "no-store, no-cache, must-revalidate" },
        ],
      },
    ];
  },

  // ── Image Domains ───────────────────────────────────────────────────────────
  images: {
    remotePatterns: [
      {
        protocol: "https",
        hostname: "**.supabase.co",
        pathname: "/storage/v1/**",
      },
      // Unsplash placeholder images (demo / development only)
      {
        protocol: "https",
        hostname: "images.unsplash.com",
      },
    ],
  },
};

export default nextConfig;
