/**
 * Grupo Micheline's Design System Theme Tokens
 * Enterprise Premium Light Theme (Apple, Stripe, Linear & Volvo inspired)
 */

export const THEME_TOKENS = {
  // Border Radius Options
  radius: {
    dialog: "rounded-3xl",
    panel: "rounded-2xl",
    card: "rounded-xl",
    input: "rounded-lg",
    button: "rounded-lg",
    badge: "rounded-full",
    inner: "rounded-md"
  },

  // Spacing Scale
  spacing: {
    container: "px-4 sm:px-6 lg:px-8 py-6 lg:py-8 space-y-6 lg:space-y-8",
    card: "p-5 sm:p-6",
    list: "space-y-3",
    grid: "gap-4 sm:gap-6",
    flex: "gap-3 sm:gap-4"
  },

  // Shadows (Stripe-like depth levels)
  shadows: {
    sm: "shadow-[0_1px_2px_rgba(0,0,0,0.02)]",
    md: "shadow-[0_4px_12px_rgba(0,0,0,0.03),0_1px_2px_rgba(0,0,0,0.02)]",
    lg: "shadow-[0_10px_30px_rgba(0,0,0,0.04),0_1px_8px_rgba(0,0,0,0.02)]",
    hover: "hover:shadow-[0_12px_36px_rgba(0,0,0,0.06),0_1px_4px_rgba(0,0,0,0.02)]"
  },

  // Transitions
  transitions: {
    default: "transition-all duration-300 ease-out",
    fast: "transition-all duration-150 ease-in-out",
    slow: "transition-all duration-500 cubic-bezier(0.16, 1, 0.3, 1)"
  },

  // Typography
  typography: {
    h1: "text-3xl sm:text-4xl lg:text-5xl font-extrabold tracking-tight text-slate-900 leading-tight",
    h2: "text-2xl sm:text-3xl font-extrabold tracking-tight text-slate-900",
    h3: "text-lg sm:text-xl font-bold text-slate-900",
    h4: "text-sm sm:text-base font-bold text-slate-800",
    body: "text-sm text-slate-650 leading-relaxed",
    label: "text-xs font-semibold uppercase tracking-wider text-slate-500",
    caption: "text-xs text-slate-500"
  },

  // Borders
  borders: {
    default: "border border-slate-200",
    subtle: "border border-slate-100",
    accent: "border border-sky-200",
    focus: "ring-2 ring-sky-500/20 border-sky-500"
  },

  // Backgrounds
  backgrounds: {
    page: "bg-slate-50",
    panel: "bg-white",
    card: "bg-white",
    hover: "hover:bg-slate-50/70",
    active: "bg-sky-50/50",
    badge: "bg-slate-50 text-slate-600 border border-slate-200"
  },

  // Glassmorphic Layer tokens
  glass: {
    panel: "bg-white/80 backdrop-blur-md border border-slate-200/60 shadow-sm",
    card: "bg-white/95 backdrop-blur-sm border border-slate-200/50 hover:bg-white transition-all duration-300",
    dropdown: "bg-white/95 backdrop-blur-md border border-slate-200/80 shadow-lg"
  },

  // Card layouts presets
  cards: {
    executive: "bg-white border border-slate-200 rounded-xl p-5 hover:border-slate-350 hover:shadow-md transition-all duration-300",
    surface: "bg-slate-50/50 border border-slate-200/80 rounded-xl p-5",
    metric: "bg-white border border-slate-200 rounded-xl p-5 shadow-[0_1px_2px_rgba(0,0,0,0.02)] flex flex-col justify-between",
    section: "bg-white border border-slate-200 rounded-xl overflow-hidden"
  },

  // Color Gradients
  gradients: {
    executive: "bg-[#F8FAFC]",
    navyBlue: "bg-[#EFF6FF]",
    accentSky: "from-sky-600 via-sky-500 to-sky-450",
    accentAmber: "from-amber-600 via-amber-500 to-orange-500",
    accentEmerald: "from-emerald-600 via-teal-600 to-green-600"
  },

  // Framer Motion presets
  motion: {
    fadeUp: {
      initial: { opacity: 0, y: 15 },
      animate: { opacity: 1, y: 0 },
      exit: { opacity: 0, y: -15 },
      transition: { duration: 0.4, ease: [0.16, 1, 0.3, 1] }
    },
    fadeIn: {
      initial: { opacity: 0 },
      animate: { opacity: 1 },
      exit: { opacity: 0 },
      transition: { duration: 0.25 }
    },
    scaleHover: {
      whileHover: { scale: 1.01, y: -1 },
      whileTap: { scale: 0.99 }
    },
    springTransition: {
      type: "spring",
      stiffness: 350,
      damping: 25
    }
  }
}
