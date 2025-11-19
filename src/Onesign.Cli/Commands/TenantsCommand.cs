using System.CommandLine;
using System.Text.Json;
using Onesign.Sdk.DotNet;

namespace Onesign.Cli.Commands;

public class TenantsCommand : Command
{
    public TenantsCommand() : base("tenants", "Manage tenants")
    {
        AddCommand(new ListTenantsCommand());
        AddCommand(new GetTenantCommand());
        AddCommand(new CreateTenantCommand());
        AddCommand(new UpdateTenantCommand());
        AddCommand(new DeleteTenantCommand());
        AddCommand(new TenantUsersCommand());
        AddCommand(new TenantConfigCommand());
    }
}

public class ListTenantsCommand : Command
{
    public ListTenantsCommand() : base("list", "List all tenants")
    {
        var pageOption = new Option<int>(
            aliases: new[] { "--page", "-p" },
            description: "Page number",
            getDefaultValue: () => 1);

        var pageSizeOption = new Option<int>(
            aliases: new[] { "--page-size", "-s" },
            description: "Number of items per page",
            getDefaultValue: () => 20);

        var formatOption = new Option<string>(
            aliases: new[] { "--format", "-f" },
            description: "Output format (json, table)",
            getDefaultValue: () => "table");

        AddOption(pageOption);
        AddOption(pageSizeOption);
        AddOption(formatOption);

        this.SetHandler(HandleAsync, pageOption, pageSizeOption, formatOption);
    }

    private async Task HandleAsync(int page, int pageSize, string format)
    {
        try
        {
            var config = CliConfig.Load();
            using var client = config.CreateClient();

            var tenants = await client.Tenants.GetTenantsAsync(page, pageSize);

            if (format == "json")
            {
                Console.WriteLine(JsonSerializer.Serialize(tenants, new JsonSerializerOptions { WriteIndented = true }));
            }
            else
            {
                Console.WriteLine($"{"ID",-36} {"Name",-30} {"Status",-15} {"Plan",-15}");
                Console.WriteLine(new string('-', 96));

                foreach (var tenant in tenants)
                {
                    Console.WriteLine($"{tenant.Id,-36} {tenant.Name,-30} {tenant.Status,-15} {tenant.Plan ?? "N/A",-15}");
                }

                Console.WriteLine($"\nTotal: {tenants.Count} tenant(s)");
            }
        }
        catch (Exception ex)
        {
            Console.WriteLine($"Error: {ex.Message}");
        }
    }
}

public class GetTenantCommand : Command
{
    public GetTenantCommand() : base("get", "Get tenant details")
    {
        var idArgument = new Argument<string>("id")
        {
            Description = "Tenant ID"
        };
        AddArgument(idArgument);

        this.SetHandler(HandleAsync, idArgument);
    }

    private async Task HandleAsync(string id)
    {
        try
        {
            var config = CliConfig.Load();
            using var client = config.CreateClient();

            if (!Guid.TryParse(id, out var tenantId))
            {
                Console.WriteLine("Error: Invalid tenant ID format");
                return;
            }

            var tenant = await client.Tenants.GetTenantAsync(tenantId.ToString());

            if (tenant == null)
            {
                Console.WriteLine($"Tenant with ID '{id}' not found");
                return;
            }

            Console.WriteLine($"ID:           {tenant.Id}");
            Console.WriteLine($"Name:         {tenant.Name}");
            Console.WriteLine($"Status:       {tenant.Status}");
            Console.WriteLine($"Plan:         {tenant.Plan ?? "N/A"}");
            Console.WriteLine($"Region:       {tenant.Region ?? "N/A"}");
            Console.WriteLine($"Created At:   {tenant.CreatedAt:yyyy-MM-dd HH:mm:ss}");
            Console.WriteLine($"Updated At:   {tenant.UpdatedAt?.ToString("yyyy-MM-dd HH:mm:ss") ?? "N/A"}");

            if (tenant.Settings != null && tenant.Settings.Any())
            {
                Console.WriteLine("\nSettings:");
                foreach (var setting in tenant.Settings)
                {
                    Console.WriteLine($"  {setting.Key}: {setting.Value}");
                }
            }
        }
        catch (Exception ex)
        {
            Console.WriteLine($"Error: {ex.Message}");
        }
    }
}

public class CreateTenantCommand : Command
{
    public CreateTenantCommand() : base("create", "Create a new tenant")
    {
        var nameOption = new Option<string>(
            aliases: new[] { "--name", "-n" },
            description: "Tenant name") { IsRequired = true };

        var planOption = new Option<string>(
            aliases: new[] { "--plan", "-p" },
            description: "Subscription plan");

        var regionOption = new Option<string>(
            aliases: new[] { "--region", "-r" },
            description: "Deployment region");

        AddOption(nameOption);
        AddOption(planOption);
        AddOption(regionOption);

        this.SetHandler(HandleAsync, nameOption, planOption, regionOption);
    }

