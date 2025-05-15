import * as React from "react"
import { cva, type VariantProps } from "class-variance-authority"

import { cn } from "@/lib/utils"

const chartVariants = cva("rounded-md border", {
  variants: {
    variant: {
      default: "bg-background text-foreground shadow",
      card: "border-muted bg-popover text-popover-foreground",
    },
    size: {
      default: "p-4",
      sm: "p-2",
      lg: "p-6",
    },
  },
  defaultVariants: {
    variant: "default",
    size: "default",
  },
})

const Chart = React.forwardRef<React.HTMLAttributes<HTMLDivElement>, VariantProps<typeof chartVariants>>(
  ({ className, variant, size, ...props }, ref) => (
    <div className={cn(chartVariants({ variant, size, className }))} ref={ref} {...props} />
  ),
)
Chart.displayName = "Chart"

const ChartContainer = React.forwardRef<React.HTMLAttributes<HTMLDivElement>, VariantProps<typeof chartVariants>>(
  ({ className, variant, size, ...props }, ref) => (
    <div className={cn(chartVariants({ variant, size, className }))} ref={ref} {...props} />
  ),
)
ChartContainer.displayName = "ChartContainer"

const ChartTooltip = React.forwardRef<React.HTMLAttributes<HTMLDivElement>, VariantProps<typeof chartVariants>>(
  ({ className, variant, size, ...props }, ref) => (
    <div className={cn(chartVariants({ variant, size, className }))} ref={ref} {...props} />
  ),
)
ChartTooltip.displayName = "ChartTooltip"

const ChartTooltipContent = React.forwardRef<React.HTMLAttributes<HTMLDivElement>, VariantProps<typeof chartVariants>>(
  ({ className, variant, size, ...props }, ref) => (
    <div className={cn(chartVariants({ variant, size, className }))} ref={ref} {...props} />
  ),
)
ChartTooltipContent.displayName = "ChartTooltipContent"

export { Chart, ChartContainer, ChartTooltip, ChartTooltipContent }
