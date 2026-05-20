# onesign-cli (`Onesign.Cli`)

Command-line tool for OneSign developers: authenticate, manage OAuth applications, and export integration config.

## Install

From the repository:

```bash
dotnet pack src/Onesign.Cli/Onesign.Cli.csproj -c Release -o ./nupkgs
dotnet tool install --global --add-source ./nupkgs Onesign.Cli
```

Or run locally:

```bash
dotnet run --project src/Onesign.Cli -- <command>
```

## Quick start

```bash
# 1. Point CLI at your OneSign API
onesign config set-server https://localhost:5001
onesign config set-client --client-id my-app --client-secret my-secret

# 2. Login (stores token in ~/.onesign/config.json)
onesign login --email admin@example.com

# 3. List / create applications
onesign apps list
onesign apps create --name "My API" --type web --redirect-uri https://localhost:3000/callback

# 4. Export snippets for your app repo
onesign config export --output ./my-project
# Creates .env.onesign and appsettings.onesign.json
```

## Commands

| Command | Description |
|---------|-------------|
| `login` | Authenticate and save tokens |
| `logout` | Clear saved tokens |
| `config set-server <url>` | Set API base URL |
| `config set-client` | Set OAuth client id/secret |
| `config show` | Show current CLI config |
| `config export` | Write `.env.onesign` and/or `appsettings.onesign.json` |
| `config clear` | Remove `~/.onesign/config.json` |
| `apps list` | List applications |
| `apps create` | Create application (with `--redirect-uri`) |
| `apps get <id>` | Application details |
| `tenants` / `users` | Tenant and user admin helpers |

## Config export formats

```bash
onesign config export --format env -o ./out
onesign config export --format appsettings -o ./out
onesign config export --format all -o ./out   # default
```

Merge `appsettings.onesign.json` into your ASP.NET Core `appsettings.json` and set `ONESIGN_SIGNING_KEY` / `Jwt:SigningKey` to match the OneSign server.

## Configuration file

`~/.onesign/config.json` — created automatically on login / set-server.
