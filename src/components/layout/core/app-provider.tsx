import { SidebarProvider } from '@/components/ui/sidebar';
import { ProjectProvider } from '@/context/ProjectContext';
import { ContractProvider } from '@/context/contracts';
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
        <ContractProvider>
          <SidebarProvider>{children}</SidebarProvider>
        </ContractProvider>
      </ProjectProvider>
    </ThemeProvider>
  );
}
