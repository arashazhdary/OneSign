import React from 'react';
import EmailTemplate from './EmailTemplate';

export interface WelcomeEmailProps {
  userName: string;
  loginUrl: string;
}

const WelcomeEmail: React.FC<WelcomeEmailProps> = ({ userName, loginUrl }) => {
  return (
    <EmailTemplate preheader={`Welcome to OneSign Admin Portal, ${userName}!`}>
      <h1 style={{ color: '#1e293b', marginTop: 0 }}>Welcome to OneSign! 🎉</h1>
      <p style={{ fontSize: '16px', color: '#475569' }}>
        Hi {userName},
      </p>
      <p style={{ fontSize: '16px', color: '#475569' }}>
        We're excited to have you on board! Your account has been successfully created
        and you're all set to start managing your organization's identity and access.
      </p>

      <div style={{ backgroundColor: '#f1f5f9', padding: '20px', borderRadius: '8px', margin: '24px 0' }}>
        <h3 style={{ marginTop: 0, color: '#1e293b' }}>Getting Started</h3>
        <ul style={{ paddingLeft: '20px', color: '#475569' }}>
          <li>Set up your profile and preferences</li>
          <li>Invite team members to collaborate</li>
          <li>Configure your organization settings</li>
          <li>Explore our powerful features</li>
        </ul>
      </div>

      <div style={{ textAlign: 'center', margin: '32px 0' }}>
        <a
          href={loginUrl}
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
          Access Your Dashboard
        </a>
      </div>

      <p style={{ fontSize: '14px', color: '#64748b', marginTop: '32px' }}>
        If you have any questions, our support team is here to help. Just reply to this email!
      </p>

      <p style={{ fontSize: '14px', color: '#64748b' }}>
        Best regards,<br />
        The OneSign Team
      </p>
    </EmailTemplate>
  );
};

export default WelcomeEmail;
