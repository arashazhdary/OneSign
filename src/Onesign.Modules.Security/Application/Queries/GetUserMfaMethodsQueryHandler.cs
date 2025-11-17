using MediatR;
using Onesign.Modules.Security.Application.DTOs;
using Onesign.Modules.Security.Domain.Repositories;

namespace Onesign.Modules.Security.Application.Queries;

public class GetUserMfaMethodsQueryHandler : IRequestHandler<GetUserMfaMethodsQuery, List<UserMfaMethodDto>>
{
    private readonly IUserMfaMethodRepository _repository;

    public GetUserMfaMethodsQueryHandler(IUserMfaMethodRepository repository)
    {
        _repository = repository;
    }

    public async Task<List<UserMfaMethodDto>> Handle(GetUserMfaMethodsQuery request, CancellationToken cancellationToken)
    {
        var methods = await _repository.GetByUserIdAsync(request.UserId, cancellationToken);

        return methods.Select(m => new UserMfaMethodDto
        {
            Id = m.Id,
            MethodType = (int)m.MethodType,
            IsDefault = m.IsDefault,
            CreatedAt = m.CreatedAt
        }).ToList();
    }
}
