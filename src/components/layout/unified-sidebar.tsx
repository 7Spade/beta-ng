'use client';

import Link from 'next/link';
import { usePathname } from 'next/navigation';
import { useState } from 'react';
import { 
  Sidebar,
  SidebarHeader,
  SidebarMenu,
  SidebarMenuItem,
  SidebarMenuButton,
  SidebarContent,
  SidebarFooter,
} from '@/components/ui/sidebar';
import { Button } from '@/components/ui/button';
import { Collapsible, CollapsibleContent, CollapsibleTrigger } from '@/components/ui/collapsible';
import { ChevronDown, Package2 } from 'lucide-react';
import { navigationConfig, footerNavigationConfig } from '@/config/navigation.config';

interface UnifiedSidebarProps {
  className?: string;
}

export function UnifiedSidebar({ className }: UnifiedSidebarProps) {
  const pathname = usePathname();
  const [expandedSections, setExpandedSections] = useState<string[]>([]);

  const toggleSection = (sectionId: string) => {
    setExpandedSections(prev => 
      prev.includes(sectionId) 
        ? prev.filter(id => id !== sectionId)
        : [...prev, sectionId]
    );
  };

  const isSectionExpanded = (sectionId: string) => expandedSections.includes(sectionId);
  
  const isRouteActive = (href: string) => pathname === href || pathname.startsWith(href + '/');

  const renderNavigationItem = (item: any) => {
    const hasChildren = item.children && item.children.length > 0;
    const isActive = isRouteActive(item.href);
    const isExpanded = isSectionExpanded(item.id);

    if (hasChildren) {
      return (
        <SidebarMenuItem key={item.id}>
          <Collapsible open={isExpanded} onOpenChange={() => toggleSection(item.id)}>
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
              <SidebarMenu>
                {item.children.map((child: any) => (
                  <SidebarMenuItem key={child.id}>
                    <SidebarMenuButton 
                      asChild 
                      isActive={isRouteActive(child.href)}
                      tooltip={child.label}
                    >
                      <Link href={child.href}>
                        <child.icon className="mr-3 h-4 w-4" />
                        <span>{child.label}</span>
                      </Link>
                    </SidebarMenuButton>
                  </SidebarMenuItem>
                ))}
              </SidebarMenu>
            </CollapsibleContent>
          </Collapsible>
        </SidebarMenuItem>
      );
    }

    return (
      <SidebarMenuItem key={item.id}>
        <SidebarMenuButton 
          asChild 
          isActive={isActive}
          tooltip={item.label}
        >
          <Link href={item.href}>
            <item.icon className="mr-3 h-4 w-4" />
            <span>{item.label}</span>
          </Link>
        </SidebarMenuButton>
      </SidebarMenuItem>
    );
  };

  return (
    <Sidebar className={className}>
      <SidebarHeader>
        <Button variant="ghost" asChild className="w-full justify-start text-lg h-12">
          <Link href="/dashboard">
            <Package2 className="mr-3 h-6 w-6" />
            <span className="font-bold">NG-Beta</span>
          </Link>
        </Button>
      </SidebarHeader>
      
      <SidebarContent>
        <SidebarMenu>
          {navigationConfig.map(renderNavigationItem)}
        </SidebarMenu>
      </SidebarContent>
      
      <SidebarFooter>
        <SidebarMenu>
          {footerNavigationConfig.map(renderNavigationItem)}
        </SidebarMenu>
      </SidebarFooter>
    </Sidebar>
  );
}
