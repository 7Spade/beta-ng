import { AppProvider } from '@/components/layout/core/app-provider';
import { AppShell } from '@/components/layout/core/app-shell';

export default function AppLayout({ children }: { children: React.ReactNode }) {
  return (
    <AppProvider>
      <AppShell>{children}</AppShell>
    </AppProvider>
  );
}
