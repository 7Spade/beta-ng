'use client'

import { SidebarMenu } from '@/components/ui/sidebar'
import { NavigationMenuItem } from './navigation-menu-item'
import type { NavigationItem } from '@/config/navigation.config'

interface NavigationMenuProps {
  items: NavigationItem[]
  onToggleSection?: (sectionId: string) => void
  isRouteActive: (route: string) => boolean
  isSectionExpanded: (sectionId: string) => boolean
  onNavigate?: (route: string) => void
}

export function NavigationMenu({
  items,
  onNavigate,
  onToggleSection,
  isRouteActive,
  isSectionExpanded,
}: NavigationMenuProps) {
  return (
    <SidebarMenu>
      {items.map(item => {
        // Check if the item or any of its children are active
        const isActive =
          isRouteActive(item.href) ||
          (item.children?.some(child => isRouteActive(child.href)) ?? false)

        const isExpanded = isSectionExpanded(item.id)

        return (
          <NavigationMenuItem
            key={item.id}
            item={item}
            isActive={isActive}
            isExpanded={isExpanded}
            onNavigate={onNavigate}
            onToggleSection={onToggleSection}
            isRouteActive={isRouteActive}
          />
        )
      })}
    </SidebarMenu>
  )
}
