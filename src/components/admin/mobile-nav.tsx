'use client';

import Link from 'next/link';
import { cn } from '@/lib/utils';

interface NavItem {
  name: string;
  href: string;
  icon: React.ComponentType<{ className?: string }>;
  current: boolean;
}

interface MobileNavProps {
  navigation: NavItem[];
}

export function MobileNav({ navigation }: MobileNavProps) {
  return (
    <nav
      className={cn(
        'fixed bottom-0 left-0 right-0 z-50',
        'md:hidden',
        'bg-sidebar/95 backdrop-blur-md',
        'border-t border-sidebar-border',
        'pb-[env(safe-area-inset-bottom)]',
      )}
    >
      <div className="flex items-center justify-around h-16">
        {navigation.map((item) => (
          <Link
            key={item.name}
            href={item.href}
            className={cn(
              'flex flex-col items-center justify-center flex-1 h-full gap-0.5 transition-colors',
              item.current
                ? 'text-primary'
                : 'text-muted-foreground hover:text-foreground',
            )}
          >
            <div
              className={cn(
                'w-1 h-1 rounded-full mb-0.5 transition-opacity',
                item.current ? 'bg-primary opacity-100' : 'opacity-0',
              )}
            />
            <item.icon className="w-5 h-5" />
            <span className="text-[10px] font-medium leading-none mt-0.5">
              {item.name}
            </span>
          </Link>
        ))}
      </div>
    </nav>
  );
}
