using FluentAssertions;
using Onesign.Sdk.DotNet;
using Xunit;

namespace Onesign.Api.Tests.Sdk;

public class OnesignOptionsTests
{
    [Fact]
    public void DefaultValues_AreCorrect()
    {
        // Act
        var options = new OnesignOptions();

        // Assert
        options.BaseUrl.Should().Be(string.Empty);
        options.ClientId.Should().Be(string.Empty);
        options.ClientSecret.Should().Be(string.Empty);
        options.RedirectUri.Should().BeNull();
        options.TenantId.Should().BeNull();
        options.Timeout.Should().Be(TimeSpan.FromSeconds(30));
        options.RetryCount.Should().Be(3);
    }

    [Fact]
    public void BaseUrl_CanBeSet()
    {
        // Arrange
        var options = new OnesignOptions();

        // Act
        options.BaseUrl = "https://auth.example.com";

        // Assert
        options.BaseUrl.Should().Be("https://auth.example.com");
    }

    [Fact]
    public void ClientId_CanBeSet()
    {
        // Arrange
        var options = new OnesignOptions();

        // Act
        options.ClientId = "my-client-id";

        // Assert
        options.ClientId.Should().Be("my-client-id");
    }

    [Fact]
    public void ClientSecret_CanBeSet()
    {
        // Arrange
        var options = new OnesignOptions();

        // Act
        options.ClientSecret = "my-secret";

        // Assert
        options.ClientSecret.Should().Be("my-secret");
    }

    [Fact]
    public void RedirectUri_CanBeSet()
    {
        // Arrange
        var options = new OnesignOptions();

        // Act
        options.RedirectUri = "https://app.example.com/callback";

        // Assert
        options.RedirectUri.Should().Be("https://app.example.com/callback");
    }

    [Fact]
    public void TenantId_CanBeSet()
    {
        // Arrange
        var options = new OnesignOptions();

        // Act
        options.TenantId = "tenant-123";

        // Assert
        options.TenantId.Should().Be("tenant-123");
    }

    [Fact]
    public void Timeout_CanBeSet()
    {
        // Arrange
        var options = new OnesignOptions();

        // Act
        options.Timeout = TimeSpan.FromMinutes(2);

        // Assert
        options.Timeout.Should().Be(TimeSpan.FromMinutes(2));
    }

    [Fact]
    public void RetryCount_CanBeSet()
    {
        // Arrange
        var options = new OnesignOptions();

        // Act
        options.RetryCount = 5;

        // Assert
        options.RetryCount.Should().Be(5);
    }

    [Fact]
    public void ObjectInitializer_SetsAllProperties()
    {
        // Act
        var options = new OnesignOptions
        {
            BaseUrl = "https://auth.example.com",
            ClientId = "client-123",
            ClientSecret = "secret-456",
            RedirectUri = "https://app.example.com/callback",
            TenantId = "tenant-789",
            Timeout = TimeSpan.FromSeconds(60),
            RetryCount = 5
        };

        // Assert
        options.BaseUrl.Should().Be("https://auth.example.com");
        options.ClientId.Should().Be("client-123");
        options.ClientSecret.Should().Be("secret-456");
        options.RedirectUri.Should().Be("https://app.example.com/callback");
        options.TenantId.Should().Be("tenant-789");
        options.Timeout.Should().Be(TimeSpan.FromSeconds(60));
        options.RetryCount.Should().Be(5);
    }

    [Theory]
    [InlineData(0)]
    [InlineData(1)]
    [InlineData(10)]
    public void RetryCount_AcceptsVariousValues(int retryCount)
    {
        // Arrange
        var options = new OnesignOptions();

        // Act
        options.RetryCount = retryCount;

        // Assert
        options.RetryCount.Should().Be(retryCount);
    }

    [Theory]
    [InlineData(1)]
    [InlineData(30)]
    [InlineData(120)]
    public void Timeout_AcceptsVariousValues(int seconds)
    {
        // Arrange
        var options = new OnesignOptions();

        // Act
        options.Timeout = TimeSpan.FromSeconds(seconds);

        // Assert
        options.Timeout.TotalSeconds.Should().Be(seconds);
    }
}
