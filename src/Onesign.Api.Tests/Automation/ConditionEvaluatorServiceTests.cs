using Microsoft.Extensions.Logging;
using Moq;
using Onesign.Modules.Automation.Application.Services;
using Onesign.Modules.Automation.Domain.Enums;
using Xunit;

namespace Onesign.Api.Tests.Automation;

public class ConditionEvaluatorServiceTests
{
    private readonly ConditionEvaluatorService _evaluator;

    public ConditionEvaluatorServiceTests()
    {
        var logger = new Mock<ILogger<ConditionEvaluatorService>>();
        _evaluator = new ConditionEvaluatorService(logger.Object);
    }

    [Fact]
    public void Evaluate_EmptyExpression_ReturnsTrue()
    {
        var payload = new Dictionary<string, object?>();
        var result = _evaluator.Evaluate(ExpressionType.JsonLogic, "", payload);
        Assert.True(result);
    }

    [Fact]
    public void Evaluate_RiskScoreGreaterThanOrEqual_ReturnsTrue()
    {
        var expression = @"{""all"": [{"">"": [{""var"": ""riskScore""}, 80]}]}";
        var payload = new Dictionary<string, object?> { { "riskScore", 85m } };
        var result = _evaluator.Evaluate(ExpressionType.JsonLogic, expression, payload);
        Assert.True(result);
    }

    [Fact]
    public void Evaluate_RiskScoreGreaterThanOrEqual_ReturnsFalse()
    {
        var expression = @"{""all"": [{"">"": [{""var"": ""riskScore""}, 80]}]}";
        var payload = new Dictionary<string, object?> { { "riskScore", 50m } };
        var result = _evaluator.Evaluate(ExpressionType.JsonLogic, expression, payload);
        Assert.False(result);
    }

    [Fact]
    public void Evaluate_BooleanEquals_ReturnsTrue()
    {
        var expression = @"{"">="": [{""var"": ""riskScore""}, 80]}";
        var payload = new Dictionary<string, object?> { { "riskScore", 80m } };
        var result = _evaluator.Evaluate(ExpressionType.JsonLogic, expression, payload);
        Assert.True(result);
    }

    [Fact]
    public void Evaluate_MfaEnabledEqualsFalse_ReturnsTrue()
    {
        var expression = @"{""=="": [{""var"": ""mfaEnabled""}, false]}";
        var payload = new Dictionary<string, object?> { { "mfaEnabled", false } };
        var result = _evaluator.Evaluate(ExpressionType.JsonLogic, expression, payload);
        Assert.True(result);
    }

    [Fact]
    public void Evaluate_MfaEnabledEqualsFalse_ReturnsFalseWhenTrue()
    {
        var expression = @"{""=="": [{""var"": ""mfaEnabled""}, false]}";
        var payload = new Dictionary<string, object?> { { "mfaEnabled", true } };
        var result = _evaluator.Evaluate(ExpressionType.JsonLogic, expression, payload);
        Assert.False(result);
    }

    [Fact]
    public void Evaluate_CountryIn_ReturnsTrue()
    {
        var expression = @"{""in"": [{""var"": ""country""}, [""US"", ""GB"", ""DE""]]}";
        var payload = new Dictionary<string, object?> { { "country", "US" } };
        var result = _evaluator.Evaluate(ExpressionType.JsonLogic, expression, payload);
        Assert.True(result);
    }

    [Fact]
    public void Evaluate_CountryIn_ReturnsFalse()
    {
        var expression = @"{""in"": [{""var"": ""country""}, [""US"", ""GB"", ""DE""]]}";
        var payload = new Dictionary<string, object?> { { "country", "FR" } };
        var result = _evaluator.Evaluate(ExpressionType.JsonLogic, expression, payload);
        Assert.False(result);
    }

    [Fact]
    public void Evaluate_AllConditions_ReturnsTrue()
    {
        var expression = @"{
            ""all"": [
                {"">="": [{""var"": ""riskScore""}, 80]},
                {""=="": [{""var"": ""mfaEnabled""}, false]},
                {""in"": [{""var"": ""country""}, [""US"", ""GB"", ""DE""]]}
            ]
        }";
        var payload = new Dictionary<string, object?>
        {
            { "riskScore", 85m },
            { "mfaEnabled", false },
            { "country", "US" }
        };
        var result = _evaluator.Evaluate(ExpressionType.JsonLogic, expression, payload);
        Assert.True(result);
    }

    [Fact]
    public void Evaluate_AllConditions_ReturnsFalse_WhenOneFails()
    {
        var expression = @"{
            ""all"": [
                {"">="": [{""var"": ""riskScore""}, 80]},
                {""=="": [{""var"": ""mfaEnabled""}, false]},
                {""in"": [{""var"": ""country""}, [""US"", ""GB"", ""DE""]]}
            ]
        }";
        var payload = new Dictionary<string, object?>
        {
            { "riskScore", 85m },
            { "mfaEnabled", true },
            { "country", "US" }
        };
        var result = _evaluator.Evaluate(ExpressionType.JsonLogic, expression, payload);
        Assert.False(result);
    }

    [Fact]
    public void Evaluate_AnyConditions_ReturnsTrue()
    {
        var expression = @"{
            ""any"": [
                {"">="": [{""var"": ""riskScore""}, 90]},
                {""=="": [{""var"": ""mfaEnabled""}, false]}
            ]
        }";
        var payload = new Dictionary<string, object?>
        {
            { "riskScore", 50m },
            { "mfaEnabled", false }
        };
        var result = _evaluator.Evaluate(ExpressionType.JsonLogic, expression, payload);
        Assert.True(result);
    }

    [Fact]
    public void Evaluate_NotEqual_ReturnsTrue()
    {
        var expression = @"{""!="": [{""var"": ""status""}, ""Active""]}";
        var payload = new Dictionary<string, object?> { { "status", "Suspended" } };
        var result = _evaluator.Evaluate(ExpressionType.JsonLogic, expression, payload);
        Assert.True(result);
    }

    [Fact]
    public void Evaluate_LessThan_ReturnsTrue()
    {
        var expression = @"{""<"": [{""var"": ""score""}, 50]}";
        var payload = new Dictionary<string, object?> { { "score", 30m } };
        var result = _evaluator.Evaluate(ExpressionType.JsonLogic, expression, payload);
        Assert.True(result);
    }

    [Fact]
    public void Evaluate_NestedProperty_ReturnsTrue()
    {
        var expression = @"{""=="": [{""var"": ""user.id""}, ""123""]}";
        var payload = new Dictionary<string, object?>
        {
            { "user", new Dictionary<string, object?> { { "id", "123" } } }
        };
        var result = _evaluator.Evaluate(ExpressionType.JsonLogic, expression, payload);
        Assert.True(result);
    }

    [Fact]
    public void Evaluate_InvalidExpression_ReturnsFalse()
    {
        var expression = "invalid json";
        var payload = new Dictionary<string, object?>();
        var result = _evaluator.Evaluate(ExpressionType.JsonLogic, expression, payload);
        Assert.False(result);
    }
}
