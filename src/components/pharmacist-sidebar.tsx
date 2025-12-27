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
import { Home, LogOut, Package, User, ReceiptText, LineChart, FileText, BarChart } from 'lucide-react';
import { Logo } from '@/components/icons';
import { Avatar, AvatarFallback, AvatarImage } from '@/components/ui/avatar';
import { PlaceHolderImages } from '@/lib/placeholder-images';
import { Button } from './ui/button';
import { useAuth } from '@/hooks/useAuth';
import { useLanguage } from '@/hooks/useLanguage';
import { LanguageSwitcher } from './language-switcher';

export function PharmacistSidebar() {
  const pathname = usePathname();
  const router = useRouter();
  const { profile, signOut } = useAuth();
  const { t: tCommon } = useLanguage();
  // Extract locale from pathname
  const locale = pathname?.split('/')[1] || 'en-IN';
  const pharmacistAvatar = PlaceHolderImages.find(
    (img) => img.id === 'avatar-doctor'
  );

  const menuItems = [
    { href: `/${locale}/dashboard/pharmacist`, label: tCommon('common.navigation.dashboard'), icon: Home, exact: true },
    {
      href: `/${locale}/dashboard/pharmacist/inventory`,
      label: tCommon('common.navigation.inventory'),
      icon: Package,
    },
    {
      href: `/${locale}/dashboard/pharmacist/prescriptions`,
      label: tCommon('common.navigation.prescriptions'),
      icon: FileText,
    },
    {
      href: `/${locale}/dashboard/pharmacist/reports`,
      label: tCommon('common.navigation.reports'),
      icon: BarChart,
    },
    {
      href: `/${locale}/dashboard/pharmacist/profile`,
      label: tCommon('common.navigation.profile'),
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
        <div className="flex flex-col gap-2 p-2">
          <LanguageSwitcher variant="dashboard" className="w-full justify-start" />
          <div className="flex items-center gap-2 min-h-[52px]">
            {profile?.role === 'pharmacist' ? (
              <>
                <Avatar className="h-10 w-10 shrink-0">
                  {pharmacistAvatar && (
                    <AvatarImage
                      src={profile?.photo || pharmacistAvatar.imageUrl}
                      alt={profile?.full_name || 'Pharmacist'}
                      data-ai-hint={pharmacistAvatar.imageHint}
                    />
                  )}
                  <AvatarFallback>{profile?.full_name?.split(' ').map(n => n[0]).join('') || 'P'}</AvatarFallback>
                </Avatar>
                <div className="flex-1 min-w-0">
                  <p className="truncate font-semibold text-sm">{profile?.full_name || 'Pharmacist'}</p>
                  <p className="truncate text-xs text-muted-foreground">Pharmacist</p>
                </div>
              </>
            ) : (
              <div className="flex-1 min-w-0">
                <p className="text-xs font-bold text-destructive truncate">Session Mismatch</p>
                <p className="text-[10px] text-muted-foreground truncate">Please log in as Pharmacist</p>
              </div>
            )}
            <Button variant="ghost" size="icon" className="shrink-0" aria-label="Log out" onClick={handleLogout}>
              <LogOut className="h-4 w-4" />
            </Button>
          </div>
        </div>
      </SidebarFooter>
    </Sidebar>
  );
}
