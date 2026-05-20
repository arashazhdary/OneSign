using Onesign.Cli.Commands;
using System.CommandLine;

return await BuildRootCommand().Parse(args).InvokeAsync();

static RootCommand BuildRootCommand()
{
    var root = new RootCommand("OneSign CLI — login, applications, and integration config export");

    root.Add(new LoginCommand());
    root.Add(new LogoutCommand());
    root.Add(new ConfigCommand());
    root.Add(new AppsCommand());
    root.Add(new TenantsCommand());
    root.Add(new UsersCommand());

    return root;
}
