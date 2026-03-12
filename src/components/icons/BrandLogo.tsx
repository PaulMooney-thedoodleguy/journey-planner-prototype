import { Train } from 'lucide-react';
import { BRAND_LOGO, BRAND_META } from '../../config/brand';
import LogoSvg from '../../assets/icons/brand/logo.svg?react';

interface BrandLogoProps {
  /** 'light' (default) — white text for dark/brand backgrounds.
   *  'dark' — brand-coloured icon + dark text for white/light backgrounds. */
  variant?: 'light' | 'dark';
}

export default function BrandLogo({ variant = 'light' }: BrandLogoProps) {
  if (BRAND_LOGO.type === 'svg') {
    return (
      <LogoSvg
        className={`h-8 w-auto ${variant === 'dark' ? 'text-brand' : 'text-white'}`}
        aria-label={BRAND_LOGO.alt}
        role="img"
      />
    );
  }
  if (BRAND_LOGO.type === 'image') {
    return (
      <img
        src={BRAND_LOGO.src}
        alt={BRAND_LOGO.alt}
        width={BRAND_LOGO.width}
        height={BRAND_LOGO.height}
        className="h-8 w-auto object-contain"
      />
    );
  }
  // 'text' fallback
  if (variant === 'dark') {
    return (
      <>
        <div className="bg-brand/10 rounded-lg p-1.5">
          <Train className="w-6 h-6 text-brand" aria-hidden="true" />
        </div>
        <span className="text-gray-900 font-bold text-lg tracking-tight leading-none">
          {BRAND_META.appName.split(' ')[0]}
          <span className="font-light"> {BRAND_META.appName.split(' ').slice(1).join(' ')}</span>
        </span>
      </>
    );
  }
  return (
    <>
      <div className="bg-white/15 rounded-lg p-1.5">
        <Train className="w-6 h-6 text-white" aria-hidden="true" />
      </div>
      <span className="text-white font-bold text-lg tracking-tight leading-none">
        {BRAND_META.appName.split(' ')[0]}
        <span className="font-light"> {BRAND_META.appName.split(' ').slice(1).join(' ')}</span>
      </span>
    </>
  );
}
