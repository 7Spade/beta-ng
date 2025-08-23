"use client"

import * as React from "react"
import { Search, Command } from "lucide-react"
import { cn } from "@/lib/utils"

interface SearchCommandProps {
  className?: string
  placeholder?: string
  onSearch?: (query: string) => void
}

const SearchCommand = React.forwardRef<HTMLDivElement, SearchCommandProps>(
  ({ className, placeholder = "Search...", onSearch, ...props }, ref) => {
    const [query, setQuery] = React.useState("")
    const [isOpen, setIsOpen] = React.useState(false)

    const handleSubmit = (e: React.FormEvent) => {
      e.preventDefault()
      if (query.trim()) {
        onSearch?.(query.trim())
        setIsOpen(false)
      }
    }

    const handleKeyDown = (e: React.KeyboardEvent) => {
      if (e.key === "Escape") {
        setIsOpen(false)
      }
    }

    return (
      <div ref={ref} className={cn("relative", className)} {...props}>
        <button
          onClick={() => setIsOpen(!isOpen)}
          className="flex items-center gap-2 px-3 py-2 text-sm text-muted-foreground hover:text-foreground transition-colors rounded-md border bg-background hover:bg-accent"
        >
          <Search className="h-4 w-4" />
          <span className="hidden sm:inline">{placeholder}</span>
          <kbd className="pointer-events-none inline-flex h-5 select-none items-center gap-1 rounded border bg-muted px-1.5 font-mono text-[10px] font-medium text-muted-foreground">
            <span className="text-xs">⌘</span>K
          </kbd>
        </button>

        {isOpen && (
          <div className="absolute top-full left-0 right-0 mt-2 z-50">
            <div className="rounded-md border bg-popover shadow-lg">
              <form onSubmit={handleSubmit} className="flex items-center border-b">
                <Search className="ml-3 h-4 w-4 shrink-0 opacity-50" />
                <input
                  type="text"
                  value={query}
                  onChange={(e) => setQuery(e.target.value)}
                  onKeyDown={handleKeyDown}
                  placeholder={placeholder}
                  className="flex h-11 w-full rounded-none bg-transparent py-3 text-sm outline-none placeholder:text-muted-foreground disabled:cursor-not-allowed disabled:opacity-50"
                  autoFocus
                />
                <button
                  type="button"
                  onClick={() => setIsOpen(false)}
                  className="px-3 py-2 text-sm text-muted-foreground hover:text-foreground"
                >
                  ESC
                </button>
              </form>
              
              <div className="p-4">
                <div className="text-sm text-muted-foreground">
                  Type to search...
                </div>
                {query && (
                  <div className="mt-2 text-sm">
                    Search results for: <span className="font-medium">{query}</span>
                  </div>
                )}
              </div>
            </div>
          </div>
        )}
      </div>
    )
  }
)
SearchCommand.displayName = "SearchCommand"

export { SearchCommand }

