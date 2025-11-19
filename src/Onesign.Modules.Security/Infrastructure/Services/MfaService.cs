using System.Security.Cryptography;
using System.Text;
using Onesign.Modules.Security.Domain.Services;

namespace Onesign.Modules.Security.Infrastructure.Services;

public class MfaService : IMfaService
{
    private const int TotpWindowSize = 30; // 30 seconds
    private const int TotpDigits = 6;
    private const int TotpTimeStepTolerance = 1; // Allow ±1 time step

    public string GenerateTotpSecret()
    {
        // Generate 160-bit (20 bytes) random secret
        var bytes = RandomNumberGenerator.GetBytes(20);

        // Convert to Base32
        return Base32Encode(bytes);
    }

    public string GenerateOtpauthUrl(string secret, string issuer, string accountName)
    {
        if (string.IsNullOrEmpty(secret))
            throw new ArgumentException("Secret cannot be null or empty", nameof(secret));

        if (string.IsNullOrEmpty(issuer))
            throw new ArgumentException("Issuer cannot be null or empty", nameof(issuer));

        if (string.IsNullOrEmpty(accountName))
            throw new ArgumentException("Account name cannot be null or empty", nameof(accountName));

        // Format: otpauth://totp/{issuer}:{accountName}?secret={secret}&issuer={issuer}
        var encodedIssuer = Uri.EscapeDataString(issuer);
        var encodedAccountName = Uri.EscapeDataString(accountName);

        return $"otpauth://totp/{encodedIssuer}:{encodedAccountName}?secret={secret}&issuer={encodedIssuer}";
    }

    public string GenerateQrCodeUri(string userEmail, string secret)
    {
        return GenerateOtpauthUrl(secret, "OneSign", userEmail);
    }

    public string GenerateEmailOtpCode()
    {
        return GenerateOtpCode();
    }

    public string EncryptSecret(string secret)
    {
        // Simple encryption - in production, use proper encryption
        var bytes = Encoding.UTF8.GetBytes(secret);
        return Convert.ToBase64String(bytes);
    }

    public bool VerifyTotpCode(string secret, string code)
    {
        if (string.IsNullOrEmpty(secret))
            throw new ArgumentException("Secret cannot be null or empty", nameof(secret));

        if (string.IsNullOrEmpty(code))
            return false;

        if (code.Length != TotpDigits)
            return false;

        if (!int.TryParse(code, out _))
            return false;

        var currentTimestamp = GetCurrentTimestamp();

        // Check current time step and ±1 tolerance
        for (int i = -TotpTimeStepTolerance; i <= TotpTimeStepTolerance; i++)
        {
            var timeStep = currentTimestamp + i;
            var expectedCode = GenerateTotpCode(secret, timeStep);

            if (expectedCode == code)
                return true;
        }

        return false;
    }

    public string GenerateOtpCode()
    {
        // Generate random 6-digit code
        var randomNumber = RandomNumberGenerator.GetInt32(0, 1000000);
        return randomNumber.ToString("D6");
    }

    public string HashCode(string code)
    {
        if (string.IsNullOrEmpty(code))
            throw new ArgumentException("Code cannot be null or empty", nameof(code));

        // Use BCrypt-style hashing with SHA256 for OTP codes
        // Since BCrypt might not be available, we'll use SHA256 with a salt
        using var sha256 = SHA256.Create();
        var saltBytes = RandomNumberGenerator.GetBytes(16);
        var codeBytes = Encoding.UTF8.GetBytes(code);

        var combined = new byte[saltBytes.Length + codeBytes.Length];
        Buffer.BlockCopy(saltBytes, 0, combined, 0, saltBytes.Length);
        Buffer.BlockCopy(codeBytes, 0, combined, saltBytes.Length, codeBytes.Length);

        var hashBytes = sha256.ComputeHash(combined);

        // Combine salt and hash: salt(16 bytes) + hash(32 bytes)
        var result = new byte[saltBytes.Length + hashBytes.Length];
        Buffer.BlockCopy(saltBytes, 0, result, 0, saltBytes.Length);
        Buffer.BlockCopy(hashBytes, 0, result, saltBytes.Length, hashBytes.Length);

        return Convert.ToBase64String(result);
    }

