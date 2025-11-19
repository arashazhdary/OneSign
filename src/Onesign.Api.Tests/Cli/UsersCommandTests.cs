using System.CommandLine;
using FluentAssertions;
using Onesign.Cli.Commands;
using Xunit;

namespace Onesign.Api.Tests.Cli;

public class UsersCommandTests
{
    [Fact]
    public void UsersCommand_HasCorrectDescription()
    {
        // Act
        var command = new UsersCommand();

        // Assert
        command.Description.Should().Be("Manage users");
        command.Name.Should().Be("users");
    }

    [Fact]
    public void UsersCommand_HasAllSubcommands()
    {
        // Act
        var command = new UsersCommand();
        var subcommands = command.Subcommands.Select(c => c.Name).ToList();

        // Assert
        subcommands.Should().Contain("list");
        subcommands.Should().Contain("get");
        subcommands.Should().Contain("create");
        subcommands.Should().Contain("delete");
    }

    [Fact]
    public async Task UsersCommand_WithHelp_ReturnsZero()
    {
        // Arrange
        var command = new UsersCommand();

        // Act
        var result = await command.InvokeAsync("--help");

        // Assert
        result.Should().Be(0);
    }
}

public class ListUsersCommandTests
{
    [Fact]
    public void ListUsersCommand_HasCorrectDescription()
    {
        // Act
        var command = new ListUsersCommand();

        // Assert
        command.Description.Should().Be("List all users");
        command.Name.Should().Be("list");
    }

    [Fact]
    public void ListUsersCommand_HasPageOption()
    {
        // Act
        var command = new ListUsersCommand();

        // Assert
        var pageOption = command.Options.FirstOrDefault(o => o.Name == "page");
        pageOption.Should().NotBeNull();
        pageOption!.Aliases.Should().Contain("--page");
        pageOption.Aliases.Should().Contain("-p");
    }

    [Fact]
    public void ListUsersCommand_HasSizeOption()
    {
        // Act
        var command = new ListUsersCommand();

        // Assert
        var sizeOption = command.Options.FirstOrDefault(o => o.Name == "size");
        sizeOption.Should().NotBeNull();
        sizeOption!.Aliases.Should().Contain("--size");
        sizeOption.Aliases.Should().Contain("-s");
    }

    [Fact]
    public void ListUsersCommand_HasSearchOption()
    {
        // Act
        var command = new ListUsersCommand();

        // Assert
        var searchOption = command.Options.FirstOrDefault(o => o.Name == "search");
        searchOption.Should().NotBeNull();
        searchOption!.Aliases.Should().Contain("--search");
        searchOption.Aliases.Should().Contain("-q");
    }

    [Fact]
    public void ListUsersCommand_HasJsonOption()
    {
        // Act
        var command = new ListUsersCommand();

        // Assert
        var jsonOption = command.Options.FirstOrDefault(o => o.Name == "json");
        jsonOption.Should().NotBeNull();
        jsonOption!.Aliases.Should().Contain("--json");
    }

    [Fact]
    public async Task ListUsersCommand_WithHelp_ReturnsZero()
    {
        // Arrange
        var command = new ListUsersCommand();

        // Act
        var result = await command.InvokeAsync("--help");

        // Assert
        result.Should().Be(0);
    }
}

public class GetUserCommandTests
{
    [Fact]
    public void GetUserCommand_HasCorrectDescription()
    {
        // Act
        var command = new GetUserCommand();

        // Assert
        command.Description.Should().Be("Get user details");
        command.Name.Should().Be("get");
    }

    [Fact]
    public void GetUserCommand_HasIdArgument()
    {
        // Act
        var command = new GetUserCommand();

        // Assert
        var idArgument = command.Arguments.FirstOrDefault(a => a.Name == "id");
        idArgument.Should().NotBeNull();
    }

    [Fact]
    public void GetUserCommand_HasJsonOption()
    {
        // Act
        var command = new GetUserCommand();

        // Assert
        var jsonOption = command.Options.FirstOrDefault(o => o.Name == "json");
        jsonOption.Should().NotBeNull();
    }

    [Fact]
    public async Task GetUserCommand_WithHelp_ReturnsZero()
    {
        // Arrange
        var command = new GetUserCommand();

        // Act
        var result = await command.InvokeAsync("--help");

        // Assert
        result.Should().Be(0);
    }
}

