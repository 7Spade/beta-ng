"use client"

import * as React from "react"
import { cn } from "@/lib/utils"

interface PageHeaderProps {
  title: string
  subtitle?: string
  children?: React.ReactNode
  className?: string
  size?: "sm" | "md" | "lg"
  actions?: React.ReactNode
}

const PageHeader = React.forwardRef<HTMLDivElement, PageHeaderProps>(
  ({ title, subtitle, children, className, size = "md", actions, ...props }, ref) => {
    const sizeClasses = {
      sm: "py-4",
      md: "py-6",
      lg: "py-8"
    }

    const titleSizeClasses = {
      sm: "text-xl",
      md: "text-2xl",
      lg: "text-3xl"
    }

    return (
      <div
        ref={ref}
        className={cn(
          "border-b bg-background",
          sizeClasses[size],
          className
        )}
        {...props}
      >
        <div className="flex items-center justify-between">
          <div className="flex-1">
            <h1 className={cn("font-bold tracking-tight", titleSizeClasses[size])}>
              {title}
            </h1>
            {subtitle && (
              <p className="text-muted-foreground mt-1">
                {subtitle}
              </p>
            )}
            {children && (
              <div className="mt-4">
                {children}
              </div>
            )}
          </div>
          
          {actions && (
            <div className="flex items-center gap-2 ml-4">
              {actions}
            </div>
          )}
        </div>
      </div>
    )
  }
)
PageHeader.displayName = "PageHeader"

export { PageHeader }

