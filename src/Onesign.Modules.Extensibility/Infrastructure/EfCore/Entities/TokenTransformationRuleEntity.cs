namespace Onesign.Modules.Extensibility.Infrastructure.EfCore.Entities;

public class TokenTransformationRuleEntity
{
    public Guid Id { get; set; }
    public Guid TenantId { get; set; }
    public string Name { get; set; } = string.Empty;
    public Guid? TargetAppId { get; set; }
    public int Order { get; set; }
    public string RuleDefinitionJson { get; set; } = "{}";
    public bool IsEnabled { get; set; }
    public DateTime CreatedAt { get; set; }
}
