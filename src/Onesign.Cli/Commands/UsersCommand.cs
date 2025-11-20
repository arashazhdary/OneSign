using System.CommandLine;
using System.CommandLine.Invocation;
using System.Text.Json;
using Onesign.Sdk.DotNet.Models;

namespace Onesign.Cli.Commands;

public class UsersCommand : Command
{
    public UsersCommand() : base("users", "Manage users")
    {
        Add(new ListUsersCommand());
        Add(new GetUserCommand());
        Add(new CreateUserCommand());
        Add(new DeleteUserCommand());
    }
}

public class ListUsersCommand : Command
{
    public ListUsersCommand() : base("list", "List all users")
    {
        var pageOption = new Option<int>(
            new[] { "--page", "-p" },
            () => 1,
            "Page number");

        var pageSizeOption = new Option<int>(
            new[] { "--size", "-s" },
            () => 20,
            "Page size");

        var searchOption = new Option<string?>(
            new[] { "--search", "-q" },
            "Search term");

        var jsonOption = new Option<bool>(
            new[] { "--json" },
            "Output as JSON");

        Add(pageOption);
        Add(pageSizeOption);
        Add(searchOption);
        Add(jsonOption);

        this.SetHandler(HandleListUsersAsync, pageOption, pageSizeOption, searchOption, jsonOption);
    }

    private async Task HandleListUsersAsync(int page, int pageSize, string? search, bool json)
    {
        try
        {
            var config = CliConfig.Load();
            using var client = config.CreateClient();

            var pagination = new PaginationRequest
            {
                PageNumber = page,
                PageSize = pageSize,
                SearchTerm = search
            };

            var result = await client.Users.ListUsersAsync(pagination);

            if (json)
            {
                Console.WriteLine(JsonSerializer.Serialize(result, new JsonSerializerOptions { WriteIndented = true }));
            }
            else
            {
                Console.WriteLine($"Users (Page {result.PageNumber} of {result.TotalPages}, Total: {result.TotalCount})");
                Console.WriteLine(new string('-', 80));
                Console.WriteLine($"{"ID",-38} {"Email",-30} {"Name",-20}");
                Console.WriteLine(new string('-', 80));

                foreach (var user in result.Items)
                {
                    var name = $"{user.FirstName} {user.LastName}".Trim();
                    Console.WriteLine($"{user.Id,-38} {user.Email,-30} {name,-20}");
                }
            }
        }
        catch (Exception ex)
        {
            Console.WriteLine($"Error: {ex.Message}");
        }
    }
}

public class GetUserCommand : Command
{
    public GetUserCommand() : base("get", "Get user details")
    {
        var idArgument = new Argument<string>("id", "User ID or email");
        var jsonOption = new Option<bool>(
            new[] { "--json" },
            "Output as JSON");

        Add(idArgument);
        Add(jsonOption);

        this.SetHandler(HandleGetUserAsync, idArgument, jsonOption);
    }

    private async Task HandleGetUserAsync(string id, bool json)
    {
        try
        {
            var config = CliConfig.Load();
            using var client = config.CreateClient();

            User user;
            if (id.Contains('@'))
            {
                user = await client.Users.GetUserByEmailAsync(id);
            }
            else
            {
                user = await client.Users.GetUserAsync(id);
            }

            if (json)
            {
                Console.WriteLine(JsonSerializer.Serialize(user, new JsonSerializerOptions { WriteIndented = true }));
            }
            else
            {
                Console.WriteLine($"ID:             {user.Id}");
                Console.WriteLine($"Email:          {user.Email}");
                Console.WriteLine($"Username:       {user.Username}");
                Console.WriteLine($"Name:           {user.FirstName} {user.LastName}");
                Console.WriteLine($"Phone:          {user.PhoneNumber}");
                Console.WriteLine($"Email Verified: {user.EmailConfirmed}");
                Console.WriteLine($"2FA Enabled:    {user.TwoFactorEnabled}");
                Console.WriteLine($"Roles:          {string.Join(", ", user.Roles)}");
                Console.WriteLine($"Created:        {user.CreatedAt:yyyy-MM-dd HH:mm:ss}");
            }
        }
        catch (Exception ex)
        {
            Console.WriteLine($"Error: {ex.Message}");
        }
    }
}

public class CreateUserCommand : Command
{
    public CreateUserCommand() : base("create", "Create a new user")
    {
        var emailOption = new Option<string>(
            new[] { "--email", "-e" },
            "User email");
        emailOption.IsRequired = true;

        var passwordOption = new Option<string>(
            new[] { "--password", "-p" },
            "User password");
        passwordOption.IsRequired = true;

        var firstNameOption = new Option<string?>(
            new[] { "--first-name", "-f" },
            "First name");

        var lastNameOption = new Option<string?>(
            new[] { "--last-name", "-l" },
            "Last name");

        var rolesOption = new Option<string[]?>(
            new[] { "--roles", "-r" },
            "User roles");

        var jsonOption = new Option<bool>(
            new[] { "--json" },
            "Output as JSON");

        Add(emailOption);
        Add(passwordOption);
        Add(firstNameOption);
        Add(lastNameOption);
        Add(rolesOption);
        Add(jsonOption);

        this.SetHandler(HandleCreateUserAsync, emailOption, passwordOption, firstNameOption, lastNameOption, rolesOption, jsonOption);
    }

    private async Task HandleCreateUserAsync(string email, string password, string? firstName, string? lastName, string[]? roles, bool json)
    {
        try
        {
            var config = CliConfig.Load();
            using var client = config.CreateClient();

            var request = new CreateUserRequest
            {
                Email = email,
                Password = password,
                FirstName = firstName,
                LastName = lastName,
                Roles = roles?.ToList()
            };

            var user = await client.Users.CreateUserAsync(request);

            if (json)
            {
                Console.WriteLine(JsonSerializer.Serialize(user, new JsonSerializerOptions { WriteIndented = true }));
            }
            else
            {
                Console.WriteLine($"User created successfully!");
                Console.WriteLine($"ID:    {user.Id}");
                Console.WriteLine($"Email: {user.Email}");
            }
        }
        catch (Exception ex)
        {
            Console.WriteLine($"Error: {ex.Message}");
        }
    }
}

public class DeleteUserCommand : Command
{
    public DeleteUserCommand() : base("delete", "Delete a user")
    {
        var idArgument = new Argument<string>("id", "User ID");
        var forceOption = new Option<bool>(
            new[] { "--force", "-f" },
            "Skip confirmation");

        Add(idArgument);
        Add(forceOption);

        this.SetHandler(HandleDeleteUserAsync, idArgument, forceOption);
    }

    private async Task HandleDeleteUserAsync(string id, bool force)
    {
        try
        {
            if (!force)
            {
                Console.Write($"Are you sure you want to delete user {id}? (y/N): ");
                var response = Console.ReadLine();
                if (response?.ToLower() != "y")
                {
                    Console.WriteLine("Cancelled.");
                    return;
                }
            }

            var config = CliConfig.Load();
            using var client = config.CreateClient();

            await client.Users.DeleteUserAsync(id);
            Console.WriteLine("User deleted successfully.");
        }
        catch (Exception ex)
        {
            Console.WriteLine($"Error: {ex.Message}");
        }
    }
}
