using MediatR;
using Onesign.Modules.Extensibility.Domain.Services;
using Onesign.Shared.Result;

namespace Onesign.Modules.Extensibility.Application.Queries;

public class GetEventTypesQuery : IRequest<Result<List<string>>>
{
}

public class GetEventTypesQueryHandler : IRequestHandler<GetEventTypesQuery, Result<List<string>>>
{
    private readonly IEventPublisher _eventPublisher;

    public GetEventTypesQueryHandler(IEventPublisher eventPublisher)
    {
        _eventPublisher = eventPublisher;
    }

    public async Task<Result<List<string>>> Handle(GetEventTypesQuery request, CancellationToken cancellationToken)
    {
        var eventTypes = await _eventPublisher.GetSupportedEventTypesAsync(cancellationToken);
        return Result.Success(eventTypes.ToList());
    }
}
