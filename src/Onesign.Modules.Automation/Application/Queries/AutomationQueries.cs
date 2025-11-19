using MediatR;
using Onesign.Modules.Automation.Application.DTOs;
using Onesign.Shared.Result;

namespace Onesign.Modules.Automation.Application.Queries;

public class GetWorkflowsQuery : IRequest<Result<List<AutomationWorkflowDto>>>
{
    public Guid TenantId { get; set; }
}

public class GetWorkflowByIdQuery : IRequest<Result<AutomationWorkflowDto>>
{
    public Guid Id { get; set; }
    public Guid TenantId { get; set; }
}

public class GetGlobalTemplatesQuery : IRequest<Result<List<AutomationWorkflowDto>>>
{
}

public class GetGlobalTemplateByIdQuery : IRequest<Result<AutomationWorkflowDto>>
{
    public Guid Id { get; set; }
}

public class GetExecutionsQuery : IRequest<Result<PaginatedResultDto<AutomationExecutionDto>>>
{
    public Guid TenantId { get; set; }
    public Guid? WorkflowId { get; set; }
    public string? Status { get; set; }
    public DateTimeOffset? From { get; set; }
    public DateTimeOffset? To { get; set; }
    public int Page { get; set; } = 1;
    public int PageSize { get; set; } = 20;
}

public class GetExecutionByIdQuery : IRequest<Result<AutomationExecutionDto>>
{
    public Guid Id { get; set; }
    public Guid TenantId { get; set; }
}
