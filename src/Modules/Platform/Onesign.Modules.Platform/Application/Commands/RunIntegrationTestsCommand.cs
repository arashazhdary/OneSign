using MediatR;
using Onesign.Modules.Platform.Application.DTOs;
using Onesign.Shared.Result;

namespace Onesign.Modules.Platform.Application.Commands;

public class RunIntegrationTestsCommand : IRequest<Result<TestSuiteResultDto>>
{
    public Guid TestSuiteId { get; set; }
    public List<string> Categories { get; set; } = new();
}
