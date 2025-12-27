'use client';

import { useState, useEffect } from 'react';
import { useRouter, useParams } from 'next/navigation';
import { useTranslations } from 'next-intl';
import { Button } from '@/components/ui/button';
import { Card, CardHeader, CardTitle, CardDescription } from '@/components/ui/card';
import { Logo } from '@/components/icons';
import { LanguageSwitcher } from '@/components/language-switcher';
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
          <div className="flex items-center gap-2 sm:gap-4">
            <LanguageSwitcher variant="homepage" />
            <Button onClick={handleGetStarted} className="text-sm sm:text-base px-3 sm:px-4">
              <span className="hidden xs:inline">{t('header.loginSignup')}</span>
              <span className="xs:hidden">Login</span>
              <ArrowRight className="ml-1 sm:ml-2 h-4 w-4" />
            </Button>
          </div>
        </div>
      </header>

      <main className="flex-1 overflow-x-hidden">
        <section className="relative h-[50vh] sm:h-[60vh] md:h-[70vh] lg:h-[80vh] w-full overflow-hidden">
          {heroImage && (
            <Image
              src={heroImage.imageUrl}
              alt={heroImage.description}
              fill
              className="object-cover object-center sm:object-[center_30%] md:object-[center_35%]"
              sizes="100vw"
              data-ai-hint={heroImage.imageHint}
              priority
            />
          )}
          <div className="absolute inset-0 bg-gradient-to-b from-black/40 via-black/50 to-black/60" />
          <div className="relative z-10 flex h-full flex-col items-center justify-center text-center text-white px-3 sm:px-4 md:px-8">
            <h1 className="font-headline text-2xl font-bold tracking-tight sm:text-3xl md:text-4xl lg:text-5xl xl:text-6xl max-w-4xl">
              {t('hero.title')}
            </h1>
            <p className="mt-3 sm:mt-4 max-w-2xl text-sm sm:text-base md:text-lg lg:text-xl">
              {t('hero.subtitle')}
            </p>
          </div>
        </section>

        <section className="py-8 sm:py-12 bg-secondary">
          <div className="container mx-auto px-3 sm:px-4">
            <div className="grid grid-cols-1 md:grid-cols-3 gap-8 text-center">
              <Card>
                <CardHeader>
                  <Users className="mx-auto h-12 w-12 text-primary" />
                  <CardTitle className="mt-4">{patientCount > 0 ? `${patientCount}+` : '0'}</CardTitle>
                  <CardDescription>{t('stats.patientsRegistered')}</CardDescription>
                </CardHeader>
              </Card>
              <Card>
                <CardHeader>
                  <Stethoscope className="mx-auto h-12 w-12 text-primary" />
                  <CardTitle>5+</CardTitle>
                  <CardDescription>{t('stats.healthcareRoles')}</CardDescription>
                </CardHeader>
              </Card>
              <Card>
                <CardHeader>
                  <Heart className="mx-auto h-12 w-12 text-primary" />
                  <CardTitle>24/7</CardTitle>
                  <CardDescription>{t('stats.accessToServices')}</CardDescription>
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
            <Button onClick={handleGetStarted} size="lg" className="mt-8">
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
