using System.CommandLine;
using FluentAssertions;
using Xunit;

namespace Onesign.Api.Tests.Cli;

public class ProgramTests
{
    [Fact]
    public async Task Main_WithNoArgs_ReturnsZero()
    {
        // Arrange
        var args = Array.Empty<string>();

        // Act
        var result = await InvokeProgram(args);

        // Assert
        result.Should().Be(0);
    }

    [Fact]
    public async Task Main_WithHelpOption_ReturnsZero()
    {
        // Arrange
        var args = new[] { "--help" };

        // Act
        var result = await InvokeProgram(args);

        // Assert
        result.Should().Be(0);
    }

    [Fact]
    public async Task Main_WithShortHelpOption_ReturnsZero()
    {
        // Arrange
        var args = new[] { "-h" };

        // Act
        var result = await InvokeProgram(args);

        // Assert
        result.Should().Be(0);
    }

    [Fact]
    public async Task Main_WithVersionOption_ReturnsZero()
    {
        // Arrange
        var args = new[] { "--version" };

        // Act
        var result = await InvokeProgram(args);

        // Assert
        result.Should().Be(0);
    }

    [Fact]
    public async Task Main_WithShortVersionOption_ReturnsZero()
    {
        // Arrange
        var args = new[] { "-v" };

        // Act
        var result = await InvokeProgram(args);

        // Assert
        result.Should().Be(0);
    }

    [Fact]
    public async Task Main_WithInvalidCommand_ReturnsNonZero()
    {
        // Arrange
        var args = new[] { "invalid-command" };

        // Act
        var result = await InvokeProgram(args);

        // Assert
        result.Should().NotBe(0);
    }

    [Fact]
    public async Task RootCommand_HasCorrectDescription()
    {
        // Arrange
        var rootCommand = CreateRootCommand();

        // Assert
        rootCommand.Description.Should().Be("OneSign CLI - Command-line interface for OneSign Identity Platform");
    }

    [Fact]
    public async Task RootCommand_HasCorrectName()
    {
        // Arrange
        var rootCommand = CreateRootCommand();

        // Assert
        rootCommand.Name.Should().Be("onesign");
    }

    [Fact]
    public void RootCommand_HasAllExpectedSubcommands()
    {
        // Arrange
        var rootCommand = CreateRootCommand();

        // Act
        var subcommands = rootCommand.Subcommands.Select(c => c.Name).ToList();

        // Assert
        subcommands.Should().Contain("login");
        subcommands.Should().Contain("logout");
        subcommands.Should().Contain("users");
        subcommands.Should().Contain("apps");
        subcommands.Should().Contain("config");
    }

    [Fact]
    public async Task Main_WithLoginHelp_ReturnsZero()
    {
        // Arrange
        var args = new[] { "login", "--help" };

        // Act
        var result = await InvokeProgram(args);

        // Assert
        result.Should().Be(0);
    }

    [Fact]
    public async Task Main_WithUsersHelp_ReturnsZero()
    {
        // Arrange
        var args = new[] { "users", "--help" };

        // Act
        var result = await InvokeProgram(args);

        // Assert
        result.Should().Be(0);
    }

    [Fact]
    public async Task Main_WithAppsHelp_ReturnsZero()
    {
        // Arrange
        var args = new[] { "apps", "--help" };

        // Act
        var result = await InvokeProgram(args);

        // Assert
        result.Should().Be(0);
    }

    [Fact]
    public async Task Main_WithConfigHelp_ReturnsZero()
    {
        // Arrange
        var args = new[] { "config", "--help" };

        // Act
        var result = await InvokeProgram(args);

        // Assert
        result.Should().Be(0);
    }

    [Fact]
    public async Task Main_WithLogoutHelp_ReturnsZero()
    {
        // Arrange
        var args = new[] { "logout", "--help" };

        // Act
        var result = await InvokeProgram(args);

        // Assert
        result.Should().Be(0);
    }

    [Fact]
    public async Task Main_WithUsersListHelp_ReturnsZero()
    {
        // Arrange
        var args = new[] { "users", "list", "--help" };

        // Act
        var result = await InvokeProgram(args);

        // Assert
        result.Should().Be(0);
    }

    [Fact]
    public async Task Main_WithAppsListHelp_ReturnsZero()
    {
        // Arrange
        var args = new[] { "apps", "list", "--help" };

        // Act
        var result = await InvokeProgram(args);

        // Assert
        result.Should().Be(0);
    }

    [Fact]
    public async Task Main_WithConfigShowHelp_ReturnsZero()
    {
        // Arrange
        var args = new[] { "config", "show", "--help" };

        // Act
        var result = await InvokeProgram(args);

        // Assert
        result.Should().Be(0);
    }

    private static RootCommand CreateRootCommand()
    {
        var rootCommand = new RootCommand("OneSign CLI - Command-line interface for OneSign Identity Platform")
        {
            Name = "onesign"
        };

        rootCommand.AddCommand(new Onesign.Cli.Commands.LoginCommand());
        rootCommand.AddCommand(new Onesign.Cli.Commands.LogoutCommand());
        rootCommand.AddCommand(new Onesign.Cli.Commands.UsersCommand());
        rootCommand.AddCommand(new Onesign.Cli.Commands.AppsCommand());
        rootCommand.AddCommand(new Onesign.Cli.Commands.ConfigCommand());

        rootCommand.AddGlobalOption(new Option<bool>(
            aliases: new[] { "--version", "-v" },
            description: "Show version information"));

        return rootCommand;
    }

    private static async Task<int> InvokeProgram(string[] args)
    {
        var rootCommand = CreateRootCommand();
        return await rootCommand.InvokeAsync(args);
    }
}
