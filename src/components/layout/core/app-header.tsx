
'use client'

import { SidebarTrigger } from '@/components/ui/sidebar'
import { Separator } from '@/components/ui/separator'
import { Logo } from '@/components/layout/shared/logo'
import { Breadcrumb } from '../navigation/breadcrumb'
import { useSidebar } from '@/components/ui/sidebar'
import { Button } from '@/components/ui/button'
import { Menu } from 'lucide-react'


interface AppHeaderProps {
    className?: string
}

export function AppHeader({ className }: AppHeaderProps) {
    const { toggleSidebar } = useSidebar();
    return (
        <header className={`flex h-16 shrink-0 items-center justify-between gap-2 transition-[width,height] ease-linear group-has-[[data-collapsible=icon]]/sidebar-wrapper:h-12 ${className}`}>
            <div className="flex items-center gap-2 px-4">
                <Button variant="outline" size="icon" className="d-block md:hidden" onClick={toggleSidebar}>
                    <Menu className="h-5 w-5" />
                    <span className="sr-only">開啟選單</span>
                </Button>
                <SidebarTrigger className="-ml-1 hidden md:flex" />
                <Separator orientation="vertical" className="mr-2 h-4 hidden md:block" />
                <div className="flex items-center gap-2">
                    <Logo className="h-5 w-5" />
                    <span className="font-semibold">Beta-NG</span>
                </div>
            </div>
            <div className="flex items-center gap-2 px-4">
               <div className="hidden md:block">
                 <Breadcrumb />
               </div>
            </div>
        </header>
    )
}
