namespace Onesign.Shared.Sms;

/// <summary>
/// SMS provider selection. Use <see cref="Null"/> when SMS is not configured.
/// </summary>
public static class SmsProviders
{
    public const string Null = "Null";
    public const string Twilio = "Twilio";
    public const string Logging = "Logging";
}

public sealed class SmsOptions
{
    public string Provider { get; set; } = SmsProviders.Null;

    public TwilioSmsOptions Twilio { get; set; } = new();
}

public sealed class TwilioSmsOptions
{
    public string AccountSid { get; set; } = string.Empty;
    public string AuthToken { get; set; } = string.Empty;
    public string FromNumber { get; set; } = string.Empty;
}
