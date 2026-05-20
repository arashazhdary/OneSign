# OneSign — Production Email

## Providers

| `Email:Provider` | When to use |
|------------------|-------------|
| `Smtp` | On-prem SMTP relay, Exchange, Mailgun SMTP |
| `SendGrid` | SendGrid HTTP API (`Email:SendGrid:ApiKey`) |
| `Null` | Dev only — emails are not sent |

If `Email:Provider` is omitted, the API infers **SendGrid** when `Email:SendGrid:ApiKey` is set, else **Smtp** when `Email:Smtp:Host` is set, else **Null**.

## Configuration (appsettings / env)

### SMTP

```json
{
  "Email": {
    "Provider": "Smtp",
    "From": { "Address": "noreply@yourdomain.com", "Name": "OneSign" },
    "Smtp": {
      "Host": "smtp.example.com",
      "Port": "587",
      "Username": "user",
      "Password": "<secret>",
      "EnableSsl": "true"
    }
  }
}
```

### SendGrid

```json
{
  "Email": {
    "Provider": "SendGrid",
    "From": { "Address": "noreply@yourdomain.com", "Name": "OneSign" },
    "SendGrid": { "ApiKey": "<secret>" }
  }
}
```

## Health check

`GET /health/ready` and `GET /health` include an **Email** check:

- **Healthy** — provider configured with required secrets
- **Degraded** — `Null` provider (no outbound mail)
- **Unhealthy** — provider set but missing host/API key

## Failure runbook

1. Check `/health/ready` → `Email` component message.
2. Verify secrets in Key Vault / K8s Secret (never commit keys).
3. For SendGrid: confirm API key permissions (Mail Send) and sender domain verification.
4. For SMTP: test port 587/465 from the API pod (`telnet` / `openssl s_client`).
5. Inspect API logs for `SendGrid returned` or SMTP exceptions.
6. Magic link / password reset / invite flows return success only when `IEmailService.SendEmailAsync` returns `true` — monitor audit and user reports if mail is delayed.

## Staging validation

1. Set `Email:Provider` and secrets in staging.
2. Call tenant **Send test email** from Admin Portal.
3. Trigger password reset for a test user.
4. Confirm `Email` is **Healthy** on readiness probe before promoting release.
