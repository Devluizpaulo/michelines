import Link from "next/link"
import Image from "next/image"
import { Button } from "@/components/ui/button"
import { LandingSettings } from "@/types/landing"

interface CampaignBannerProps {
  landingSettings: LandingSettings
}

export function CampaignBanner({ landingSettings }: CampaignBannerProps) {
  if (!landingSettings.showCampaignBanner) return null

  return (
    <section className="w-full py-16 bg-white border-b border-slate-200/60 relative overflow-hidden select-none">
      {/* Ambient glows behind the banner */}
      <div className="absolute inset-0 bg-grid-slate-900/[0.01] pointer-events-none" />
      <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-[600px] h-[300px] bg-sky-500/[0.03] rounded-full blur-[120px] pointer-events-none" />

      <div className="container mx-auto px-6 max-w-5xl">
        {landingSettings.campaignTemplateId === 1 && (
          <div className="bg-gradient-to-r from-sky-50/80 to-indigo-50/50 border border-sky-100 rounded-3xl p-6 md:p-10 flex flex-col md:flex-row items-center gap-8 shadow-sm relative overflow-hidden">
            <div className="flex-1 space-y-4 text-left relative z-10">
              <span className="bg-sky-100 text-sky-700 border border-sky-200 text-[10px] font-black uppercase px-2.5 py-1 rounded-full tracking-wider">
                Campanha D-TAXI
              </span>
              <h3 className="text-2xl md:text-3xl font-black text-slate-900 leading-tight">
                {landingSettings.campaignText || "Alugue seu Corolla Cross com Fila D-TAXI!"}
              </h3>
              <p className="text-slate-600 text-sm md:text-base leading-relaxed font-medium">
                {landingSettings.campaignSubtitle || "Fature alto no aeroporto de Congonhas. Retirada rápida em 24 horas."}
              </p>
              <div className="pt-2">
                <Link href={landingSettings.campaignBtnUrl || "/cadastro"}>
                  <Button className="bg-sky-600 hover:bg-sky-500 text-white rounded-2xl font-bold px-6 h-11 transition-all shadow-sm hover:shadow">
                    {landingSettings.campaignBtnText || "Quero Aproveitar"}
                  </Button>
                </Link>
              </div>
            </div>
            <div className="w-full md:w-[320px] h-[200px] relative rounded-2xl overflow-hidden shrink-0 shadow-sm border border-slate-200 bg-white">
              <Image 
                src="/images/banners/banner-1.png" 
                alt="Promo Corolla Cross"
                fill
                className="object-cover"
              />
            </div>
          </div>
        )}

        {landingSettings.campaignTemplateId === 2 && (
          <div className="bg-gradient-to-r from-amber-50/80 to-orange-50/50 border border-amber-100 rounded-3xl p-6 md:p-10 flex flex-col md:flex-row items-center gap-8 shadow-sm relative overflow-hidden">
            <div className="flex-1 space-y-4 text-left relative z-10">
              <span className="bg-amber-100 text-amber-800 border border-amber-200 text-[10px] font-black uppercase px-2.5 py-1 rounded-full tracking-wider">
                Destaque Exclusivo
              </span>
              <h3 className="text-2xl md:text-3xl font-black text-slate-900 leading-tight">
                {landingSettings.campaignText || "Taxa Zero: 3 Diárias Grátis para Começar!"}
              </h3>
              <p className="text-slate-600 text-sm md:text-base leading-relaxed font-medium">
                {landingSettings.campaignSubtitle || "Inscreva-se hoje e aproveite as condições especiais sem comprovante de score."}
              </p>
              <div className="pt-2">
                <Link href={landingSettings.campaignBtnUrl || "/cadastro"}>
                  <Button className="bg-amber-600 hover:bg-amber-500 text-white rounded-2xl font-bold px-6 h-11 transition-all shadow-sm hover:shadow">
                    {landingSettings.campaignBtnText || "Quero Aproveitar"}
                  </Button>
                </Link>
              </div>
            </div>
            <div className="w-full md:w-[320px] h-[200px] relative rounded-2xl overflow-hidden shrink-0 shadow-sm border border-amber-200 bg-white">
              <Image 
                src="/images/banners/banner-2.png" 
                alt="Promo Taxa Zero"
                fill
                className="object-cover"
              />
            </div>
          </div>
        )}

        {landingSettings.campaignTemplateId === 3 && (
          <div className="bg-gradient-to-r from-emerald-50/80 to-teal-50/50 border border-emerald-100 rounded-3xl p-6 md:p-10 flex flex-col md:flex-row items-center gap-8 shadow-sm relative overflow-hidden">
            <div className="flex-1 space-y-4 text-left relative z-10">
              <span className="bg-emerald-100 text-emerald-800 border border-emerald-200 text-[10px] font-black uppercase px-2.5 py-1 rounded-full tracking-wider">
                Mobilidade Híbrida Eco
              </span>
              <h3 className="text-2xl md:text-3xl font-black text-slate-900 leading-tight">
                {landingSettings.campaignText || "Economize até R$ 2.000 com Corolla Híbrido + GNV"}
              </h3>
              <p className="text-slate-600 text-sm md:text-base leading-relaxed font-medium">
                {landingSettings.campaignSubtitle || "Tecnologia de ponta para rodar mais gastando muito menos combustível."}
              </p>
              <div className="pt-2">
                <Link href={landingSettings.campaignBtnUrl || "/cadastro"}>
                  <Button className="bg-emerald-600 hover:bg-emerald-500 text-white rounded-2xl font-bold px-6 h-11 transition-all shadow-sm hover:shadow">
                    {landingSettings.campaignBtnText || "Quero Aproveitar"}
                  </Button>
                </Link>
              </div>
            </div>
            <div className="w-full md:w-[320px] h-[200px] relative rounded-2xl overflow-hidden shrink-0 shadow-sm border border-emerald-200 bg-white">
              <Image 
                src="/images/banners/banner-3.png" 
                alt="Promo Híbridos"
                fill
                className="object-cover"
              />
            </div>
          </div>
        )}
      </div>
    </section>
  )
}
