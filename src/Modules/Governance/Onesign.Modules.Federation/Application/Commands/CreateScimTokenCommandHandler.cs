using MediatR;
using Microsoft.Extensions.Logging;
using Onesign.Modules.Federation.Application.DTOs;
using Onesign.Modules.Federation.Domain.Entities;
using Onesign.Modules.Federation.Domain.Enums;
using Onesign.Modules.Federation.Domain.Repositories;
using Onesign.Shared.Result;
using System.Security.Cryptography;

namespace Onesign.Modules.Federation.Application.Commands;

public class CreateScimTokenCommandHandler : IRequestHandler<CreateScimTokenCommand, Result<ScimTokenDto>>
{
    private readonly IScimTokenRepository _repository;
    private readonly ILogger<CreateScimTokenCommandHandler> _logger;

    public CreateScimTokenCommandHandler(
        IScimTokenRepository repository,
        ILogger<CreateScimTokenCommandHandler> logger)
    {
        _repository = repository;
        _logger = logger;
    }

    public async Task<Result<ScimTokenDto>> Handle(CreateScimTokenCommand request, CancellationToken cancellationToken)
    {
        _logger.LogInformation("Creating SCIM token for tenant {TenantId}", request.TenantId);

        try
        {
            // Generate secure random token
            var plainToken = GenerateSecureToken();
            var tokenHash = HashToken(plainToken);

            var token = new ScimToken
            {
                Id = Guid.NewGuid(),
                TenantId = request.TenantId,
                Name = request.Name,
                TokenHash = tokenHash,
                Status = ScimTokenStatus.Active,
                CreatedAt = DateTime.UtcNow,
                ExpiresAt = request.ExpiresAt
            };

            var created = await _repository.AddAsync(token, cancellationToken);

            var dto = new ScimTokenDto
            {
                Id = created.Id,
                TenantId = created.TenantId,
                Name = created.Name,
                Status = created.Status,
                CreatedAt = created.CreatedAt,
                ExpiresAt = created.ExpiresAt,
                LastUsedAt = created.LastUsedAt,
                PlainToken = plainToken // Only returned on creation
            };

            return Result.Success(dto);
        }
        catch (Exception ex)
        {
            _logger.LogError(ex, "Error creating SCIM token");
            return Result.Failure<ScimTokenDto>("SCIM_TOKEN_CREATE_FAILED", ex.Message);
        }
    }

    private static string GenerateSecureToken()
    {
        var bytes = new byte[32];
        using var rng = RandomNumberGenerator.Create();
        rng.GetBytes(bytes);
        return Convert.ToBase64String(bytes).Replace("+", "-").Replace("/", "_").Replace("=", "");
    }

    private static string HashToken(string token)
    {
        using var sha256 = SHA256.Create();
        var bytes = System.Text.Encoding.UTF8.GetBytes(token);
        var hash = sha256.ComputeHash(bytes);
        return Convert.ToBase64String(hash);
    }
}
