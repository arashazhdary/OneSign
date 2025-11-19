namespace Onesign.Modules.Security.Domain.Services;

public interface IMfaService
{
    string GenerateTotpSecret();
    string GenerateOtpauthUrl(string secret, string issuer, string accountName);
    string GenerateQrCodeUri(string userEmail, string secret);
    bool VerifyTotpCode(string secret, string code);
    string GenerateOtpCode();
    string GenerateEmailOtpCode();
    string HashCode(string code);
    bool VerifyCodeHash(string code, string hash);
    string EncryptSecret(string secret);
}
