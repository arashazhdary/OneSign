using Xunit;
using FluentAssertions;
using Onesign.Modules.Security.Infrastructure.Services;

namespace Onesign.Api.Tests.Security;

public class MfaServiceTests
{
    private readonly MfaService _mfaService;

    public MfaServiceTests()
    {
        _mfaService = new MfaService();
    }

    #region GenerateTotpSecret Tests

    [Fact]
    public void GenerateTotpSecret_ShouldReturnBase32String()
    {
        // Act
        var secret = _mfaService.GenerateTotpSecret();

        // Assert
        secret.Should().NotBeNullOrEmpty();
        secret.Length.Should().Be(32); // 160 bits = 32 Base32 characters
        secret.Should().MatchRegex("^[A-Z2-7]+$"); // Base32 alphabet
    }

    [Fact]
    public void GenerateTotpSecret_ShouldGenerateUniqueSecrets()
    {
        // Act
        var secret1 = _mfaService.GenerateTotpSecret();
        var secret2 = _mfaService.GenerateTotpSecret();

        // Assert
        secret1.Should().NotBe(secret2);
    }

    [Fact]
    public void GenerateTotpSecret_ShouldGenerateMultipleUniqueSecrets()
    {
        // Act
        var secrets = Enumerable.Range(0, 100).Select(_ => _mfaService.GenerateTotpSecret()).ToList();

        // Assert
        secrets.Distinct().Count().Should().Be(100);
    }

    #endregion

    #region GenerateOtpauthUrl Tests

    [Fact]
    public void GenerateOtpauthUrl_ShouldReturnValidUri()
    {
        // Arrange
        var secret = "JBSWY3DPEHPK3PXP";
        var issuer = "OneSign";
        var accountName = "test@example.com";

        // Act
        var uri = _mfaService.GenerateOtpauthUrl(secret, issuer, accountName);

        // Assert
        uri.Should().NotBeNullOrEmpty();
        uri.Should().StartWith("otpauth://totp/");
        uri.Should().Contain(secret);
        uri.Should().Contain("issuer=OneSign");
    }

    [Fact]
    public void GenerateOtpauthUrl_ShouldEncodeSpecialCharacters()
    {
        // Arrange
        var secret = "JBSWY3DPEHPK3PXP";
        var issuer = "One Sign App";
        var accountName = "test+user@example.com";

        // Act
        var uri = _mfaService.GenerateOtpauthUrl(secret, issuer, accountName);

        // Assert
        uri.Should().Contain("One%20Sign%20App");
        uri.Should().Contain("test%2Buser%40example.com");
    }

    [Theory]
    [InlineData(null, "issuer", "account")]
    [InlineData("", "issuer", "account")]
    public void GenerateOtpauthUrl_WithNullOrEmptySecret_ShouldThrowArgumentException(string secret, string issuer, string accountName)
    {
        // Act & Assert
        var act = () => _mfaService.GenerateOtpauthUrl(secret, issuer, accountName);
        act.Should().Throw<ArgumentException>().WithParameterName("secret");
    }

    [Theory]
    [InlineData("secret", null, "account")]
    [InlineData("secret", "", "account")]
    public void GenerateOtpauthUrl_WithNullOrEmptyIssuer_ShouldThrowArgumentException(string secret, string issuer, string accountName)
    {
        // Act & Assert
        var act = () => _mfaService.GenerateOtpauthUrl(secret, issuer, accountName);
        act.Should().Throw<ArgumentException>().WithParameterName("issuer");
    }

    [Theory]
    [InlineData("secret", "issuer", null)]
    [InlineData("secret", "issuer", "")]
    public void GenerateOtpauthUrl_WithNullOrEmptyAccountName_ShouldThrowArgumentException(string secret, string issuer, string accountName)
    {
        // Act & Assert
        var act = () => _mfaService.GenerateOtpauthUrl(secret, issuer, accountName);
        act.Should().Throw<ArgumentException>().WithParameterName("accountName");
    }

    #endregion

    #region VerifyTotpCode Tests

    [Fact]
    public void VerifyTotpCode_WithValidCode_ShouldReturnTrue()
    {
        // Arrange
        var secret = "JBSWY3DPEHPK3PXP";
        var code = GenerateCurrentTotpCode(secret);

        // Act
        var isValid = _mfaService.VerifyTotpCode(secret, code);

        // Assert
        isValid.Should().BeTrue();
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
        isValid.Should().BeFalse();
    }

    [Theory]
    [InlineData(null)]
    [InlineData("")]
    public void VerifyTotpCode_WithNullOrEmptySecret_ShouldThrowArgumentException(string secret)
    {
        // Act & Assert
        var act = () => _mfaService.VerifyTotpCode(secret, "123456");
        act.Should().Throw<ArgumentException>().WithParameterName("secret");
    }

    [Theory]
    [InlineData(null)]
    [InlineData("")]
    public void VerifyTotpCode_WithNullOrEmptyCode_ShouldReturnFalse(string code)
    {
        // Act
        var isValid = _mfaService.VerifyTotpCode("JBSWY3DPEHPK3PXP", code);

        // Assert
        isValid.Should().BeFalse();
    }

    [Fact]
    public void VerifyTotpCode_WithWrongLengthCode_ShouldReturnFalse()
    {
        // Arrange
        var secret = "JBSWY3DPEHPK3PXP";

        // Act & Assert
        _mfaService.VerifyTotpCode(secret, "12345").Should().BeFalse();
        _mfaService.VerifyTotpCode(secret, "1234567").Should().BeFalse();
    }

    [Fact]
    public void VerifyTotpCode_WithNonNumericCode_ShouldReturnFalse()
    {
        // Arrange
        var secret = "JBSWY3DPEHPK3PXP";

        // Act
        var isValid = _mfaService.VerifyTotpCode(secret, "abcdef");

        // Assert
        isValid.Should().BeFalse();
    }

