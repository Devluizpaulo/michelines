"use client"
import Link from "next/link"
import Image from "next/image"
import { X } from "lucide-react"
import { Button } from "@/components/ui/button"

interface MobileMenuProps {
  isOpen: boolean
  onClose: () => void
}

export default function MobileMenu({ isOpen, onClose }: MobileMenuProps) {
  if (!isOpen) return null

  return (
    <div className="fixed inset-0 bg-white z-50 overflow-y-auto">
      <div className="flex justify-between items-center p-4 border-b">
        <Link href="/" onClick={onClose}>
          <Image
            src="/images/logos/logo-grupo-michelines.png"
            alt="Logo Grupo Micheline's"
            width={200}
            height={60}
            className="h-12 w-auto"
          />
        </Link>
        <button onClick={onClose} className="p-2">
          <X className="h-6 w-6" />
        </button>
      </div>

      <nav className="p-4">
        <ul className="space-y-4">
          <li>
            <Link href="#sobre" className="block py-2 text-lg font-medium border-b border-gray-100" onClick={onClose}>
              Sobre Nós
            </Link>
          </li>
          <li>
            <Link
              href="#beneficios"
              className="block py-2 text-lg font-medium border-b border-gray-100"
              onClick={onClose}
            >
              Benefícios
            </Link>
          </li>
          <li>
            <Link
              href="#veiculos"
              className="block py-2 text-lg font-medium border-b border-gray-100"
              onClick={onClose}
            >
              Veículos
            </Link>
          </li>
          <li>
            <Link
              href="#depoimentos"
              className="block py-2 text-lg font-medium border-b border-gray-100"
              onClick={onClose}
            >
              Depoimentos
            </Link>
          </li>
          <li>
            <Link href="#contato" className="block py-2 text-lg font-medium border-b border-gray-100" onClick={onClose}>
              Contato
            </Link>
          </li>
        </ul>

        <div className="mt-8">
          <Link href="/cadastro" onClick={onClose}>
            <Button className="w-full mb-4">Seja um Motorista</Button>
          </Link>
          <Link href="/login" onClick={onClose}>
            <Button variant="outline" className="w-full">
              Acesso Administrativo
            </Button>
          </Link>
        </div>
      </nav>
    </div>
  )
}
