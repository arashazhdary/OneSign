using Moq;
using Onesign.Modules.Automation.Application.Commands;
using Onesign.Modules.Automation.Application.Handlers;
using Onesign.Modules.Automation.Domain.Entities;
using Onesign.Modules.Automation.Domain.Enums;
using Onesign.Modules.Automation.Domain.Repositories;
using Onesign.Modules.Automation.Domain.Services;
using Xunit;

namespace Onesign.Api.Tests.Automation;

public class WorkflowCommandHandlerTests
{
    private readonly Mock<IAutomationWorkflowRepository> _repositoryMock;
    private readonly Mock<IConditionEvaluator> _conditionEvaluatorMock;

    public WorkflowCommandHandlerTests()
    {
        _repositoryMock = new Mock<IAutomationWorkflowRepository>();
        _conditionEvaluatorMock = new Mock<IConditionEvaluator>();
    }

    [Fact]
    public async Task CreateWorkflowCommand_CreatesWorkflow()
    {
        var handler = new CreateWorkflowCommandHandler(_repositoryMock.Object);

        var command = new CreateWorkflowCommand
        {
            TenantId = Guid.NewGuid(),
            UserId = Guid.NewGuid(),
            Name = "Test Workflow",
            Description = "Test Description",
            Severity = "Warning",
            IsEnabled = true,
            Triggers = new List<CreateTriggerDto>
            {
                new() { EventType = "Auth.HighRiskSignInDetected", SourceModule = "Auth" }
            },
            Conditions = new List<CreateConditionDto>
            {
                new() { ExpressionType = "JsonLogic", Expression = @"{"">="": [{""var"": ""riskScore""}, 80]}", Order = 0 }
            },
            Actions = new List<CreateActionDto>
            {
                new() { ActionType = "RevokeSessions", Order = 0, ConfigJson = "{}", IsCritical = true }
            }
        };

        var result = await handler.Handle(command, CancellationToken.None);

        Assert.True(result.IsSuccess);
        Assert.NotNull(result.Value);
        Assert.Equal("Test Workflow", result.Value.Name);
        Assert.Equal("Warning", result.Value.Severity);
        Assert.Single(result.Value.Triggers);
        Assert.Single(result.Value.Conditions);
        Assert.Single(result.Value.Actions);

        _repositoryMock.Verify(r => r.AddAsync(It.IsAny<AutomationWorkflow>(), It.IsAny<CancellationToken>()), Times.Once);
    }

    [Fact]
    public async Task DeleteWorkflowCommand_DeletesWorkflow()
    {
        var workflowId = Guid.NewGuid();
        var tenantId = Guid.NewGuid();

        _repositoryMock.Setup(r => r.GetByIdAsync(workflowId, It.IsAny<CancellationToken>()))
            .ReturnsAsync(new AutomationWorkflow { Id = workflowId, TenantId = tenantId });

        var handler = new DeleteWorkflowCommandHandler(_repositoryMock.Object);

        var command = new DeleteWorkflowCommand
        {
            Id = workflowId,
            TenantId = tenantId
        };

        var result = await handler.Handle(command, CancellationToken.None);

        Assert.True(result.IsSuccess);
        _repositoryMock.Verify(r => r.DeleteAsync(workflowId, It.IsAny<CancellationToken>()), Times.Once);
    }

    [Fact]
    public async Task DeleteWorkflowCommand_ReturnsFailure_WhenWorkflowNotFound()
    {
        var workflowId = Guid.NewGuid();
        var tenantId = Guid.NewGuid();

        _repositoryMock.Setup(r => r.GetByIdAsync(workflowId, It.IsAny<CancellationToken>()))
            .ReturnsAsync((AutomationWorkflow?)null);

        var handler = new DeleteWorkflowCommandHandler(_repositoryMock.Object);

        var command = new DeleteWorkflowCommand
        {
            Id = workflowId,
            TenantId = tenantId
        };

        var result = await handler.Handle(command, CancellationToken.None);

        Assert.True(result.IsFailure);
        Assert.Equal("NotFound", result.ErrorCode);
    }

    [Fact]
    public async Task EnableWorkflowCommand_EnablesWorkflow()
    {
        var workflowId = Guid.NewGuid();
        var tenantId = Guid.NewGuid();
        var userId = Guid.NewGuid();

        var workflow = new AutomationWorkflow
        {
            Id = workflowId,
            TenantId = tenantId,
            IsEnabled = false
        };

        _repositoryMock.Setup(r => r.GetByIdWithDetailsAsync(workflowId, It.IsAny<CancellationToken>()))
            .ReturnsAsync(workflow);

        var handler = new EnableWorkflowCommandHandler(_repositoryMock.Object);

        var command = new EnableWorkflowCommand
        {
            Id = workflowId,
            TenantId = tenantId,
            UserId = userId
        };

        var result = await handler.Handle(command, CancellationToken.None);

        Assert.True(result.IsSuccess);
        Assert.True(workflow.IsEnabled);
        _repositoryMock.Verify(r => r.UpdateAsync(workflow, It.IsAny<CancellationToken>()), Times.Once);
    }

