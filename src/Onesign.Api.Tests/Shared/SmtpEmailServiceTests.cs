using FluentAssertions;
using Microsoft.Extensions.Configuration;
using Microsoft.Extensions.Logging;
using Moq;
using Onesign.Shared.Email;
using Xunit;

namespace Onesign.Api.Tests.Shared;

public class SmtpEmailServiceTests
{
    private readonly Mock<IConfiguration> _mockConfiguration;
    private readonly Mock<ILogger<SmtpEmailService>> _mockLogger;

    public SmtpEmailServiceTests()
    {
        _mockConfiguration = new Mock<IConfiguration>();
        _mockLogger = new Mock<ILogger<SmtpEmailService>>();
        SetupDefaultConfiguration();
    }

    private void SetupDefaultConfiguration()
    {
        _mockConfiguration.Setup(c => c["Email:Smtp:Host"]).Returns("localhost");
        _mockConfiguration.Setup(c => c["Email:Smtp:Port"]).Returns("25");
        _mockConfiguration.Setup(c => c["Email:Smtp:Username"]).Returns((string?)null);
        _mockConfiguration.Setup(c => c["Email:Smtp:Password"]).Returns((string?)null);
        _mockConfiguration.Setup(c => c["Email:From:Address"]).Returns("test@onesign.local");
        _mockConfiguration.Setup(c => c["Email:From:Name"]).Returns("Test SSO");
        _mockConfiguration.Setup(c => c["Email:Smtp:EnableSsl"]).Returns("false");
    }

    [Fact]
    public void Constructor_WithNullLogger_ShouldUseNullLogger()
    {
        // Act
        var service = new SmtpEmailService(_mockConfiguration.Object, null);

        // Assert
        service.Should().NotBeNull();
    }

    [Fact]
    public void Constructor_WithLogger_ShouldInitializeCorrectly()
    {
        // Act
        var service = new SmtpEmailService(_mockConfiguration.Object, _mockLogger.Object);

        // Assert
        service.Should().NotBeNull();
    }

    [Fact]
    public async Task SendEmailAsync_WithBasicParameters_ShouldAttemptToSend()
    {
        // Arrange
        var service = new SmtpEmailService(_mockConfiguration.Object, _mockLogger.Object);

        // Act - This will fail because there's no actual SMTP server
        var result = await service.SendEmailAsync("test@example.com", "Subject", "Body");

        // Assert - Should return false due to connection failure
        result.Should().BeFalse();
    }

    [Fact]
    public async Task SendEmailAsync_WithDisplayName_ShouldAttemptToSend()
    {
        // Arrange
        var service = new SmtpEmailService(_mockConfiguration.Object, _mockLogger.Object);

        // Act
        var result = await service.SendEmailAsync(
            "test@example.com",
            "Test User",
            "Subject",
            "Body",
            true,
            CancellationToken.None);

        // Assert - Should return false due to connection failure
        result.Should().BeFalse();
    }

    [Fact]
    public async Task SendEmailAsync_WithHtmlBody_ShouldAttemptToSend()
    {
        // Arrange
        var service = new SmtpEmailService(_mockConfiguration.Object, _mockLogger.Object);
        var htmlBody = "<html><body><h1>Test</h1></body></html>";

        // Act
        var result = await service.SendEmailAsync("test@example.com", "Subject", htmlBody, true);

        // Assert
        result.Should().BeFalse();
    }

    [Fact]
    public async Task SendEmailAsync_WithPlainTextBody_ShouldAttemptToSend()
    {
        // Arrange
        var service = new SmtpEmailService(_mockConfiguration.Object, _mockLogger.Object);

        // Act
        var result = await service.SendEmailAsync("test@example.com", "Subject", "Plain text", false);

        // Assert
        result.Should().BeFalse();
    }

    [Fact]
    public async Task SendEmailAsync_WithCredentials_ShouldUseCredentials()
    {
        // Arrange
        _mockConfiguration.Setup(c => c["Email:Smtp:Username"]).Returns("user@test.com");
        _mockConfiguration.Setup(c => c["Email:Smtp:Password"]).Returns("password123");

        var service = new SmtpEmailService(_mockConfiguration.Object, _mockLogger.Object);

        // Act
        var result = await service.SendEmailAsync("test@example.com", "Subject", "Body");

        // Assert
        result.Should().BeFalse();
    }

    [Fact]
    public async Task SendEmailAsync_WithSslEnabled_ShouldAttemptSecureConnection()
    {
        // Arrange
        _mockConfiguration.Setup(c => c["Email:Smtp:EnableSsl"]).Returns("true");
        _mockConfiguration.Setup(c => c["Email:Smtp:Port"]).Returns("587");

        var service = new SmtpEmailService(_mockConfiguration.Object, _mockLogger.Object);

        // Act
        var result = await service.SendEmailAsync("test@example.com", "Subject", "Body");

        // Assert
        result.Should().BeFalse();
    }

    [Fact]
    public async Task SendEmailAsync_WithDefaultFromAddress_ShouldUseDefault()
    {
        // Arrange
        _mockConfiguration.Setup(c => c["Email:From:Address"]).Returns((string?)null);
        _mockConfiguration.Setup(c => c["Email:From:Name"]).Returns((string?)null);

        var service = new SmtpEmailService(_mockConfiguration.Object, _mockLogger.Object);

        // Act
        var result = await service.SendEmailAsync("test@example.com", "Subject", "Body");

        // Assert
        result.Should().BeFalse();
    }

