// Helper to fetch and cache tenant branding
import { SliderImage, DEFAULT_SLIDER_IMAGES } from '@/app/components/ImageSlider';

export interface LoginPageConfig {
  backgroundType: 'color' | 'gradient' | 'image' | 'slider';
  backgroundColor?: string;
  gradientStart?: string;
  gradientEnd?: string;
  backgroundImageUrl?: string;
  showLogo: boolean;
  title?: string;
  subtitle?: string;
  sliderImages?: SliderImage[];
  sliderAutoPlay?: boolean;
  sliderInterval?: number;
  layout?: 'split' | 'centered' | 'overlay';
  formPosition?: 'left' | 'right';
}

export interface TenantBranding {
  logoUrl?: string;
  logoDarkUrl?: string;
  faviconUrl?: string;
  primaryColor?: string;
  secondaryColor?: string;
  accentColor?: string;
  tenantName?: string;
  loginPageConfig?: LoginPageConfig;
  welcomeTitle?: string;
  welcomeSubtitle?: string;
  footerText?: string;
  socialLinks?: {
    facebook?: string;
    twitter?: string;
    linkedin?: string;
    instagram?: string;
  };
  features?: {
    showSocialLogin?: boolean;
    showRememberMe?: boolean;
    showLanguageSwitcher?: boolean;
    allowRegistration?: boolean;
  };
}

// Default branding configuration
export const DEFAULT_BRANDING: TenantBranding = {
  primaryColor: '#6366f1',
  secondaryColor: '#8b5cf6',
  accentColor: '#10b981',
  tenantName: 'OneSign',
  welcomeTitle: 'Welcome Back',
  welcomeSubtitle: 'Sign in to continue to your account',
  loginPageConfig: {
    backgroundType: 'slider',
    showLogo: true,
    layout: 'split',
    formPosition: 'right',
    sliderAutoPlay: true,
    sliderInterval: 5000,
    sliderImages: DEFAULT_SLIDER_IMAGES,
    gradientStart: '#6366f1',
    gradientEnd: '#8b5cf6',
  },
  features: {
    showSocialLogin: true,
    showRememberMe: true,
    showLanguageSwitcher: true,
    allowRegistration: true,
  },
};

let cachedBranding: TenantBranding | null = null;
let cachedTenantId: string | null = null;

export async function getTenantBranding(tenantId: string): Promise<TenantBranding> {
  // Return cached branding if same tenant
  if (cachedBranding && cachedTenantId === tenantId) {
    return cachedBranding;
  }

  try {
    const baseUrl = process.env.NEXT_PUBLIC_API_URL || 'http://localhost:7000';
    const response = await fetch(`${baseUrl}/api/tenant/branding?tenantId=${tenantId}`);

    if (response.ok) {
      const data = await response.json();

      // Merge with defaults to ensure all properties exist
      cachedBranding = {
        ...DEFAULT_BRANDING,
        ...data,
        loginPageConfig: {
          ...DEFAULT_BRANDING.loginPageConfig,
          ...data.loginPageConfig,
          sliderImages: data.loginPageConfig?.sliderImages?.length > 0
            ? data.loginPageConfig.sliderImages
            : DEFAULT_SLIDER_IMAGES,
        },
        features: {
          ...DEFAULT_BRANDING.features,
          ...data.features,
        },
      };
      cachedTenantId = tenantId;
      return cachedBranding;
    }
  } catch (error) {
    console.error('Failed to fetch tenant branding:', error);
  }

  // Return default branding
  return DEFAULT_BRANDING;
}

export function clearBrandingCache(): void {
  cachedBranding = null;
  cachedTenantId = null;
}

// Helper function to get CSS variables from branding
export function getBrandingCSSVars(branding: TenantBranding): Record<string, string> {
  return {
    '--primary-color': branding.primaryColor || DEFAULT_BRANDING.primaryColor!,
    '--secondary-color': branding.secondaryColor || DEFAULT_BRANDING.secondaryColor!,
    '--accent-color': branding.accentColor || DEFAULT_BRANDING.accentColor!,
  };
}

// Helper function to get gradient style
export function getGradientStyle(branding: TenantBranding): string {
  const start = branding.loginPageConfig?.gradientStart || branding.primaryColor || '#6366f1';
  const end = branding.loginPageConfig?.gradientEnd || branding.secondaryColor || '#8b5cf6';
  return `linear-gradient(135deg, ${start}, ${end})`;
}
