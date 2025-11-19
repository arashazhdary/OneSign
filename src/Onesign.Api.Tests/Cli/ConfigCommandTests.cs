using System.CommandLine;
using FluentAssertions;
using Onesign.Cli.Commands;
using Xunit;

namespace Onesign.Api.Tests.Cli;

public class ConfigCommandTests
{
    [Fact]
    public void ConfigCommand_HasCorrectDescription()
    {
        // Act
        var command = new ConfigCommand();

        // Assert
        command.Description.Should().Be("Manage CLI configuration");
        command.Name.Should().Be("config");
    }

    [Fact]
    public void ConfigCommand_HasAllSubcommands()
    {
        // Act
        var command = new ConfigCommand();
        var subcommands = command.Subcommands.Select(c => c.Name).ToList();

        // Assert
        subcommands.Should().Contain("set-server");
        subcommands.Should().Contain("set-client");
        subcommands.Should().Contain("show");
        subcommands.Should().Contain("clear");
    }

    [Fact]
    public async Task ConfigCommand_WithHelp_ReturnsZero()
    {
        // Arrange
        var command = new ConfigCommand();

        // Act
        var result = await command.InvokeAsync("--help");

        // Assert
        result.Should().Be(0);
    }
}

public class SetServerCommandTests
{
    [Fact]
    public void SetServerCommand_HasCorrectDescription()
    {
        // Act
        var command = new SetServerCommand();

        // Assert
        command.Description.Should().Be("Set the OneSign server URL");
        command.Name.Should().Be("set-server");
    }

    [Fact]
    public void SetServerCommand_HasUrlArgument()
    {
        // Act
        var command = new SetServerCommand();

        // Assert
        var urlArgument = command.Arguments.FirstOrDefault(a => a.Name == "url");
        urlArgument.Should().NotBeNull();
    }

    [Fact]
    public async Task SetServerCommand_WithHelp_ReturnsZero()
    {
        // Arrange
        var command = new SetServerCommand();

        // Act
        var result = await command.InvokeAsync("--help");

        // Assert
        result.Should().Be(0);
    }
}

public class SetClientCommandTests
{
    [Fact]
    public void SetClientCommand_HasCorrectDescription()
    {
        // Act
        var command = new SetClientCommand();

        // Assert
        command.Description.Should().Be("Set client credentials");
        command.Name.Should().Be("set-client");
    }

    [Fact]
    public void SetClientCommand_HasRequiredClientIdOption()
    {
        // Act
        var command = new SetClientCommand();

        // Assert
        var clientIdOption = command.Options.FirstOrDefault(o => o.Name == "client-id");
        clientIdOption.Should().NotBeNull();
        clientIdOption!.IsRequired.Should().BeTrue();
        clientIdOption.Aliases.Should().Contain("--client-id");
        clientIdOption.Aliases.Should().Contain("-i");
    }

    [Fact]
    public void SetClientCommand_HasRequiredClientSecretOption()
    {
        // Act
        var command = new SetClientCommand();

        // Assert
        var clientSecretOption = command.Options.FirstOrDefault(o => o.Name == "client-secret");
        clientSecretOption.Should().NotBeNull();
        clientSecretOption!.IsRequired.Should().BeTrue();
        clientSecretOption.Aliases.Should().Contain("--client-secret");
        clientSecretOption.Aliases.Should().Contain("-s");
    }

    [Fact]
    public async Task SetClientCommand_WithHelp_ReturnsZero()
    {
        // Arrange
        var command = new SetClientCommand();

        // Act
        var result = await command.InvokeAsync("--help");

        // Assert
        result.Should().Be(0);
    }
}

public class ShowConfigCommandTests
{
    [Fact]
    public void ShowConfigCommand_HasCorrectDescription()
    {
        // Act
        var command = new ShowConfigCommand();

        // Assert
        command.Description.Should().Be("Show current configuration");
        command.Name.Should().Be("show");
    }

    [Fact]
    public void ShowConfigCommand_HasShowSecretsOption()
    {
        // Act
        var command = new ShowConfigCommand();

        // Assert
        var showSecretsOption = command.Options.FirstOrDefault(o => o.Name == "show-secrets");
        showSecretsOption.Should().NotBeNull();
        showSecretsOption!.Aliases.Should().Contain("--show-secrets");
    }

    [Fact]
    public async Task ShowConfigCommand_WithHelp_ReturnsZero()
    {
        // Arrange
        var command = new ShowConfigCommand();

        // Act
        var result = await command.InvokeAsync("--help");

        // Assert
        result.Should().Be(0);
    }
}

public class ClearConfigCommandTests
{
    [Fact]
    public void ClearConfigCommand_HasCorrectDescription()
    {
        // Act
        var command = new ClearConfigCommand();

        // Assert
        command.Description.Should().Be("Clear all configuration");
        command.Name.Should().Be("clear");
    }

    [Fact]
    public void ClearConfigCommand_HasForceOption()
    {
        // Act
        var command = new ClearConfigCommand();

        // Assert
        var forceOption = command.Options.FirstOrDefault(o => o.Name == "force");
        forceOption.Should().NotBeNull();
        forceOption!.Aliases.Should().Contain("--force");
        forceOption.Aliases.Should().Contain("-f");
    }

    [Fact]
    public async Task ClearConfigCommand_WithHelp_ReturnsZero()
    {
        // Arrange
        var command = new ClearConfigCommand();

        // Act
        var result = await command.InvokeAsync("--help");

        // Assert
        result.Should().Be(0);
    }
}
