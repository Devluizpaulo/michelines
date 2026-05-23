"use client"

import { useState } from "react"
import Link from "next/link"
import Image from "next/image"
import { Lock } from "lucide-react"
import { usePathname } from "next/navigation"

export default function AdminAccessButton() {
  const pathname = usePathname()
  const [isHovered, setIsHovered] = useState(false)

  if (pathname !== "/") return null

  return (
    <div className="fixed bottom-20 right-4 z-40">
      <Link href="/login">
        <button
          className="flex items-center justify-center bg-blue-600 hover:bg-blue-700 text-white rounded-full w-12 h-12 shadow-lg transition-all duration-300"
          onMouseEnter={() => setIsHovered(true)}
          onMouseLeave={() => setIsHovered(false)}
        >
          <Lock className="h-5 w-5" />
          {isHovered && (
            <div className="absolute right-14 bg-white text-gray-800 text-xs px-3 py-2 rounded shadow-md whitespace-nowrap flex items-center">
              <Image
                src="/images/logos/logo-grupo-michelines.png"
                alt="Logo Grupo Michelines"
                width={80}
                height={30}
                className="h-5 w-auto mr-2"
              />
              <span>Acesso Administrativo</span>
            </div>
          )}
        </button>
      </Link>
    </div>
  )
}
