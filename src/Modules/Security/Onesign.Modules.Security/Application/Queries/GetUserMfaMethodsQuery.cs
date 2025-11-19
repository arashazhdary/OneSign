using MediatR;
using Onesign.Modules.Security.Application.DTOs;

namespace Onesign.Modules.Security.Application.Queries;

public class GetUserMfaMethodsQuery : IRequest<List<UserMfaMethodDto>>
{
    public Guid UserId { get; set; }
}
