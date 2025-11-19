using MediatR;
using Onesign.Modules.PrivilegedAccess.Application.DTOs;
using Onesign.Shared.Result;

namespace Onesign.Modules.PrivilegedAccess.Application.Queries;

public class GetBreakGlassAccountsQuery : IRequest<Result<List<BreakGlassAccountDto>>>
{
}
