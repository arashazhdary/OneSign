import React from 'react';
import EmailTemplate from './EmailTemplate';

export interface InvitationEmailProps {
  inviterName: string;
  organizationName: string;
  inviteUrl: string;
  role: string;
}

const InvitationEmail: React.FC<InvitationEmailProps> = ({
  inviterName,
  organizationName,
  inviteUrl,
  role
}) => {
  return (
    <EmailTemplate preheader={`${inviterName} invited you to join ${organizationName}`}>
      <h1 style={{ color: '#1e293b', marginTop: 0 }}>You're Invited! 🎊</h1>
      <p style={{ fontSize: '16px', color: '#475569' }}>
        <strong>{inviterName}</strong> has invited you to join{' '}
        <strong>{organizationName}</strong> on OneSign Admin Portal.
      </p>

      <div
        style={{
          backgroundColor: '#ede9fe',
          padding: '20px',
          borderRadius: '8px',
          margin: '24px 0',
          border: '2px solid #a855f7'
        }}
      >
        <h3 style={{ marginTop: 0, color: '#1e293b' }}>Your Role</h3>
        <p style={{ margin: 0, color: '#475569', fontSize: '16px' }}>
          You've been assigned the role of <strong>{role}</strong>
        </p>
      </div>

      <p style={{ fontSize: '16px', color: '#475569' }}>
        Accept this invitation to start collaborating with your team and manage
        your organization's identity and access management.
      </p>

      <div style={{ textAlign: 'center', margin: '32px 0' }}>
        <a
          href={inviteUrl}
          className="button"
          style={{
            display: 'inline-block',
            padding: '12px 32px',
            background: 'linear-gradient(135deg, #a855f7 0%, #9333ea 100%)',
            color: 'white',
            textDecoration: 'none',
            borderRadius: '8px',
            fontWeight: '600'
          }}
        >
          Accept Invitation
        </a>
      </div>

      <p style={{ fontSize: '14px', color: '#64748b', marginTop: '32px' }}>
        This invitation link will expire in 7 days. If you have any questions,
        please contact {inviterName} or our support team.
      </p>

      <p style={{ fontSize: '14px', color: '#64748b' }}>
        Best regards,<br />
        The OneSign Team
      </p>
    </EmailTemplate>
  );
};

export default InvitationEmail;
