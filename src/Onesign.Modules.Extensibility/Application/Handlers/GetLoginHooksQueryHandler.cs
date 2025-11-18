using MediatR;
using Onesign.Modules.Extensibility.Application.DTOs;
using Onesign.Modules.Extensibility.Application.Queries;
using Onesign.Modules.Extensibility.Domain.Repositories;
using Onesign.Shared.Result;

namespace Onesign.Modules.Extensibility.Application.Handlers;

public class GetLoginHooksQueryHandler : IRequestHandler<GetLoginHooksQuery, Result<List<LoginHookDto>>>
{
    private readonly ILoginHookRepository _repository;

    public GetLoginHooksQueryHandler(ILoginHookRepository repository)
    {
        _repository = repository;
    }

    public async Task<Result<List<LoginHookDto>>> Handle(GetLoginHooksQuery request, CancellationToken cancellationToken)
    {
        var hooks = await _repository.GetByTenantIdAsync(request.TenantId, cancellationToken);

        var dtos = hooks.Select(h => new LoginHookDto
        {
            Id = h.Id,
            Name = h.Name,
            Stage = h.Stage.ToString(),
            EndpointUrl = h.EndpointUrl,
            TimeoutSeconds = h.TimeoutSeconds,
            FailOpen = h.FailOpen,
            IsEnabled = h.IsEnabled,
            CreatedAt = h.CreatedAt
        }).ToList();

        return Result.Success(dtos);
    }
}
