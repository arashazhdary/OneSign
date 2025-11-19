using MediatR;
using Onesign.Modules.Platform.Application.DTOs;
using Onesign.Shared.Result;

namespace Onesign.Modules.Platform.Application.Queries;

public class GetIntegrationTestResultsQuery : IRequest<Result<PaginatedResultDto<IntegrationTestResultDto>>>
{
    public int Page { get; set; } = 1;
    public int PageSize { get; set; } = 20;
    public string? Status { get; set; }
    public string? Category { get; set; }
}

public class GetTestSuiteResultsQuery : IRequest<Result<TestSuiteResultDto>>
{
    public Guid TestSuiteId { get; set; }
}

public class GetIntegrationTestResultByIdQuery : IRequest<Result<IntegrationTestResultDto>>
{
    public Guid Id { get; set; }
}
