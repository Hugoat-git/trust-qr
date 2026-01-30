'use client';

import Link from 'next/link';
import { usePathname, useRouter } from 'next/navigation';
import { cn } from '@/lib/utils';
import { createClient } from '@/lib/supabase-browser';
import { Button } from '@/components/ui/button';
import {
  LayoutDashboard,
  Users,
  Ticket,
  Settings,
  ArrowLeft,
  LogOut,
  Store,
} from 'lucide-react';

interface AdminLayoutProps {
  children: React.ReactNode;
  params: Promise<{ slug: string }>;
}

export default function AdminLayout({ children }: AdminLayoutProps) {
  const pathname = usePathname();
  const router = useRouter();
  const slug = pathname.split('/')[2];

  const navigation = [
    {
      name: 'Dashboard',
      href: `/admin/${slug}`,
      icon: LayoutDashboard,
      current: pathname === `/admin/${slug}`,
    },
    {
      name: 'Participants',
      href: `/admin/${slug}/participants`,
      icon: Users,
      current: pathname === `/admin/${slug}/participants`,
    },
    {
      name: 'Vouchers',
      href: `/admin/${slug}/vouchers`,
      icon: Ticket,
      current: pathname === `/admin/${slug}/vouchers`,
    },
    {
      name: 'Paramètres',
      href: `/admin/${slug}/settings`,
      icon: Settings,
      current: pathname === `/admin/${slug}/settings`,
    },
  ];

  const handleLogout = async () => {
    const supabase = createClient();
    await supabase.auth.signOut();
    router.push('/admin/login');
    router.refresh();
  };

  return (
    <div className="min-h-screen bg-gray-50">
      {/* Sidebar */}
      <div className="fixed inset-y-0 left-0 z-50 w-64 bg-white border-r border-gray-200">
        <div className="flex flex-col h-full">
          {/* Logo */}
          <Link href="/admin" className="flex items-center gap-2 h-16 px-6 border-b border-gray-200 hover:bg-gray-50 transition-colors">
            <div className="w-8 h-8 bg-primary rounded-lg flex items-center justify-center">
              <span className="text-white font-bold text-sm">QR</span>
            </div>
            <span className="font-semibold text-gray-900">QR Fidélité</span>
          </Link>

          {/* Navigation */}
          <nav className="flex-1 px-4 py-4 space-y-1">
            {navigation.map((item) => (
              <Link
                key={item.name}
                href={item.href}
                className={cn(
                  'flex items-center gap-3 px-3 py-2 rounded-lg text-sm font-medium transition-colors',
                  item.current
                    ? 'bg-primary/10 text-primary'
                    : 'text-gray-600 hover:bg-gray-100 hover:text-gray-900'
                )}
              >
                <item.icon className="w-5 h-5" />
                {item.name}
              </Link>
            ))}
          </nav>

          {/* Footer actions */}
          <div className="p-4 border-t border-gray-200 space-y-2">
            <Link
              href="/admin"
              className="flex items-center gap-2 px-3 py-2 text-sm text-gray-600 hover:text-gray-900 hover:bg-gray-100 rounded-lg transition-colors"
            >
              <Store className="w-4 h-4" />
              Changer de restaurant
            </Link>
            <Link
              href={`/${slug}`}
              target="_blank"
              className="flex items-center gap-2 px-3 py-2 text-sm text-gray-600 hover:text-gray-900 hover:bg-gray-100 rounded-lg transition-colors"
            >
              <ArrowLeft className="w-4 h-4" />
              Voir la page publique
            </Link>
            <Button
              variant="ghost"
              className="w-full justify-start text-red-600 hover:text-red-700 hover:bg-red-50"
              onClick={handleLogout}
            >
              <LogOut className="w-4 h-4 mr-2" />
              Déconnexion
            </Button>
          </div>
        </div>
      </div>

      {/* Main content */}
      <div className="pl-64">
        <main className="p-8">{children}</main>
      </div>
    </div>
  );
}
