using MediatR;
using Onesign.Modules.Developer.Application.DTOs;
using Onesign.Shared.Result;

namespace Onesign.Modules.Developer.Application.Queries;

public class GetServiceAccountsQuery : IRequest<Result<List<ServiceAccountDto>>>
{
    public Guid TenantId { get; set; }
}
