namespace Onesign.Modules.Security.Application.DTOs;

public class ConfirmTotpEnrollmentRequest
{
    public string Secret { get; set; } = string.Empty;
    public string Code { get; set; } = string.Empty;
}
