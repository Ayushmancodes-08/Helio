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
        <header className="sticky top-0 z-10 flex h-14 items-center gap-4 border-b bg-background px-4">
          <SidebarTrigger />
          <h1 className="text-xl font-semibold">Patient Dashboard</h1>
        </header>
        <main className="flex-1 p-4 pt-8 md:p-8">{children}</main>
      </SidebarInset>
    </>
  );
}
