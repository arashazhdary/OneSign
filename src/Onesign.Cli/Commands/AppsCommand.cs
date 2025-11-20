using System.CommandLine;
using System.CommandLine.Binding;
using System.CommandLine.Invocation;
using System.CommandLine.Parsing;
using System.Text.Json;
using Onesign.Sdk.DotNet.Models;

namespace Onesign.Cli.Commands;

public class AppsCommand : Command
{
    public AppsCommand() : base("apps", "Manage applications")
    {
        Add(new ListAppsCommand());
        Add(new GetAppCommand());
        Add(new CreateAppCommand());
        Add(new DeleteAppCommand());
        Add(new RegenerateSecretCommand());
    }
}

public class ListAppsCommand : Command
{
    public ListAppsCommand() : base("list", "List all applications")
    {
        var pageOption = new Option<int>("--page", "-p")
        {
            Description = "Page number",
            DefaultValueFactory = (ArgumentResult result) => 1
        };

        var pageSizeOption = new Option<int>("--size", "-s")
        {
            Description = "Page size",
            DefaultValueFactory = (ArgumentResult result) => 20
        };

        var jsonOption = new Option<bool>("--json")
        {
            Description = "Output as JSON"
        };

        Add(pageOption);
        Add(pageSizeOption);
        Add(jsonOption);

        this.SetAction(async (ParseResult parseResult) =>
        {
            var page = parseResult.GetValue(pageOption);
            var pageSize = parseResult.GetValue(pageSizeOption);
            var json = parseResult.GetValue(jsonOption);
            await HandleListAppsAsync(page, pageSize, json);
        });
    }

    private async Task HandleListAppsAsync(int page, int pageSize, bool json)
    {
        try
        {
            var config = CliConfig.Load();
            using var client = config.CreateClient();

            var pagination = new PaginationRequest
            {
                PageNumber = page,
                PageSize = pageSize
            };

            var result = await client.Applications.ListApplicationsAsync(pagination);

            if (json)
            {
                Console.WriteLine(JsonSerializer.Serialize(result, new JsonSerializerOptions { WriteIndented = true }));
            }
            else
            {
                Console.WriteLine($"Applications (Page {result.PageNumber} of {result.TotalPages}, Total: {result.TotalCount})");
                Console.WriteLine(new string('-', 100));
                Console.WriteLine($"{"ID",-38} {"Client ID",-30} {"Name",-25} {"Type",-10}");
                Console.WriteLine(new string('-', 100));

                foreach (var app in result.Items)
                {
                    Console.WriteLine($"{app.Id,-38} {app.ClientId,-30} {app.DisplayName,-25} {app.ApplicationType,-10}");
                }
            }
        }
        catch (Exception ex)
        {
            Console.WriteLine($"Error: {ex.Message}");
        }
    }
}

public class GetAppCommand : Command
{
    public GetAppCommand() : base("get", "Get application details")
    {
        var idArgument = new Argument<string>("id")
        {
            Description = "Application ID or Client ID"
        };
        var jsonOption = new Option<bool>("--json")
        {
            Description = "Output as JSON"
        };

        Add(idArgument);
        Add(jsonOption);

        this.SetAction(async (ParseResult parseResult) =>
        {
            var id = parseResult.GetValue(idArgument);
            var json = parseResult.GetValue(jsonOption);
            await HandleGetAppAsync(id!, json);
        });
    }

    private async Task HandleGetAppAsync(string id, bool json)
    {
        try
        {
            var config = CliConfig.Load();
            using var client = config.CreateClient();

            Application app;
            try
            {
                app = await client.Applications.GetApplicationAsync(id);
            }
            catch
            {
                app = await client.Applications.GetApplicationByClientIdAsync(id);
            }

            if (json)
            {
                Console.WriteLine(JsonSerializer.Serialize(app, new JsonSerializerOptions { WriteIndented = true }));
            }
            else
            {
                Console.WriteLine($"ID:           {app.Id}");
                Console.WriteLine($"Client ID:    {app.ClientId}");
                Console.WriteLine($"Name:         {app.DisplayName}");
                Console.WriteLine($"Description:  {app.Description}");
                Console.WriteLine($"Type:         {app.ApplicationType}");
                Console.WriteLine($"Enabled:      {app.Enabled}");
                Console.WriteLine($"Redirect URIs:");
                foreach (var uri in app.RedirectUris)
                {
                    Console.WriteLine($"  - {uri}");
                }
                Console.WriteLine($"Permissions:");
                foreach (var permission in app.Permissions)
                {
                    Console.WriteLine($"  - {permission}");
                }
                Console.WriteLine($"Created:      {app.CreatedAt:yyyy-MM-dd HH:mm:ss}");
            }
        }
        catch (Exception ex)
        {
            Console.WriteLine($"Error: {ex.Message}");
        }
    }
}

