"use client"

import * as React from "react"
import { X } from "lucide-react"
import { cn } from "@/lib/utils"

interface DrawerContainerProps {
  isOpen: boolean
  onClose: () => void
  children: React.ReactNode
  className?: string
  side?: "left" | "right" | "top" | "bottom"
  size?: "sm" | "md" | "lg" | "xl" | "full"
}

const DrawerContainer = React.forwardRef<HTMLDivElement, DrawerContainerProps>(
  ({ isOpen, onClose, children, className, side = "right", size = "md", ...props }, ref) => {
    const sizeClasses = {
      sm: "w-64",
      md: "w-80",
      lg: "w-96",
      xl: "w-[28rem]",
      full: "w-full"
    }

    const sideClasses = {
      left: "left-0 top-0 h-full translate-x-[-100%]",
      right: "right-0 top-0 h-full translate-x-[100%]",
      top: "top-0 left-0 w-full translate-y-[-100%]",
      bottom: "bottom-0 left-0 w-full translate-y-[100%]"
    }

    const sideSizeClasses = {
      left: sizeClasses[size],
      right: sizeClasses[size],
      top: "h-64",
      bottom: "h-64"
    }

    if (!isOpen) return null

    return (
      <>
        {/* Backdrop */}
        <div
          className="fixed inset-0 bg-black/50 z-40"
          onClick={onClose}
        />
        
        {/* Drawer */}
        <div
          ref={ref}
          className={cn(
            "fixed z-50 bg-background border shadow-lg transition-transform duration-300 ease-in-out",
            sideClasses[side],
            sideSizeClasses[side],
            isOpen && "translate-x-0 translate-y-0",
            className
          )}
          {...props}
        >
          {/* Header */}
          <div className="flex items-center justify-between p-4 border-b">
            <h2 className="text-lg font-semibold">Drawer</h2>
            <button
              onClick={onClose}
              className="p-1 rounded-md hover:bg-accent transition-colors"
            >
              <X className="h-4 w-4" />
            </button>
          </div>
          
          {/* Content */}
          <div className="flex-1 overflow-auto">
            {children}
          </div>
        </div>
      </>
    )
  }
)
DrawerContainer.displayName = "DrawerContainer"

export { DrawerContainer }

