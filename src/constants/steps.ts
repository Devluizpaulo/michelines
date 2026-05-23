export interface Step {
  number: string
  title: string
  description: string
  details: string
}

export const stepsData: Step[] = [
  {
    number: "01",
    title: "Cadastro Rápido",
    description: "Envie seus documentos básicos (CNH com EAR) via formulário ou WhatsApp em apenas 2 minutos.",
    details: "Requisitos fundamentais: Ter mais de 18 anos, CNH ativa na categoria B com EAR e certidão negativa de antecedentes criminais."
  },
  {
    number: "02",
    title: "Análise Descomplicada",
    description: "Nossa equipe faz uma análise ágil e humanizada, sem burocracia excessiva e sem travas de score de crédito.",
    details: "Valorizamos seu esforço de trabalhar. Nosso foco é validar a CNH e a documentação básica para te colocar na rua rápido."
  },
  {
    number: "03",
    title: "Escolha do Veículo",
    description: "Escolha o modelo ideal no nosso showroom — de sedans econômicos a híbridos premium equipados com GNV.",
    details: "Você escolhe a categoria de acordo com seu orçamento de diária, perfil de passageiro e meta de faturamento diário."
  },
  {
    number: "04",
    title: "Retirada em 24 Horas",
    description: "Assine o contrato digital transparente e retire o carro revisado, higienizado, segurado e pronto para faturar.",
    details: "Veículos com IPVA pago, seguro completo e manutenção preventiva programada inclusa para você rodar sem dor de cabeça."
  },
  {
    number: "05",
    title: "Fature com Liberdade",
    description: "Acesse corredores de ônibus, ganhe fila prioritária D-Taxi nos aeroportos e fique com 100% do seu lucro líquido.",
    details: "Suporte 24h físico e jurídico grátis. Participe do nosso ecossistema de motoristas com consultoria de rotas lucrativas."
  }
]
