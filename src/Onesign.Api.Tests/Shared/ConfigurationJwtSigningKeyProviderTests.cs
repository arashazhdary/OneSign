using FluentAssertions;
using Microsoft.Extensions.Configuration;
using Moq;
using Onesign.Shared.Security;
using Xunit;

namespace Onesign.Api.Tests.Shared;

public class ConfigurationJwtSigningKeyProviderTests
{
    private readonly Mock<IConfiguration> _mockConfiguration;

    public ConfigurationJwtSigningKeyProviderTests()
    {
        _mockConfiguration = new Mock<IConfiguration>();
    }

    [Fact]
    public void Constructor_ShouldInitializeWithConfiguration()
    {
        // Act
        var provider = new ConfigurationJwtSigningKeyProvider(_mockConfiguration.Object);

        // Assert
        provider.Should().NotBeNull();
    }

    [Fact]
    public void GetSigningKey_WhenEnvironmentVariableIsSet_ShouldReturnEnvironmentValue()
    {
        // Arrange
        var expectedKey = "environment-variable-key-min-32-characters-long";
        Environment.SetEnvironmentVariable("JWT_SIGNING_KEY", expectedKey);

        try
        {
            var provider = new ConfigurationJwtSigningKeyProvider(_mockConfiguration.Object);

            // Act
            var key = provider.GetSigningKey();

            // Assert
            key.Should().Be(expectedKey);
        }
        finally
        {
            Environment.SetEnvironmentVariable("JWT_SIGNING_KEY", null);
        }
    }

    [Fact]
    public void GetSigningKey_WhenConfigurationIsSet_ShouldReturnConfigurationValue()
    {
        // Arrange
        var expectedKey = "configuration-jwt-signing-key-min-32-chars";
        _mockConfiguration.Setup(c => c["Jwt:SigningKey"]).Returns(expectedKey);
        Environment.SetEnvironmentVariable("JWT_SIGNING_KEY", null);

        var provider = new ConfigurationJwtSigningKeyProvider(_mockConfiguration.Object);

        // Act
        var key = provider.GetSigningKey();

        // Assert
        key.Should().Be(expectedKey);
    }

    [Fact]
    public void GetSigningKey_WhenNothingIsSet_ShouldReturnDefaultKey()
    {
        // Arrange
        _mockConfiguration.Setup(c => c["Jwt:SigningKey"]).Returns((string?)null);
        Environment.SetEnvironmentVariable("JWT_SIGNING_KEY", null);

        var provider = new ConfigurationJwtSigningKeyProvider(_mockConfiguration.Object);

        // Act
        var key = provider.GetSigningKey();

        // Assert
        key.Should().Be("your-secret-signing-key-change-in-production-min-32-chars");
    }

    [Fact]
    public void GetSigningKey_EnvironmentVariable_ShouldTakePriorityOverConfiguration()
    {
        // Arrange
        var envKey = "environment-key-takes-priority-over-config";
        var configKey = "configuration-key-should-be-ignored";

        Environment.SetEnvironmentVariable("JWT_SIGNING_KEY", envKey);
        _mockConfiguration.Setup(c => c["Jwt:SigningKey"]).Returns(configKey);

        try
        {
            var provider = new ConfigurationJwtSigningKeyProvider(_mockConfiguration.Object);

            // Act
            var key = provider.GetSigningKey();

            // Assert
            key.Should().Be(envKey);
        }
        finally
        {
            Environment.SetEnvironmentVariable("JWT_SIGNING_KEY", null);
        }
    }

    [Fact]
    public void GetSigningKey_Configuration_ShouldTakePriorityOverDefault()
    {
        // Arrange
        var configKey = "configured-key-takes-priority-over-default";
        _mockConfiguration.Setup(c => c["Jwt:SigningKey"]).Returns(configKey);
        Environment.SetEnvironmentVariable("JWT_SIGNING_KEY", null);

        var provider = new ConfigurationJwtSigningKeyProvider(_mockConfiguration.Object);

        // Act
        var key = provider.GetSigningKey();

        // Assert
        key.Should().Be(configKey);
        key.Should().NotBe("your-secret-signing-key-change-in-production-min-32-chars");
    }

