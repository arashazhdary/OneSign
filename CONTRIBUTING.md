# Contributing to OneSign

Thank you for contributing to the OneSign monorepo.

## Development setup

1. Clone the repository and install **.NET 10 SDK**, **Node.js 20+**, and **SQL Server** (local or Docker).
2. API: `dotnet run --project src/Onesign.Api`
3. Admin Portal: `cd onesign-admin-portal-react && npm ci && npm run dev`
4. Login Portal: `cd onesign-login-portal && npm ci && npm run dev`

See [README.md](README.md) and [docs/DEV-SANDBOX-QUICKSTART.md](docs/DEV-SANDBOX-QUICKSTART.md).

## Pull requests

1. Branch from `master` (or `develop` if your team uses it).
2. Keep changes focused — one feature or fix per PR.
3. Run relevant checks before opening the PR:
   - `dotnet build src/Onesign.Api/Onesign.Api.csproj`
   - `dotnet test src/Onesign.IntegrationTests/Onesign.IntegrationTests.csproj` (when touching API)
   - Frontend build for touched apps (`vite build` / `next build`)
4. Do not commit secrets, `.env` files, or production credentials.
5. Update docs when you change public API or configuration keys.

## Commit messages

Use clear prefixes: `feat`, `fix`, `docs`, `chore`, `test`. Reference GitHub issues when applicable: `(#123)`.

## Code style

- **C#**: follow existing module layout (Application / Domain / Infrastructure), MediatR handlers, `Result<T>` patterns.
- **TypeScript/React**: match surrounding components; prefer `globalService` / module services over inline `fetch`.

## Reporting issues

Open a [GitHub Issue](https://github.com/arashazhdary/OneSign/issues) with reproduction steps, environment, and expected vs actual behavior.

## License

By contributing, you agree that your contributions will be licensed under the [MIT License](LICENSE).
