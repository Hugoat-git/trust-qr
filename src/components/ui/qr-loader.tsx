import { cn } from '@/lib/utils';

interface QRLoaderProps {
  size?: number;
  className?: string;
  style?: React.CSSProperties;
}

export function QRLoader({ size = 24, className, style }: QRLoaderProps) {
  return (
    <span
      className={cn(
        'inline-block rounded-full border-2 border-current border-t-transparent animate-spin',
        className,
      )}
      style={{ width: size, height: size, ...style }}
    />
  );
}