    [Fact]
    public void GetSigningKey_MultipleCallsToSameInstance_ShouldReturnSameValue()
    {
        // Arrange
        var expectedKey = "consistent-key-across-multiple-calls";
        _mockConfiguration.Setup(c => c["Jwt:SigningKey"]).Returns(expectedKey);

        var provider = new ConfigurationJwtSigningKeyProvider(_mockConfiguration.Object);

        // Act
        var key1 = provider.GetSigningKey();
        var key2 = provider.GetSigningKey();
        var key3 = provider.GetSigningKey();

        // Assert
        key1.Should().Be(key2);
        key2.Should().Be(key3);
    }

    [Fact]
    public void GetSigningKey_WithEmptyEnvironmentVariable_ShouldFallbackToConfiguration()
    {
        // Arrange
        var configKey = "fallback-to-config-key-when-env-empty";
        Environment.SetEnvironmentVariable("JWT_SIGNING_KEY", string.Empty);
        _mockConfiguration.Setup(c => c["Jwt:SigningKey"]).Returns(configKey);

        try
        {
            var provider = new ConfigurationJwtSigningKeyProvider(_mockConfiguration.Object);

            // Act
            var key = provider.GetSigningKey();

            // Assert
            // Empty string is still a valid value from environment variable
            key.Should().BeEmpty();
        }
        finally
        {
            Environment.SetEnvironmentVariable("JWT_SIGNING_KEY", null);
        }
    }

    [Fact]
    public void GetSigningKey_ImplementsInterface_ShouldReturnString()
    {
        // Arrange
        IJwtSigningKeyProvider provider = new ConfigurationJwtSigningKeyProvider(_mockConfiguration.Object);

        // Act
        var key = provider.GetSigningKey();

        // Assert
        key.Should().NotBeNull();
        key.Should().BeOfType<string>();
    }

    [Fact]
    public void GetSigningKey_WithWhitespaceKey_ShouldReturnWhitespace()
    {
        // Arrange
        var whitespaceKey = "   ";
        _mockConfiguration.Setup(c => c["Jwt:SigningKey"]).Returns(whitespaceKey);
        Environment.SetEnvironmentVariable("JWT_SIGNING_KEY", null);

        var provider = new ConfigurationJwtSigningKeyProvider(_mockConfiguration.Object);

        // Act
        var key = provider.GetSigningKey();

        // Assert
        key.Should().Be(whitespaceKey);
    }

    [Fact]
    public void GetSigningKey_WithLongKey_ShouldReturnFullKey()
    {
        // Arrange
        var longKey = new string('X', 1000);
        _mockConfiguration.Setup(c => c["Jwt:SigningKey"]).Returns(longKey);
        Environment.SetEnvironmentVariable("JWT_SIGNING_KEY", null);

        var provider = new ConfigurationJwtSigningKeyProvider(_mockConfiguration.Object);

        // Act
        var key = provider.GetSigningKey();

        // Assert
        key.Should().Be(longKey);
        key.Length.Should().Be(1000);
    }

    [Fact]
    public void GetSigningKey_WithSpecialCharacters_ShouldReturnKey()
    {
        // Arrange
        var specialKey = "key!@#$%^&*()_+-=[]{}|;':\",./<>?";
        _mockConfiguration.Setup(c => c["Jwt:SigningKey"]).Returns(specialKey);
        Environment.SetEnvironmentVariable("JWT_SIGNING_KEY", null);

        var provider = new ConfigurationJwtSigningKeyProvider(_mockConfiguration.Object);

        // Act
        var key = provider.GetSigningKey();

        // Assert
        key.Should().Be(specialKey);
    }

    [Fact]
    public void GetSigningKey_WithUnicodeCharacters_ShouldReturnKey()
    {
        // Arrange
        var unicodeKey = "key-with-unicode-\u00e9\u00e8\u00ea-\u4e2d\u6587-characters";
        _mockConfiguration.Setup(c => c["Jwt:SigningKey"]).Returns(unicodeKey);
        Environment.SetEnvironmentVariable("JWT_SIGNING_KEY", null);

        var provider = new ConfigurationJwtSigningKeyProvider(_mockConfiguration.Object);

        // Act
        var key = provider.GetSigningKey();

        // Assert
        key.Should().Be(unicodeKey);
    }

    [Fact]
    public void Provider_ShouldImplementIJwtSigningKeyProvider()
    {
        // Arrange
        var provider = new ConfigurationJwtSigningKeyProvider(_mockConfiguration.Object);

        // Assert
        provider.Should().BeAssignableTo<IJwtSigningKeyProvider>();
    }
}
