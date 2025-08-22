
'use client'

import Link from 'next/link'
import { usePathname } from 'next/navigation'
import { useState, useEffect } from 'react'
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

  useEffect(() => {
    const sectionsToExpand = navigationConfig
      .filter(item => item.children && shouldExpandSection(item.id, pathname))
      .map(item => item.id)

    setExpandedSections(prev => {
      const newExpanded = new Set([...prev, ...sectionsToExpand])
      return Array.from(newExpanded)
    })
  }, [pathname])

  const toggleSection = (sectionId: string) => {
    setExpandedSections(prev =>
      prev.includes(sectionId)
        ? prev.filter(id => id !== sectionId)
        : [...prev, sectionId]
    )
  }

  const isRouteActive = (href: string) =>
    pathname === href || pathname.startsWith(`${href}/`)

  const isSectionExpanded = (sectionId: string) =>
    expandedSections.includes(sectionId)

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
