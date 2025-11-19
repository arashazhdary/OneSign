using MediatR;
using Onesign.Modules.Developer.Application.DTOs;
using Onesign.Shared.Result;

namespace Onesign.Modules.Developer.Application.Queries;

public class GetApiKeysQuery : IRequest<Result<List<ApiKeyDto>>>
{
    public Guid TenantId { get; set; }
    public Guid? ServiceAccountId { get; set; }
}
