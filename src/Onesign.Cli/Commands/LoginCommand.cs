using System.CommandLine;
using System.CommandLine.Binding;
using System.CommandLine.Invocation;
using System.CommandLine.Parsing;
using System.Text.Json;
using Onesign.Sdk.DotNet;

namespace Onesign.Cli.Commands;

public class LoginCommand : Command
{
    public LoginCommand() : base("login", "Authenticate with OneSign")
    {
        var emailOption = new Option<string>("--email", "-e")
        {
            Description = "Email address for authentication"
        };

        var passwordOption = new Option<string>("--password", "-p")
        {
            Description = "Password for authentication"
        };

        var interactiveOption = new Option<bool>("--interactive", "-i")
        {
            Description = "Use interactive login prompts",
            DefaultValueFactory = (ArgumentResult result) => true
        };

        Add(emailOption);
        Add(passwordOption);
        Add(interactiveOption);

        this.SetAction(async (ParseResult parseResult) =>
        {
            var email = parseResult.GetValue(emailOption);
            var password = parseResult.GetValue(passwordOption);
            var interactive = parseResult.GetValue(interactiveOption);
            await HandleLoginAsync(email, password, interactive);
        });
    }

    private async Task HandleLoginAsync(string? email, string? password, bool interactive)
    {
        try
        {
            var config = CliConfig.Load();

            if (string.IsNullOrEmpty(config.BaseUrl))
            {
                Console.WriteLine("Error: No server configured. Run 'onesign config set-server <url>' first.");
                return;
            }

            if (interactive && string.IsNullOrEmpty(email))
            {
                Console.Write("Email: ");
                email = Console.ReadLine();
            }

            if (interactive && string.IsNullOrEmpty(password))
            {
                Console.Write("Password: ");
                password = ReadPassword();
            }

            if (string.IsNullOrEmpty(email) || string.IsNullOrEmpty(password))
            {
                Console.WriteLine("Error: Email and password are required.");
                return;
            }

            using var client = new OnesignClient(config.BaseUrl, config.ClientId ?? "", config.ClientSecret ?? "");
            var token = await client.Auth.LoginAsync(email, password);

            config.AccessToken = token.AccessToken;
            config.RefreshToken = token.RefreshToken;
            config.TokenExpiresAt = token.ExpiresAt;
            config.Save();

            Console.WriteLine("Login successful!");
            Console.WriteLine($"Token expires at: {token.ExpiresAt:yyyy-MM-dd HH:mm:ss}");
        }
        catch (Exception ex)
        {
            Console.WriteLine($"Error: {ex.Message}");
        }
    }

    private static string ReadPassword()
    {
        var password = new System.Text.StringBuilder();
        ConsoleKeyInfo key;

        do
        {
            key = Console.ReadKey(true);

            if (key.Key != ConsoleKey.Backspace && key.Key != ConsoleKey.Enter)
            {
                password.Append(key.KeyChar);
                Console.Write("*");
            }
            else if (key.Key == ConsoleKey.Backspace && password.Length > 0)
            {
                password.Length--;
                Console.Write("\b \b");
            }
        }
        while (key.Key != ConsoleKey.Enter);

        Console.WriteLine();
        return password.ToString();
    }
}

public class LogoutCommand : Command
{
    public LogoutCommand() : base("logout", "Clear saved credentials")
    {
        this.SetAction((ParseResult parseResult) =>
        {
            HandleLogout();
        });
    }

    private void HandleLogout()
    {
        var config = CliConfig.Load();
        config.AccessToken = null;
        config.RefreshToken = null;
        config.TokenExpiresAt = null;
        config.Save();

        Console.WriteLine("Logged out successfully.");
    }
}

public class CliConfig
{
    private static readonly string ConfigPath = Path.Combine(
        Environment.GetFolderPath(Environment.SpecialFolder.UserProfile),
        ".onesign",
        "config.json");

    public string? BaseUrl { get; set; }
    public string? ClientId { get; set; }
    public string? ClientSecret { get; set; }
    public string? AccessToken { get; set; }
    public string? RefreshToken { get; set; }
    public DateTimeOffset? TokenExpiresAt { get; set; }

    public static CliConfig Load()
    {
        if (!File.Exists(ConfigPath))
        {
            return new CliConfig();
        }

        var json = File.ReadAllText(ConfigPath);
        return JsonSerializer.Deserialize<CliConfig>(json) ?? new CliConfig();
    }

    public void Save()
    {
        var directory = Path.GetDirectoryName(ConfigPath)!;
        if (!Directory.Exists(directory))
        {
            Directory.CreateDirectory(directory);
        }

        var json = JsonSerializer.Serialize(this, new JsonSerializerOptions { WriteIndented = true });
        File.WriteAllText(ConfigPath, json);
    }

    public OnesignClient CreateClient()
    {
        if (string.IsNullOrEmpty(BaseUrl))
        {
            throw new InvalidOperationException("No server configured. Run 'onesign config set-server <url>' first.");
        }

        var client = new OnesignClient(BaseUrl, ClientId ?? "", ClientSecret ?? "");

        if (!string.IsNullOrEmpty(AccessToken))
        {
            client.Auth.SetToken(new Sdk.DotNet.Models.TokenResponse
            {
                AccessToken = AccessToken,
                RefreshToken = RefreshToken,
                ExpiresAt = TokenExpiresAt ?? DateTimeOffset.UtcNow.AddHours(1)
            });
        }

        return client;
    }
}
