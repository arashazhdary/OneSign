import React from 'react';
import EmailTemplate from './EmailTemplate';

export interface PasswordResetEmailProps {
  userName: string;
  resetUrl: string;
  expiresIn: string;
}

const PasswordResetEmail: React.FC<PasswordResetEmailProps> = ({
  userName,
  resetUrl,
  expiresIn = '1 hour'
}) => {
  return (
    <EmailTemplate preheader="Reset your OneSign password">
      <h1 style={{ color: '#1e293b', marginTop: 0 }}>Password Reset Request</h1>
      <p style={{ fontSize: '16px', color: '#475569' }}>
        Hi {userName},
      </p>
      <p style={{ fontSize: '16px', color: '#475569' }}>
        We received a request to reset your password for your OneSign account.
        If you didn't make this request, you can safely ignore this email.
      </p>

      <div
        style={{
          backgroundColor: '#fef3c7',
          border: '2px solid #fbbf24',
          padding: '16px',
          borderRadius: '8px',
          margin: '24px 0'
        }}
      >
        <p style={{ margin: 0, color: '#92400e', fontSize: '14px' }}>
          ⚠️ <strong>Security Notice:</strong> This link will expire in {expiresIn}.
          For your security, do not share this link with anyone.
        </p>
      </div>

      <div style={{ textAlign: 'center', margin: '32px 0' }}>
        <a
          href={resetUrl}
          className="button"
          style={{
            display: 'inline-block',
            padding: '12px 32px',
            background: 'linear-gradient(135deg, #3b82f6 0%, #2563eb 100%)',
            color: 'white',
            textDecoration: 'none',
            borderRadius: '8px',
            fontWeight: '600'
          }}
        >
          Reset Your Password
        </a>
      </div>

      <p style={{ fontSize: '14px', color: '#64748b', marginTop: '32px' }}>
        If the button doesn't work, copy and paste this link into your browser:
        <br />
        <a href={resetUrl} style={{ color: '#3b82f6', wordBreak: 'break-all' }}>
          {resetUrl}
        </a>
      </p>

      <p style={{ fontSize: '14px', color: '#64748b' }}>
        If you continue to have problems, please contact our support team.
      </p>

      <p style={{ fontSize: '14px', color: '#64748b' }}>
        Best regards,<br />
        The OneSign Team
      </p>
    </EmailTemplate>
  );
};

export default PasswordResetEmail;
