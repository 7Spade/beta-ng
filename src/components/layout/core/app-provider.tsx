import { SidebarProvider } from '@/components/ui/sidebar';
import { ProjectProvider } from '@/context/ProjectContext';

export function AppProvider({ children }: { children: React.ReactNode }) {
  return (
    <ProjectProvider>
      <SidebarProvider>{children}</SidebarProvider>
    </ProjectProvider>
  );
}
