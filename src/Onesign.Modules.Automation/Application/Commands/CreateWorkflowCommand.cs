using MediatR;
using Onesign.Modules.Automation.Application.DTOs;
using Onesign.Shared.Result;

namespace Onesign.Modules.Automation.Application.Commands;

public class CreateWorkflowCommand : IRequest<Result<AutomationWorkflowDto>>
{
    public Guid TenantId { get; set; }
    public Guid UserId { get; set; }
    public string Name { get; set; } = string.Empty;
    public string? Description { get; set; }
    public string Severity { get; set; } = "Info";
    public bool IsEnabled { get; set; }
    public List<CreateTriggerDto> Triggers { get; set; } = new();
    public List<CreateConditionDto> Conditions { get; set; } = new();
    public List<CreateActionDto> Actions { get; set; } = new();
}

public class CreateTriggerDto
{
    public string EventType { get; set; } = string.Empty;
    public string SourceModule { get; set; } = string.Empty;
}

public class CreateConditionDto
{
    public string ExpressionType { get; set; } = "JsonLogic";
    public string Expression { get; set; } = string.Empty;
    public int Order { get; set; }
}

public class CreateActionDto
{
    public string ActionType { get; set; } = string.Empty;
    public int Order { get; set; }
    public string ConfigJson { get; set; } = "{}";
    public bool IsCritical { get; set; }
}

public class UpdateWorkflowCommand : IRequest<Result<AutomationWorkflowDto>>
{
    public Guid Id { get; set; }
    public Guid TenantId { get; set; }
    public Guid UserId { get; set; }
    public string Name { get; set; } = string.Empty;
    public string? Description { get; set; }
    public string Severity { get; set; } = "Info";
    public bool IsEnabled { get; set; }
    public List<CreateTriggerDto> Triggers { get; set; } = new();
    public List<CreateConditionDto> Conditions { get; set; } = new();
    public List<CreateActionDto> Actions { get; set; } = new();
}

public class DeleteWorkflowCommand : IRequest<Result>
{
    public Guid Id { get; set; }
    public Guid TenantId { get; set; }
}

public class EnableWorkflowCommand : IRequest<Result>
{
    public Guid Id { get; set; }
    public Guid TenantId { get; set; }
    public Guid UserId { get; set; }
}

public class DisableWorkflowCommand : IRequest<Result>
{
    public Guid Id { get; set; }
    public Guid TenantId { get; set; }
    public Guid UserId { get; set; }
}

public class TestWorkflowCommand : IRequest<Result<WorkflowTestResultDto>>
{
    public Guid Id { get; set; }
    public Guid TenantId { get; set; }
    public string TestPayloadJson { get; set; } = "{}";
}
