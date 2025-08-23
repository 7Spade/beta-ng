"use client"

import * as React from "react"
import { cn } from "@/lib/utils"

interface LayoutWrapperProps extends React.HTMLAttributes<HTMLDivElement> {
  children: React.ReactNode
  className?: string
  fluid?: boolean
  padding?: "none" | "sm" | "md" | "lg"
}

const LayoutWrapper = React.forwardRef<HTMLDivElement, LayoutWrapperProps>(
  ({ children, className, fluid = false, padding = "md", ...props }, ref) => {
    const paddingClasses = {
      none: "",
      sm: "px-4 py-2",
      md: "px-6 py-4",
      lg: "px-8 py-6",
    }

    return (
      <div
        ref={ref}
        className={cn(
          "min-h-screen bg-background",
          !fluid && "mx-auto",
          fluid ? "w-full" : "max-w-7xl",
          paddingClasses[padding],
          className
        )}
        {...props}
      >
        {children}
      </div>
    )
  }
)
LayoutWrapper.displayName = "LayoutWrapper"

export { LayoutWrapper }

