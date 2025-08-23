"use client"

import * as React from "react"
import { cn } from "@/lib/utils"

interface ResponsiveWrapperProps {
  children: React.ReactNode
  className?: string
  breakpoint?: "sm" | "md" | "lg" | "xl"
  mobile?: React.ReactNode
  tablet?: React.ReactNode
  desktop?: React.ReactNode
}

const ResponsiveWrapper = React.forwardRef<HTMLDivElement, ResponsiveWrapperProps>(
  ({ children, className, breakpoint = "md", mobile, tablet, desktop, ...props }, ref) => {
    const [isMobile, setIsMobile] = React.useState(false)
    const [isTablet, setIsTablet] = React.useState(false)

    React.useEffect(() => {
      const checkScreenSize = () => {
        const width = window.innerWidth
        setIsMobile(width < 640)
        setIsTablet(width >= 640 && width < 1024)
      }

      checkScreenSize()
      window.addEventListener("resize", checkScreenSize)
      return () => window.removeEventListener("resize", checkScreenSize)
    }, [])

    const renderContent = () => {
      if (isMobile && mobile) return mobile
      if (isTablet && tablet) return tablet
      if (!isMobile && !isTablet && desktop) return desktop
      return children
    }

    return (
      <div
        ref={ref}
        className={cn(
          "w-full",
          className
        )}
        {...props}
      >
        {renderContent()}
      </div>
    )
  }
)
ResponsiveWrapper.displayName = "ResponsiveWrapper"

export { ResponsiveWrapper }

