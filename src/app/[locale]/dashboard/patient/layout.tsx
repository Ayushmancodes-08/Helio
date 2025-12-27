import { PatientSidebar } from '@/components/patient-sidebar';
import { SidebarInset, SidebarTrigger } from '@/components/ui/sidebar';

export default function PatientDashboardLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <>
      <PatientSidebar />
      <SidebarInset>
        <header className="sticky top-0 z-10 flex h-14 sm:h-16 items-center gap-3 sm:gap-4 border-b bg-background px-3 sm:px-4">
          <SidebarTrigger className="shrink-0" />
          <h1 className="text-lg sm:text-xl font-semibold truncate">Patient Dashboard</h1>
        </header>
        <main className="flex-1 p-3 pt-6 sm:p-4 sm:pt-8 md:p-8">{children}</main>
      </SidebarInset>
    </>
  );
}
