using System.CommandLine;
using System.Text.Json;

namespace Onesign.Cli.Commands;

public class ConfigCommand : Command
{
    public ConfigCommand() : base("config", "Manage CLI configuration")
    {
        AddCommand(new SetServerCommand());
        AddCommand(new SetClientCommand());
        AddCommand(new ShowConfigCommand());
        AddCommand(new ClearConfigCommand());
    }
}

public class SetServerCommand : Command
{
    public SetServerCommand() : base("set-server", "Set the OneSign server URL")
    {
        var urlArgument = new Argument<string>("url", "Server URL (e.g., https://auth.example.com)");

        AddArgument(urlArgument);

        this.SetHandler(HandleSetServer, urlArgument);
    }

    private void HandleSetServer(string url)
    {
        try
        {
            if (!Uri.TryCreate(url, UriKind.Absolute, out var uri))
            {
                Console.WriteLine("Error: Invalid URL format.");
                return;
            }

            var config = CliConfig.Load();
            config.BaseUrl = uri.ToString().TrimEnd('/');
            config.Save();

            Console.WriteLine($"Server URL set to: {config.BaseUrl}");
        }
        catch (Exception ex)
        {
            Console.WriteLine($"Error: {ex.Message}");
        }
    }
}

public class SetClientCommand : Command
{
    public SetClientCommand() : base("set-client", "Set client credentials")
    {
        var clientIdOption = new Option<string>(
            aliases: new[] { "--client-id", "-i" },
            description: "Client ID")
        { IsRequired = true };

        var clientSecretOption = new Option<string>(
            aliases: new[] { "--client-secret", "-s" },
            description: "Client Secret")
        { IsRequired = true };

        AddOption(clientIdOption);
        AddOption(clientSecretOption);

        this.SetHandler(HandleSetClient, clientIdOption, clientSecretOption);
    }

    private void HandleSetClient(string clientId, string clientSecret)
    {
        try
        {
            var config = CliConfig.Load();
            config.ClientId = clientId;
            config.ClientSecret = clientSecret;
            config.Save();

            Console.WriteLine("Client credentials saved successfully.");
        }
        catch (Exception ex)
        {
            Console.WriteLine($"Error: {ex.Message}");
        }
    }
}

public class ShowConfigCommand : Command
{
    public ShowConfigCommand() : base("show", "Show current configuration")
    {
        var showSecretsOption = new Option<bool>(
            aliases: new[] { "--show-secrets" },
            description: "Show secret values");

        AddOption(showSecretsOption);

        this.SetHandler(HandleShowConfig, showSecretsOption);
    }

    private void HandleShowConfig(bool showSecrets)
    {
        try
        {
            var config = CliConfig.Load();

            Console.WriteLine("Current Configuration:");
            Console.WriteLine(new string('-', 50));
            Console.WriteLine($"Server URL:     {config.BaseUrl ?? "(not set)"}");
            Console.WriteLine($"Client ID:      {config.ClientId ?? "(not set)"}");

            if (showSecrets)
            {
                Console.WriteLine($"Client Secret:  {config.ClientSecret ?? "(not set)"}");
            }
            else
            {
                Console.WriteLine($"Client Secret:  {(string.IsNullOrEmpty(config.ClientSecret) ? "(not set)" : "********")}");
            }

            Console.WriteLine();
            Console.WriteLine("Authentication Status:");
            Console.WriteLine(new string('-', 50));

            if (!string.IsNullOrEmpty(config.AccessToken))
            {
                var expired = config.TokenExpiresAt.HasValue && config.TokenExpiresAt.Value <= DateTimeOffset.UtcNow;
                Console.WriteLine($"Logged in:      Yes");
                Console.WriteLine($"Token Expires:  {config.TokenExpiresAt?.ToString("yyyy-MM-dd HH:mm:ss") ?? "Unknown"}");
                Console.WriteLine($"Token Status:   {(expired ? "Expired" : "Valid")}");
            }
            else
            {
                Console.WriteLine($"Logged in:      No");
            }
        }
        catch (Exception ex)
        {
            Console.WriteLine($"Error: {ex.Message}");
        }
    }
}

public class ClearConfigCommand : Command
{
    public ClearConfigCommand() : base("clear", "Clear all configuration")
    {
        var forceOption = new Option<bool>(
            aliases: new[] { "--force", "-f" },
            description: "Skip confirmation");

        AddOption(forceOption);

        this.SetHandler(HandleClearConfig, forceOption);
    }

    private void HandleClearConfig(bool force)
    {
        try
        {
            if (!force)
            {
                Console.Write("Are you sure you want to clear all configuration? (y/N): ");
                var response = Console.ReadLine();
                if (response?.ToLower() != "y")
                {
                    Console.WriteLine("Cancelled.");
                    return;
                }
            }

            var configPath = Path.Combine(
                Environment.GetFolderPath(Environment.SpecialFolder.UserProfile),
                ".onesign",
                "config.json");

            if (File.Exists(configPath))
            {
                File.Delete(configPath);
            }

            Console.WriteLine("Configuration cleared successfully.");
        }
        catch (Exception ex)
        {
            Console.WriteLine($"Error: {ex.Message}");
        }
    }
}
