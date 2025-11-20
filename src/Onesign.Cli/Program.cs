using System.CommandLine;
using Onesign.Cli.Commands;

namespace Onesign.Cli;

class Program
{
    static async Task<int> Main(string[] args)
    {
        var rootCommand = new RootCommand("OneSign CLI - Command-line interface for OneSign Identity Platform");

        // Add commands
        rootCommand.Add(new LoginCommand());
        rootCommand.Add(new LogoutCommand());
        rootCommand.Add(new UsersCommand());
        rootCommand.Add(new AppsCommand());
        rootCommand.Add(new TenantsCommand());
        rootCommand.Add(new ConfigCommand());

        // Add version option
        rootCommand.AddGlobalOption(new Option<bool>(
            new[] { "--version", "-v" },
            "Show version information"));

        return await rootCommand.InvokeAsync(args);
    }
}
