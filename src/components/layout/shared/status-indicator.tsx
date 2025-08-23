"use client"

import * as React from "react"
import { cn } from "@/lib/utils"

interface StatusIndicatorProps {
  status: "online" | "offline" | "away" | "busy" | "pending" | "success" | "warning" | "error"
  size?: "sm" | "md" | "lg"
  showLabel?: boolean
  className?: string
  animated?: boolean
}

const StatusIndicator = React.forwardRef<HTMLDivElement, StatusIndicatorProps>(
  ({ status, size = "md", showLabel = false, className, animated = false, ...props }, ref) => {
    const statusConfig = {
      online: {
        color: "bg-green-500",
        label: "Online"
      },
      offline: {
        color: "bg-gray-500",
        label: "Offline"
      },
      away: {
        color: "bg-yellow-500",
        label: "Away"
      },
      busy: {
        color: "bg-red-500",
        label: "Busy"
      },
      pending: {
        color: "bg-blue-500",
        label: "Pending"
      },
      success: {
        color: "bg-green-500",
        label: "Success"
      },
      warning: {
        color: "bg-yellow-500",
        label: "Warning"
      },
      error: {
        color: "bg-red-500",
        label: "Error"
      }
    }

    const sizeClasses = {
      sm: "w-2 h-2",
      md: "w-3 h-3",
      lg: "w-4 h-4"
    }

    const labelSizeClasses = {
      sm: "text-xs",
      md: "text-sm",
      lg: "text-base"
    }

    const config = statusConfig[status]

    return (
      <div
        ref={ref}
        className={cn(
          "flex items-center gap-2",
          className
        )}
        {...props}
      >
        <div
          className={cn(
            "rounded-full",
            sizeClasses[size],
            config.color,
            animated && "animate-pulse"
          )}
        />
        
        {showLabel && (
          <span className={cn("text-muted-foreground", labelSizeClasses[size])}>
            {config.label}
          </span>
        )}
      </div>
    )
  }
)
StatusIndicator.displayName = "StatusIndicator"

export { StatusIndicator }

