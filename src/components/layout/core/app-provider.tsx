import { SidebarProvider } from '@/components/ui/sidebar';
import { ProjectProvider } from '@/context/ProjectContext';
import { ThemeProvider } from './theme-provider';


export function AppProvider({ children }: { children: React.ReactNode }) {
  return (
    <ThemeProvider
      attribute="class"
      defaultTheme="system"
      enableSystem
      disableTransitionOnChange
    >
      <ProjectProvider>
        <SidebarProvider>{children}</SidebarProvider>
      </ProjectProvider>
    </ThemeProvider>
  );
}
