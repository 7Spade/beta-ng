'use client'

import { SidebarMenu } from '@/components/ui/sidebar'
import { NavigationMenuItem } from './navigation-menu-item'
import type { NavigationItem } from '@/config/navigation.config'

interface NavigationMenuProps {
  items: NavigationItem[]
  activeRoute: string
  expandedSections: string[]
  onNavigate?: (route: string) => void
  onToggleSection?: (sectionId: string) => void
  isRouteActive: (route: string) => boolean
  isSectionExpanded: (sectionId: string) => boolean
}

export function NavigationMenu({
  items,
  activeRoute,
  expandedSections,
  onNavigate,
  onToggleSection,
  isRouteActive,
  isSectionExpanded
}: NavigationMenuProps) {
  return (
    <SidebarMenu>
      {items.map((item) => {
        // 檢查項目或其子項目是否為活躍狀態
        const isActive = isRouteActive(item.href) || 
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