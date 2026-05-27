import withPWAInit from "@ducanh2912/next-pwa";

const withPWA = withPWAInit({
  dest: "public",
  disable: process.env.NODE_ENV === "development",
});

/** @type {import('next').NextConfig} */
const nextConfig = {
  typescript: {
    ignoreBuildErrors: true,
  },
  images: {
    // Habilita otimização para imagens do Supabase Storage
    remotePatterns: [
      {
        protocol: "https",
        hostname: "cbynwzxalzcaownnouwp.supabase.co",
        pathname: "/storage/v1/**",
      },
      {
        // Fallback para outros domínios externos (Firebase Storage, etc.)
        protocol: "https",
        hostname: "*.googleapis.com",
        pathname: "/**",
      },
      {
        protocol: "https",
        hostname: "*.googleusercontent.com",
        pathname: "/**",
      },
    ],
    // Formatos modernos para melhor performance
    formats: ["image/avif", "image/webp"],
    // Cache de imagens por 1 hora
    minimumCacheTTL: 3600,
  },
}

export default withPWA(nextConfig);
