import * as React from "react"
import { cn } from "@/lib/utils"
import { THEME_TOKENS } from "@/theme/design-system"

export interface CardProps extends React.HTMLAttributes<HTMLDivElement> {
  hoverEffect?: boolean
}

/**
 * ExecutiveCard: Apple/Stripe-inspired elevated container with smooth borders,
 * custom micro-interactions, and premium layout shadows.
 */
export const ExecutiveCard = React.forwardRef<HTMLDivElement, CardProps>(
  ({ className, hoverEffect = true, children, ...props }, ref) => {
    return (
      <div
        ref={ref}
        className={cn(
          THEME_TOKENS.cards.executive,
          THEME_TOKENS.shadows.md,
          hoverEffect && "hover:-translate-y-0.5 active:scale-[0.99] cursor-pointer",
          className
        )}
        {...props}
      >
        {children}
      </div>
    )
  }
)
ExecutiveCard.displayName = "ExecutiveCard"

/**
 * SurfaceCard: Subtle card, light gray/flat background, clean borders,
 * perfect for forms, setting blocks, or layout groupings.
 */
export const SurfaceCard = React.forwardRef<HTMLDivElement, CardProps>(
  ({ className, children, ...props }, ref) => {
    return (
      <div
        ref={ref}
        className={cn(
          THEME_TOKENS.cards.surface,
          "shadow-sm",
          className
        )}
        {...props}
      >
        {children}
      </div>
    )
  }
)
SurfaceCard.displayName = "SurfaceCard"

export interface MetricCardProps extends CardProps {
  title: string
  value: string | number
  description?: string
  trend?: {
    value: string | number
    label: string
    isPositive?: boolean
  }
  icon?: React.ReactNode
}

/**
 * MetricCard: High-performance KPI indicators. Displays critical metric value,
 * title, optional trends, and descriptive footnotes.
 */
export const MetricCard = React.forwardRef<HTMLDivElement, MetricCardProps>(
  ({ className, title, value, description, trend, icon, ...props }, ref) => {
    return (
      <div
        ref={ref}
        className={cn(
          THEME_TOKENS.cards.metric,
          THEME_TOKENS.shadows.sm,
          className
        )}
        {...props}
      >
        <div>
          <div className="flex justify-between items-start gap-3">
            <span className="text-xs font-semibold uppercase tracking-wider text-slate-500">
              {title}
            </span>
            {icon && <div className="text-slate-400">{icon}</div>}
          </div>
          <div className="mt-2.5">
            <h3 className="text-3xl font-black text-slate-900 tracking-tight">
              {value}
            </h3>
          </div>
        </div>

        {(trend || description) && (
          <div className="mt-4 pt-3 border-t border-slate-100 flex items-center gap-2">
            {trend && (
              <span
                className={cn(
                  "text-xs font-bold px-1.5 py-0.5 rounded",
                  trend.isPositive
                    ? "bg-emerald-50 text-emerald-700"
                    : "bg-red-50 text-red-700"
                )}
              >
                {trend.value}
              </span>
            )}
            <span className="text-xs text-slate-500">
              {trend ? trend.label : description}
            </span>
          </div>
        )}
      </div>
    )
  }
)
MetricCard.displayName = "MetricCard"

export interface SectionCardProps extends CardProps {
  title?: string
  description?: string
  headerActions?: React.ReactNode
  footer?: React.ReactNode
}

/**
 * SectionCard: Reusable layout wrapper with an optional header block,
 * description labels, horizontal action items, and bottom footers.
 */
export const SectionCard = React.forwardRef<HTMLDivElement, SectionCardProps>(
  ({ className, title, description, headerActions, footer, children, ...props }, ref) => {
    return (
      <div
        ref={ref}
        className={cn(
          THEME_TOKENS.cards.section,
          THEME_TOKENS.shadows.sm,
          className
        )}
        {...props}
      >
        {(title || description || headerActions) && (
          <div className="px-6 py-5 border-b border-slate-100 flex flex-col sm:flex-row sm:items-center sm:justify-between gap-3">
            <div>
              {title && (
                <h3 className="text-base font-extrabold text-slate-900">
                  {title}
                </h3>
              )}
              {description && (
                <p className="text-xs text-slate-500 mt-0.5">
                  {description}
                </p>
              )}
            </div>
            {headerActions && (
              <div className="flex items-center gap-2 shrink-0">
                {headerActions}
              </div>
            )}
          </div>
        )}

        <div className="p-6">
          {children}
        </div>

        {footer && (
          <div className="px-6 py-4 bg-slate-50/50 border-t border-slate-100 flex items-center justify-end gap-3">
            {footer}
          </div>
        )}
      </div>
    )
  }
)
SectionCard.displayName = "SectionCard"
