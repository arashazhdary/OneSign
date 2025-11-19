using Onesign.Modules.Automation.Domain.Enums;

namespace Onesign.Modules.Automation.Domain.Services;

public interface IConditionEvaluator
{
    bool Evaluate(ExpressionType expressionType, string expression, Dictionary<string, object?> payload);
}
