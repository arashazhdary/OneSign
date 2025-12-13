import { EmailTemplate, EmailTemplateType } from '@/components/branding/EmailTemplateEditor';

export const DEFAULT_EMAIL_TEMPLATES: EmailTemplate[] = [
  {
    id: 'welcome',
    name: 'Welcome Email',
    subject: 'Welcome to {{company.name}}!',
    type: 'welcome' as EmailTemplateType,
    body: '',
    htmlBody: `
      <h1>Welcome to {{company.name}}, {{user.firstName}}!</h1>
      <p>We're excited to have you on board. Your account has been successfully created.</p>
      <p>Here's what you can do next:</p>
      <ul>
        <li>Complete your profile</li>
        <li>Explore our features</li>
        <li>Connect with your team</li>
      </ul>
      <p>If you have any questions, feel free to reach out to our support team at {{support.email}}.</p>
      <p>Best regards,<br>The {{company.name}} Team</p>
    `,
  },
  {
    id: 'password_reset',
    name: 'Password Reset',
    subject: 'Reset Your Password - {{company.name}}',
    type: 'password_reset' as EmailTemplateType,
    body: '',
    htmlBody: `
      <h1>Password Reset Request</h1>
      <p>Hello {{user.firstName}},</p>
      <p>We received a request to reset your password for your {{company.name}} account.</p>
      <p>Click the button below to reset your password:</p>
      <p style="text-align: center; margin: 30px 0;">
        <a href="{{reset_link}}" style="background-color: #6366f1; color: white; padding: 12px 24px; text-decoration: none; border-radius: 8px; display: inline-block;">
          Reset Password
        </a>
      </p>
      <p>Or copy and paste this link into your browser:</p>
      <p style="word-break: break-all; color: #6b7280;">{{reset_link}}</p>
      <p><strong>This link will expire in 1 hour.</strong></p>
      <p>If you didn't request a password reset, you can safely ignore this email. Your password will remain unchanged.</p>
      <p>Best regards,<br>The {{company.name}} Team</p>
      <hr style="margin: 30px 0; border: none; border-top: 1px solid #e5e7eb;">
      <p style="font-size: 12px; color: #6b7280;">
        If you have any questions, contact us at {{support.email}}
      </p>
    `,
  },
  {
    id: 'magic_link',
    name: 'Magic Link Login',
    subject: 'Your Login Link - {{company.name}}',
    type: 'magic_link' as EmailTemplateType,
    body: '',
    htmlBody: `
      <h1>Your Magic Login Link</h1>
      <p>Hello {{user.firstName}},</p>
      <p>Click the button below to securely sign in to your {{company.name}} account:</p>
      <p style="text-align: center; margin: 30px 0;">
        <a href="{{magic_link}}" style="background-color: #8b5cf6; color: white; padding: 12px 24px; text-decoration: none; border-radius: 8px; display: inline-block;">
          Sign In to {{company.name}}
        </a>
      </p>
      <p>Or copy and paste this link into your browser:</p>
      <p style="word-break: break-all; color: #6b7280;">{{magic_link}}</p>
      <p><strong>This link will expire in 15 minutes and can only be used once.</strong></p>
      <p>If you didn't request this login link, please ignore this email and ensure your account is secure.</p>
      <p>Best regards,<br>The {{company.name}} Team</p>
      <hr style="margin: 30px 0; border: none; border-top: 1px solid #e5e7eb;">
      <p style="font-size: 12px; color: #6b7280;">
        For security reasons, never share this link with anyone. If you have concerns, contact {{support.email}}
      </p>
    `,
  },
  {
    id: 'mfa_code',
    name: 'MFA Verification Code',
    subject: 'Your Verification Code - {{company.name}}',
    type: 'mfa_code' as EmailTemplateType,
    body: '',
    htmlBody: `
      <h1>Your Verification Code</h1>
      <p>Hello {{user.firstName}},</p>
      <p>Your multi-factor authentication code is:</p>
      <div style="text-align: center; margin: 30px 0;">
        <div style="background-color: #f3f4f6; padding: 20px; border-radius: 12px; display: inline-block;">
          <span style="font-size: 32px; font-weight: bold; letter-spacing: 8px; color: #1f2937; font-family: monospace;">
            {{mfa_code}}
          </span>
        </div>
      </div>
      <p><strong>This code will expire in 10 minutes.</strong></p>
      <p>If you didn't request this code, please secure your account immediately and contact support.</p>
      <p>Best regards,<br>The {{company.name}} Team</p>
      <hr style="margin: 30px 0; border: none; border-top: 1px solid #e5e7eb;">
      <p style="font-size: 12px; color: #6b7280;">
        Never share your verification codes with anyone. {{company.name}} will never ask for your codes.
        Contact us at {{support.email}} if you need help.
      </p>
    `,
  },
  {
    id: 'account_locked',
    name: 'Account Locked',
    subject: 'Security Alert: Account Locked - {{company.name}}',
    type: 'account_locked' as EmailTemplateType,
    body: '',
    htmlBody: `
      <h1>⚠️ Your Account Has Been Locked</h1>
      <p>Hello {{user.firstName}},</p>
      <p>We've temporarily locked your {{company.name}} account due to multiple failed login attempts.</p>
      <div style="background-color: #fef2f2; border-left: 4px solid #ef4444; padding: 16px; margin: 20px 0; border-radius: 4px;">
        <p style="margin: 0; color: #991b1b;">
          <strong>Security Notice:</strong> This is a precautionary measure to protect your account from unauthorized access.
        </p>
      </div>
      <h2>What should you do?</h2>
      <ol>
        <li>Wait 30 minutes for the automatic unlock</li>
        <li>Or reset your password immediately using the link below</li>
        <li>Review your recent account activity</li>
      </ol>
      <p style="text-align: center; margin: 30px 0;">
        <a href="{{reset_link}}" style="background-color: #ef4444; color: white; padding: 12px 24px; text-decoration: none; border-radius: 8px; display: inline-block;">
          Reset Password Now
        </a>
      </p>
      <h2>Need help?</h2>
      <p>If you didn't attempt to log in, or if you believe your account may be compromised, please contact our security team immediately at {{support.email}}.</p>
      <p>Best regards,<br>The {{company.name}} Security Team</p>
      <hr style="margin: 30px 0; border: none; border-top: 1px solid #e5e7eb;">
      <p style="font-size: 12px; color: #6b7280;">
        This is an automated security notification. For immediate assistance, contact {{support.email}}
      </p>
    `,
  },
];

export function getDefaultTemplate(type: EmailTemplateType): EmailTemplate | undefined {
  return DEFAULT_EMAIL_TEMPLATES.find(t => t.type === type);
}

export function getTemplateTypeLabel(type: EmailTemplateType): string {
  const labels: Record<EmailTemplateType, string> = {
    welcome: 'Welcome Email',
    password_reset: 'Password Reset',
    magic_link: 'Magic Link Login',
    mfa_code: 'MFA Verification Code',
    account_locked: 'Account Locked',
  };
  return labels[type] || type;
}
