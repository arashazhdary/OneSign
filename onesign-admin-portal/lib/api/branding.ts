import { API_BASE } from './config/api-config';

// DTOs
export interface BrandingConfigDto {
  id: string;
  tenantId: string;
  companyName: string;
  logoUrl?: string;
  faviconUrl?: string;
  primaryColor: string;
  secondaryColor: string;
  accentColor: string;
  fontFamily?: string;
  customCss?: string;
  loginPageTitle?: string;
  loginPageDescription?: string;
  loginBackgroundUrl?: string;
  emailTemplateHeaderUrl?: string;
  emailTemplateFooterText?: string;
  termsOfServiceUrl?: string;
  privacyPolicyUrl?: string;
  supportEmail?: string;
  supportUrl?: string;
  customDomain?: string;
  showPoweredBy: boolean;
  createdAt: string;
  updatedAt?: string;
}

export interface UpdateBrandingDto {
  tenantId: string;
  userId: string;
  companyName: string;
  logoUrl?: string;
  faviconUrl?: string;
  primaryColor: string;
  secondaryColor: string;
  accentColor: string;
  fontFamily?: string;
  customCss?: string;
  loginPageTitle?: string;
  loginPageDescription?: string;
  loginBackgroundUrl?: string;
  emailTemplateHeaderUrl?: string;
  emailTemplateFooterText?: string;
  termsOfServiceUrl?: string;
  privacyPolicyUrl?: string;
  supportEmail?: string;
  supportUrl?: string;
  customDomain?: string;
  showPoweredBy: boolean;
}

export interface BrandingAssetDto {
  id: string;
  tenantId: string;
  assetType: string; // Logo, Favicon, Background, EmailHeader
  fileName: string;
  fileUrl: string;
  fileSize: number;
  mimeType: string;
  uploadedAt: string;
  uploadedByUserId: string;
}

export interface EmailTemplateDto {
  id: string;
  tenantId: string;
  templateType: string;
  templateName: string;
  subject: string;
  htmlContent: string;
  textContent?: string;
  isActive: boolean;
  variables: string[];
  createdAt: string;
  updatedAt?: string;
}

export interface UpdateEmailTemplateDto {
  tenantId: string;
  userId: string;
  subject: string;
  htmlContent: string;
  textContent?: string;
  isActive: boolean;
}

export interface BrandingPreviewDto {
  logoUrl?: string;
  primaryColor: string;
  secondaryColor: string;
  accentColor: string;
  loginPageTitle?: string;
  loginBackgroundUrl?: string;
}

// Tenant API functions

export async function getBrandingConfig(tenantId: string): Promise<BrandingConfigDto> {
  const response = await fetch(`${API_BASE}/api/tenant/branding?tenantId=${tenantId}`);
  if (!response.ok) throw new Error('Failed to fetch branding config');
  return response.json();
}

export async function updateBrandingConfig(
  data: UpdateBrandingDto
): Promise<BrandingConfigDto> {
  const response = await fetch(`${API_BASE}/api/tenant/branding`, {
    method: 'PUT',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify(data),
  });
  if (!response.ok) throw new Error('Failed to update branding config');
  return response.json();
}

export async function uploadBrandingAsset(
  tenantId: string,
  userId: string,
  assetType: string,
  file: File
): Promise<BrandingAssetDto> {
  const formData = new FormData();
  formData.append('tenantId', tenantId);
  formData.append('userId', userId);
  formData.append('assetType', assetType);
  formData.append('file', file);

  const response = await fetch(`${API_BASE}/api/tenant/branding/assets`, {
    method: 'POST',
    body: formData,
  });
  if (!response.ok) throw new Error('Failed to upload branding asset');
  return response.json();
}

export async function deleteBrandingAsset(
  id: string,
  tenantId: string,
  userId: string
): Promise<void> {
  const response = await fetch(
    `${API_BASE}/api/tenant/branding/assets/${id}?tenantId=${tenantId}&userId=${userId}`,
    { method: 'DELETE' }
  );
  if (!response.ok) throw new Error('Failed to delete branding asset');
}

export async function getEmailTemplates(tenantId: string): Promise<EmailTemplateDto[]> {
  const response = await fetch(`${API_BASE}/api/tenant/branding/email-templates?tenantId=${tenantId}`);
  if (!response.ok) throw new Error('Failed to fetch email templates');
  return response.json();
}

