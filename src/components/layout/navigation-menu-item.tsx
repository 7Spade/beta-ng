'use client'

import Link from 'next/link'
import { ChevronDown } from 'lucide-react'
import { 
  SidebarMenuItem, 
  SidebarMenuButton, 
  SidebarMenuSub,
  SidebarMenuSubItem,
  SidebarMenuSubButton
} from '@/components/ui/sidebar'
import { Collapsible, CollapsibleContent, CollapsibleTrigger } from '@/components/ui/collapsible'
import type { NavigationItem } from '@/config/navigation.config'

interface NavigationMenuItemProps {
  item: NavigationItem
  isActive: boolean
  isExpanded?: boolean
  onNavigate?: (route: string) => void
  onToggleSection?: (sectionId: string) => void
  isRouteActive?: (route: string) => boolean
}

export function NavigationMenuItem({
  item,
  isActive,
  isExpanded = false,
  onNavigate,
  onToggleSection,
  isRouteActive
}: NavigationMenuItemProps) {
  const hasChildren = item.children && item.children.length > 0
  
  // 如果有子項目，使用可摺疊元件
  if (hasChildren) {
    return (
      <SidebarMenuItem>
        <Collapsible open={isExpanded} onOpenChange={() => onToggleSection?.(item.id)}>
          <CollapsibleTrigger asChild>
            <SidebarMenuButton 
              isActive={isActive}
              tooltip={item.label}
              className="w-full justify-between"
            >
              <div className="flex items-center">
                <item.icon className="mr-3 h-4 w-4" />
                <span>{item.label}</span>
              </div>
              <ChevronDown 
                className={`h-4 w-4 transition-transform ${
                  isExpanded ? 'rotate-180' : ''
                }`} 
              />
            </SidebarMenuButton>
          </CollapsibleTrigger>
          <CollapsibleContent>
            <SidebarMenuSub>
              {item.children?.map((child) => (
                <NavigationSubMenuItem
                  key={child.id}
                  item={child}
                  isActive={isRouteActive?.(child.href) ?? false}
                  onNavigate={onNavigate}
                />
              ))}
            </SidebarMenuSub>
          </CollapsibleContent>
        </Collapsible>
      </SidebarMenuItem>
    )
  }
  
  // 一般導航項目
  return (
    <SidebarMenuItem>
      <SidebarMenuButton 
        asChild 
        isActive={isActive} 
        tooltip={item.label}
      >
        <Link 
          href={item.href}
          onClick={() => onNavigate?.(item.href)}
        >
          <item.icon className="h-4 w-4" />
          <span>{item.label}</span>
        </Link>
      </SidebarMenuButton>
    </SidebarMenuItem>
  )
}

interface NavigationSubMenuItemProps {
  item: NavigationItem
  isActive?: boolean
  onNavigate?: (route: string) => void
}

function NavigationSubMenuItem({ item, isActive = false, onNavigate }: NavigationSubMenuItemProps) {
  return (
    <SidebarMenuSubItem>
      <SidebarMenuSubButton asChild isActive={isActive}>
        <Link 
          href={item.href}
          onClick={() => onNavigate?.(item.href)}
        >
          <item.icon className="h-4 w-4" />
          <span>{item.label}</span>
        </Link>
      </SidebarMenuSubButton>
    </SidebarMenuSubItem>
  );
}