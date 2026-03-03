import { cn } from '@/lib/utils';

interface TrustQRLogoProps {
  size?: number;
  className?: string;
}

export function TrustQRLogo({ size = 32, className }: TrustQRLogoProps) {
  return (
    <svg
      width={size}
      height={size}
      viewBox="0 0 100 100"
      fill="none"
      xmlns="http://www.w3.org/2000/svg"
      className={cn('flex-shrink-0', className)}
    >
      {/* Star shape as clip path */}
      <defs>
        <clipPath id="starClip">
          <path d="M50 4L61.8 34.5L95.1 37.3L70 58.8L77.6 91.5L50 74.5L22.4 91.5L30 58.8L4.9 37.3L38.2 34.5Z" />
        </clipPath>
      </defs>

      {/* Star background */}
      <path
        d="M50 4L61.8 34.5L95.1 37.3L70 58.8L77.6 91.5L50 74.5L22.4 91.5L30 58.8L4.9 37.3L38.2 34.5Z"
        fill="currentColor"
      />

      {/* QR pattern inside star */}
      <g clipPath="url(#starClip)" opacity="0.25">
        {/* Top-left finder */}
        <rect x="20" y="22" width="22" height="22" rx="2" fill="white" />
        <rect x="24" y="26" width="14" height="14" rx="1" fill="currentColor" />
        <rect x="28" y="30" width="6" height="6" fill="white" />

        {/* Top-right finder */}
        <rect x="58" y="22" width="22" height="22" rx="2" fill="white" />
        <rect x="62" y="26" width="14" height="14" rx="1" fill="currentColor" />
        <rect x="66" y="30" width="6" height="6" fill="white" />

        {/* Bottom-left finder */}
        <rect x="20" y="56" width="22" height="22" rx="2" fill="white" />
        <rect x="24" y="60" width="14" height="14" rx="1" fill="currentColor" />
        <rect x="28" y="64" width="6" height="6" fill="white" />

        {/* Data modules */}
        <rect x="46" y="26" width="6" height="6" fill="white" />
        <rect x="46" y="36" width="6" height="6" fill="white" />
        <rect x="46" y="46" width="6" height="6" fill="white" />
        <rect x="46" y="58" width="6" height="6" fill="white" />
        <rect x="46" y="68" width="6" height="6" fill="white" />
        <rect x="56" y="50" width="6" height="6" fill="white" />
        <rect x="66" y="50" width="6" height="6" fill="white" />
        <rect x="58" y="58" width="6" height="6" fill="white" />
        <rect x="68" y="60" width="6" height="6" fill="white" />
        <rect x="58" y="68" width="6" height="6" fill="white" />
        <rect x="68" y="70" width="6" height="6" fill="white" />
        <rect x="76" y="58" width="6" height="6" fill="white" />
      </g>
    </svg>
  );
}
