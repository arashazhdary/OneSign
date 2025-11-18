using System.CommandLine;
using FluentAssertions;
using Onesign.Cli.Commands;
using Xunit;

namespace Onesign.Api.Tests.Cli;

public class AppsCommandTests
{
    [Fact]
    public void AppsCommand_HasCorrectDescription()
    {
        // Act
        var command = new AppsCommand();

        // Assert
        command.Description.Should().Be("Manage applications");
        command.Name.Should().Be("apps");
    }

    [Fact]
    public void AppsCommand_HasAllSubcommands()
    {
        // Act
        var command = new AppsCommand();
        var subcommands = command.Subcommands.Select(c => c.Name).ToList();

        // Assert
        subcommands.Should().Contain("list");
        subcommands.Should().Contain("get");
        subcommands.Should().Contain("create");
        subcommands.Should().Contain("delete");
        subcommands.Should().Contain("regenerate-secret");
    }

    [Fact]
    public async Task AppsCommand_WithHelp_ReturnsZero()
    {
        // Arrange
        var command = new AppsCommand();

        // Act
        var result = await command.InvokeAsync("--help");

        // Assert
        result.Should().Be(0);
    }
}

public class ListAppsCommandTests
{
    [Fact]
    public void ListAppsCommand_HasCorrectDescription()
    {
        // Act
        var command = new ListAppsCommand();

        // Assert
        command.Description.Should().Be("List all applications");
        command.Name.Should().Be("list");
    }

    [Fact]
    public void ListAppsCommand_HasPageOption()
    {
        // Act
        var command = new ListAppsCommand();

        // Assert
        var pageOption = command.Options.FirstOrDefault(o => o.Name == "page");
        pageOption.Should().NotBeNull();
        pageOption!.Aliases.Should().Contain("--page");
        pageOption.Aliases.Should().Contain("-p");
    }

    [Fact]
    public void ListAppsCommand_HasSizeOption()
    {
        // Act
        var command = new ListAppsCommand();

        // Assert
        var sizeOption = command.Options.FirstOrDefault(o => o.Name == "size");
        sizeOption.Should().NotBeNull();
        sizeOption!.Aliases.Should().Contain("--size");
        sizeOption.Aliases.Should().Contain("-s");
    }

    [Fact]
    public void ListAppsCommand_HasJsonOption()
    {
        // Act
        var command = new ListAppsCommand();

        // Assert
        var jsonOption = command.Options.FirstOrDefault(o => o.Name == "json");
        jsonOption.Should().NotBeNull();
        jsonOption!.Aliases.Should().Contain("--json");
    }

    [Fact]
    public async Task ListAppsCommand_WithHelp_ReturnsZero()
    {
        // Arrange
        var command = new ListAppsCommand();

        // Act
        var result = await command.InvokeAsync("--help");

        // Assert
        result.Should().Be(0);
    }
}

public class GetAppCommandTests
{
    [Fact]
    public void GetAppCommand_HasCorrectDescription()
    {
        // Act
        var command = new GetAppCommand();

        // Assert
        command.Description.Should().Be("Get application details");
        command.Name.Should().Be("get");
    }

    [Fact]
    public void GetAppCommand_HasIdArgument()
    {
        // Act
        var command = new GetAppCommand();

        // Assert
        var idArgument = command.Arguments.FirstOrDefault(a => a.Name == "id");
        idArgument.Should().NotBeNull();
    }

    [Fact]
    public void GetAppCommand_HasJsonOption()
    {
        // Act
        var command = new GetAppCommand();

        // Assert
        var jsonOption = command.Options.FirstOrDefault(o => o.Name == "json");
        jsonOption.Should().NotBeNull();
    }

    [Fact]
    public async Task GetAppCommand_WithHelp_ReturnsZero()
    {
        // Arrange
        var command = new GetAppCommand();

        // Act
        var result = await command.InvokeAsync("--help");

        // Assert
        result.Should().Be(0);
    }
}

public class CreateAppCommandTests
{
    [Fact]
    public void CreateAppCommand_HasCorrectDescription()
    {
        // Act
        var command = new CreateAppCommand();

        // Assert
        command.Description.Should().Be("Create a new application");
        command.Name.Should().Be("create");
    }

