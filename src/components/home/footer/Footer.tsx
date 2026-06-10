"use client"

import Link from "next/link"
import Image from "next/image"
import { MapPin, Phone, Mail, ArrowRight } from "lucide-react"
import { Button } from "@/components/ui/button"

export function Footer() {
  return (
    <footer className="bg-transparent text-sky-100/80 py-16 md:py-20 relative z-10 select-none">
      <div className="container mx-auto px-6 lg:px-12">
        {/* Footer main links and info */}
        <div className="grid md:grid-cols-12 gap-12 lg:gap-16 mb-16">

          {/* Column 1: Brand Info */}
          <div className="md:col-span-5 lg:col-span-4 space-y-6">
            <div className="bg-white p-3 rounded-2xl inline-flex items-center justify-center shadow-sm select-none">
              <Image
                src="/images/logos/logo-grupo-michelines.png"
                alt="Logo Grupo Michelines"
                width={290}
                height={55}
                className="h-11 w-auto opacity-100 object-contain"
              />
            </div>
            <p className="text-xs leading-relaxed text-sky-200/80 font-semibold text-justify">
              Grupo Michelines: há mais de 45 anos impulsionando a carreira de motoristas em São Paulo. Especialistas em frotas de táxi premium com suporte total e rentabilidade superior.
            </p>
            <p className="text-sky-400 font-extrabold text-xs tracking-wider uppercase">
              Excelência e mobilidade premium desde 1980.
            </p>

            {/* Logos parceiros homologados */}
            <div className="pt-4 border-t border-white/10 flex flex-wrap gap-2.5">
              <span className="text-[9px] font-black text-sky-200 bg-white/10 border border-white/10 px-3 py-1 rounded-full uppercase tracking-wider shadow-sm">ADETAXI SP</span>
              <span className="text-[9px] font-black text-indigo-200 bg-white/10 border border-white/10 px-3 py-1 rounded-full uppercase tracking-wider shadow-sm">D-TAXI CONGONHAS</span>
            </div>
          </div>

          {/* Column 2: Direct Contact */}
          <div className="md:col-span-4 space-y-6">
            <h4 className="text-white font-black text-xs uppercase tracking-widest">Contato Direto</h4>
            <ul className="space-y-4 text-xs font-semibold">
              <li className="flex items-start gap-3">
                <MapPin className="h-4.5 w-4.5 text-sky-600 shrink-0 mt-0.5" />
                <div>
                  <p className="font-bold text-white">Rua Contos Gauchescos, 165</p>
                  <p className="text-sky-300/80 text-[10px]">Vila Santa Catarina, São Paulo - SP</p>
                </div>
              </li>
              <li className="flex items-center gap-3">
                <Phone className="h-4.5 w-4.5 text-sky-600 shrink-0" />
                <span className="font-bold text-white">+55 11 94483-0851</span>
              </li>
              <li className="flex items-center gap-3">
                <Mail className="h-4.5 w-4.5 text-sky-600 shrink-0" />
                <span className="text-sky-100">contato@grupomichelines.com.br</span>
              </li>
            </ul>
          </div>

          {/* Column 3: Quick Links */}
          <div className="md:col-span-3 lg:col-span-4 space-y-6">
            <h4 className="text-white font-black text-xs uppercase tracking-widest">Acesso Rápido</h4>
            <div className="grid grid-cols-2 gap-x-3 gap-y-2.5 text-xs font-bold">
              {[
                { label: "Simulador", href: "/#simulador" },
                { label: "Como Funciona", href: "/#como-funciona" },
                { label: "Showroom", href: "/#showroom" },
                { label: "Acessível", href: "/#acessivel" },
                { label: "Vantagens", href: "/#vantagens" },
                { label: "Cases Reais", href: "/#cases" },
                { label: "FAQ", href: "/#faq" },
                { label: "Cadastro", href: "/cadastro" },
                { label: "Login Admin", href: "/login" }
              ].map(link => (
                <Link
                  key={link.label}
                  href={link.href}
                  className="text-sky-200/80 hover:text-white transition-all duration-300 hover:translate-x-0.5"
                >
                  {link.label}
                </Link>
              ))}
            </div>

            {/* Safety Badges */}
            <div className="pt-4 border-t border-white/10">
              <div className="bg-white/10 border border-white/10 px-4 py-2.5 rounded-2xl flex items-center gap-3 shadow-sm inline-flex">
                <span className="w-2 h-2 rounded-full bg-emerald-500 animate-pulse"></span>
                <span className="text-[9px] font-black text-sky-200 tracking-wider uppercase">Plataforma Segura e Homologada</span>
              </div>
            </div>
          </div>

        </div>

        {/* Footer credits and legal terms */}
        <div className="pt-8 border-t border-white/10 flex flex-col md:flex-row justify-between items-center gap-4 text-[10px] text-sky-300/60 font-semibold">
          <p>© {new Date().getFullYear()} Grupo Michelines. Todos os direitos reservados.</p>
          <div className="flex gap-6">
            <Link href="#" className="hover:text-white transition-colors">Termos de Uso</Link>
            <Link href="#" className="hover:text-white transition-colors">Diretrizes de Privacidade</Link>
          </div>
        </div>
      </div>
    </footer>
  )
}
