"use client"

import * as React from "react"
import { cn } from "@/lib/utils"

interface PopoverContainerProps {
  isOpen: boolean
  onClose: () => void
  children: React.ReactNode
  className?: string
  triggerRef?: React.RefObject<HTMLElement>
  placement?: "top" | "bottom" | "left" | "right"
  offset?: number
}

const PopoverContainer = React.forwardRef<HTMLDivElement, PopoverContainerProps>(
  ({ isOpen, onClose, children, className, triggerRef, placement = "bottom", offset = 8, ...props }, ref) => {
    const [position, setPosition] = React.useState({ top: 0, left: 0 })

    React.useEffect(() => {
      if (isOpen && triggerRef?.current) {
        const rect = triggerRef.current.getBoundingClientRect()
        const popoverWidth = 200 // Default width, can be made dynamic
        const popoverHeight = 100 // Default height, can be made dynamic

        let top = 0
        let left = 0

        switch (placement) {
          case "top":
            top = rect.top - popoverHeight - offset
            left = rect.left + (rect.width / 2) - (popoverWidth / 2)
            break
          case "bottom":
            top = rect.bottom + offset
            left = rect.left + (rect.width / 2) - (popoverWidth / 2)
            break
          case "left":
            top = rect.top + (rect.height / 2) - (popoverHeight / 2)
            left = rect.left - popoverWidth - offset
            break
          case "right":
            top = rect.top + (rect.height / 2) - (popoverHeight / 2)
            left = rect.right + offset
            break
        }

        setPosition({ top, left })
      }
    }, [isOpen, triggerRef, placement, offset])

    if (!isOpen) return null

    return (
      <>
        {/* Backdrop */}
        <div
          className="fixed inset-0 z-40"
          onClick={onClose}
        />
        
        {/* Popover */}
        <div
          ref={ref}
          className={cn(
            "fixed z-50 bg-popover border rounded-md shadow-lg p-2",
            className
          )}
          style={{
            top: position.top,
            left: position.left,
          }}
          {...props}
        >
          {children}
        </div>
      </>
    )
  }
)
PopoverContainer.displayName = "PopoverContainer"

export { PopoverContainer }