    public bool VerifyCodeHash(string code, string hash)
    {
        if (string.IsNullOrEmpty(code))
            return false;

        if (string.IsNullOrEmpty(hash))
            return false;

        try
        {
            var hashBytes = Convert.FromBase64String(hash);

            if (hashBytes.Length != 48) // 16 bytes salt + 32 bytes hash
                return false;

            var saltBytes = new byte[16];
            var storedHashBytes = new byte[32];

            Buffer.BlockCopy(hashBytes, 0, saltBytes, 0, 16);
            Buffer.BlockCopy(hashBytes, 16, storedHashBytes, 0, 32);

            using var sha256 = SHA256.Create();
            var codeBytes = Encoding.UTF8.GetBytes(code);

            var combined = new byte[saltBytes.Length + codeBytes.Length];
            Buffer.BlockCopy(saltBytes, 0, combined, 0, saltBytes.Length);
            Buffer.BlockCopy(codeBytes, 0, combined, saltBytes.Length, codeBytes.Length);

            var computedHash = sha256.ComputeHash(combined);

            // Constant-time comparison
            return CryptographicOperations.FixedTimeEquals(storedHashBytes, computedHash);
        }
        catch
        {
            return false;
        }
    }

    private string GenerateTotpCode(string secret, long timeStep)
    {
        var secretBytes = Base32Decode(secret);
        var timeStepBytes = BitConverter.GetBytes(timeStep);

        if (BitConverter.IsLittleEndian)
            Array.Reverse(timeStepBytes);

        using var hmac = new HMACSHA1(secretBytes);
        var hash = hmac.ComputeHash(timeStepBytes);

        // Dynamic truncation
        var offset = hash[hash.Length - 1] & 0x0F;
        var binary = ((hash[offset] & 0x7F) << 24)
                   | ((hash[offset + 1] & 0xFF) << 16)
                   | ((hash[offset + 2] & 0xFF) << 8)
                   | (hash[offset + 3] & 0xFF);

        var otp = binary % (int)Math.Pow(10, TotpDigits);
        return otp.ToString($"D{TotpDigits}");
    }

    private long GetCurrentTimestamp()
    {
        var unixTimestamp = DateTimeOffset.UtcNow.ToUnixTimeSeconds();
        return unixTimestamp / TotpWindowSize;
    }

    private static string Base32Encode(byte[] data)
    {
        const string base32Chars = "ABCDEFGHIJKLMNOPQRSTUVWXYZ234567";
        var sb = new StringBuilder();

        for (int i = 0; i < data.Length; i += 5)
        {
            int byteCount = Math.Min(5, data.Length - i);
            ulong buffer = 0;

            for (int j = 0; j < byteCount; j++)
            {
                buffer = (buffer << 8) | data[i + j];
            }

            int bitCount = byteCount * 8;
            while (bitCount > 0)
            {
                int index = (bitCount >= 5)
                    ? (int)((buffer >> (bitCount - 5)) & 0x1F)
                    : (int)((buffer & (ulong)((1 << bitCount) - 1)) << (5 - bitCount));

                sb.Append(base32Chars[index]);
                bitCount -= 5;
            }
        }

        return sb.ToString();
    }

    private static byte[] Base32Decode(string base32)
    {
        const string base32Chars = "ABCDEFGHIJKLMNOPQRSTUVWXYZ234567";
        base32 = base32.TrimEnd('=').ToUpper();

        var outputBytes = new List<byte>();
        ulong buffer = 0;
        int bitsInBuffer = 0;

        foreach (char c in base32)
        {
            int value = base32Chars.IndexOf(c);
            if (value < 0)
                throw new ArgumentException($"Invalid character in base32 string: {c}");

            buffer = (buffer << 5) | (ulong)value;
            bitsInBuffer += 5;

            if (bitsInBuffer >= 8)
            {
                outputBytes.Add((byte)(buffer >> (bitsInBuffer - 8)));
                bitsInBuffer -= 8;
            }
        }

        return outputBytes.ToArray();
    }
}