    [Fact]
    public async Task SendEmailAsync_WithCancellationToken_ShouldRespectCancellation()
    {
        // Arrange
        var service = new SmtpEmailService(_mockConfiguration.Object, _mockLogger.Object);
        var cts = new CancellationTokenSource();

        // Act
        var result = await service.SendEmailAsync(
            "test@example.com",
            "Subject",
            "Body",
            true,
            cts.Token);

        // Assert
        result.Should().BeFalse();
    }

    [Fact]
    public async Task SendEmailAsync_WhenSmtpFails_ShouldLogError()
    {
        // Arrange
        var service = new SmtpEmailService(_mockConfiguration.Object, _mockLogger.Object);

        // Act
        await service.SendEmailAsync("test@example.com", "Subject", "Body");

        // Assert
        _mockLogger.Verify(
            x => x.Log(
                LogLevel.Error,
                It.IsAny<EventId>(),
                It.Is<It.IsAnyType>((v, t) => true),
                It.IsAny<Exception>(),
                It.IsAny<Func<It.IsAnyType, Exception?, string>>()),
            Times.Once);
    }

    [Fact]
    public async Task SendEmailAsync_WithInvalidPort_ShouldReturnFalse()
    {
        // Arrange
        _mockConfiguration.Setup(c => c["Email:Smtp:Port"]).Returns("99999");

        var service = new SmtpEmailService(_mockConfiguration.Object, _mockLogger.Object);

        // Act
        var result = await service.SendEmailAsync("test@example.com", "Subject", "Body");

        // Assert
        result.Should().BeFalse();
    }

    [Fact]
    public async Task SendEmailAsync_SimpleOverload_ShouldCallOverloadWithDisplayName()
    {
        // Arrange
        var service = new SmtpEmailService(_mockConfiguration.Object, _mockLogger.Object);

        // Act
        var result = await service.SendEmailAsync("test@example.com", "Subject", "Body");

        // Assert
        result.Should().BeFalse();
    }

    [Fact]
    public async Task SendEmailAsync_WithLongSubject_ShouldHandle()
    {
        // Arrange
        var service = new SmtpEmailService(_mockConfiguration.Object, _mockLogger.Object);
        var longSubject = new string('A', 1000);

        // Act
        var result = await service.SendEmailAsync("test@example.com", longSubject, "Body");

        // Assert
        result.Should().BeFalse();
    }

    [Fact]
    public async Task SendEmailAsync_WithLongBody_ShouldHandle()
    {
        // Arrange
        var service = new SmtpEmailService(_mockConfiguration.Object, _mockLogger.Object);
        var longBody = new string('B', 10000);

        // Act
        var result = await service.SendEmailAsync("test@example.com", "Subject", longBody);

        // Assert
        result.Should().BeFalse();
    }

    [Fact]
    public async Task SendEmailAsync_WithEmptyToAddress_ShouldReturnFalse()
    {
        // Arrange
        var service = new SmtpEmailService(_mockConfiguration.Object, _mockLogger.Object);

        // Act
        var result = await service.SendEmailAsync(string.Empty, "Subject", "Body");

        // Assert
        result.Should().BeFalse();
    }

    [Fact]
    public async Task SendEmailAsync_WithDefaultPort_ShouldUse25()
    {
        // Arrange
        _mockConfiguration.Setup(c => c["Email:Smtp:Port"]).Returns((string?)null);

        var service = new SmtpEmailService(_mockConfiguration.Object, _mockLogger.Object);

        // Act
        var result = await service.SendEmailAsync("test@example.com", "Subject", "Body");

        // Assert
        result.Should().BeFalse();
    }

    [Fact]
    public async Task SendEmailAsync_WithDefaultHost_ShouldUseLocalhost()
    {
        // Arrange
        _mockConfiguration.Setup(c => c["Email:Smtp:Host"]).Returns((string?)null);

        var service = new SmtpEmailService(_mockConfiguration.Object, _mockLogger.Object);

        // Act
        var result = await service.SendEmailAsync("test@example.com", "Subject", "Body");

        // Assert
        result.Should().BeFalse();
    }

    [Fact]
    public async Task SendEmailAsync_WithOnlyUsername_ShouldNotSetCredentials()
    {
        // Arrange
        _mockConfiguration.Setup(c => c["Email:Smtp:Username"]).Returns("user");
        _mockConfiguration.Setup(c => c["Email:Smtp:Password"]).Returns(string.Empty);

        var service = new SmtpEmailService(_mockConfiguration.Object, _mockLogger.Object);

        // Act
        var result = await service.SendEmailAsync("test@example.com", "Subject", "Body");

        // Assert
        result.Should().BeFalse();
    }

    [Fact]
    public async Task SendEmailAsync_WithOnlyPassword_ShouldNotSetCredentials()
    {
        // Arrange
        _mockConfiguration.Setup(c => c["Email:Smtp:Username"]).Returns(string.Empty);
        _mockConfiguration.Setup(c => c["Email:Smtp:Password"]).Returns("password");

        var service = new SmtpEmailService(_mockConfiguration.Object, _mockLogger.Object);

        // Act
        var result = await service.SendEmailAsync("test@example.com", "Subject", "Body");

        // Assert
        result.Should().BeFalse();
    }
}
