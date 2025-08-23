"use client"

import * as React from "react"
import { cn } from "@/lib/utils"

interface SectionDividerProps {
  className?: string
  orientation?: "horizontal" | "vertical"
  size?: "sm" | "md" | "lg"
  variant?: "solid" | "dashed" | "dotted"
  label?: string
}

const SectionDivider = React.forwardRef<HTMLDivElement, SectionDividerProps>(
  ({ className, orientation = "horizontal", size = "md", variant = "solid", label, ...props }, ref) => {
    const sizeClasses = {
      sm: orientation === "horizontal" ? "h-px" : "w-px",
      md: orientation === "horizontal" ? "h-0.5" : "w-0.5",
      lg: orientation === "horizontal" ? "h-1" : "w-1"
    }

    const variantClasses = {
      solid: "bg-border",
      dashed: "border-dashed border-border",
      dotted: "border-dotted border-border"
    }

    const orientationClasses = {
      horizontal: "w-full",
      vertical: "h-full"
    }

    if (label) {
      return (
        <div
          ref={ref}
          className={cn(
            "flex items-center gap-4",
            orientation === "horizontal" ? "w-full" : "h-full",
            className
          )}
          {...props}
        >
          <div
            className={cn(
              "flex-1",
              sizeClasses[size],
              variantClasses[variant],
              orientationClasses[orientation]
            )}
          />
          <span className="text-sm text-muted-foreground whitespace-nowrap">
            {label}
          </span>
          <div
            className={cn(
              "flex-1",
              sizeClasses[size],
              variantClasses[variant],
              orientationClasses[orientation]
            )}
          />
        </div>
      )
    }

    return (
      <div
        ref={ref}
        className={cn(
          sizeClasses[size],
          variantClasses[variant],
          orientationClasses[orientation],
          className
        )}
        {...props}
      />
    )
  }
)
SectionDivider.displayName = "SectionDivider"

export { SectionDivider }

