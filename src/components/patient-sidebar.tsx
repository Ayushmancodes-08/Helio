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
  HeartPulse,
  Home,
  LogOut,
  Pill,
  User,
  Video,
  Bell,
} from 'lucide-react';
import { Logo } from '@/components/icons';
import { Avatar, AvatarFallback, AvatarImage } from '@/components/ui/avatar';
import { Button } from './ui/button';
import { useAuth } from '@/hooks/useAuth';
import { useLanguage } from '@/hooks/useLanguage';
import { LanguageSwitcher } from './language-switcher';

export function PatientSidebar() {
  const pathname = usePathname();
  const router = useRouter();
  const { profile, signOut } = useAuth();
  const { t: tCommon } = useLanguage();

  // Extract locale from pathname (e.g., /en-IN/dashboard/patient -> en-IN)
  const locale = pathname?.split('/')[1] || 'en-IN';

  const menuItems = [
    { href: `/${locale}/dashboard/patient`, label: tCommon('navigation.dashboard'), icon: Home, exact: true },
    { href: `/${locale}/dashboard/patient/appointments`, label: tCommon('navigation.appointments'), icon: Calendar },
    { href: `/${locale}/dashboard/patient/alerts`, label: tCommon('navigation.healthAlerts'), icon: Bell },
    { href: `/${locale}/dashboard/patient/records`, label: tCommon('navigation.healthRecords'), icon: HeartPulse },
    { href: `/${locale}/dashboard/patient/pharmacy-stock`, label: tCommon('navigation.pharmacyStock'), icon: Pill },
    { href: `/${locale}/dashboard/patient/consultation`, label: tCommon('navigation.videoConsultation'), icon: Video },
    { href: `/${locale}/dashboard/patient/profile`, label: tCommon('navigation.profile'), icon: User },
  ];

  const handleLogout = async () => {
    await signOut();
    router.push(`/${locale}/login`);
  };

  const getInitials = (name: string) => {
    return name.split(' ').map(n => n[0]).join('').toUpperCase();
  };

  return (
    <Sidebar collapsible="icon">
      <SidebarHeader className="border-b">
        <div className="flex items-center gap-2">
          <Logo className="h-8 w-8 text-primary" />
          <span className="text-lg font-semibold">G.S. Setu</span>
        </div>
      </SidebarHeader>
      <SidebarContent className="p-2">
        <SidebarMenu>
          {menuItems.map((item) => (
            <SidebarMenuItem key={item.href}>
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
        <div className="flex flex-col gap-3 p-2">
          <LanguageSwitcher variant="dashboard" className="w-full justify-start" />
          <div className="flex items-center gap-3">
            {profile?.role === 'patient' ? (
              <>
                <Avatar className="h-10 w-10">
                  {profile?.photo && (
                    <AvatarImage src={profile.photo} alt={profile.full_name} />
                  )}
                  <AvatarFallback>
                    {profile ? getInitials(profile.full_name) : 'P'}
                  </AvatarFallback>
                </Avatar>
                <div className="overflow-hidden">
                  <p className="truncate font-semibold">{profile?.full_name || 'Patient'}</p>
                  <p className="truncate text-xs text-muted-foreground">Patient</p>
                </div>
              </>
            ) : (
              <div className="overflow-hidden w-full">
                <p className="text-xs font-bold text-destructive truncate">Session Mismatch</p>
                <p className="text-[10px] text-muted-foreground truncate">Please log in as Patient</p>
              </div>
            )}
            <Button variant="ghost" size="icon" aria-label="Log out" onClick={handleLogout}>
              <LogOut />
            </Button>
          </div>
        </div>
      </SidebarFooter>
    </Sidebar>
  );
}
