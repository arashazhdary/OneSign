using MediatR;
using Onesign.Modules.Platform.Application.DTOs;
using Onesign.Shared.Result;

namespace Onesign.Modules.Platform.Application.Queries;

public class GetDiagnosticsQuery : IRequest<Result<DiagnosticsDto>>
{
}
