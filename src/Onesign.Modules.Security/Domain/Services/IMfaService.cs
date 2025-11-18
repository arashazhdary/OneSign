namespace Onesign.Modules.Security.Domain.Services;

public interface IMfaService
{
    string GenerateTotpSecret();
    string GenerateOtpauthUrl(string secret, string issuer, string accountName);
    bool VerifyTotpCode(string secret, string code);
    string GenerateOtpCode();
    string HashCode(string code);
    bool VerifyCodeHash(string code, string hash);
}