    [Fact]
    public void CreateAppCommand_HasRequiredNameOption()
    {
        // Act
        var command = new CreateAppCommand();

        // Assert
        var nameOption = command.Options.FirstOrDefault(o => o.Name == "name");
        nameOption.Should().NotBeNull();
        nameOption!.IsRequired.Should().BeTrue();
        nameOption.Aliases.Should().Contain("--name");
        nameOption.Aliases.Should().Contain("-n");
    }

    [Fact]
    public void CreateAppCommand_HasTypeOption()
    {
        // Act
        var command = new CreateAppCommand();

        // Assert
        var typeOption = command.Options.FirstOrDefault(o => o.Name == "type");
        typeOption.Should().NotBeNull();
        typeOption!.Aliases.Should().Contain("--type");
        typeOption.Aliases.Should().Contain("-t");
    }

    [Fact]
    public void CreateAppCommand_HasRedirectUriOption()
    {
        // Act
        var command = new CreateAppCommand();

        // Assert
        var redirectUriOption = command.Options.FirstOrDefault(o => o.Name == "redirect-uri");
        redirectUriOption.Should().NotBeNull();
        redirectUriOption!.Aliases.Should().Contain("--redirect-uri");
        redirectUriOption.Aliases.Should().Contain("-r");
    }

    [Fact]
    public void CreateAppCommand_HasDescriptionOption()
    {
        // Act
        var command = new CreateAppCommand();

        // Assert
        var descriptionOption = command.Options.FirstOrDefault(o => o.Name == "description");
        descriptionOption.Should().NotBeNull();
        descriptionOption!.Aliases.Should().Contain("--description");
        descriptionOption.Aliases.Should().Contain("-d");
    }

    [Fact]
    public void CreateAppCommand_HasJsonOption()
    {
        // Act
        var command = new CreateAppCommand();

        // Assert
        var jsonOption = command.Options.FirstOrDefault(o => o.Name == "json");
        jsonOption.Should().NotBeNull();
    }

    [Fact]
    public async Task CreateAppCommand_WithHelp_ReturnsZero()
    {
        // Arrange
        var command = new CreateAppCommand();

        // Act
        var result = await command.InvokeAsync("--help");

        // Assert
        result.Should().Be(0);
    }
}

public class DeleteAppCommandTests
{
    [Fact]
    public void DeleteAppCommand_HasCorrectDescription()
    {
        // Act
        var command = new DeleteAppCommand();

        // Assert
        command.Description.Should().Be("Delete an application");
        command.Name.Should().Be("delete");
    }

    [Fact]
    public void DeleteAppCommand_HasIdArgument()
    {
        // Act
        var command = new DeleteAppCommand();

        // Assert
        var idArgument = command.Arguments.FirstOrDefault(a => a.Name == "id");
        idArgument.Should().NotBeNull();
    }

    [Fact]
    public void DeleteAppCommand_HasForceOption()
    {
        // Act
        var command = new DeleteAppCommand();

        // Assert
        var forceOption = command.Options.FirstOrDefault(o => o.Name == "force");
        forceOption.Should().NotBeNull();
        forceOption!.Aliases.Should().Contain("--force");
        forceOption.Aliases.Should().Contain("-f");
    }

    [Fact]
    public async Task DeleteAppCommand_WithHelp_ReturnsZero()
    {
        // Arrange
        var command = new DeleteAppCommand();

        // Act
        var result = await command.InvokeAsync("--help");

        // Assert
        result.Should().Be(0);
    }
}

public class RegenerateSecretCommandTests
{
    [Fact]
    public void RegenerateSecretCommand_HasCorrectDescription()
    {
        // Act
        var command = new RegenerateSecretCommand();

        // Assert
        command.Description.Should().Be("Regenerate client secret for an application");
        command.Name.Should().Be("regenerate-secret");
    }

    [Fact]
    public void RegenerateSecretCommand_HasIdArgument()
    {
        // Act
        var command = new RegenerateSecretCommand();

        // Assert
        var idArgument = command.Arguments.FirstOrDefault(a => a.Name == "id");
        idArgument.Should().NotBeNull();
    }

    [Fact]
    public async Task RegenerateSecretCommand_WithHelp_ReturnsZero()
    {
        // Arrange
        var command = new RegenerateSecretCommand();

        // Act
        var result = await command.InvokeAsync("--help");

        // Assert
        result.Should().Be(0);
    }
}