    [Fact]
    public void VerifyTotpCode_WithCodeFromDifferentSecret_ShouldReturnFalse()
    {
        // Arrange
        var secret1 = "JBSWY3DPEHPK3PXP";
        var secret2 = "HXDMVJECJJWSRB3H";
        var code = GenerateCurrentTotpCode(secret2);

        // Act
        var isValid = _mfaService.VerifyTotpCode(secret1, code);

        // Assert
        isValid.Should().BeFalse();
    }

    #endregion

    #region GenerateOtpCode Tests

    [Fact]
    public void GenerateOtpCode_ShouldReturn6DigitCode()
    {
        // Act
        var code = _mfaService.GenerateOtpCode();

        // Assert
        code.Should().NotBeNullOrEmpty();
        code.Length.Should().Be(6);
        code.Should().MatchRegex("^[0-9]{6}$");
    }

    [Fact]
    public void GenerateOtpCode_ShouldGenerateUniqueCodes()
    {
        // Act
        var codes = Enumerable.Range(0, 100).Select(_ => _mfaService.GenerateOtpCode()).ToList();

        // Assert
        codes.Distinct().Count().Should().BeGreaterThan(90); // Allow some collisions
    }

    [Fact]
    public void GenerateOtpCode_ShouldPadWithLeadingZeros()
    {
        // Act - generate many codes and check some have leading zeros
        var codes = Enumerable.Range(0, 1000).Select(_ => _mfaService.GenerateOtpCode()).ToList();

        // Assert
        codes.All(c => c.Length == 6).Should().BeTrue();
    }

    #endregion

    #region HashCode Tests

    [Fact]
    public void HashCode_ShouldReturnNonEmptyHash()
    {
        // Arrange
        var code = "123456";

        // Act
        var hash = _mfaService.HashCode(code);

        // Assert
        hash.Should().NotBeNullOrEmpty();
    }

    [Fact]
    public void HashCode_ShouldReturnDifferentHashesForSameCode()
    {
        // Arrange (salt-based hashing should produce different hashes)
        var code = "123456";

        // Act
        var hash1 = _mfaService.HashCode(code);
        var hash2 = _mfaService.HashCode(code);

        // Assert - salted hash should be different each time
        hash1.Should().NotBe(hash2);
    }

    [Fact]
    public void HashCode_ShouldReturnBase64EncodedString()
    {
        // Arrange
        var code = "123456";

        // Act
        var hash = _mfaService.HashCode(code);

        // Assert
        var act = () => Convert.FromBase64String(hash);
        act.Should().NotThrow();
    }

    [Theory]
    [InlineData(null)]
    [InlineData("")]
    public void HashCode_WithNullOrEmptyCode_ShouldThrowArgumentException(string code)
    {
        // Act & Assert
        var act = () => _mfaService.HashCode(code);
        act.Should().Throw<ArgumentException>().WithParameterName("code");
    }

    #endregion

    #region VerifyCodeHash Tests

    [Fact]
    public void VerifyCodeHash_WithValidCode_ShouldReturnTrue()
    {
        // Arrange
        var code = "123456";
        var hash = _mfaService.HashCode(code);

        // Act
        var isValid = _mfaService.VerifyCodeHash(code, hash);

        // Assert
        isValid.Should().BeTrue();
    }

    [Fact]
    public void VerifyCodeHash_WithInvalidCode_ShouldReturnFalse()
    {
        // Arrange
        var code = "123456";
        var hash = _mfaService.HashCode(code);
        var wrongCode = "654321";

        // Act
        var isValid = _mfaService.VerifyCodeHash(wrongCode, hash);

        // Assert
        isValid.Should().BeFalse();
    }

    [Theory]
    [InlineData(null)]
    [InlineData("")]
    public void VerifyCodeHash_WithNullOrEmptyCode_ShouldReturnFalse(string code)
    {
        // Arrange
        var hash = _mfaService.HashCode("123456");

        // Act
        var isValid = _mfaService.VerifyCodeHash(code, hash);

        // Assert
        isValid.Should().BeFalse();
    }

    [Theory]
    [InlineData(null)]
    [InlineData("")]
    public void VerifyCodeHash_WithNullOrEmptyHash_ShouldReturnFalse(string hash)
    {
        // Act
        var isValid = _mfaService.VerifyCodeHash("123456", hash);

        // Assert
        isValid.Should().BeFalse();
    }

    [Fact]
    public void VerifyCodeHash_WithInvalidBase64Hash_ShouldReturnFalse()
    {
        // Act
        var isValid = _mfaService.VerifyCodeHash("123456", "not-valid-base64!");

        // Assert
        isValid.Should().BeFalse();
    }

    [Fact]
    public void VerifyCodeHash_WithTruncatedHash_ShouldReturnFalse()
    {
        // Arrange
        var code = "123456";
        var hash = _mfaService.HashCode(code);
        var truncatedHash = hash.Substring(0, hash.Length / 2);

        // Act
        var isValid = _mfaService.VerifyCodeHash(code, truncatedHash);

        // Assert
        isValid.Should().BeFalse();
    }

    [Fact]
    public void VerifyCodeHash_WithCorruptedHash_ShouldReturnFalse()
    {
        // Arrange
        var code = "123456";
        var hash = _mfaService.HashCode(code);
        var corrupted = "AAAA" + hash.Substring(4);

        // Act
        var isValid = _mfaService.VerifyCodeHash(code, corrupted);

        // Assert
        isValid.Should().BeFalse();
    }

    #endregion

    #region Helper Methods

    private string GenerateCurrentTotpCode(string secret)
    {
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

    #endregion
}