export async function getEmailTemplate(
  id: string,
  tenantId: string
): Promise<EmailTemplateDto> {
  const response = await fetch(
    `${API_BASE}/api/tenant/branding/email-templates/${id}?tenantId=${tenantId}`
  );
  if (!response.ok) throw new Error('Failed to fetch email template');
  return response.json();
}

export async function updateEmailTemplate(
  id: string,
  data: UpdateEmailTemplateDto
): Promise<EmailTemplateDto> {
  const response = await fetch(`${API_BASE}/api/tenant/branding/email-templates/${id}`, {
    method: 'PUT',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify(data),
  });
  if (!response.ok) throw new Error('Failed to update email template');
  return response.json();
}

export async function sendTestEmail(
  tenantId: string,
  templateId: string,
  recipientEmail: string
): Promise<void> {
  const response = await fetch(`${API_BASE}/api/tenant/branding/email-templates/${templateId}/test`, {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({ tenantId, recipientEmail }),
  });
  if (!response.ok) throw new Error('Failed to send test email');
}

export async function getPreview(tenantId: string): Promise<BrandingPreviewDto> {
  const response = await fetch(`${API_BASE}/api/tenant/branding/preview?tenantId=${tenantId}`);
  if (!response.ok) throw new Error('Failed to fetch branding preview');
  return response.json();
}

export async function resetToDefaults(tenantId: string, userId: string): Promise<void> {
  const response = await fetch(
    `${API_BASE}/api/tenant/branding/reset?tenantId=${tenantId}&userId=${userId}`,
    { method: 'POST' }
  );
  if (!response.ok) throw new Error('Failed to reset branding to defaults');
}

// Global API functions

export async function getGlobalBrandingDefaults(): Promise<Partial<BrandingConfigDto>> {
  const response = await fetch(`${API_BASE}/api/global/branding/defaults`);
  if (!response.ok) throw new Error('Failed to fetch global branding defaults');
  return response.json();
}

export async function updateGlobalBrandingDefaults(
  data: Partial<BrandingConfigDto>
): Promise<void> {
  const response = await fetch(`${API_BASE}/api/global/branding/defaults`, {
    method: 'PUT',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify(data),
  });
  if (!response.ok) throw new Error('Failed to update global branding defaults');
}

// Constants
export const ASSET_TYPES = ['Logo', 'Favicon', 'Background', 'EmailHeader'];

export const EMAIL_TEMPLATE_TYPES = [
  'WelcomeEmail',
  'PasswordReset',
  'EmailVerification',
  'MfaEnrollment',
  'AccessRequestNotification',
  'SecurityAlert',
  'IncidentNotification',
];

export const DEFAULT_COLORS = {
  primary: '#3B82F6',
  secondary: '#8B5CF6',
  accent: '#06B6D4',
};

// Helper functions

export function validateColor(color: string): boolean {
  return /^#[0-9A-F]{6}$/i.test(color);
}

export function isValidUrl(url: string): boolean {
  try {
    new URL(url);
    return true;
  } catch {
    return false;
  }
}

export function getTemplateVariables(templateType: string): string[] {
  const commonVars = ['{{tenantName}}', '{{companyName}}', '{{supportEmail}}', '{{year}}'];

  const typeSpecificVars: Record<string, string[]> = {
    WelcomeEmail: ['{{userName}}', '{{userEmail}}', '{{loginUrl}}'],
    PasswordReset: ['{{userName}}', '{{resetUrl}}', '{{expirationTime}}'],
    EmailVerification: ['{{userName}}', '{{verificationUrl}}', '{{expirationTime}}'],
    MfaEnrollment: ['{{userName}}', '{{enrollmentUrl}}', '{{qrCodeUrl}}'],
    AccessRequestNotification: ['{{requesterName}}', '{{resourceName}}', '{{approvalUrl}}'],
    SecurityAlert: ['{{alertType}}', '{{alertDescription}}', '{{actionUrl}}'],
    IncidentNotification: ['{{incidentId}}', '{{incidentTitle}}', '{{severity}}', '{{incidentUrl}}'],
  };

  return [...commonVars, ...(typeSpecificVars[templateType] || [])];
}
