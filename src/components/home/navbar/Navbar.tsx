"use client"

import { useState, useEffect } from "react"
import Link from "next/link"
import Image from "next/image"
import { Lock, Menu, Sparkles } from "lucide-react"
import { Button } from "@/components/ui/button"
import { LandingSettings } from "@/types/landing"
import { Sheet, SheetContent, SheetDescription, SheetHeader, SheetTitle, SheetTrigger } from "@/components/ui/sheet"

interface NavbarProps {
  landingSettings: LandingSettings
}

export function Navbar({ landingSettings }: NavbarProps) {
  const [mobileOpen, setMobileOpen] = useState(false)
  const [scrolled, setScrolled] = useState(false)

  // Rolagem para fixar cabeçalho com fundo
  useEffect(() => {
    const handleScroll = () => {
      setScrolled(window.scrollY > 30)
    }
    window.addEventListener("scroll", handleScroll)
    return () => window.removeEventListener("scroll", handleScroll)
  }, [])

  return (
    <>
      <header className="fixed top-0 left-0 right-0 z-50 w-full flex flex-col items-center pointer-events-none select-none">
        
        {/* Dynamic Campaign Banner from Admin - light blue slate theme */}
        {landingSettings.showCampaignBanner && !scrolled && (
          <div className="w-full pointer-events-auto bg-sky-50 border-b border-sky-100 py-2.5 px-4 text-center text-xs font-bold text-sky-800 tracking-wide flex items-center justify-center gap-2 shadow-sm transition-opacity duration-300">
            <Sparkles className="h-3.5 w-3.5 text-sky-600 animate-pulse" />
            <span>{landingSettings.campaignText}</span>
            <span className="bg-sky-100 text-sky-700 border border-sky-300 text-[9px] px-2 py-0.5 rounded-full font-black uppercase tracking-wider">Informativo</span>
          </div>
        )}

        <div className="w-full flex justify-center">
          <div
            className={`pointer-events-auto flex items-center justify-between transition-all duration-500 ease-out ${
              scrolled
                ? "mt-4 w-[92%] sm:w-[88%] max-w-6xl bg-white/90 backdrop-blur-md border border-slate-200 shadow-[0_8px_30px_rgba(15,23,42,0.06)] rounded-2xl px-6 py-3"
                : "w-full bg-transparent border-b border-transparent px-6 lg:px-12 py-6"
            }`}
          >
            {/* Logo and institutional badge */}
            <Link href="/" className="flex items-center gap-2 group relative transition-transform duration-300 hover:scale-[1.01]">
              <div className="bg-white p-2 rounded-xl flex items-center justify-center shadow-sm border border-slate-150">
                <Image
                  src="/images/logos/logo-grupo-michelines.png"
                  alt="Logo Grupo Micheline's"
                  width={140}
                  height={40}
                  className="h-7 sm:h-8 w-auto object-contain"
                  priority
                />
              </div>
              {/* Institutional 45 Years Badge - Premium gradient styling */}
              {/* Institutional 45 Years Badge - Premium gradient styling */}
              <span className={`text-[10px] font-extrabold px-2.5 py-0.5 rounded-full uppercase tracking-wider ml-3 shadow-sm border ${
                scrolled
                  ? "text-sky-700 bg-gradient-to-r from-sky-50 to-indigo-50/50 border-sky-200"
                  : "text-white bg-white/10 border-white/20"
              }`}>
                45 Anos
              </span>
            </Link>

            {/* Desktop Navigation - Clean typography */}
            <nav className="hidden md:flex items-center gap-8">
              {[
                { label: "D-Taxi", href: "/d-taxi-congonhas" },
                { label: "Simulador", href: "/#simulador" },
                { label: "Como Funciona", href: "/#como-funciona" },
                { label: "Showroom", href: "/#showroom" },
                { label: "Acessível", href: "/#acessivel" },
                { label: "Vantagens", href: "/#vantagens" },
                { label: "Cases", href: "/#cases" },
                { label: "FAQ", href: "/#faq" }
              ].map((item) => (
                <Link
                  key={item.label}
                  href={item.href}
                  className={`text-sm font-semibold transition-colors duration-300 relative group py-1.5 ${
                    scrolled 
                      ? "text-slate-650 hover:text-sky-600" 
                      : "text-white/80 hover:text-white"
                  }`}
                >
                  {item.label}
                  <span className={`absolute left-0 bottom-0 w-0 h-[2px] transition-all duration-300 group-hover:w-full ${
                    scrolled ? "bg-sky-600" : "bg-white"
                  }`}></span>
                </Link>
              ))}
            </nav>

            {/* Actions - Luxury Rounded CTAs with micro translate */}
            <div className="hidden md:flex items-center gap-4">
              <Link href="/cadastro">
                <Button className="bg-sky-600 hover:bg-sky-500 text-white rounded-2xl px-6 text-xs font-bold shadow-sm hover:shadow-md transition-all duration-300 hover:-translate-y-0.5 active:translate-y-0 h-10">
                  Fazer Cadastro
                </Button>
              </Link>
              <Link href="/login">
                <Button variant="ghost" size="icon" className={`rounded-2xl w-10 h-10 transition-all duration-300 hover:scale-105 border ${
                  scrolled 
                    ? "text-slate-500 hover:text-sky-600 hover:bg-slate-50 border-slate-200" 
                    : "text-white/80 hover:text-white hover:bg-white/10 border-white/20"
                }`}>
                  <Lock className="h-4 w-4" />
                  <span className="sr-only">Login Administrativo</span>
                </Button>
              </Link>
            </div>

            {/* Mobile Sheet Trigger */}
            <Sheet open={mobileOpen} onOpenChange={setMobileOpen}>
              <SheetTrigger asChild>
                <button className={`md:hidden p-2.5 rounded-2xl transition-all duration-300 active:scale-95 shadow-sm border ${
                  scrolled 
                    ? "text-slate-600 hover:text-sky-600 bg-slate-50 border-slate-200" 
                    : "text-white/80 hover:text-white bg-white/10 border-white/20"
                }`}>
                  <Menu className="h-5 w-5" />
                </button>
              </SheetTrigger>
              <SheetContent side="right" className="bg-white border-l border-slate-200 text-slate-900 w-80 shadow-2xl flex flex-col justify-between p-6">
                <div className="space-y-6">
                  <SheetHeader className="border-b border-slate-100 pb-4 text-left">
                    <SheetTitle className="text-slate-900 font-black">Grupo Michelines</SheetTitle>
                    <SheetDescription className="text-slate-500 text-xs font-semibold">Parceiro Oficial de Mobilidade</SheetDescription>
                  </SheetHeader>
                  
                  <nav className="flex flex-col gap-3">
                    {[
                      { label: "D-Taxi Congonhas ✈️", href: "/d-taxi-congonhas" },
                      { label: "Simulador de Ganhos", href: "/#simulador" },
                      { label: "Como Funciona", href: "/#como-funciona" },
                      { label: "Showroom da Frota", href: "/#showroom" },
                      { label: "Táxi Acessível ♿", href: "/#acessivel" },
                      { label: "Benefícios do Táxi", href: "/#vantagens" },
                      { label: "Cases Reais", href: "/#cases" },
                      { label: "FAQ", href: "/#faq" }
                    ].map((item) => (
                      <Link
                        key={item.label}
                        href={item.href}
                        onClick={() => setMobileOpen(false)}
                        className="text-sm font-semibold text-slate-600 hover:text-sky-600 py-2.5 px-3 rounded-xl hover:bg-slate-50 transition-all text-left"
                      >
                        {item.label}
                      </Link>
                    ))}
                  </nav>
                </div>

                <div className="flex flex-col gap-3 pt-6 border-t border-slate-100">
                  <Link href="/cadastro" onClick={() => setMobileOpen(false)}>
                    <Button className="w-full bg-sky-600 hover:bg-sky-500 text-white h-11 text-xs font-bold rounded-2xl shadow-sm hover:shadow">
                      Seja um Motorista
                    </Button>
                  </Link>
                  <Link href="/login" onClick={() => setMobileOpen(false)}>
                    <Button variant="outline" className="w-full h-11 text-xs font-bold rounded-2xl border-slate-200 bg-slate-50 text-slate-700 hover:bg-slate-100">
                      Acesso Administrativo
                    </Button>
                  </Link>
                </div>
              </SheetContent>
            </Sheet>

          </div>
        </div>

      </header>
    </>
  )
}
