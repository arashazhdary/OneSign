namespace Onesign.Modules.Identity.Application.DTOs;

public class ResetPasswordConfirmRequest
{
    public string Token { get; set; } = string.Empty;
    public string NewPassword { get; set; } = string.Empty;
}

