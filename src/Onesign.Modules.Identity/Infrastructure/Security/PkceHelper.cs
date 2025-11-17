using System.Security.Cryptography;
using System.Text;

namespace Onesign.Modules.Identity.Infrastructure.Security;

public static class PkceHelper
{
    public static string GenerateCodeVerifier()
    {
        var bytes = new byte[32];
        using var rng = RandomNumberGenerator.Create();
        rng.GetBytes(bytes);
        return Base64UrlEncode(bytes);
    }

    public static string GenerateCodeChallenge(string codeVerifier)
    {
        using var sha256 = SHA256.Create();
        var hash = sha256.ComputeHash(Encoding.UTF8.GetBytes(codeVerifier));
        return Base64UrlEncode(hash);
    }

    public static bool VerifyCodeChallenge(string codeVerifier, string codeChallenge)
    {
        var computedChallenge = GenerateCodeChallenge(codeVerifier);
        return computedChallenge == codeChallenge;
    }

    private static string Base64UrlEncode(byte[] input)
    {
        return Convert.ToBase64String(input)
            .TrimEnd('=')
            .Replace('+', '-')
            .Replace('/', '_');
    }
}