public class CreateAppCommand : Command
{
    public CreateAppCommand() : base("create", "Create a new application")
    {
        var nameOption = new Option<string>("--name", "-n")
        {
            Description = "Application display name",
            Arity = ArgumentArity.ExactlyOne
        };

        var typeOption = new Option<string>("--type", "-t")
        {
            Description = "Application type (web, spa, native, machine)",
            DefaultValueFactory = (ArgumentResult result) => "web"
        };

        var redirectUrisOption = new Option<string[]?>("--redirect-uri", "-r")
        {
            Description = "Redirect URIs"
        };

        var descriptionOption = new Option<string?>("--description", "-d")
        {
            Description = "Application description"
        };

        var jsonOption = new Option<bool>("--json")
        {
            Description = "Output as JSON"
        };

        Add(nameOption);
        Add(typeOption);
        Add(redirectUrisOption);
        Add(descriptionOption);
        Add(jsonOption);

        this.SetAction(async (ParseResult parseResult) =>
        {
            var name = parseResult.GetValue(nameOption);
            var type = parseResult.GetValue(typeOption);
            var redirectUris = parseResult.GetValue(redirectUrisOption);
            var description = parseResult.GetValue(descriptionOption);
            var json = parseResult.GetValue(jsonOption);
            await HandleCreateAppAsync(name!, type!, redirectUris, description, json);
        });
    }

    private async Task HandleCreateAppAsync(string name, string type, string[]? redirectUris, string? description, bool json)
    {
        try
        {
            var config = CliConfig.Load();
            using var client = config.CreateClient();

            var request = new CreateApplicationRequest
            {
                DisplayName = name,
                ApplicationType = type,
                Description = description,
                RedirectUris = redirectUris?.ToList()
            };

            var app = await client.Applications.CreateApplicationAsync(request);

            if (json)
            {
                Console.WriteLine(JsonSerializer.Serialize(app, new JsonSerializerOptions { WriteIndented = true }));
            }
            else
            {
                Console.WriteLine("Application created successfully!");
                Console.WriteLine($"ID:        {app.Id}");
                Console.WriteLine($"Client ID: {app.ClientId}");
                Console.WriteLine($"Name:      {app.DisplayName}");
            }
        }
        catch (Exception ex)
        {
            Console.WriteLine($"Error: {ex.Message}");
        }
    }
}

public class DeleteAppCommand : Command
{
    public DeleteAppCommand() : base("delete", "Delete an application")
    {
        var idArgument = new Argument<string>("id")
        {
            Description = "Application ID"
        };
        var forceOption = new Option<bool>("--force", "-f")
        {
            Description = "Skip confirmation"
        };

        Add(idArgument);
        Add(forceOption);

        this.SetAction(async (ParseResult parseResult) =>
        {
            var id = parseResult.GetValue(idArgument);
            var force = parseResult.GetValue(forceOption);
            await HandleDeleteAppAsync(id!, force);
        });
    }

    private async Task HandleDeleteAppAsync(string id, bool force)
    {
        try
        {
            if (!force)
            {
                Console.Write($"Are you sure you want to delete application {id}? (y/N): ");
                var response = Console.ReadLine();
                if (response?.ToLower() != "y")
                {
                    Console.WriteLine("Cancelled.");
                    return;
                }
            }

            var config = CliConfig.Load();
            using var client = config.CreateClient();

            await client.Applications.DeleteApplicationAsync(id);
            Console.WriteLine("Application deleted successfully.");
        }
        catch (Exception ex)
        {
            Console.WriteLine($"Error: {ex.Message}");
        }
    }
}

public class RegenerateSecretCommand : Command
{
    public RegenerateSecretCommand() : base("regenerate-secret", "Regenerate client secret for an application")
    {
        var idArgument = new Argument<string>("id")
        {
            Description = "Application ID"
        };

        Add(idArgument);

        this.SetAction(async (ParseResult parseResult) =>
        {
            var id = parseResult.GetValue(idArgument);
            await HandleRegenerateSecretAsync(id!);
        });
    }

    private async Task HandleRegenerateSecretAsync(string id)
    {
        try
        {
            var config = CliConfig.Load();
            using var client = config.CreateClient();

            var newSecret = await client.Applications.RegenerateClientSecretAsync(id);
            Console.WriteLine("Client secret regenerated successfully!");
            Console.WriteLine($"New Secret: {newSecret}");
            Console.WriteLine("Note: Make sure to save this secret, as it cannot be retrieved again.");
        }
        catch (Exception ex)
        {
            Console.WriteLine($"Error: {ex.Message}");
        }
    }
}
