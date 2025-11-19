namespace Onesign.Modules.Security.Application.DTOs;

public class BeginTotpEnrollmentResponse
{
    public string Secret { get; set; } = string.Empty;
    public string QrCodeUri { get; set; } = string.Empty;
}
