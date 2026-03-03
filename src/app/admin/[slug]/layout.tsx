'use client';

import { useState, useEffect, Suspense } from 'react';
import Link from 'next/link';
import { usePathname, useRouter } from 'next/navigation';
import { QRLoader } from '@/components/ui/qr-loader';
import { TrustQRLogo } from '@/components/ui/trustqr-logo';
import { MobileNav } from '@/components/admin/mobile-nav';
import { cn } from '@/lib/utils';
import { createClient } from '@/lib/supabase-browser';
import { Button } from '@/components/ui/button';
import { OnboardingProgress } from '@/components/admin/onboarding-progress';
import {
  LayoutDashboard,
  Users,
  Ticket,
  Settings,
  ArrowLeft,
  LogOut,
  Store,
  QrCode,
  ChevronUp,
  Moon,
  Sun,
  RotateCcw,
  ExternalLink,
} from 'lucide-react';
import { useTheme } from 'next-themes';

interface RestaurantData {
  id: string;
  name: string;
  logo_url: string | null;
  google_review_url: string;
  primary_color: string;
}

interface AdminLayoutProps {
  children: React.ReactNode;
  params: Promise<{ slug: string }>;
}

export default function AdminLayout({ children }: AdminLayoutProps) {
  const pathname = usePathname();
  const router = useRouter();
  const slug = pathname.split('/')[2];
  const { theme, setTheme } = useTheme();

  const [restaurant, setRestaurant] = useState<RestaurantData | null>(null);
  const [onboardingDismissed, setOnboardingDismissed] = useState(false);
  const [hasLinkedQR, setHasLinkedQR] = useState(false);
  const [userEmail, setUserEmail] = useState<string | null>(null);
  const [menuOpen, setMenuOpen] = useState(false);
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false);
  const [mounted, setMounted] = useState(false);

  useEffect(() => setMounted(true), []);

  useEffect(() => {
    const dismissed = localStorage.getItem(`onboarding_dismissed_${slug}`);
    setOnboardingDismissed(dismissed === 'true');

    async function fetchData() {
      try {
        // Fetch user email
        const supabase = createClient();
        const { data: { user } } = await supabase.auth.getUser();
        if (user?.email) setUserEmail(user.email);

        // Fetch restaurant
        const response = await fetch(`/api/admin/restaurant?slug=${slug}`);
        const data = await response.json();
        if (response.ok && data.restaurant) {
          setRestaurant(data.restaurant as RestaurantData);

          const qrResponse = await fetch(`/api/admin/qr-codes?restaurantId=${data.restaurant.id}`);
          const qrData = await qrResponse.json();
          setHasLinkedQR(qrData.qrCodes && qrData.qrCodes.length > 0);
        }
      } catch (error) {
        console.error('Error fetching data:', error);
      }
    }

    if (slug) fetchData();
  }, [slug, pathname]);

  const navigation = [
    { name: 'Dashboard', href: `/admin/${slug}`, icon: LayoutDashboard, current: pathname === `/admin/${slug}` },
    { name: 'Participants', href: `/admin/${slug}/participants`, icon: Users, current: pathname === `/admin/${slug}/participants` },
    { name: 'QR Codes', href: `/admin/${slug}/qr-codes`, icon: QrCode, current: pathname === `/admin/${slug}/qr-codes` },
    { name: 'Vouchers', href: `/admin/${slug}/vouchers`, icon: Ticket, current: pathname === `/admin/${slug}/vouchers` },
    { name: 'Paramètres', href: `/admin/${slug}/settings`, icon: Settings, current: pathname === `/admin/${slug}/settings` },
  ];

  const handleLogout = async () => {
    const supabase = createClient();
    await supabase.auth.signOut();
    router.push('/admin/login');
    router.refresh();
  };

  const handleRedoOnboarding = () => {
    localStorage.removeItem(`onboarding_dismissed_${slug}`);
    setOnboardingDismissed(false);
    setMenuOpen(false);
    router.push(`/admin/${slug}/onboarding`);
  };

  return (
    <div className="min-h-screen bg-background">
      {/* Sidebar — hidden on mobile */}
      <div className="hidden md:flex md:flex-col fixed inset-y-0 left-0 z-50 w-64 bg-sidebar border-r border-sidebar-border">
        <div className="flex flex-col h-full">
          {/* Logo */}
          <Link href="/admin" className="flex items-center gap-2.5 h-16 px-6 border-b border-sidebar-border hover:bg-sidebar-accent/50 transition-colors">
            <TrustQRLogo size={28} className="text-primary" />
            <span className="font-semibold text-foreground tracking-tight">TrustQR</span>
          </Link>

          {/* Onboarding Progress */}
          {restaurant && !onboardingDismissed && !pathname.includes('/onboarding') && (
            <div className="pt-4">
              <OnboardingProgress
                slug={slug}
                name={restaurant.name}
                googleReviewUrl={restaurant.google_review_url}
                logoUrl={restaurant.logo_url}
                primaryColor={restaurant.primary_color}
                hasLinkedQR={hasLinkedQR}
              />
            </div>
          )}

          {/* Navigation */}
          <nav className="flex-1 px-3 py-4 space-y-0.5">
            {navigation.map((item) => (
              <Link
                key={item.name}
                href={item.href}
                className={cn(
                  'flex items-center gap-3 px-3 py-2.5 rounded-lg text-[13px] font-medium transition-all duration-150',
                  item.current
                    ? 'bg-primary/10 text-primary shadow-sm shadow-primary/5'
                    : 'text-muted-foreground hover:bg-sidebar-accent hover:text-foreground'
                )}
              >
                <item.icon className={cn('w-[18px] h-[18px]', item.current && 'text-primary')} />
                {item.name}
              </Link>
            ))}
          </nav>

          {/* User menu bottom */}
          <div className="relative border-t border-sidebar-border">
            {/* Dropdown menu */}
            {menuOpen && (
              <>
                <div className="fixed inset-0 z-40" onClick={() => setMenuOpen(false)} />
                <div className="absolute bottom-full left-0 right-0 z-50 p-1.5 mb-1 mx-2 bg-popover border border-border rounded-xl shadow-xl shadow-black/20 animate-in fade-in slide-in-from-bottom-2 duration-150">
                  <button
                    type="button"
                    onClick={() => { setTheme(theme === 'dark' ? 'light' : 'dark'); setMenuOpen(false); }}
                    className="w-full flex items-center gap-3 px-3 py-2 text-sm text-muted-foreground hover:text-foreground hover:bg-accent rounded-lg transition-colors"
                  >
                    {mounted && theme === 'dark' ? <Sun className="w-4 h-4" /> : <Moon className="w-4 h-4" />}
                    {mounted && theme === 'dark' ? 'Mode clair' : 'Mode sombre'}
                  </button>
                  <button
                    type="button"
                    onClick={handleRedoOnboarding}
                    className="w-full flex items-center gap-3 px-3 py-2 text-sm text-muted-foreground hover:text-foreground hover:bg-accent rounded-lg transition-colors"
                  >
                    <RotateCcw className="w-4 h-4" />
                    Revoir l'onboarding
                  </button>
                  <Link
                    href="/admin"
                    onClick={() => setMenuOpen(false)}
                    className="flex items-center gap-3 px-3 py-2 text-sm text-muted-foreground hover:text-foreground hover:bg-accent rounded-lg transition-colors"
                  >
                    <Store className="w-4 h-4" />
                    Mes restaurants
                  </Link>
                  <Link
                    href={`/${slug}`}
                    target="_blank"
                    onClick={() => setMenuOpen(false)}
                    className="flex items-center gap-3 px-3 py-2 text-sm text-muted-foreground hover:text-foreground hover:bg-accent rounded-lg transition-colors"
                  >
                    <ExternalLink className="w-4 h-4" />
                    Voir la page publique
                  </Link>
                  <div className="my-1 border-t border-border" />
                  <button
                    type="button"
                    onClick={handleLogout}
                    className="w-full flex items-center gap-3 px-3 py-2 text-sm text-red-500 hover:bg-red-500/10 rounded-lg transition-colors"
                  >
                    <LogOut className="w-4 h-4" />
                    Déconnexion
                  </button>
                </div>
              </>
            )}

            {/* Email trigger */}
            <button
              type="button"
              onClick={() => setMenuOpen(!menuOpen)}
              className="w-full flex items-center gap-3 px-5 py-3.5 text-left hover:bg-sidebar-accent transition-colors"
            >
              <div className="w-8 h-8 rounded-full bg-primary/12 flex items-center justify-center flex-shrink-0 ring-1 ring-primary/10">
                <span className="text-xs font-semibold text-primary uppercase">
                  {userEmail ? userEmail[0] : '?'}
                </span>
              </div>
              <span className="text-[13px] text-muted-foreground truncate flex-1">
                {userEmail || 'Chargement...'}
              </span>
              <ChevronUp className={cn('w-4 h-4 text-muted-foreground transition-transform duration-200', menuOpen && 'rotate-180')} />
            </button>
          </div>
        </div>
      </div>

      {/* Mobile top header — visible only on mobile */}
      <header className="md:hidden fixed top-0 left-0 right-0 z-40 h-14 bg-sidebar border-b border-sidebar-border flex items-center justify-between px-4">
        <div className="flex items-center gap-2">
          <TrustQRLogo size={22} className="text-primary" />
          <span className="font-semibold text-sm text-foreground truncate max-w-[180px]">
            {restaurant?.name ?? 'TrustQR'}
          </span>
        </div>
        <button
          type="button"
          onClick={() => setMobileMenuOpen(!mobileMenuOpen)}
          className="w-8 h-8 rounded-full bg-primary/12 flex items-center justify-center ring-1 ring-primary/10"
        >
          <span className="text-xs font-semibold text-primary uppercase">
            {userEmail ? userEmail[0] : '?'}
          </span>
        </button>
      </header>

      {/* Mobile user menu dropdown */}
      {mobileMenuOpen && (
        <>
          <div className="md:hidden fixed inset-0 z-40" onClick={() => setMobileMenuOpen(false)} />
          <div className="md:hidden fixed top-14 right-4 left-4 z-50 p-1.5 bg-popover border border-border rounded-xl shadow-xl shadow-black/20 animate-in fade-in slide-in-from-top-2 duration-150">
            <button
              type="button"
              onClick={() => { setTheme(theme === 'dark' ? 'light' : 'dark'); setMobileMenuOpen(false); }}
              className="w-full flex items-center gap-3 px-3 py-2 text-sm text-muted-foreground hover:text-foreground hover:bg-accent rounded-lg transition-colors"
            >
              {mounted && theme === 'dark' ? <Sun className="w-4 h-4" /> : <Moon className="w-4 h-4" />}
              {mounted && theme === 'dark' ? 'Mode clair' : 'Mode sombre'}
            </button>
            <button
              type="button"
              onClick={handleRedoOnboarding}
              className="w-full flex items-center gap-3 px-3 py-2 text-sm text-muted-foreground hover:text-foreground hover:bg-accent rounded-lg transition-colors"
            >
              <RotateCcw className="w-4 h-4" />
              Revoir l'onboarding
            </button>
            <Link
              href="/admin"
              onClick={() => setMobileMenuOpen(false)}
              className="flex items-center gap-3 px-3 py-2 text-sm text-muted-foreground hover:text-foreground hover:bg-accent rounded-lg transition-colors"
            >
              <Store className="w-4 h-4" />
              Mes restaurants
            </Link>
            <Link
              href={`/${slug}`}
              target="_blank"
              onClick={() => setMobileMenuOpen(false)}
              className="flex items-center gap-3 px-3 py-2 text-sm text-muted-foreground hover:text-foreground hover:bg-accent rounded-lg transition-colors"
            >
              <ExternalLink className="w-4 h-4" />
              Voir la page publique
            </Link>
            <div className="my-1 border-t border-border" />
            <button
              type="button"
              onClick={handleLogout}
              className="w-full flex items-center gap-3 px-3 py-2 text-sm text-red-500 hover:bg-red-500/10 rounded-lg transition-colors"
            >
              <LogOut className="w-4 h-4" />
              Déconnexion
            </button>
          </div>
        </>
      )}

      {/* Main content */}
      <div className="pl-0 md:pl-64">
        <main className="p-4 md:p-8 pt-[calc(3.5rem+1rem)] md:pt-8 pb-20 md:pb-8">
          <Suspense
            fallback={
              <div className="flex items-center justify-center py-32">
                <QRLoader size={48} />
              </div>
            }
          >
            {children}
          </Suspense>
        </main>
      </div>

      <MobileNav navigation={navigation} />
    </div>
  );
}
