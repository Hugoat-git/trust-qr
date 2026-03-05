import { type ComponentPropsWithoutRef, type ReactNode } from 'react';
import { ArrowRightIcon } from 'lucide-react';
import { cn } from '@/lib/utils';

interface BentoGridProps extends ComponentPropsWithoutRef<'div'> {
  children: ReactNode;
  className?: string;
}

interface BentoCardProps extends ComponentPropsWithoutRef<'div'> {
  name: string;
  className: string;
  background: ReactNode;
  Icon: React.ElementType;
  description: string;
  href: string;
  cta: string;
  pro?: boolean;
}

const BentoGrid = ({ children, className, ...props }: BentoGridProps) => (
  <div
    className={cn('grid w-full grid-cols-1 gap-4 lg:grid-cols-3 lg:auto-rows-[220px]', className)}
    {...props}
  >
    {children}
  </div>
);

const BentoCard = ({
  name,
  className,
  background,
  Icon,
  description,
  href,
  cta,
  pro,
  ...props
}: BentoCardProps) => (
  <div
    className={cn(
      'group relative flex flex-col justify-end overflow-hidden rounded-2xl border border-[#3F3835] bg-[#282828] transition-all duration-300 hover:border-[#B55933]/50 hover:shadow-lg hover:shadow-[#B55933]/5',
      className
    )}
    {...props}
  >
    {/* Background */}
    <div className="pointer-events-none absolute inset-0 select-none">{background}</div>

    {/* Bottom gradient fade so text is readable over bg */}
    <div className="absolute inset-0 bg-gradient-to-t from-[#282828] via-[#282828]/60 to-transparent" />

    {/* Content */}
    <div className="relative z-10 p-5">
      <div className="flex transform-gpu flex-col gap-1 transition-all duration-300 lg:group-hover:-translate-y-7">
        <Icon className="h-7 w-7 text-[#B55933] transition-all duration-300 group-hover:scale-90" />
        <div className="mt-2 flex items-center gap-2">
          <h3 className="[font-family:var(--font-oswald)] text-base font-bold text-white">{name}</h3>
          {pro && (
            <span className="rounded bg-[#B55933]/20 px-2 py-0.5 [font-family:var(--font-jetbrains)] text-[10px] font-bold text-[#B55933]">
              Pro
            </span>
          )}
        </div>
        <p className="max-w-xs [font-family:var(--font-jetbrains)] text-xs leading-relaxed text-[#A1887D]">
          {description}
        </p>
      </div>

      {/* CTA mobile */}
      <div className="mt-3 lg:hidden">
        <a href={href} className="flex items-center gap-1 [font-family:var(--font-jetbrains)] text-xs font-semibold text-[#B55933]">
          {cta} <ArrowRightIcon className="h-3 w-3" />
        </a>
      </div>
    </div>

    {/* CTA desktop — apparaît au hover */}
    <div className="pointer-events-none absolute bottom-0 z-10 hidden w-full translate-y-6 px-5 pb-4 opacity-0 transition-all duration-300 group-hover:translate-y-0 group-hover:opacity-100 lg:flex">
      <a href={href} className="pointer-events-auto flex items-center gap-1 [font-family:var(--font-jetbrains)] text-xs font-semibold text-[#B55933]">
        {cta} <ArrowRightIcon className="h-3 w-3" />
      </a>
    </div>

    <div className="pointer-events-none absolute inset-0 transition-all duration-300 group-hover:bg-[#B55933]/[0.02]" />
  </div>
);

export { BentoCard, BentoGrid };
