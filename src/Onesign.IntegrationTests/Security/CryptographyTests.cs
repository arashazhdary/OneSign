using System.Security.Cryptography;
using System.Text;
using FluentAssertions;
using Xunit;

namespace Onesign.IntegrationTests.Security;

/// <summary>
/// Tests for cryptographic implementations
/// </summary>
public class CryptographyTests
{
    [Fact]
    public void PasswordHashing_ShouldUseSecureAlgorithm()
    {
        // Test that BCrypt is used correctly
        var password = "SecurePassword123!";
        var hash = BCrypt.Net.BCrypt.HashPassword(password);

        // BCrypt hashes should start with $2
        hash.Should().StartWith("$2");

        // Hash should be at least 60 characters
        hash.Length.Should().BeGreaterOrEqualTo(60);

        // Verify works correctly
        BCrypt.Net.BCrypt.Verify(password, hash).Should().BeTrue();
        BCrypt.Net.BCrypt.Verify("WrongPassword", hash).Should().BeFalse();
    }

    [Fact]
    public void PasswordHashing_SamePlaintext_ProducesDifferentHashes()
    {
        var password = "SecurePassword123!";

        var hash1 = BCrypt.Net.BCrypt.HashPassword(password);
        var hash2 = BCrypt.Net.BCrypt.HashPassword(password);

        // Each hash should be different due to random salt
        hash1.Should().NotBe(hash2);

        // But both should verify correctly
        BCrypt.Net.BCrypt.Verify(password, hash1).Should().BeTrue();
        BCrypt.Net.BCrypt.Verify(password, hash2).Should().BeTrue();
    }

    [Fact]
    public void TokenGeneration_ShouldBeSecurelyRandom()
    {
        var tokens = new HashSet<string>();

        for (int i = 0; i < 100; i++)
        {
            var token = GenerateSecureToken(32);
            tokens.Add(token);
        }

        // All tokens should be unique
        tokens.Count.Should().Be(100);
    }

    [Fact]
    public void SecureRandomBytes_ShouldHaveHighEntropy()
    {
        var bytes = RandomNumberGenerator.GetBytes(256);

        // Basic entropy check - should have variety
        var uniqueBytes = bytes.Distinct().Count();
        uniqueBytes.Should().BeGreaterThan(200, "Random bytes should have high entropy");
    }

    [Fact]
    public void AesEncryption_ShouldWorkCorrectly()
    {
        var plaintext = "Sensitive data to encrypt";
        var key = RandomNumberGenerator.GetBytes(32); // 256-bit key

        // Encrypt
        var encrypted = AesEncrypt(plaintext, key);
        encrypted.Should().NotBe(plaintext);

        // Decrypt
        var decrypted = AesDecrypt(encrypted, key);
        decrypted.Should().Be(plaintext);
    }

    [Fact]
    public void AesEncryption_SameInput_ProducesDifferentOutput()
    {
        var plaintext = "Test data";
        var key = RandomNumberGenerator.GetBytes(32);

        var encrypted1 = AesEncrypt(plaintext, key);
        var encrypted2 = AesEncrypt(plaintext, key);

        // Should be different due to random IV
        encrypted1.Should().NotBe(encrypted2);

        // But both should decrypt to same value
        AesDecrypt(encrypted1, key).Should().Be(plaintext);
        AesDecrypt(encrypted2, key).Should().Be(plaintext);
    }

    [Fact]
    public void HmacSha256_ShouldProduceConsistentSignature()
    {
        var data = "Data to sign";
        var key = RandomNumberGenerator.GetBytes(32);

        var signature1 = ComputeHmacSha256(data, key);
        var signature2 = ComputeHmacSha256(data, key);

        signature1.Should().Be(signature2);
    }

    [Fact]
    public void HmacSha256_DifferentData_ProducesDifferentSignature()
    {
        var key = RandomNumberGenerator.GetBytes(32);

        var signature1 = ComputeHmacSha256("Data 1", key);
        var signature2 = ComputeHmacSha256("Data 2", key);

        signature1.Should().NotBe(signature2);
    }

    [Fact]
    public void CodeChallenge_S256_ShouldComputeCorrectly()
    {
        // PKCE code verifier
        var codeVerifier = "dBjftJeZ4CVP-mB92K27uhbUJU1p1r_wW1gFWFOEjXk";

        // Expected code challenge (SHA256 hash, base64url encoded)
        var expectedChallenge = "E9Melhoa2OwvFrEMTJguCHaoeK1t8URWbuGJSstw-cM";

        // Compute
        var actualChallenge = ComputeCodeChallenge(codeVerifier);

        actualChallenge.Should().Be(expectedChallenge);
    }

