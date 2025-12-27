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
import { Home, LogOut, Building2, Stethoscope, FileEdit, User } from 'lucide-react';
import { Logo } from '@/components/icons';
import { Avatar, AvatarFallback, AvatarImage } from '@/components/ui/avatar';
import { PlaceHolderImages } from '@/lib/placeholder-images';
import { Button } from './ui/button';
import { useAuth } from '@/hooks/useAuth';
import { useLanguage } from '@/hooks/useLanguage';
import { LanguageSwitcher } from './language-switcher';

export function DataEntryOperatorSidebar() {
  const pathname = usePathname();
  const router = useRouter();
  const { profile, signOut } = useAuth();
  const { t: tCommon } = useLanguage();
  const operatorAvatar = PlaceHolderImages.find(
    (img) => img.id === 'avatar-doctor'
  );

  // Extract locale from pathname
  const locale = pathname?.split('/')[1] || 'en-IN';

  const menuItems = [
    { href: `/${locale}/dashboard/data-entry-operator`, label: tCommon('navigation.dashboard'), icon: Home, exact: true },
    {
      href: `/${locale}/dashboard/data-entry-operator/districts-hospitals`,
      label: tCommon('navigation.districtsHospitals'),
      icon: Building2,
    },
    {
      href: `/${locale}/dashboard/data-entry-operator/hospital-infrastructure`,
      label: tCommon('navigation.hospitalInfrastructure'),
      icon: Stethoscope,
    },
    {
      href: `/${locale}/dashboard/data-entry-operator/hospital-data`,
      label: tCommon('navigation.hospitalDataEntry'),
      icon: FileEdit,
    },
    {
      href: `/${locale}/dashboard/data-entry-operator/profile`,
      label: tCommon('navigation.profile'),
      icon: User,
    },
  ];

  const handleLogout = async () => {
    await signOut();
    router.push(`/${locale}/login`);
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
            <Avatar className="h-10 w-10">
              {operatorAvatar && (
                <AvatarImage
                  src={profile?.photo || operatorAvatar.imageUrl}
                  alt={profile?.full_name || 'Data Entry Operator'}
                  data-ai-hint={operatorAvatar.imageHint}
                />
              )}
              <AvatarFallback>{profile?.full_name?.split(' ').map(n => n[0]).join('') || 'DEO'}</AvatarFallback>
            </Avatar>
            <div className="overflow-hidden">
              <p className="truncate font-semibold">{profile?.full_name || 'Data Entry Operator'}</p>
              <p className="truncate text-xs text-muted-foreground">Data Entry Operator</p>
            </div>
            <Button variant="ghost" size="icon" aria-label="Log out" onClick={handleLogout}>
              <LogOut />
            </Button>
          </div>
        </div>
      </SidebarFooter>
    </Sidebar>
  );
}
