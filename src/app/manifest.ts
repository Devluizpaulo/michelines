import { MetadataRoute } from 'next'

export default function manifest(): MetadataRoute.Manifest {
  return {
    name: "Grupo Michelines",
    short_name: "Michelines",
    description: "45 Anos de Tradição em Táxis",
    start_url: '/',
    display: 'standalone',
    background_color: '#ffffff',
    theme_color: '#2563eb',
    icons: [
      {
        src: '/images/logos/logo-grupo-michelines.png',
        sizes: '192x192',
        type: 'image/png',
      },
      {
        src: '/images/logos/logo-grupo-michelines.png',
        sizes: '512x512',
        type: 'image/png',
      },
    ],
  }
}
