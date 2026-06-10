export interface Step {
  number: string
  title: string
  description: string
  details: string
}

export const stepsData: Step[] = [
  {
    number: "01",
    title: "Cadastro Inicial",
    description:
      "Envie seus documentos básicos pelo formulário ou WhatsApp de forma rápida e prática.",
    details:
      "Requisitos principais: CNH categoria B com EAR, documentação pessoal regularizada e disponibilidade para atuação na operação táxi."
  },

  {
    number: "02",
    title: "Análise de Cadastro",
    description:
      "Nossa equipe realiza uma análise simples e humanizada, focada no perfil operacional do motorista.",
    details:
      "Buscamos reduzir burocracias desnecessárias para agilizar sua entrada na operação."
  },

  {
    number: "03",
    title: "Escolha do Veículo",
    description:
      "Escolha o modelo ideal para sua rotina entre veículos executivos, híbridos, econômicos e opções com GNV.",
    details:
      "Nossa equipe auxilia na escolha do veículo mais adequado ao seu perfil de operação e objetivo de faturamento."
  },

  {
    number: "04",
    title: "Assinatura e Retirada",
    description:
      "Após aprovação do cadastro, você assina o contrato e retira o veículo pronto para operação.",
    details:
      "Os veículos são entregues revisados, higienizados e com suporte operacional da frota."
  },

  {
    number: "05",
    title: "Comece sua Operação",
    description:
      "Inicie sua rotina com suporte da frota, assistência 24h e estrutura preparada para o dia a dia da operação de táxi.",
    details:
      "A frota oferece manutenção própria, suporte operacional, assistência com guincho e acompanhamento em caso de necessidade."
  }
]