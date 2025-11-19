using FluentAssertions;
using Onesign.Modules.Identity.Infrastructure.Security;
using Xunit;

namespace Onesign.Api.Tests.Identity;

public class PasswordHasherTests
{
    private readonly PasswordHasher _passwordHasher;

    public PasswordHasherTests()
    {
        _passwordHasher = new PasswordHasher();
    }

    #region HashPassword Tests

    [Fact]
    public void HashPassword_ValidPassword_ReturnsHash()
    {
        // Arrange
        var password = "MySecurePassword123!";

        // Act
        var hash = _passwordHasher.HashPassword(password);

        // Assert
        hash.Should().NotBeNullOrEmpty();
        hash.Should().NotBe(password);
    }

    [Fact]
    public void HashPassword_SamePassword_ReturnsDifferentHashes()
    {
        // Arrange
        var password = "MySecurePassword123!";

        // Act
        var hash1 = _passwordHasher.HashPassword(password);
        var hash2 = _passwordHasher.HashPassword(password);

        // Assert
        hash1.Should().NotBe(hash2); // BCrypt uses random salt
    }

    [Fact]
    public void HashPassword_EmptyPassword_ReturnsHash()
    {
        // Arrange
        var password = "";

        // Act
        var hash = _passwordHasher.HashPassword(password);

        // Assert
        hash.Should().NotBeNullOrEmpty();
    }

    [Fact]
    public void HashPassword_LongPassword_ReturnsHash()
    {
        // Arrange
        var password = new string('a', 1000);

        // Act
        var hash = _passwordHasher.HashPassword(password);

        // Assert
        hash.Should().NotBeNullOrEmpty();
    }

    [Fact]
    public void HashPassword_SpecialCharacters_ReturnsHash()
    {
        // Arrange
        var password = "P@$$w0rd!#%&*()_+-=[]{}|;':\",./<>?";

        // Act
        var hash = _passwordHasher.HashPassword(password);

        // Assert
        hash.Should().NotBeNullOrEmpty();
    }

    [Fact]
    public void HashPassword_UnicodeCharacters_ReturnsHash()
    {
        // Arrange
        var password = "password";

        // Act
        var hash = _passwordHasher.HashPassword(password);

        // Assert
        hash.Should().NotBeNullOrEmpty();
    }

    [Fact]
    public void HashPassword_ReturnsValidBCryptFormat()
    {
        // Arrange
        var password = "TestPassword123";

        // Act
        var hash = _passwordHasher.HashPassword(password);

        // Assert
        // BCrypt hashes start with $2a$, $2b$, or $2y$
        hash.Should().StartWith("$2");
        hash.Should().Contain("$");
    }

    #endregion

    #region VerifyPassword Tests

    [Fact]
    public void VerifyPassword_CorrectPassword_ReturnsTrue()
    {
        // Arrange
        var password = "MySecurePassword123!";
        var hash = _passwordHasher.HashPassword(password);

        // Act
        var result = _passwordHasher.VerifyPassword(password, hash);

        // Assert
        result.Should().BeTrue();
    }

    [Fact]
    public void VerifyPassword_IncorrectPassword_ReturnsFalse()
    {
        // Arrange
        var password = "MySecurePassword123!";
        var wrongPassword = "WrongPassword123!";
        var hash = _passwordHasher.HashPassword(password);

        // Act
        var result = _passwordHasher.VerifyPassword(wrongPassword, hash);

        // Assert
        result.Should().BeFalse();
    }

    [Fact]
    public void VerifyPassword_CaseSensitive_ReturnsFalse()
    {
        // Arrange
        var password = "MySecurePassword123!";
        var wrongCasePassword = "mysecurepassword123!";
        var hash = _passwordHasher.HashPassword(password);

        // Act
        var result = _passwordHasher.VerifyPassword(wrongCasePassword, hash);

        // Assert
        result.Should().BeFalse();
    }

    [Fact]
    public void VerifyPassword_EmptyPassword_HandlesCorrectly()
    {
        // Arrange
        var password = "";
        var hash = _passwordHasher.HashPassword(password);

        // Act
        var result = _passwordHasher.VerifyPassword(password, hash);

        // Assert
        result.Should().BeTrue();
    }

