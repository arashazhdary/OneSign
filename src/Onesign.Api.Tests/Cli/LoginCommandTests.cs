using System.CommandLine;
using System.Text.Json;
using FluentAssertions;
using Onesign.Cli.Commands;
using Xunit;

namespace Onesign.Api.Tests.Cli;

public class LoginCommandTests
{
    [Fact]
    public void LoginCommand_HasCorrectDescription()
    {
        // Act
        var command = new LoginCommand();

        // Assert
        command.Description.Should().Be("Authenticate with OneSign");
        command.Name.Should().Be("login");
    }

    [Fact]
    public void LoginCommand_HasEmailOption()
    {
        // Act
        var command = new LoginCommand();

        // Assert
        var emailOption = command.Options.FirstOrDefault(o => o.Name == "email");
        emailOption.Should().NotBeNull();
        emailOption!.Aliases.Should().Contain("--email");
        emailOption.Aliases.Should().Contain("-e");
    }

    [Fact]
    public void LoginCommand_HasPasswordOption()
    {
        // Act
        var command = new LoginCommand();

        // Assert
        var passwordOption = command.Options.FirstOrDefault(o => o.Name == "password");
        passwordOption.Should().NotBeNull();
        passwordOption!.Aliases.Should().Contain("--password");
        passwordOption.Aliases.Should().Contain("-p");
    }

    [Fact]
    public void LoginCommand_HasInteractiveOption()
    {
        // Act
        var command = new LoginCommand();

        // Assert
        var interactiveOption = command.Options.FirstOrDefault(o => o.Name == "interactive");
        interactiveOption.Should().NotBeNull();
        interactiveOption!.Aliases.Should().Contain("--interactive");
        interactiveOption.Aliases.Should().Contain("-i");
    }

    [Fact]
    public async Task LoginCommand_WithHelp_ReturnsZero()
    {
        // Arrange
        var command = new LoginCommand();

        // Act
        var result = await command.InvokeAsync("--help");

        // Assert
        result.Should().Be(0);
    }
}

public class LogoutCommandTests
{
    private readonly string _testConfigPath;

    public LogoutCommandTests()
    {
        _testConfigPath = Path.Combine(Path.GetTempPath(), $".onesign-test-{Guid.NewGuid()}", "config.json");
    }

    [Fact]
    public void LogoutCommand_HasCorrectDescription()
    {
        // Act
        var command = new LogoutCommand();

        // Assert
        command.Description.Should().Be("Clear saved credentials");
        command.Name.Should().Be("logout");
    }

    [Fact]
    public async Task LogoutCommand_WithHelp_ReturnsZero()
    {
        // Arrange
        var command = new LogoutCommand();

        // Act
        var result = await command.InvokeAsync("--help");

        // Assert
        result.Should().Be(0);
    }
}

public class CliConfigTests
{
    private readonly string _testConfigDir;
    private readonly string _originalConfigPath;

    public CliConfigTests()
    {
        _testConfigDir = Path.Combine(Path.GetTempPath(), $".onesign-test-{Guid.NewGuid()}");
        _originalConfigPath = Path.Combine(
            Environment.GetFolderPath(Environment.SpecialFolder.UserProfile),
            ".onesign",
            "config.json");
    }

    [Fact]
    public void Load_WithNoConfigFile_ReturnsEmptyConfig()
    {
        // Act
        var config = CliConfig.Load();

        // Assert
        config.Should().NotBeNull();
    }

    [Fact]
    public void CliConfig_DefaultValues_AreNull()
    {
        // Act
        var config = new CliConfig();

        // Assert
        config.BaseUrl.Should().BeNull();
        config.ClientId.Should().BeNull();
        config.ClientSecret.Should().BeNull();
        config.AccessToken.Should().BeNull();
        config.RefreshToken.Should().BeNull();
        config.TokenExpiresAt.Should().BeNull();
    }

    [Fact]
    public void CliConfig_CanSetAllProperties()
    {
        // Act
        var config = new CliConfig
        {
            BaseUrl = "https://auth.example.com",
            ClientId = "client-123",
            ClientSecret = "secret-456",
            AccessToken = "access-token",
            RefreshToken = "refresh-token",
            TokenExpiresAt = DateTimeOffset.UtcNow.AddHours(1)
        };

        // Assert
        config.BaseUrl.Should().Be("https://auth.example.com");
        config.ClientId.Should().Be("client-123");
        config.ClientSecret.Should().Be("secret-456");
        config.AccessToken.Should().Be("access-token");
        config.RefreshToken.Should().Be("refresh-token");
        config.TokenExpiresAt.Should().NotBeNull();
    }

    [Fact]
    public void CreateClient_WithNoBaseUrl_ThrowsInvalidOperationException()
    {
        // Arrange
        var config = new CliConfig();

        // Act & Assert
        var act = () => config.CreateClient();
        act.Should().Throw<InvalidOperationException>()
            .WithMessage("*No server configured*");
    }

    [Fact]
    public void CreateClient_WithBaseUrl_CreatesClient()
    {
        // Arrange
        var config = new CliConfig
        {
            BaseUrl = "https://auth.example.com",
            ClientId = "client-123",
            ClientSecret = "secret-456"
        };

        // Act
        using var client = config.CreateClient();

        // Assert
        client.Should().NotBeNull();
    }

    [Fact]
    public void CreateClient_WithAccessToken_SetsTokenOnClient()
    {
        // Arrange
        var config = new CliConfig
        {
            BaseUrl = "https://auth.example.com",
            ClientId = "client-123",
            ClientSecret = "secret-456",
            AccessToken = "test-token",
            RefreshToken = "refresh-token",
            TokenExpiresAt = DateTimeOffset.UtcNow.AddHours(1)
        };

        // Act
        using var client = config.CreateClient();

        // Assert
        client.Should().NotBeNull();
        client.Auth.GetCachedToken().Should().NotBeNull();
        client.Auth.GetCachedToken()!.AccessToken.Should().Be("test-token");
    }

    [Fact]
    public void CreateClient_WithNullClientCredentials_UsesEmptyStrings()
    {
        // Arrange
        var config = new CliConfig
        {
            BaseUrl = "https://auth.example.com"
        };

        // Act
        using var client = config.CreateClient();

        // Assert
        client.Should().NotBeNull();
    }

    [Fact]
    public void CreateClient_WithEmptyAccessToken_DoesNotSetToken()
    {
        // Arrange
        var config = new CliConfig
        {
            BaseUrl = "https://auth.example.com",
            AccessToken = ""
        };

        // Act
        using var client = config.CreateClient();

        // Assert
        client.Auth.GetCachedToken().Should().BeNull();
    }

    [Fact]
    public void CreateClient_WithNullTokenExpiresAt_UsesDefaultExpiration()
    {
        // Arrange
        var config = new CliConfig
        {
            BaseUrl = "https://auth.example.com",
            AccessToken = "test-token"
        };

        // Act
        using var client = config.CreateClient();

        // Assert
        client.Auth.GetCachedToken().Should().NotBeNull();
        client.Auth.GetCachedToken()!.ExpiresAt.Should().BeCloseTo(DateTimeOffset.UtcNow.AddHours(1), TimeSpan.FromMinutes(1));
    }
}
