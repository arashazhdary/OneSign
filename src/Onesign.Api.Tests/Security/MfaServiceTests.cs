using Xunit;
using Onesign.Modules.Security.Infrastructure.Services;

namespace Onesign.Api.Tests.Security;

public class MfaServiceTests
{
    private readonly MfaService _mfaService;

    public MfaServiceTests()
    {
        _mfaService = new MfaService();
    }

    [Fact]
    public void GenerateTotpSecret_ShouldReturnBase32String()
    {
        // Act
        var secret = _mfaService.GenerateTotpSecret();

        // Assert
        Assert.NotNull(secret);
        Assert.NotEmpty(secret);
        Assert.Equal(32, secret.Length); // 160 bits = 32 Base32 characters
        Assert.Matches("^[A-Z2-7]+$", secret); // Base32 alphabet
    }

    [Fact]
    public void GenerateQrCodeUri_ShouldReturnValidUri()
    {
        // Arrange
        var email = "test@example.com";
        var secret = "JBSWY3DPEHPK3PXP";

        // Act
        var uri = _mfaService.GenerateQrCodeUri(email, secret);

        // Assert
        Assert.NotNull(uri);
        Assert.StartsWith("otpauth://totp/", uri);
        Assert.Contains(email, uri);
        Assert.Contains(secret, uri);
    }

    [Fact]
    public void VerifyTotpCode_WithValidCode_ShouldReturnTrue()
    {
        // Arrange
        var secret = "JBSWY3DPEHPK3PXP";

        // Generate current TOTP code
        var code = GenerateCurrentTotpCode(secret);

        // Act
        var isValid = _mfaService.VerifyTotpCode(secret, code);

        // Assert
        Assert.True(isValid);
    }

    [Fact]
    public void VerifyTotpCode_WithInvalidCode_ShouldReturnFalse()
    {
        // Arrange
        var secret = "JBSWY3DPEHPK3PXP";
        var invalidCode = "000000";

        // Act
        var isValid = _mfaService.VerifyTotpCode(secret, invalidCode);

        // Assert
        Assert.False(isValid);
    }

    [Fact]
    public void GenerateEmailOtpCode_ShouldReturn6DigitCode()
    {
        // Act
        var code = _mfaService.GenerateEmailOtpCode();

        // Assert
        Assert.NotNull(code);
        Assert.Equal(6, code.Length);
        Assert.Matches("^[0-9]{6}$", code);
    }

    [Fact]
    public void HashCode_ShouldReturnConsistentHash()
    {
        // Arrange
        var code = "123456";

        // Act
        var hash1 = _mfaService.HashCode(code);
        var hash2 = _mfaService.HashCode(code);

        // Assert
        Assert.NotNull(hash1);
        Assert.NotNull(hash2);
        Assert.Equal(hash1, hash2);
    }

    [Fact]
    public void VerifyHashedCode_WithValidCode_ShouldReturnTrue()
    {
        // Arrange
        var code = "123456";
        var hashedCode = _mfaService.HashCode(code);

        // Act
        var isValid = _mfaService.VerifyHashedCode(code, hashedCode);

        // Assert
        Assert.True(isValid);
    }

    [Fact]
    public void VerifyHashedCode_WithInvalidCode_ShouldReturnFalse()
    {
        // Arrange
        var code = "123456";
        var hashedCode = _mfaService.HashCode(code);
        var wrongCode = "654321";

        // Act
        var isValid = _mfaService.VerifyHashedCode(wrongCode, hashedCode);

        // Assert
        Assert.False(isValid);
    }

    [Fact]
    public void EncryptSecret_ShouldReturnEncryptedString()
    {
        // Arrange
        var secret = "JBSWY3DPEHPK3PXP";

        // Act
        var encrypted = _mfaService.EncryptSecret(secret);

        // Assert
        Assert.NotNull(encrypted);
        Assert.NotEmpty(encrypted);
        Assert.NotEqual(secret, encrypted);
    }

    [Fact]
    public void DecryptSecret_ShouldReturnOriginalSecret()
    {
        // Arrange
        var secret = "JBSWY3DPEHPK3PXP";
        var encrypted = _mfaService.EncryptSecret(secret);

        // Act
        var decrypted = _mfaService.DecryptSecret(encrypted);

        // Assert
        Assert.Equal(secret, decrypted);
    }

    private string GenerateCurrentTotpCode(string secret)
    {
        // Simple TOTP generation for testing
        var unixTime = DateTimeOffset.UtcNow.ToUnixTimeSeconds();
        var timeStep = unixTime / 30;

        var secretBytes = Base32Decode(secret);
        var timeBytes = BitConverter.GetBytes(timeStep);
        if (BitConverter.IsLittleEndian)
            Array.Reverse(timeBytes);

        using var hmac = new System.Security.Cryptography.HMACSHA1(secretBytes);
        var hash = hmac.ComputeHash(timeBytes);

        var offset = hash[hash.Length - 1] & 0x0F;
        var binary = ((hash[offset] & 0x7F) << 24)
                   | ((hash[offset + 1] & 0xFF) << 16)
                   | ((hash[offset + 2] & 0xFF) << 8)
                   | (hash[offset + 3] & 0xFF);

        var otp = binary % 1000000;
        return otp.ToString("D6");
    }

    private byte[] Base32Decode(string base32)
    {
        const string base32Chars = "ABCDEFGHIJKLMNOPQRSTUVWXYZ234567";
        base32 = base32.TrimEnd('=').ToUpperInvariant();

        var bits = new System.Collections.BitArray(base32.Length * 5);
        for (int i = 0; i < base32.Length; i++)
        {
            var value = base32Chars.IndexOf(base32[i]);
            for (int j = 0; j < 5; j++)
            {
                bits[i * 5 + j] = (value & (1 << (4 - j))) != 0;
            }
        }

        var bytes = new byte[(bits.Length + 7) / 8];
        bits.CopyTo(bytes, 0);

        return bytes.Take((bits.Length / 8)).ToArray();
    }
}
