
'use client'

import { usePathname } from 'next/navigation'
import { useMemo, Fragment } from 'react'
import Link from 'next/link'
import {
  Breadcrumb as UiBreadcrumb,
  BreadcrumbItem,
  BreadcrumbLink,
  BreadcrumbList,
  BreadcrumbPage,
  BreadcrumbSeparator,
} from '@/components/ui/breadcrumb'
import { navigationConfig } from '@/config/navigation.config'

export function Breadcrumb() {
  const pathname = usePathname()

  const breadcrumbs = useMemo(() => {
    const segments = pathname.split('/').filter(Boolean)
    const crumbs: Array<{ label: string; href: string; isLast: boolean }> = []

    let currentPath = ''
    segments.forEach((segment, index) => {
      currentPath += `/${segment}`
      const isLast = index === segments.length - 1

      let label = segment.charAt(0).toUpperCase() + segment.slice(1)
      let found = false

      for (const item of navigationConfig) {
        if (item.href === currentPath) {
          label = item.label
          found = true
          break
        }
        if (item.children) {
          for (const child of item.children) {
            if (child.href === currentPath) {
              label = child.label
              found = true
              break
            }
          }
        }
        if (found) break
      }
       
      if(label.toLowerCase() === 'dashboard') {
        return;
      }

      crumbs.push({ label, href: currentPath, isLast })
    })

    return crumbs
  }, [pathname])

  return (
    <UiBreadcrumb>
      <BreadcrumbList>
        <BreadcrumbItem>
          <BreadcrumbLink asChild>
            <Link href="/dashboard">儀表板</Link>
          </BreadcrumbLink>
        </BreadcrumbItem>
        {breadcrumbs.map((crumb, index) => (
          <Fragment key={crumb.href}>
            <BreadcrumbSeparator />
            <BreadcrumbItem>
              {crumb.isLast ? (
                <BreadcrumbPage>{crumb.label}</BreadcrumbPage>
              ) : (
                <BreadcrumbLink asChild>
                  <Link href={crumb.href}>{crumb.label}</Link>
                </BreadcrumbLink>
              )}
            </BreadcrumbItem>
          </Fragment>
        ))}
      </BreadcrumbList>
    </UiBreadcrumb>
  )
}
