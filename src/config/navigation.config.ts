/**
 * @project Beta-NG Integrated Platform - 統一整合平台導航配置
 * @framework Next.js 15+ (App Router)
 * @typescript 5.0+
 * @author Beta-NG Development Team
 * @created 2025-01-22
 * @updated 2025-01-22
 * @version 1.0.0
 * 
 * @fileoverview 應用程式導航配置和工具函數
 * @description 定義統一側邊欄的導航結構，包含主導航項目、PartnerVerse 子選單配置，
 * 以及相關的導航工具函數。支援平行路由架構和條件渲染。
 * 
 * @tech-stack
 * - Runtime: Node.js 20+
 * - Framework: Next.js 15 (App Router)
 * - Language: TypeScript 5.0+
 * - UI: shadcn/ui + Tailwind CSS 4.0+
 * - Icons: Lucide React
 * - State: Zustand + React Context
 * - Routing: Next.js App Router (Parallel Routes)
 * 
 * @environment
 * - Node: >=20.0.0
 * - Package Manager: pnpm
 * - Build Tool: Turbopack
 * 
 * @features
 * - 統一導航配置管理
 * - 支援巢狀子選單結構
 * - 路徑匹配和活躍狀態檢測
 * - PartnerVerse 模組特殊導航支援
 * - 工具函數提供導航邏輯
 * 
 * @usage
 * '''typescript
 * import { navigationConfig, findNavigationItemByPath } from '@/config/navigation.config'
 * 
 * // 獲取當前路徑對應的導航項目
 * const currentItem = findNavigationItemByPath('/partnerverse/partners')
 * 
 * // 檢查是否應該展開某個區段
 * const shouldExpand = shouldExpandSection('partnerverse', '/partnerverse/workflows')
 * '''
 */

import {
    LayoutDashboard,
    FolderKanban,
    Building2,
    FileText,
    Users,
    BarChart3,
    Settings,
    ClipboardList,
    CalendarDays,
    ArrowLeftRight,
    Wrench,
    BookOpen
} from 'lucide-react'
import type { LucideIcon } from 'lucide-react'

export interface NavigationItem {
    id: string
    label: string
    icon: LucideIcon
    href: string
    children?: NavigationItem[]
}

export const navigationConfig: NavigationItem[] = [
    {
        id: 'documents',
        label: '文件',
        icon: FileText,
        href: '/documents'
    },
    {
        id: 'analytics',
        label: '分析',
        icon: BarChart3,
        href: '/analytics'
    },
    {
        id: 'dashboard',
        label: '儀表板',
        icon: LayoutDashboard,
        href: '/dashboard'
    },
    {
        id: 'projects',
        label: '專案',
        icon: FolderKanban,
        href: '/projects'
    },
    {
        id: 'contracts',
        label: '合約',
        icon: Building2,
        href: '/contracts'
    },
    {
        id: 'partnerverse',
        label: '合作夥伴',
        icon: Users,
        href: '/partnerverse',
        children: [
            {
                id: 'partners',
                label: '夥伴列表',
                icon: Users,
                href: '/partnerverse/partners'
            },
            {
                id: 'receivable-payable',
                label: '應收應付系統',
                icon: ArrowLeftRight,
                href: '/partnerverse/receivable-payable'
            }
        ]
    },
    {
        id: 'team',
        label: '內部團隊',
        icon: Users,
        href: '/team',
        children: [
            {
                id: 'schedule',
                label: '排班表',
                icon: CalendarDays,
                href: '/team/schedule'
            },
            {
                id: 'members',
                label: '同伴列表',
                icon: ClipboardList,
                href: '/team/members'
            },
            {
                id: 'skills',
                label: '技能清單',
                icon: Wrench,
                href: '/team/skills'
            },
            {
                id: 'knowledge-base',
                label: '工法工序庫',
                icon: BookOpen,
                href: '/team/knowledge-base'
            },
        
        ]
    }
]

export const footerNavigationConfig: NavigationItem[] = [
    {
        id: 'settings',
        label: '設定',
        icon: Settings,
        href: '/settings'
    }
]

// 工具函數：根據路徑找到對應的導航項目
export function findNavigationItemByPath(path: string): NavigationItem | null {
    for (const item of navigationConfig) {
        if (item.href === path) {
            return item;
        }
        if (item.children) {
            const childItem = item.children.find(child => path.startsWith(child.href));
            if (childItem) return childItem;
        }
    }
    return null;
}

// 工具函數：檢查路徑是否應該展開某個區段
export function shouldExpandSection(sectionId: string, currentPath: string): boolean {
    const section = navigationConfig.find(item => item.id === sectionId)

    if (!section?.children) {
        return false
    }

    return section.children.some(child =>
        currentPath === child.href || currentPath.startsWith(child.href + '/')
    )
}

// 工具函數：檢查路徑是否為活躍狀態
export function isPathActive(itemPath: string, currentPath: string): boolean {
    if (itemPath === '/partnerverse') {
        return currentPath.startsWith('/partnerverse');
    }
    return currentPath === itemPath || currentPath.startsWith(itemPath + '/')
}