    [Fact]
    public async Task DisableWorkflowCommand_DisablesWorkflow()
    {
        var workflowId = Guid.NewGuid();
        var tenantId = Guid.NewGuid();
        var userId = Guid.NewGuid();

        var workflow = new AutomationWorkflow
        {
            Id = workflowId,
            TenantId = tenantId,
            IsEnabled = true
        };

        _repositoryMock.Setup(r => r.GetByIdWithDetailsAsync(workflowId, It.IsAny<CancellationToken>()))
            .ReturnsAsync(workflow);

        var handler = new DisableWorkflowCommandHandler(_repositoryMock.Object);

        var command = new DisableWorkflowCommand
        {
            Id = workflowId,
            TenantId = tenantId,
            UserId = userId
        };

        var result = await handler.Handle(command, CancellationToken.None);

        Assert.True(result.IsSuccess);
        Assert.False(workflow.IsEnabled);
        _repositoryMock.Verify(r => r.UpdateAsync(workflow, It.IsAny<CancellationToken>()), Times.Once);
    }

    [Fact]
    public async Task TestWorkflowCommand_ReturnsMatchedResult()
    {
        var workflowId = Guid.NewGuid();
        var tenantId = Guid.NewGuid();

        var workflow = new AutomationWorkflow
        {
            Id = workflowId,
            TenantId = tenantId,
            Triggers = new List<AutomationTrigger>
            {
                new() { Id = Guid.NewGuid(), WorkflowId = workflowId, EventType = "Auth.HighRiskSignInDetected", SourceModule = "Auth" }
            },
            Conditions = new List<AutomationCondition>
            {
                new() { Id = Guid.NewGuid(), WorkflowId = workflowId, ExpressionType = ExpressionType.JsonLogic, Expression = @"{"">="": [{""var"": ""riskScore""}, 80]}", Order = 0 }
            },
            Actions = new List<AutomationAction>
            {
                new() { Id = Guid.NewGuid(), WorkflowId = workflowId, ActionType = ActionType.RevokeSessions, Order = 0, ConfigJson = "{}", IsCritical = true }
            }
        };

        _repositoryMock.Setup(r => r.GetByIdWithDetailsAsync(workflowId, It.IsAny<CancellationToken>()))
            .ReturnsAsync(workflow);

        _conditionEvaluatorMock.Setup(e => e.Evaluate(It.IsAny<ExpressionType>(), It.IsAny<string>(), It.IsAny<Dictionary<string, object?>>()))
            .Returns(true);

        var handler = new TestWorkflowCommandHandler(_repositoryMock.Object, _conditionEvaluatorMock.Object);

        var testPayload = @"{""eventType"": ""Auth.HighRiskSignInDetected"", ""riskScore"": 85}";
        var command = new TestWorkflowCommand
        {
            Id = workflowId,
            TenantId = tenantId,
            TestPayloadJson = testPayload
        };

        var result = await handler.Handle(command, CancellationToken.None);

        Assert.True(result.IsSuccess);
        Assert.NotNull(result.Value);
        Assert.True(result.Value.Matched);
        Assert.True(result.Value.ConditionsPassed);
        Assert.Single(result.Value.ActionsToExecute);
        Assert.Equal("RevokeSessions", result.Value.ActionsToExecute[0].ActionType);
    }

    [Fact]
    public async Task TestWorkflowCommand_ReturnsNotMatched_WhenEventTypeDoesNotMatch()
    {
        var workflowId = Guid.NewGuid();
        var tenantId = Guid.NewGuid();

        var workflow = new AutomationWorkflow
        {
            Id = workflowId,
            TenantId = tenantId,
            Triggers = new List<AutomationTrigger>
            {
                new() { Id = Guid.NewGuid(), WorkflowId = workflowId, EventType = "Auth.HighRiskSignInDetected", SourceModule = "Auth" }
            },
            Conditions = new List<AutomationCondition>(),
            Actions = new List<AutomationAction>()
        };

        _repositoryMock.Setup(r => r.GetByIdWithDetailsAsync(workflowId, It.IsAny<CancellationToken>()))
            .ReturnsAsync(workflow);

        var handler = new TestWorkflowCommandHandler(_repositoryMock.Object, _conditionEvaluatorMock.Object);

        var testPayload = @"{""eventType"": ""Auth.SignInSucceeded""}";
        var command = new TestWorkflowCommand
        {
            Id = workflowId,
            TenantId = tenantId,
            TestPayloadJson = testPayload
        };

        var result = await handler.Handle(command, CancellationToken.None);

        Assert.True(result.IsSuccess);
        Assert.NotNull(result.Value);
        Assert.False(result.Value.Matched);
    }
}
