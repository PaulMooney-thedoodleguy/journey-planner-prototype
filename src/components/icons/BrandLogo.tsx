import { BRAND_LOGO } from '../../config/brand';
import LogoSvg from '../../assets/icons/brand/logo.svg?react';

interface BrandLogoProps {
  /** 'light' (default) — white wordmark for dark/brand backgrounds (header).
   *  'dark' — grey wordmark for white/light backgrounds (modal, login). */
  variant?: 'light' | 'dark';
}

/**
 * navIQuate wordmark.
 *
 * Renders "nav" + "IQ" (Naviquate Teal #54BF8A) + "uate" in Sofia Pro / Nunito / Arial.
 * The teal IQ matches the brand logomark. The rest of the wordmark adapts to the
 * variant: white on dark backgrounds, Naviquate Grey on light backgrounds.
 *
 * If BRAND_LOGO.type is 'svg' or 'image', those paths remain available for future use.
 */
export default function BrandLogo({ variant = 'light' }: BrandLogoProps) {
  if (BRAND_LOGO.type === 'svg') {
    return (
      <LogoSvg
        className={`h-8 w-auto ${variant === 'dark' ? 'text-brand' : 'text-white'}`}
        aria-label="navIQuate"
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

  // Default 'text' — navIQuate wordmark
  const baseColor = variant === 'dark' ? '#4E5866' : '#ffffff';

  return (
    <span
      aria-label="navIQuate"
      className="text-xl font-semibold tracking-tight leading-none select-none"
      style={{ color: baseColor }}
    >
      nav
      <span style={{ color: '#54BF8A' }}>IQ</span>
      uate
    </span>
  );
}
