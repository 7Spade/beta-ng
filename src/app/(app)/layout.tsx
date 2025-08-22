import { SidebarProvider, SidebarInset } from '@/components/ui/sidebar';
import { UnifiedSidebar } from '@/components/layout/unified-sidebar';
import { AppHeader } from '@/components/layout/app-header';
import { ProjectProvider } from '@/context/ProjectContext';

export default function AppLayout({ children }: { children: React.ReactNode }) {
  return (
    <ProjectProvider>
      <SidebarProvider>
        <div className="flex min-h-screen">
          <UnifiedSidebar />
          <SidebarInset className="flex-1">
            <AppHeader />
            <div className="flex flex-1 flex-col gap-4 p-4 pt-0">
              {children}
            </div>
          </SidebarInset>
        </div>
      </SidebarProvider>
    </ProjectProvider>
  );
}
