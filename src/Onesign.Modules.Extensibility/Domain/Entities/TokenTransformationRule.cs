namespace Onesign.Modules.Extensibility.Domain.Entities;

public class TokenTransformationRule
{
    public Guid Id { get; set; }
    public Guid TenantId { get; set; }
    public string Name { get; set; } = string.Empty;
    public Guid? TargetAppId { get; set; } // null = applies to all apps
    public int Order { get; set; }
    public string RuleDefinitionJson { get; set; } = "{}";
    public bool IsEnabled { get; set; }
    public DateTime CreatedAt { get; set; }
}
