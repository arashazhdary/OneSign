namespace Onesign.Modules.Security.Application.DTOs;

public class UserMfaMethodDto
{
    public Guid Id { get; set; }
    public int MethodType { get; set; } // 1=Totp, 2=EmailOtp, 3=SmsOtp
    public bool IsDefault { get; set; }
    public DateTime CreatedAt { get; set; }
}
