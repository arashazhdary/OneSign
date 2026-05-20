# SMS Provider Setup (OneSign)

OneSign sends MFA and notification SMS through `ISmsService`. Configure the provider in `appsettings` (provider-agnostic).

## Configuration

```json
{
  "Sms": {
    "Provider": "Twilio",
    "Twilio": {
      "AccountSid": "ACxxxxxxxx",
      "AuthToken": "your-auth-token",
      "FromNumber": "+15551234567"
    }
  }
}
```

| `Provider` | Behavior |
|------------|----------|
| `Null` (default in production template) | No SMS sent; MFA SMS OTP logs a warning |
| `Logging` | Logs message to app logs and returns success (use in **Development**) |
| `Twilio` | Sends via [Twilio Messages API](https://www.twilio.com/docs/sms/api) |

If `Sms:Provider` is omitted:

- **Development** → `Logging`
- **Other environments** → `Null`

`appsettings.Development.json` ships with `"Provider": "Logging"` so local MFA SMS OTP flows succeed without Twilio.

## Twilio

1. Create a Twilio account and buy/verify a sender phone number.
2. Set `Sms:Provider` to `Twilio` and fill `Sms:Twilio` values.
3. Store `AuthToken` in user secrets or environment variables (never commit secrets).

Phone numbers should use **E.164** format (e.g. `+989121234567`).

## MFA SMS OTP

When a user enrolls **SMS OTP** and creates a challenge (`POST /api/tenant/mfa/challenge`), `MfaChallengeService` calls `ISmsService.SendSmsAsync` with the verification code.

## Notifications

`NotificationDeliveryWorker` uses the same `ISmsService` for outbox items on the SMS channel.

## Azure Communication Services

Not bundled in this release. Use Twilio for production, or add a custom `ISmsService` implementation and register it in `SmsServiceExtensions`.
