namespace Onesign.Modules.Identity.Application.DTOs;

public class LoginResponse
{
    public string AccessToken { get; set; } = string.Empty;
    public string IdToken { get; set; } = string.Empty;
    public string TokenType { get; set; } = "Bearer";
    public int ExpiresIn { get; set; }

    // MFA fields
    public bool MfaRequired { get; set; }
    public Guid? ChallengeId { get; set; }
    public int? MfaMethodType { get; set; }
    public string? MaskedDestination { get; set; }
}

