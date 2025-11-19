using MediatR;
using Onesign.Modules.Extensibility.Application.DTOs;
using Onesign.Modules.Extensibility.Domain.Enums;
using Onesign.Modules.Extensibility.Domain.Repositories;
using Onesign.Shared.Result;

namespace Onesign.Modules.Extensibility.Application.Commands;

public class UpdateLoginHookCommand : IRequest<Result<LoginHookDto>>
{
    public Guid TenantId { get; set; }
    public Guid HookId { get; set; }
    public string Name { get; set; } = string.Empty;
    public string Stage { get; set; } = string.Empty;
    public string EndpointUrl { get; set; } = string.Empty;
    public string Secret { get; set; } = string.Empty;
    public int TimeoutSeconds { get; set; } = 2;
    public bool FailOpen { get; set; } = true;
    public bool IsEnabled { get; set; }
}

public class UpdateLoginHookCommandHandler : IRequestHandler<UpdateLoginHookCommand, Result<LoginHookDto>>
{
    private readonly ILoginHookRepository _repository;

    public UpdateLoginHookCommandHandler(ILoginHookRepository repository)
    {
        _repository = repository;
    }

    public async Task<Result<LoginHookDto>> Handle(UpdateLoginHookCommand request, CancellationToken cancellationToken)
    {
        var hook = await _repository.GetByIdAsync(request.HookId, cancellationToken);

        if (hook == null)
            return Result.Failure<LoginHookDto>("HookNotFound", "Login hook not found");

        if (hook.TenantId != request.TenantId)
            return Result.Failure<LoginHookDto>("Unauthorized", "Hook does not belong to this tenant");

        if (!Enum.TryParse<HookStage>(request.Stage, true, out var stage))
            return Result.Failure<LoginHookDto>("InvalidStage", "Invalid hook stage");

        hook.Name = request.Name;
        hook.Stage = stage;
        hook.EndpointUrl = request.EndpointUrl;
        hook.Secret = request.Secret;
        hook.TimeoutSeconds = request.TimeoutSeconds;
        hook.FailOpen = request.FailOpen;
        hook.IsEnabled = request.IsEnabled;

        await _repository.UpdateAsync(hook, cancellationToken);

        var dto = new LoginHookDto
        {
            Id = hook.Id,
            Name = hook.Name,
            Stage = hook.Stage.ToString(),
            EndpointUrl = hook.EndpointUrl,
            TimeoutSeconds = hook.TimeoutSeconds,
            FailOpen = hook.FailOpen,
            IsEnabled = hook.IsEnabled,
            CreatedAt = hook.CreatedAt
        };

        return Result.Success(dto);
    }
}
