# Security Policy

## Supported Versions

We release patches for security vulnerabilities for the following versions:

| Version | Supported          |
| ------- | ------------------ |
| 1.0.x   | :white_check_mark: |

## Reporting a Vulnerability

We take security seriously. If you discover a security vulnerability, please follow these steps:

### Private Disclosure

**DO NOT** create a public GitHub issue for security vulnerabilities.

Instead, please email security details to:
- **Email:** security@onesign.example.com (replace with actual email)
- **Subject:** [SECURITY] Brief description

### What to Include

Please include the following information:
- Type of vulnerability
- Steps to reproduce
- Potential impact
- Suggested fix (if any)
- Your contact information

### Response Timeline

- **Initial Response:** Within 48 hours
- **Status Update:** Within 7 days
- **Fix Timeline:** Varies by severity

## Security Best Practices

### For Developers

1. **Dependencies**
   - Regularly update dependencies
   - Run `npm audit` before releases
   - Use `npm audit fix` for automatic fixes

2. **Environment Variables**
   - Never commit `.env` files
   - Use `.env.example` for templates
   - Rotate secrets regularly

3. **Code Review**
   - All changes require review
   - Check for common vulnerabilities
   - Follow OWASP guidelines

### For Deployment

1. **HTTPS/SSL**
   - Always use HTTPS in production
   - Use valid SSL certificates
   - Enable HSTS headers

2. **Security Headers**
   - Already configured in next.config.ts
   - X-Content-Type-Options: nosniff
   - X-Frame-Options: DENY
   - X-XSS-Protection: enabled
   - Strict-Transport-Security
   - Content-Security-Policy

3. **Access Control**
   - Use principle of least privilege
   - Implement rate limiting
   - Monitor access logs

4. **Docker Security**
   - Use non-root user (already configured)
   - Scan images for vulnerabilities
   - Keep base images updated

### Security Checklist

- [ ] All dependencies up to date
- [ ] No known vulnerabilities (`npm audit`)
- [ ] Environment variables secured
- [ ] HTTPS enabled
- [ ] Security headers configured
- [ ] Access logs monitored
- [ ] Regular security audits
- [ ] Backup and recovery plan

## Vulnerability Severity Levels

| Level    | Response Time | Description                          |
|----------|---------------|--------------------------------------|
| Critical | 24 hours      | Immediate action required            |
| High     | 7 days        | Significant risk, priority fix       |
| Medium   | 30 days       | Moderate risk, scheduled fix         |
| Low      | 90 days       | Minor risk, best effort              |

## Security Updates

Security updates are published as:
- Patch releases for critical/high severity
- Minor releases for medium/low severity
- GitHub Security Advisories

## Additional Resources

- [OWASP Top 10](https://owasp.org/www-project-top-ten/)
- [Next.js Security](https://nextjs.org/docs/advanced-features/security-headers)
- [Node.js Security Best Practices](https://nodejs.org/en/docs/guides/security/)

## Recognition

We appreciate responsible disclosure and will acknowledge contributors in:
- Security advisories
- Release notes
- Hall of Fame (if applicable)

Thank you for helping keep OneSign Landing secure!
