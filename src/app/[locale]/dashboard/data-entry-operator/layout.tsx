
import { DataEntryOperatorSidebar } from '@/components/data-entry-operator-sidebar';
import { SidebarInset, SidebarTrigger } from '@/components/ui/sidebar';

export default function DataEntryOperatorDashboardLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <>
      <DataEntryOperatorSidebar />
      <SidebarInset>
        <header className="sticky top-0 z-10 flex h-14 items-center gap-4 border-b bg-background px-4">
          <SidebarTrigger />
          <h1 className="text-xl font-semibold">Data Entry Dashboard</h1>
        </header>
        <main className="flex-1 p-4 pt-8 md:p-8">{children}</main>
      </SidebarInset>
    </>
  );
}