    [Fact]
    public void VerifyPassword_EmptyPasswordAgainstNonEmptyHash_ReturnsFalse()
    {
        // Arrange
        var password = "SomePassword";
        var hash = _passwordHasher.HashPassword(password);

        // Act
        var result = _passwordHasher.VerifyPassword("", hash);

        // Assert
        result.Should().BeFalse();
    }

    [Fact]
    public void VerifyPassword_SpecialCharacters_VerifiesCorrectly()
    {
        // Arrange
        var password = "P@$$w0rd!#%&*()";
        var hash = _passwordHasher.HashPassword(password);

        // Act
        var result = _passwordHasher.VerifyPassword(password, hash);

        // Assert
        result.Should().BeTrue();
    }

    [Fact]
    public void VerifyPassword_UnicodeCharacters_VerifiesCorrectly()
    {
        // Arrange
        var password = "password";
        var hash = _passwordHasher.HashPassword(password);

        // Act
        var result = _passwordHasher.VerifyPassword(password, hash);

        // Assert
        result.Should().BeTrue();
    }

    [Fact]
    public void VerifyPassword_LongPassword_VerifiesCorrectly()
    {
        // Arrange
        var password = new string('a', 1000);
        var hash = _passwordHasher.HashPassword(password);

        // Act
        var result = _passwordHasher.VerifyPassword(password, hash);

        // Assert
        result.Should().BeTrue();
    }

    [Fact]
    public void VerifyPassword_WhitespacePassword_VerifiesCorrectly()
    {
        // Arrange
        var password = "   password with spaces   ";
        var hash = _passwordHasher.HashPassword(password);

        // Act
        var result = _passwordHasher.VerifyPassword(password, hash);

        // Assert
        result.Should().BeTrue();
    }

    [Fact]
    public void VerifyPassword_TrimmedWhitespace_ReturnsFalse()
    {
        // Arrange
        var password = "   password   ";
        var trimmedPassword = "password";
        var hash = _passwordHasher.HashPassword(password);

        // Act
        var result = _passwordHasher.VerifyPassword(trimmedPassword, hash);

        // Assert
        result.Should().BeFalse();
    }

    #endregion

    #region Edge Cases

    [Fact]
    public void HashAndVerify_MultipleIterations_AllSucceed()
    {
        // Arrange
        var passwords = new[] { "Pass1", "Pass2", "Pass3", "Pass4", "Pass5" };

        // Act & Assert
        foreach (var password in passwords)
        {
            var hash = _passwordHasher.HashPassword(password);
            var result = _passwordHasher.VerifyPassword(password, hash);
            result.Should().BeTrue($"Password '{password}' should verify correctly");
        }
    }

    [Fact]
    public void VerifyPassword_SimilarPasswords_ReturnsFalse()
    {
        // Arrange
        var password = "Password123";
        var similarPassword = "Password124";
        var hash = _passwordHasher.HashPassword(password);

        // Act
        var result = _passwordHasher.VerifyPassword(similarPassword, hash);

        // Assert
        result.Should().BeFalse();
    }

    [Fact]
    public void VerifyPassword_NewlinesInPassword_VerifiesCorrectly()
    {
        // Arrange
        var password = "Password\nwith\nnewlines";
        var hash = _passwordHasher.HashPassword(password);

        // Act
        var result = _passwordHasher.VerifyPassword(password, hash);

        // Assert
        result.Should().BeTrue();
    }

    [Fact]
    public void VerifyPassword_TabsInPassword_VerifiesCorrectly()
    {
        // Arrange
        var password = "Password\twith\ttabs";
        var hash = _passwordHasher.HashPassword(password);

        // Act
        var result = _passwordHasher.VerifyPassword(password, hash);

        // Assert
        result.Should().BeTrue();
    }

    [Fact]
    public void HashPassword_NumericOnlyPassword_ReturnsValidHash()
    {
        // Arrange
        var password = "1234567890";

        // Act
        var hash = _passwordHasher.HashPassword(password);
        var result = _passwordHasher.VerifyPassword(password, hash);

        // Assert
        hash.Should().NotBeNullOrEmpty();
        result.Should().BeTrue();
    }

    #endregion
}