    private async Task HandleAsync(string name, string? plan, string? region)
    {
        try
        {
            var config = CliConfig.Load();
            using var client = config.CreateClient();

            var request = new Onesign.Sdk.DotNet.Models.CreateTenantRequest
            {
                Name = name,
                Plan = plan,
                Region = region
            };

            var tenant = await client.Tenants.CreateTenantAsync(request);

            Console.WriteLine("Tenant created successfully!");
            Console.WriteLine($"ID:     {tenant.Id}");
            Console.WriteLine($"Name:   {tenant.Name}");
            Console.WriteLine($"Status: {tenant.Status}");
        }
        catch (Exception ex)
        {
            Console.WriteLine($"Error: {ex.Message}");
        }
    }
}

public class UpdateTenantCommand : Command
{
    public UpdateTenantCommand() : base("update", "Update a tenant")
    {
        var idArgument = new Argument<string>("id")
        {
            Description = "Tenant ID"
        };
        var nameOption = new Option<string?>(
            aliases: new[] { "--name", "-n" },
            description: "New tenant name");

        var planOption = new Option<string?>(
            aliases: new[] { "--plan", "-p" },
            description: "New subscription plan");

        var statusOption = new Option<string?>(
            aliases: new[] { "--status", "-s" },
            description: "New tenant status (Active, Suspended, Deleted)");

        AddArgument(idArgument);
        AddOption(nameOption);
        AddOption(planOption);
        AddOption(statusOption);

        this.SetHandler(HandleAsync, idArgument, nameOption, planOption, statusOption);
    }

    private async Task HandleAsync(string id, string? name, string? plan, string? status)
    {
        try
        {
            var config = CliConfig.Load();
            using var client = config.CreateClient();

            if (!Guid.TryParse(id, out var tenantId))
            {
                Console.WriteLine("Error: Invalid tenant ID format");
                return;
            }

            var request = new Onesign.Sdk.DotNet.Models.UpdateTenantRequest
            {
                Name = name,
                Plan = plan,
                Status = status
            };

            var tenant = await client.Tenants.UpdateTenantAsync(tenantId, request);

            Console.WriteLine("Tenant updated successfully!");
            Console.WriteLine($"ID:     {tenant.Id}");
            Console.WriteLine($"Name:   {tenant.Name}");
            Console.WriteLine($"Status: {tenant.Status}");
        }
        catch (Exception ex)
        {
            Console.WriteLine($"Error: {ex.Message}");
        }
    }
}

public class DeleteTenantCommand : Command
{
    public DeleteTenantCommand() : base("delete", "Delete a tenant")
    {
        var idArgument = new Argument<string>("id")
        {
            Description = "Tenant ID"
        };
        var forceOption = new Option<bool>(
            aliases: new[] { "--force", "-f" },
            description: "Force deletion without confirmation");

        AddArgument(idArgument);
        AddOption(forceOption);

        this.SetHandler(HandleAsync, idArgument, forceOption);
    }

    private async Task HandleAsync(string id, bool force)
    {
        try
        {
            var config = CliConfig.Load();
            using var client = config.CreateClient();

            if (!Guid.TryParse(id, out var tenantId))
            {
                Console.WriteLine("Error: Invalid tenant ID format");
                return;
            }

            if (!force)
            {
                Console.Write($"Are you sure you want to delete tenant {id}? (y/N): ");
                var confirmation = Console.ReadLine();
                if (!string.Equals(confirmation, "y", StringComparison.OrdinalIgnoreCase))
                {
                    Console.WriteLine("Deletion cancelled.");
                    return;
                }
            }

            await client.Tenants.DeleteTenantAsync(tenantId);
            Console.WriteLine("Tenant deleted successfully!");
        }
        catch (Exception ex)
        {
            Console.WriteLine($"Error: {ex.Message}");
        }
    }
}

public class TenantUsersCommand : Command
{
    public TenantUsersCommand() : base("users", "List users in a tenant")
    {
        var idArgument = new Argument<string>("id")
        {
            Description = "Tenant ID"
        };
        var pageOption = new Option<int>(
            aliases: new[] { "--page", "-p" },
            description: "Page number",
            getDefaultValue: () => 1);

        var pageSizeOption = new Option<int>(
            aliases: new[] { "--page-size", "-s" },
            description: "Number of items per page",
            getDefaultValue: () => 20);

        AddArgument(idArgument);
        AddOption(pageOption);
        AddOption(pageSizeOption);

        this.SetHandler(HandleAsync, idArgument, pageOption, pageSizeOption);
    }

