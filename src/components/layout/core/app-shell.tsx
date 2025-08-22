
'use client';

import { useState, useEffect } from 'react';
import { SidebarInset } from '@/components/ui/sidebar';
import { UnifiedSidebar } from '@/components/layout/navigation/unified-sidebar';
import { AppHeader } from '@/components/layout/core/app-header';

export function AppShell({ children }: { children: React.ReactNode }) {
  const [isClient, setIsClient] = useState(false);

  useEffect(() => {
    setIsClient(true);
  }, []);

  return (
    <div className="flex min-h-screen">
      <UnifiedSidebar collapsible="icon" className="hidden md:flex" />
      <SidebarInset className="flex-1">
        {isClient && <AppHeader />}
        <div className="flex flex-1 flex-col gap-4 p-4 pt-0">{children}</div>
      </SidebarInset>
    </div>
  );
}
