import { Train } from 'lucide-react';
import { BRAND_LOGO, BRAND_META } from '../../config/brand';
import LogoSvg from '../../assets/icons/brand/logo.svg?react';

export default function BrandLogo() {
  if (BRAND_LOGO.type === 'svg') {
    return (
      <LogoSvg
        className="h-8 w-auto text-white"
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
  // 'text' fallback — preserves current look
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