public class CreateUserCommandTests
{
    [Fact]
    public void CreateUserCommand_HasCorrectDescription()
    {
        // Act
        var command = new CreateUserCommand();

        // Assert
        command.Description.Should().Be("Create a new user");
        command.Name.Should().Be("create");
    }

    [Fact]
    public void CreateUserCommand_HasRequiredEmailOption()
    {
        // Act
        var command = new CreateUserCommand();

        // Assert
        var emailOption = command.Options.FirstOrDefault(o => o.Name == "email");
        emailOption.Should().NotBeNull();
        emailOption!.IsRequired.Should().BeTrue();
        emailOption.Aliases.Should().Contain("--email");
        emailOption.Aliases.Should().Contain("-e");
    }

    [Fact]
    public void CreateUserCommand_HasRequiredPasswordOption()
    {
        // Act
        var command = new CreateUserCommand();

        // Assert
        var passwordOption = command.Options.FirstOrDefault(o => o.Name == "password");
        passwordOption.Should().NotBeNull();
        passwordOption!.IsRequired.Should().BeTrue();
        passwordOption.Aliases.Should().Contain("--password");
        passwordOption.Aliases.Should().Contain("-p");
    }

    [Fact]
    public void CreateUserCommand_HasFirstNameOption()
    {
        // Act
        var command = new CreateUserCommand();

        // Assert
        var firstNameOption = command.Options.FirstOrDefault(o => o.Name == "first-name");
        firstNameOption.Should().NotBeNull();
        firstNameOption!.Aliases.Should().Contain("--first-name");
        firstNameOption.Aliases.Should().Contain("-f");
    }

    [Fact]
    public void CreateUserCommand_HasLastNameOption()
    {
        // Act
        var command = new CreateUserCommand();

        // Assert
        var lastNameOption = command.Options.FirstOrDefault(o => o.Name == "last-name");
        lastNameOption.Should().NotBeNull();
        lastNameOption!.Aliases.Should().Contain("--last-name");
        lastNameOption.Aliases.Should().Contain("-l");
    }

    [Fact]
    public void CreateUserCommand_HasRolesOption()
    {
        // Act
        var command = new CreateUserCommand();

        // Assert
        var rolesOption = command.Options.FirstOrDefault(o => o.Name == "roles");
        rolesOption.Should().NotBeNull();
        rolesOption!.Aliases.Should().Contain("--roles");
        rolesOption.Aliases.Should().Contain("-r");
    }

    [Fact]
    public void CreateUserCommand_HasJsonOption()
    {
        // Act
        var command = new CreateUserCommand();

        // Assert
        var jsonOption = command.Options.FirstOrDefault(o => o.Name == "json");
        jsonOption.Should().NotBeNull();
    }

    [Fact]
    public async Task CreateUserCommand_WithHelp_ReturnsZero()
    {
        // Arrange
        var command = new CreateUserCommand();

        // Act
        var result = await command.InvokeAsync("--help");

        // Assert
        result.Should().Be(0);
    }
}

public class DeleteUserCommandTests
{
    [Fact]
    public void DeleteUserCommand_HasCorrectDescription()
    {
        // Act
        var command = new DeleteUserCommand();

        // Assert
        command.Description.Should().Be("Delete a user");
        command.Name.Should().Be("delete");
    }

    [Fact]
    public void DeleteUserCommand_HasIdArgument()
    {
        // Act
        var command = new DeleteUserCommand();

        // Assert
        var idArgument = command.Arguments.FirstOrDefault(a => a.Name == "id");
        idArgument.Should().NotBeNull();
    }

    [Fact]
    public void DeleteUserCommand_HasForceOption()
    {
        // Act
        var command = new DeleteUserCommand();

        // Assert
        var forceOption = command.Options.FirstOrDefault(o => o.Name == "force");
        forceOption.Should().NotBeNull();
        forceOption!.Aliases.Should().Contain("--force");
        forceOption.Aliases.Should().Contain("-f");
    }

    [Fact]
    public async Task DeleteUserCommand_WithHelp_ReturnsZero()
    {
        // Arrange
        var command = new DeleteUserCommand();

        // Act
        var result = await command.InvokeAsync("--help");

        // Assert
        result.Should().Be(0);
    }
}
