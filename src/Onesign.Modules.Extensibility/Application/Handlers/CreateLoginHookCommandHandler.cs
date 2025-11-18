using MediatR;
using Onesign.Modules.Extensibility.Application.Commands;
using Onesign.Modules.Extensibility.Domain.Entities;
using Onesign.Modules.Extensibility.Domain.Enums;
using Onesign.Modules.Extensibility.Domain.Repositories;
using Onesign.Shared.Result;

namespace Onesign.Modules.Extensibility.Application.Handlers;

public class CreateLoginHookCommandHandler : IRequestHandler<CreateLoginHookCommand, Result<Guid>>
{
    private readonly ILoginHookRepository _repository;

    public CreateLoginHookCommandHandler(ILoginHookRepository repository)
    {
        _repository = repository;
    }

    public async Task<Result<Guid>> Handle(CreateLoginHookCommand request, CancellationToken cancellationToken)
    {
        if (string.IsNullOrWhiteSpace(request.Name))
            return Result.Failure<Guid>("InvalidName", "Login hook name is required");

        if (!Enum.TryParse<HookStage>(request.Stage, true, out var stage))
            return Result.Failure<Guid>("InvalidStage", "Invalid hook stage");

        if (string.IsNullOrWhiteSpace(request.EndpointUrl))
            return Result.Failure<Guid>("InvalidEndpointUrl", "Endpoint URL is required");

        var loginHook = new LoginHook
        {
            Id = Guid.NewGuid(),
            TenantId = request.TenantId,
            Name = request.Name,
            Stage = stage,
            EndpointUrl = request.EndpointUrl,
            Secret = request.Secret,
            TimeoutSeconds = request.TimeoutSeconds > 0 ? request.TimeoutSeconds : 2,
            FailOpen = request.FailOpen,
            IsEnabled = true,
            CreatedAt = DateTime.UtcNow
        };

        await _repository.AddAsync(loginHook, cancellationToken);

        return Result.Success(loginHook.Id);
    }
}
