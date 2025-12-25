'use client';

import Link from 'next/link';
import { usePathname, useRouter } from 'next/navigation';
import {
  Sidebar,
  SidebarContent,
  SidebarHeader,
  SidebarMenu,
  SidebarMenuItem,
  SidebarMenuButton,
  SidebarFooter,
} from '@/components/ui/sidebar';
import {
  Calendar,
  Home,
  LogOut,
  Users,
  FileText,
  Video,
  BeakerIcon,
  User,
} from 'lucide-react';
import { Logo } from '@/components/icons';
import { Avatar, AvatarFallback, AvatarImage } from '@/components/ui/avatar';
import { PlaceHolderImages } from '@/lib/placeholder-images';
import { Button } from './ui/button';
import { useAuth } from '@/hooks/useAuth';

const menuItems = [
  { href: '/dashboard/doctor', label: 'Dashboard', icon: Home, exact: true },
  {
    href: '/dashboard/doctor/appointments',
    label: 'Appointments',
    icon: Calendar,
  },
  { href: '/dashboard/doctor/patients', label: 'Patients', icon: Users },
  {
    href: '/dashboard/doctor/consultations',
    label: 'Consultations',
    icon: Video,
  },
  {
    href: '/dashboard/doctor/prescriptions',
    label: 'Prescriptions',
    icon: FileText,
  },
  {
    href: '/dashboard/doctor/lab-reports',
    label: 'Lab Reports',
    icon: BeakerIcon,
  },
  {
    href: '/dashboard/doctor/profile',
    label: 'Profile',
    icon: User,
  },
];

export function DoctorSidebar() {
  const pathname = usePathname();
  const router = useRouter();
  const { profile, signOut } = useAuth();
  const doctorAvatar = PlaceHolderImages.find(
    (img) => img.id === 'avatar-doctor'
  );

  const handleLogout = async () => {
    await signOut();
    router.push('/login');
  };

  return (
    <Sidebar>
      <SidebarHeader className="border-b">
        <div className="flex items-center gap-2">
          <Logo className="h-8 w-8 text-primary" />
          <span className="text-lg font-semibold">G.S. Setu</span>
        </div>
      </SidebarHeader>
      <SidebarContent className="p-2">
        <SidebarMenu>
          {menuItems.map((item) => (
            <SidebarMenuItem key={item.label}>
              <Link href={item.href} passHref>
                <SidebarMenuButton
                  isActive={item.exact ? pathname === item.href : pathname.startsWith(item.href)}
                  tooltip={item.label}
                >
                  <item.icon />
                  <span>{item.label}</span>
                </SidebarMenuButton>
              </Link>
            </SidebarMenuItem>
          ))}
        </SidebarMenu>
      </SidebarContent>
      <SidebarFooter className="border-t">
        <div className="flex items-center gap-3 p-2">
          {profile?.role === 'doctor' ? (
            <>
              <Avatar className="h-10 w-10">
                {doctorAvatar && (
                  <AvatarImage
                    src={profile?.photo || doctorAvatar.imageUrl}
                    alt={profile?.full_name || 'Doctor'}
                    data-ai-hint={doctorAvatar.imageHint}
                  />
                )}
                <AvatarFallback>{profile?.full_name?.split(' ').map(n => n[0]).join('') || 'D'}</AvatarFallback>
              </Avatar>
              <div className="overflow-hidden">
                <p className="truncate font-semibold">{profile?.full_name || 'Doctor'}</p>
                <p className="truncate text-xs text-muted-foreground capitalize">{profile?.specialization || 'Doctor'}</p>
              </div>
            </>
          ) : (
            <div className="overflow-hidden w-full">
              <p className="text-xs font-bold text-destructive truncate">Session Mismatch</p>
              <p className="text-[10px] text-muted-foreground truncate">Please log in as Doctor</p>
            </div>
          )}
          <Button variant="ghost" size="icon" aria-label="Log out" onClick={handleLogout}>
            <LogOut />
          </Button>
        </div>
      </SidebarFooter>
    </Sidebar>
  );
}
