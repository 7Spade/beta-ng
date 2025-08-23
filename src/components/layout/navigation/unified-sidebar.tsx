
'use client'

import Link from 'next/link'
import { usePathname } from 'next/navigation'
import { useState, useEffect, useCallback, useMemo } from 'react'
import {
  Sidebar,
  SidebarHeader,
  SidebarContent,
  SidebarFooter,
} from '@/components/ui/sidebar'
import { Button } from '@/components/ui/button'
import { Package2 } from 'lucide-react'
import {
  navigationConfig,
  footerNavigationConfig,
  shouldExpandSection,
} from '@/config/navigation.config'
import { NavigationMenu } from './navigation-menu'
import type { ComponentProps } from 'react'

interface UnifiedSidebarProps extends ComponentProps<typeof Sidebar> {
  className?: string
}

export function UnifiedSidebar({ className, ...props }: UnifiedSidebarProps) {
  const pathname = usePathname()
  const [expandedSections, setExpandedSections] = useState<string[]>([])

  // Memoize the sections that should be expanded to prevent unnecessary recalculations
  const sectionsToExpand = useMemo(() => {
    return navigationConfig
      .filter(item => item.children && shouldExpandSection(item.id, pathname))
      .map(item => item.id)
  }, [pathname])

  // Use useCallback to prevent the effect from running unnecessarily
  const updateExpandedSections = useCallback(() => {
    setExpandedSections(prev => {
      // Only update if there are actual changes to prevent infinite loops
      const newExpanded = new Set([...prev, ...sectionsToExpand])
      const newArray = Array.from(newExpanded)
      
      // Check if the arrays are actually different to prevent unnecessary updates
      if (prev.length === newArray.length && 
          prev.every((item, index) => item === newArray[index])) {
        return prev // Return the same reference if no changes
      }
      
      return newArray
    })
  }, [sectionsToExpand])

  useEffect(() => {
    updateExpandedSections()
  }, [updateExpandedSections])

  const toggleSection = useCallback((sectionId: string) => {
    setExpandedSections(prev =>
      prev.includes(sectionId)
        ? prev.filter(id => id !== sectionId)
        : [...prev, sectionId]
    )
  }, [])

  const isRouteActive = useCallback((href: string) =>
    pathname === href || pathname.startsWith(`${href}/`), [pathname])

  const isSectionExpanded = useCallback((sectionId: string) =>
    expandedSections.includes(sectionId), [expandedSections])

  return (
    <Sidebar className={className} {...props}>
      <SidebarHeader>
        <Button
          variant="ghost"
          asChild
          className="h-12 w-full justify-start text-lg"
        >
          <Link href="/dashboard">
            <Package2 className="mr-3 h-6 w-6" />
            <span className="font-bold">Beta-NG</span>
          </Link>
        </Button>
      </SidebarHeader>

      <SidebarContent>
        <NavigationMenu
          items={navigationConfig}
          isRouteActive={isRouteActive}
          isSectionExpanded={isSectionExpanded}
          onToggleSection={toggleSection}
        />
      </SidebarContent>

      <SidebarFooter>
        <NavigationMenu
          items={footerNavigationConfig}
          isRouteActive={isRouteActive}
          isSectionExpanded={isSectionExpanded}
          onToggleSection={toggleSection}
        />
      </SidebarFooter>
    </Sidebar>
  )
}
