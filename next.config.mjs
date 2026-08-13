import withPWAInit from "@ducanh2912/next-pwa";

/**
 * PWA restrito ao painel administrativo.
 *
 * `register: false` impede o next-pwa de injetar o registro do service worker em
 * todas as páginas — quem registra é o <AdminPWA/>, com escopo "/admin/". Assim o
 * site institucional continua sendo um site comum (sem SW, sem manifest, sem
 * prompt de instalação) e só a intranet funciona como app instalável.
 */
const withPWA = withPWAInit({
  dest: "public",
  disable: process.env.NODE_ENV === "development",
  register: false,
  scope: "/admin/",
  // A nova versão fica em "waiting" até o usuário confirmar no aviso do painel,
  // em vez de recarregar a intranet sozinha no meio de um formulário. Com este
  // valor o next-pwa injeta no sw.js o listener da mensagem SKIP_WAITING, que é
  // o que o botão "Atualizar" do <AdminPWA/> dispara.
  skipWaiting: false,
  reloadOnOnline: true,
  cacheOnFrontEndNav: true,
  // O precache é do painel, não do site: as imagens institucionais somam
  // dezenas de MB de PNG e nenhuma delas é usada pela intranet.
  publicExcludes: [
    "!images/**/*",
    "!icons/**/*",
    "!*.webmanifest",
  ],
  workboxOptions: {
    // Precisa ser repetido aqui: o `skipWaiting` de nível superior não chega ao
    // workbox-build, que por padrão emitiria `self.skipWaiting()` no bundle.
    skipWaiting: false,
    clientsClaim: false,
    // Sem fallback de navegação: o painel exige rede para autenticar, e um
    // shell offline serviria uma tela de login que não funciona.
    navigateFallback: undefined,
    exclude: [/\.map$/, /^manifest.*\.js$/],
    runtimeCaching: [
      {
        // Chamadas de API e Firestore precisam ser sempre frescas
        urlPattern: /^https:\/\/(firestore|identitytoolkit|securetoken)\.googleapis\.com\/.*/i,
        handler: "NetworkOnly",
      },
      {
        urlPattern: /\/api\/.*/i,
        handler: "NetworkOnly",
      },
      {
        // Imagens do Supabase Storage: cache longo, revalidando em segundo plano
        urlPattern: /^https:\/\/[a-z0-9]+\.supabase\.co\/storage\/v1\/object\/public\/.*/i,
        handler: "StaleWhileRevalidate",
        options: {
          cacheName: "supabase-media",
          expiration: { maxEntries: 200, maxAgeSeconds: 30 * 24 * 60 * 60 },
        },
      },
    ],
  },
});

/** @type {import('next').NextConfig} */
const nextConfig = {
  reactStrictMode: true,
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
  async headers() {
    return [
      {
        // O painel nunca deve ser indexado nem embutido em iframe de terceiros
        source: "/admin/:path*",
        headers: [
          { key: "X-Robots-Tag", value: "noindex, nofollow" },
          { key: "X-Frame-Options", value: "DENY" },
          { key: "Referrer-Policy", value: "strict-origin-when-cross-origin" },
        ],
      },
      {
        source: "/api/:path*",
        headers: [
          { key: "Cache-Control", value: "no-store" },
          { key: "X-Content-Type-Options", value: "nosniff" },
        ],
      },
    ];
  },
};

export default withPWA(nextConfig);
