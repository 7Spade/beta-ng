'use client'

import { SidebarTrigger } from '@/components/ui/sidebar'
import { Separator } from '@/components/ui/separator'
import { Breadcrumb, BreadcrumbItem, BreadcrumbLink, BreadcrumbList, BreadcrumbPage, BreadcrumbSeparator } from '@/components/ui/breadcrumb'
import { usePathname } from 'next/navigation'
import { useMemo } from 'react'
import { navigationConfig } from '@/config/navigation.config'
import { Logo } from './logo'

interface AppHeaderProps {
    className?: string
}

export function AppHeader({ className }: AppHeaderProps) {
    const pathname = usePathname()

    // 生成麵包屑導航
    const breadcrumbs = useMemo(() => {
        const segments = pathname.split('/').filter(Boolean)
        const crumbs: Array<{ label: string; href: string; isLast: boolean }> = []

        // 根據路徑段生成麵包屑
        let currentPath = ''
        segments.forEach((segment, index) => {
            currentPath += `/${segment}`
            const isLast = index === segments.length - 1

            // 嘗試從導航配置中找到對應的標籤
            let label = segment.charAt(0).toUpperCase() + segment.slice(1)

            // 檢查主導航項目
            const mainItem = navigationConfig.find(item => item.href === currentPath)
            if (mainItem) {
                label = mainItem.label
            } else {
                // 檢查子導航項目
                for (const item of navigationConfig) {
                    if (item.children) {
                        const childItem = item.children.find(child => child.href === currentPath)
                        if (childItem) {
                            label = childItem.label
                            break
                        }
                    }
                }
            }

            crumbs.push({
                label,
                href: currentPath,
                isLast
            })
        })

        return crumbs
    }, [pathname])

    return (
        <header className={`flex h-16 shrink-0 items-center justify-between gap-2 transition-[width,height] ease-linear group-has-[[data-collapsible=icon]]/sidebar-wrapper:h-12 ${className}`}>
            <div className="flex items-center gap-2 px-4">
                <SidebarTrigger className="-ml-1" />
                <Separator orientation="vertical" className="mr-2 h-4" />
                <div className="flex items-center gap-2">
                    <Logo className="h-5 w-5" />
                    <span className="font-semibold">NG-Beta</span>
                </div>
            </div>
            <div className="flex items-center gap-2 px-4">
                <Breadcrumb>
                    <BreadcrumbList>
                        {breadcrumbs.map((crumb, index) => (
                            <div key={crumb.href} className="flex items-center">
                                {index > 0 && <BreadcrumbSeparator />}
                                <BreadcrumbItem>
                                    {crumb.isLast ? (
                                        <BreadcrumbPage>{crumb.label}</BreadcrumbPage>
                                    ) : (
                                        <BreadcrumbLink asChild>
                                            <a href={crumb.href}>{crumb.label}</a>
                                        </BreadcrumbLink>
                                    )}
                                </BreadcrumbItem>
                            </div>
                        ))}
                    </BreadcrumbList>
                </Breadcrumb>
            </div>
        </header>
    )
}