    private async Task HandleAsync(string id, int page, int pageSize)
    {
        try
        {
            var config = CliConfig.Load();
            using var client = config.CreateClient();

            if (!Guid.TryParse(id, out var tenantId))
            {
                Console.WriteLine("Error: Invalid tenant ID format");
                return;
            }

            var users = await client.Tenants.GetTenantUsersAsync(tenantId, page, pageSize);

            Console.WriteLine($"{"ID",-36} {"Email",-35} {"Name",-25}");
            Console.WriteLine(new string('-', 96));

            foreach (var user in users)
            {
                var name = $"{user.FirstName} {user.LastName}".Trim();
                Console.WriteLine($"{user.Id,-36} {user.Email,-35} {name,-25}");
            }

            Console.WriteLine($"\nTotal: {users.Count} user(s)");
        }
        catch (Exception ex)
        {
            Console.WriteLine($"Error: {ex.Message}");
        }
    }
}

public class TenantConfigCommand : Command
{
    public TenantConfigCommand() : base("config", "Manage tenant configuration")
    {
        AddCommand(new GetTenantConfigCommand());
        AddCommand(new SetTenantConfigCommand());
    }
}

public class GetTenantConfigCommand : Command
{
    public GetTenantConfigCommand() : base("get", "Get tenant configuration")
    {
        var idArgument = new Argument<string>("id")
        {
            Description = "Tenant ID"
        };
        var keyOption = new Option<string?>(
            aliases: new[] { "--key", "-k" },
            description: "Specific configuration key to retrieve");

        AddArgument(idArgument);
        AddOption(keyOption);

        this.SetHandler(HandleAsync, idArgument, keyOption);
    }

    private async Task HandleAsync(string id, string? key)
    {
        try
        {
            var config = CliConfig.Load();
            using var client = config.CreateClient();

            if (!Guid.TryParse(id, out var tenantId))
            {
                Console.WriteLine("Error: Invalid tenant ID format");
                return;
            }

            var tenant = await client.Tenants.GetTenantAsync(tenantId.ToString());

            if (tenant == null)
            {
                Console.WriteLine($"Tenant with ID '{id}' not found");
                return;
            }

            if (tenant.Settings == null || !tenant.Settings.Any())
            {
                Console.WriteLine("No configuration settings found for this tenant.");
                return;
            }

            if (!string.IsNullOrEmpty(key))
            {
                if (tenant.Settings.TryGetValue(key, out var value))
                {
                    Console.WriteLine($"{key}: {value}");
                }
                else
                {
                    Console.WriteLine($"Configuration key '{key}' not found");
                }
            }
            else
            {
                Console.WriteLine("Configuration:");
                foreach (var setting in tenant.Settings.OrderBy(s => s.Key))
                {
                    Console.WriteLine($"  {setting.Key}: {setting.Value}");
                }
            }
        }
        catch (Exception ex)
        {
            Console.WriteLine($"Error: {ex.Message}");
        }
    }
}

public class SetTenantConfigCommand : Command
{
    public SetTenantConfigCommand() : base("set", "Set tenant configuration value")
    {
        var idArgument = new Argument<string>("id")
        {
            Description = "Tenant ID"
        };
        var keyArgument = new Argument<string>("key")
        {
            Description = "Configuration key"
        };
        var valueArgument = new Argument<string>("value")
        {
            Description = "Configuration value"
        };

        AddArgument(idArgument);
        AddArgument(keyArgument);
        AddArgument(valueArgument);

        this.SetHandler(HandleAsync, idArgument, keyArgument, valueArgument);
    }

    private async Task HandleAsync(string id, string key, string value)
    {
        try
        {
            var config = CliConfig.Load();
            using var client = config.CreateClient();

            if (!Guid.TryParse(id, out var tenantId))
            {
                Console.WriteLine("Error: Invalid tenant ID format");
                return;
            }

            var tenant = await client.Tenants.GetTenantAsync(tenantId.ToString());

            if (tenant == null)
            {
                Console.WriteLine($"Tenant with ID '{id}' not found");
                return;
            }

            var settings = tenant.Settings ?? new Dictionary<string, string>();
            settings[key] = value;

            var updateRequest = new Onesign.Sdk.DotNet.Models.UpdateTenantRequest
            {
                Settings = settings
            };

            await client.Tenants.UpdateTenantAsync(tenantId, updateRequest);
            Console.WriteLine($"Configuration updated: {key} = {value}");
        }
        catch (Exception ex)
        {
            Console.WriteLine($"Error: {ex.Message}");
        }
    }
}
