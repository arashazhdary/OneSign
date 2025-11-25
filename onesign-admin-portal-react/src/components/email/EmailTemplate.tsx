import React from 'react';

export interface EmailTemplateProps {
  children: React.ReactNode;
  preheader?: string;
}

const EmailTemplate: React.FC<EmailTemplateProps> = ({ children, preheader }) => {
  return (
    <html lang="en">
      <head>
        <meta charSet="UTF-8" />
        <meta name="viewport" content="width=device-width, initial-scale=1.0" />
        <title>OneSign Admin Portal</title>
        <style>{`
          body {
            font-family: -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, 'Helvetica Neue', Arial, sans-serif;
            line-height: 1.6;
            color: #1e293b;
            background-color: #f1f5f9;
            margin: 0;
            padding: 0;
          }
          .container {
            max-width: 600px;
            margin: 0 auto;
            padding: 20px;
          }
          .header {
            background: linear-gradient(135deg, #3b82f6 0%, #a855f7 100%);
            padding: 30px 20px;
            text-align: center;
            border-radius: 12px 12px 0 0;
          }
          .logo {
            color: white;
            font-size: 28px;
            font-weight: bold;
            text-decoration: none;
          }
          .content {
            background: white;
            padding: 40px 30px;
            border-radius: 0 0 12px 12px;
            box-shadow: 0 4px 6px -1px rgba(0, 0, 0, 0.1);
          }
          .button {
            display: inline-block;
            padding: 12px 32px;
            background: linear-gradient(135deg, #3b82f6 0%, #2563eb 100%);
            color: white;
            text-decoration: none;
            border-radius: 8px;
            font-weight: 600;
            margin: 20px 0;
          }
          .footer {
            text-align: center;
            padding: 20px;
            color: #64748b;
            font-size: 14px;
          }
          .preheader {
            display: none;
            max-width: 0;
            max-height: 0;
            overflow: hidden;
            opacity: 0;
          }
        `}</style>
      </head>
      <body>
        {preheader && <div className="preheader">{preheader}</div>}
        <div className="container">
          <div className="header">
            <div className="logo">OneSign</div>
          </div>
          <div className="content">{children}</div>
          <div className="footer">
            <p>© 2024 OneSign Admin Portal. All rights reserved.</p>
            <p>
              <a href="#">Unsubscribe</a> | <a href="#">Privacy Policy</a>
            </p>
          </div>
        </div>
      </body>
    </html>
  );
};

export default EmailTemplate;
