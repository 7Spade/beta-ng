"use client"

import * as React from "react"
import { Plus, Search, Settings, User } from "lucide-react"
import { cn } from "@/lib/utils"

interface QuickAction {
  id: string
  label: string
  icon: React.ReactNode
  onClick: () => void
  variant?: "default" | "secondary" | "outline"
}

interface QuickActionsProps {
  className?: string
  actions?: QuickAction[]
}

const QuickActions = React.forwardRef<HTMLDivElement, QuickActionsProps>(
  ({ className, actions = [], ...props }, ref) => {
    const defaultActions: QuickAction[] = [
      {
        id: "new",
        label: "New",
        icon: <Plus className="h-4 w-4" />,
        onClick: () => console.log("New action clicked"),
        variant: "default"
      },
      {
        id: "search",
        label: "Search",
        icon: <Search className="h-4 w-4" />,
        onClick: () => console.log("Search action clicked"),
        variant: "outline"
      },
      {
        id: "settings",
        label: "Settings",
        icon: <Settings className="h-4 w-4" />,
        onClick: () => console.log("Settings action clicked"),
        variant: "outline"
      },
      {
        id: "profile",
        label: "Profile",
        icon: <User className="h-4 w-4" />,
        onClick: () => console.log("Profile action clicked"),
        variant: "outline"
      }
    ]

    const allActions = actions.length > 0 ? actions : defaultActions

    const getVariantStyles = (variant: QuickAction["variant"] = "default") => {
      switch (variant) {
        case "secondary":
          return "bg-secondary text-secondary-foreground hover:bg-secondary/80"
        case "outline":
          return "border border-input bg-background hover:bg-accent hover:text-accent-foreground"
        default:
          return "bg-primary text-primary-foreground hover:bg-primary/90"
      }
    }

    return (
      <div ref={ref} className={cn("flex items-center gap-2", className)} {...props}>
        {allActions.map((action) => (
          <button
            key={action.id}
            onClick={action.onClick}
            className={cn(
              "inline-flex items-center gap-2 rounded-md px-3 py-2 text-sm font-medium transition-colors focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2",
              getVariantStyles(action.variant)
            )}
            title={action.label}
          >
            {action.icon}
            <span className="hidden sm:inline">{action.label}</span>
          </button>
        ))}
      </div>
    )
  }
)
QuickActions.displayName = "QuickActions"

export { QuickActions }
export type { QuickAction }

