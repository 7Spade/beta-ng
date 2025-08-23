"use client"

import * as React from "react"
import { User, Settings, LogOut, ChevronDown } from "lucide-react"
import { cn } from "@/lib/utils"

interface UserMenuProps {
  className?: string
  user?: {
    name?: string
    email?: string
    avatar?: string
  }
  onProfileClick?: () => void
  onSettingsClick?: () => void
  onLogoutClick?: () => void
}

const UserMenu = React.forwardRef<HTMLDivElement, UserMenuProps>(
  ({ className, user, onProfileClick, onSettingsClick, onLogoutClick, ...props }, ref) => {
    const [isOpen, setIsOpen] = React.useState(false)

    const handleToggle = () => setIsOpen(!isOpen)

    const handleProfileClick = () => {
      onProfileClick?.()
      setIsOpen(false)
    }

    const handleSettingsClick = () => {
      onSettingsClick?.()
      setIsOpen(false)
    }

    const handleLogoutClick = () => {
      onLogoutClick?.()
      setIsOpen(false)
    }

    return (
      <div ref={ref} className={cn("relative", className)} {...props}>
        <button
          onClick={handleToggle}
          className="flex items-center gap-2 p-2 rounded-md hover:bg-accent transition-colors"
        >
          <div className="w-8 h-8 rounded-full bg-primary/10 flex items-center justify-center">
            {user?.avatar ? (
              <img
                src={user.avatar}
                alt={user.name || "User"}
                className="w-8 h-8 rounded-full object-cover"
              />
            ) : (
              <User className="h-4 w-4 text-primary" />
            )}
          </div>
          <div className="hidden sm:block text-left">
            <div className="text-sm font-medium">{user?.name || "User"}</div>
            <div className="text-xs text-muted-foreground">{user?.email || "user@example.com"}</div>
          </div>
          <ChevronDown className={cn("h-4 w-4 transition-transform", isOpen && "rotate-180")} />
        </button>

        {isOpen && (
          <div className="absolute right-0 top-full mt-2 w-56 rounded-md border bg-popover shadow-lg z-50">
            <div className="p-2">
              <button
                onClick={handleProfileClick}
                className="flex w-full items-center gap-2 rounded-sm px-2 py-1.5 text-sm outline-none hover:bg-accent hover:text-accent-foreground"
              >
                <User className="h-4 w-4" />
                Profile
              </button>
              <button
                onClick={handleSettingsClick}
                className="flex w-full items-center gap-2 rounded-sm px-2 py-1.5 text-sm outline-none hover:bg-accent hover:text-accent-foreground"
              >
                <Settings className="h-4 w-4" />
                Settings
              </button>
              <div className="h-px bg-border my-1" />
              <button
                onClick={handleLogoutClick}
                className="flex w-full items-center gap-2 rounded-sm px-2 py-1.5 text-sm outline-none hover:bg-accent hover:text-accent-foreground text-red-600 hover:text-red-700"
              >
                <LogOut className="h-4 w-4" />
                Log out
              </button>
            </div>
          </div>
        )}
      </div>
    )
  }
)
UserMenu.displayName = "UserMenu"

export { UserMenu }

