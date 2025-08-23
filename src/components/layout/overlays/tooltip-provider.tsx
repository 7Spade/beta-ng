"use client"

import * as React from "react"
import { cn } from "@/lib/utils"

interface TooltipContextType {
  showTooltip: (content: string, target: HTMLElement) => void
  hideTooltip: () => void
}

const TooltipContext = React.createContext<TooltipContextType | undefined>(undefined)

interface TooltipProviderProps {
  children: React.ReactNode
  className?: string
}

export const TooltipProvider = React.forwardRef<HTMLDivElement, TooltipProviderProps>(
  ({ children, className, ...props }, ref) => {
    const [tooltip, setTooltip] = React.useState<{
      content: string
      position: { top: number; left: number }
      isVisible: boolean
    }>({
      content: "",
      position: { top: 0, left: 0 },
      isVisible: false
    })

    const showTooltip = React.useCallback((content: string, target: HTMLElement) => {
      const rect = target.getBoundingClientRect()
      setTooltip({
        content,
        position: {
          top: rect.top - 40,
          left: rect.left + rect.width / 2
        },
        isVisible: true
      })
    }, [])

    const hideTooltip = React.useCallback(() => {
      setTooltip(prev => ({ ...prev, isVisible: false }))
    }, [])

    const contextValue = React.useMemo(() => ({
      showTooltip,
      hideTooltip
    }), [showTooltip, hideTooltip])

    return (
      <TooltipContext.Provider value={contextValue}>
        <div ref={ref} className={cn("relative", className)} {...props}>
          {children}
          
          {/* Tooltip */}
          {tooltip.isVisible && (
            <div
              className="fixed z-50 px-2 py-1 text-sm text-white bg-gray-900 rounded shadow-lg pointer-events-none"
              style={{
                top: tooltip.position.top,
                left: tooltip.position.left,
                transform: "translateX(-50%)"
              }}
            >
              {tooltip.content}
            </div>
          )}
        </div>
      </TooltipContext.Provider>
    )
  }
)
TooltipProvider.displayName = "TooltipProvider"

export const useTooltip = () => {
  const context = React.useContext(TooltipContext)
  if (!context) {
    throw new Error("useTooltip must be used within a TooltipProvider")
  }
  return context
}

interface TooltipTriggerProps {
  children: React.ReactNode
  content: string
  className?: string
}

export const TooltipTrigger = React.forwardRef<HTMLDivElement, TooltipTriggerProps>(
  ({ children, content, className, ...props }, ref) => {
    const { showTooltip, hideTooltip } = useTooltip()

    const handleMouseEnter = (e: React.MouseEvent<HTMLDivElement>) => {
      showTooltip(content, e.currentTarget)
    }

    const handleMouseLeave = () => {
      hideTooltip()
    }

    return (
      <div
        ref={ref}
        className={cn("inline-block", className)}
        onMouseEnter={handleMouseEnter}
        onMouseLeave={handleMouseLeave}
        {...props}
      >
        {children}
      </div>
    )
  }
)
TooltipTrigger.displayName = "TooltipTrigger"