    [Fact]
    public void Base32Encoding_ShouldWorkCorrectly()
    {
        var data = new byte[] { 72, 101, 108, 108, 111 }; // "Hello"
        var encoded = Base32Encode(data);

        // Base32 should only contain valid characters
        encoded.Should().MatchRegex("^[A-Z2-7]+$");

        // Decode back
        var decoded = Base32Decode(encoded);
        decoded.Should().BeEquivalentTo(data);
    }

    #region Helper Methods

    private string GenerateSecureToken(int length)
    {
        var bytes = RandomNumberGenerator.GetBytes(length);
        return Convert.ToBase64String(bytes)
            .Replace("+", "-")
            .Replace("/", "_")
            .TrimEnd('=');
    }

    private string AesEncrypt(string plaintext, byte[] key)
    {
        using var aes = Aes.Create();
        aes.Key = key;
        aes.GenerateIV();

        using var encryptor = aes.CreateEncryptor();
        var plaintextBytes = Encoding.UTF8.GetBytes(plaintext);
        var ciphertext = encryptor.TransformFinalBlock(plaintextBytes, 0, plaintextBytes.Length);

        // Prepend IV to ciphertext
        var result = new byte[aes.IV.Length + ciphertext.Length];
        Buffer.BlockCopy(aes.IV, 0, result, 0, aes.IV.Length);
        Buffer.BlockCopy(ciphertext, 0, result, aes.IV.Length, ciphertext.Length);

        return Convert.ToBase64String(result);
    }

    private string AesDecrypt(string ciphertext, byte[] key)
    {
        var fullCipher = Convert.FromBase64String(ciphertext);

        using var aes = Aes.Create();
        aes.Key = key;

        // Extract IV
        var iv = new byte[aes.BlockSize / 8];
        Buffer.BlockCopy(fullCipher, 0, iv, 0, iv.Length);
        aes.IV = iv;

        // Extract ciphertext
        var cipher = new byte[fullCipher.Length - iv.Length];
        Buffer.BlockCopy(fullCipher, iv.Length, cipher, 0, cipher.Length);

        using var decryptor = aes.CreateDecryptor();
        var plaintext = decryptor.TransformFinalBlock(cipher, 0, cipher.Length);

        return Encoding.UTF8.GetString(plaintext);
    }

    private string ComputeHmacSha256(string data, byte[] key)
    {
        using var hmac = new HMACSHA256(key);
        var hash = hmac.ComputeHash(Encoding.UTF8.GetBytes(data));
        return Convert.ToBase64String(hash);
    }

    private string ComputeCodeChallenge(string codeVerifier)
    {
        using var sha256 = SHA256.Create();
        var hash = sha256.ComputeHash(Encoding.ASCII.GetBytes(codeVerifier));
        return Convert.ToBase64String(hash)
            .TrimEnd('=')
            .Replace('+', '-')
            .Replace('/', '_');
    }

    private string Base32Encode(byte[] data)
    {
        const string alphabet = "ABCDEFGHIJKLMNOPQRSTUVWXYZ234567";
        var result = new StringBuilder();
        int buffer = 0, bitsLeft = 0;

        foreach (var b in data)
        {
            buffer = (buffer << 8) | b;
            bitsLeft += 8;

            while (bitsLeft >= 5)
            {
                result.Append(alphabet[(buffer >> (bitsLeft - 5)) & 0x1F]);
                bitsLeft -= 5;
            }
        }

        if (bitsLeft > 0)
        {
            result.Append(alphabet[(buffer << (5 - bitsLeft)) & 0x1F]);
        }

        return result.ToString();
    }

    private byte[] Base32Decode(string encoded)
    {
        const string alphabet = "ABCDEFGHIJKLMNOPQRSTUVWXYZ234567";
        var result = new List<byte>();
        int buffer = 0, bitsLeft = 0;

        foreach (var c in encoded.ToUpperInvariant())
        {
            var value = alphabet.IndexOf(c);
            if (value < 0) continue;

            buffer = (buffer << 5) | value;
            bitsLeft += 5;

            if (bitsLeft >= 8)
            {
                result.Add((byte)(buffer >> (bitsLeft - 8)));
                bitsLeft -= 8;
            }
        }

        return result.ToArray();
    }

    #endregion
}
