using MediatR;
using Onesign.Modules.Automation.Application.DTOs;
using Onesign.Shared.Result;

namespace Onesign.Modules.Automation.Application.Commands;

public class CreateGlobalTemplateCommand : IRequest<Result<AutomationWorkflowDto>>
{
    public Guid UserId { get; set; }
    public string Name { get; set; } = string.Empty;
    public string? Description { get; set; }
    public string Severity { get; set; } = "Info";
    public bool TenantCanDisable { get; set; } = true;
    public bool TenantCanOverrideConditions { get; set; } = true;
    public List<CreateTriggerDto> Triggers { get; set; } = new();
    public List<CreateConditionDto> Conditions { get; set; } = new();
    public List<CreateActionDto> Actions { get; set; } = new();
}

public class UpdateGlobalTemplateCommand : IRequest<Result<AutomationWorkflowDto>>
{
    public Guid Id { get; set; }
    public Guid UserId { get; set; }
    public string Name { get; set; } = string.Empty;
    public string? Description { get; set; }
    public string Severity { get; set; } = "Info";
    public bool TenantCanDisable { get; set; } = true;
    public bool TenantCanOverrideConditions { get; set; } = true;
    public List<CreateTriggerDto> Triggers { get; set; } = new();
    public List<CreateConditionDto> Conditions { get; set; } = new();
    public List<CreateActionDto> Actions { get; set; } = new();
}

public class DeleteGlobalTemplateCommand : IRequest<Result>
{
    public Guid Id { get; set; }
}

public class PublishTemplateCommand : IRequest<Result>
{
    public Guid Id { get; set; }
    public Guid UserId { get; set; }
}

public class EnforceTemplateCommand : IRequest<Result>
{
    public Guid Id { get; set; }
    public Guid UserId { get; set; }
}

public class UnenforceTemplateCommand : IRequest<Result>
{
    public Guid Id { get; set; }
    public Guid UserId { get; set; }
}

public class CloneTemplateCommand : IRequest<Result<AutomationWorkflowDto>>
{
    public Guid TemplateId { get; set; }
    public Guid TenantId { get; set; }
    public Guid UserId { get; set; }
    public string? CustomName { get; set; }
}
