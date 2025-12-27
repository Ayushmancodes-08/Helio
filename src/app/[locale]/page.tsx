'use client';

import { useState, useEffect } from 'react';
import { useRouter, useParams } from 'next/navigation';
import { useTranslations } from 'next-intl';
import { Button } from '@/components/ui/button';
import { Card, CardHeader, CardTitle, CardDescription } from '@/components/ui/card';
import { Logo } from '@/components/icons';
import { LanguageSwitcher } from '@/components/language-switcher';
import { ModeToggle } from '@/components/mode-toggle';
import Image from 'next/image';
import { PlaceHolderImages } from '@/lib/placeholder-images';
import { ArrowRight, Heart, Users, Stethoscope } from 'lucide-react';
import { createClient } from '@/lib/supabase/client';
import { useAuth } from '@/hooks/useAuth';

export default function LandingPage() {
  const router = useRouter();
  const params = useParams();
  const locale = (params?.locale as string) || 'en-IN';
  const t = useTranslations('homepage');
  const [patientCount, setPatientCount] = useState(0);
  const heroImage = PlaceHolderImages.find((img) => img.id === 'hero');

  useEffect(() => {
    const fetchPatientCount = async () => {
      const supabase = createClient()
      const { count } = await supabase
        .from('profiles')
        .select('*', { count: 'exact', head: true })
        .eq('role', 'patient')

      setPatientCount(count || 0)
    }

    fetchPatientCount()
  }, []);

  const { isAuthenticated, profile, loading } = useAuth();

  useEffect(() => {
    if (!loading && isAuthenticated && profile?.role) {
      router.replace(`/${locale}/dashboard/${profile.role}`);
    }
  }, [loading, isAuthenticated, profile, router, locale]);

  const handleGetStarted = () => {
    router.push(`/${locale}/login`);
  };

  return (
    <div className="flex flex-col min-h-screen overflow-x-hidden">
      <header className="sticky top-0 z-50 bg-background/80 backdrop-blur-sm border-b">
        <div className="container mx-auto flex h-16 items-center justify-between px-3 sm:px-4">
          <div className="flex items-center gap-1 sm:gap-2">
            <Logo className="h-7 w-7 sm:h-8 sm:w-8 text-primary" />
            <span className="font-bold text-base sm:text-xl" data-testid="app-name">
              <span className="hidden sm:inline">{t('header.appName')}</span>
              <span className="sm:hidden">GSS</span>
            </span>
          </div>
          <div className="flex items-center gap-2 sm:gap-3">
            <LanguageSwitcher variant="homepage" />
            <ModeToggle />
            <Button onClick={handleGetStarted} className="h-9 px-3 text-sm sm:h-10 sm:px-4 sm:text-base shadow-sm hover:shadow-md active:scale-95 transition-all">
              <span className="hidden xs:inline">{t('header.loginSignup')}</span>
              <span className="xs:hidden">Login</span>
              <ArrowRight className="ml-1 sm:ml-2 h-4 w-4" />
            </Button>
          </div>
        </div>
      </header>

      <main className="flex-1 overflow-x-hidden">
        <section className="relative min-h-[60vh] sm:h-[70vh] md:h-[80vh] w-full overflow-hidden flex flex-col">
          {heroImage && (
            <Image
              src={heroImage.imageUrl}
              alt={heroImage.description}
              fill
              className="object-cover object-[center_20%]"
              sizes="100vw"
              data-ai-hint={heroImage.imageHint}
              priority
            />
          )}
          <div className="absolute inset-0 bg-gradient-to-b from-black/60 via-black/50 to-black/70" />
          <div className="relative z-10 flex flex-1 flex-col items-center justify-center text-center text-white px-4 sm:px-6 md:px-8 py-12">
            <h1 className="font-headline text-3xl font-bold tracking-tight sm:text-4xl md:text-5xl lg:text-6xl max-w-4xl drop-shadow-md">
              {t('hero.title')}
            </h1>
            <p className="mt-4 sm:mt-6 max-w-2xl text-base sm:text-lg md:text-xl lg:text-2xl text-gray-100 drop-shadow-sm leading-relaxed">
              {t('hero.subtitle')}
            </p>
          </div>
        </section>

        <section className="py-8 sm:py-12 bg-secondary">
          <div className="container mx-auto px-4 sm:px-6">
            <div className="grid grid-cols-1 md:grid-cols-3 gap-6 sm:gap-8 text-center">
              <Card className="bg-background/50 backdrop-blur-sm border-none shadow-md hover:shadow-lg transition-all duration-300">
                <CardHeader className="py-8">
                  <div className="mx-auto rounded-full bg-primary/10 p-4 w-fit mb-4">
                    <Users className="h-8 w-8 text-primary" />
                  </div>
                  <CardTitle className="text-3xl font-bold text-foreground">{patientCount > 0 ? `${patientCount}+` : '0'}</CardTitle>
                  <CardDescription className="text-base font-medium">{t('stats.patientsRegistered')}</CardDescription>
                </CardHeader>
              </Card>
              <Card className="bg-background/50 backdrop-blur-sm border-none shadow-md hover:shadow-lg transition-all duration-300">
                <CardHeader className="py-8">
                  <div className="mx-auto rounded-full bg-primary/10 p-4 w-fit mb-4">
                    <Stethoscope className="h-8 w-8 text-primary" />
                  </div>
                  <CardTitle className="text-3xl font-bold text-foreground">5+</CardTitle>
                  <CardDescription className="text-base font-medium">{t('stats.healthcareRoles')}</CardDescription>
                </CardHeader>
              </Card>
              <Card className="bg-background/50 backdrop-blur-sm border-none shadow-md hover:shadow-lg transition-all duration-300">
                <CardHeader className="py-8">
                  <div className="mx-auto rounded-full bg-primary/10 p-4 w-fit mb-4">
                    <Heart className="h-8 w-8 text-primary" />
                  </div>
                  <CardTitle className="text-3xl font-bold text-foreground">24/7</CardTitle>
                  <CardDescription className="text-base font-medium">{t('stats.accessToServices')}</CardDescription>
                </CardHeader>
              </Card>
            </div>
          </div>
        </section>

        <section id="get-started" className="py-12 sm:py-16">
          <div className="container mx-auto px-3 sm:px-4 flex flex-col items-center text-center">
            <h2 className="text-2xl sm:text-3xl font-bold">{t('cta.title')}</h2>
            <p className="mt-2 text-muted-foreground max-w-xl">
              {t('cta.description')}
            </p>
            <Button onClick={handleGetStarted} className="mt-8 h-10 px-4 py-2 sm:h-11 sm:rounded-md sm:px-8 text-base">
              {t('cta.button')} <ArrowRight className="ml-2 h-4 w-4" />
            </Button>
          </div>
        </section>

      </main>

      <footer className="py-4 sm:py-6 border-t bg-background">
        <div className="container mx-auto px-3 sm:px-4 text-center text-muted-foreground text-xs sm:text-sm">
          {t('footer.copyright', { year: new Date().getFullYear() })}
        </div>
      </footer>
    </div>
  );
}
