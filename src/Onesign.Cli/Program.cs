using System.CommandLine;
using Onesign.Cli.Commands;

namespace Onesign.Cli;

class Program
{
    static async Task<int> Main(string[] args)
    {
        var rootCommand = new RootCommand("OneSign CLI - Command-line interface for OneSign Identity Platform")
        {
            Name = "onesign"
        };

        // Add commands
        rootCommand.AddCommand(new LoginCommand());
        rootCommand.AddCommand(new LogoutCommand());
        rootCommand.AddCommand(new UsersCommand());
        rootCommand.AddCommand(new AppsCommand());
        rootCommand.AddCommand(new TenantsCommand());
        rootCommand.AddCommand(new ConfigCommand());

        // Add version option
        rootCommand.AddGlobalOption(new Option<bool>(
            aliases: new[] { "--version", "-v" },
            description: "Show version information"));

        return await rootCommand.InvokeAsync(args);
    }
}
