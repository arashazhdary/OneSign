using FluentAssertions;
using Moq;
using Onesign.Modules.Automation.Domain.Entities;
using Onesign.Modules.Automation.Domain.Enums;
using Onesign.Modules.Automation.Domain.Repositories;
using Xunit;

namespace Onesign.Api.Tests.Automation;

public class AutomationModuleTests
{
    #region AutomationWorkflow Entity Tests

    [Fact]
    public void AutomationWorkflow_Creation_ShouldInitializeWithDefaultValues()
    {
        // Arrange & Act
        var workflow = new AutomationWorkflow();

        // Assert
        workflow.Id.Should().Be(Guid.Empty);
        workflow.TenantId.Should().BeNull();
        workflow.Name.Should().BeEmpty();
        workflow.Description.Should().BeNull();
        workflow.ScopeType.Should().Be(WorkflowScopeType.Tenant);
        workflow.IsTemplate.Should().BeFalse();
        workflow.IsEnabled.Should().BeFalse();
        workflow.Severity.Should().Be(WorkflowSeverity.Info);
        workflow.IsEnforced.Should().BeFalse();
        workflow.TenantCanDisable.Should().BeFalse();
        workflow.TenantCanOverrideConditions.Should().BeFalse();
        workflow.Triggers.Should().NotBeNull().And.BeEmpty();
        workflow.Conditions.Should().NotBeNull().And.BeEmpty();
        workflow.Actions.Should().NotBeNull().And.BeEmpty();
    }

    [Fact]
    public void AutomationWorkflow_Creation_ShouldSetAllPropertiesCorrectly()
    {
        // Arrange
        var workflowId = Guid.NewGuid();
        var tenantId = Guid.NewGuid();
        var userId = Guid.NewGuid();
        var createdAt = DateTimeOffset.UtcNow;

        // Act
        var workflow = new AutomationWorkflow
        {
            Id = workflowId,
            TenantId = tenantId,
            Name = "High Risk Sign-In Response",
            Description = "Automated response to high risk sign-in events",
            ScopeType = WorkflowScopeType.Tenant,
            IsTemplate = false,
            IsEnabled = true,
            Severity = WorkflowSeverity.Critical,
            IsEnforced = true,
            TenantCanDisable = false,
            TenantCanOverrideConditions = true,
            CreatedAt = createdAt,
            CreatedByUserId = userId
        };

        // Assert
        workflow.Id.Should().Be(workflowId);
        workflow.TenantId.Should().Be(tenantId);
        workflow.Name.Should().Be("High Risk Sign-In Response");
        workflow.Description.Should().Be("Automated response to high risk sign-in events");
        workflow.ScopeType.Should().Be(WorkflowScopeType.Tenant);
        workflow.IsEnabled.Should().BeTrue();
        workflow.Severity.Should().Be(WorkflowSeverity.Critical);
        workflow.IsEnforced.Should().BeTrue();
        workflow.CreatedByUserId.Should().Be(userId);
    }

    [Fact]
    public void AutomationWorkflow_GlobalScope_ShouldHaveNullTenantId()
    {
        // Arrange & Act
        var workflow = new AutomationWorkflow
        {
            Id = Guid.NewGuid(),
            TenantId = null,
            Name = "Global Security Template",
            ScopeType = WorkflowScopeType.Global,
            IsTemplate = true
        };

        // Assert
        workflow.TenantId.Should().BeNull();
        workflow.ScopeType.Should().Be(WorkflowScopeType.Global);
        workflow.IsTemplate.Should().BeTrue();
    }

    [Fact]
    public void AutomationWorkflow_AddTrigger_ShouldAddToTriggersList()
    {
        // Arrange
        var workflow = new AutomationWorkflow
        {
            Id = Guid.NewGuid(),
            Name = "Test Workflow"
        };

        var trigger = new AutomationTrigger
        {
            Id = Guid.NewGuid(),
            WorkflowId = workflow.Id,
            EventType = "Auth.HighRiskSignInDetected",
            SourceModule = "Auth"
        };

        // Act
        workflow.Triggers.Add(trigger);

        // Assert
        workflow.Triggers.Should().HaveCount(1);
        workflow.Triggers[0].EventType.Should().Be("Auth.HighRiskSignInDetected");
    }

    [Theory]
    [InlineData(1, 1, 1)]
    [InlineData(2, 3, 2)]
    [InlineData(3, 2, 5)]
    public void AutomationWorkflow_MultipleComponents_ShouldMaintainAllCollections(int triggerCount, int conditionCount, int actionCount)
    {
        // Arrange
        var workflow = new AutomationWorkflow
        {
            Id = Guid.NewGuid(),
            Name = "Complex Workflow"
        };

        // Act
        for (int i = 0; i < triggerCount; i++)
        {
            workflow.Triggers.Add(new AutomationTrigger
            {
                Id = Guid.NewGuid(),
                WorkflowId = workflow.Id,
                EventType = $"Event.Type{i}",
                SourceModule = "TestModule"
            });
        }

        for (int i = 0; i < conditionCount; i++)
        {
            workflow.Conditions.Add(new AutomationCondition
            {
                Id = Guid.NewGuid(),
                WorkflowId = workflow.Id,
                ExpressionType = ExpressionType.JsonLogic,
                Expression = $"{{\"==\": [{{\"var\": \"field{i}\"}}, true]}}",
                Order = i
            });
        }

        for (int i = 0; i < actionCount; i++)
        {
            workflow.Actions.Add(new AutomationAction
            {
                Id = Guid.NewGuid(),
                WorkflowId = workflow.Id,
                ActionType = ActionType.SendEmail,
                Order = i,
                ConfigJson = "{}",
                IsCritical = i == 0
            });
        }

        // Assert
        workflow.Triggers.Should().HaveCount(triggerCount);
        workflow.Conditions.Should().HaveCount(conditionCount);
        workflow.Actions.Should().HaveCount(actionCount);
    }

    #endregion

    #region AutomationTrigger Entity Tests

    [Fact]
    public void AutomationTrigger_Creation_ShouldInitializeWithDefaultValues()
    {
        // Arrange & Act
        var trigger = new AutomationTrigger();

        // Assert
        trigger.Id.Should().Be(Guid.Empty);
        trigger.WorkflowId.Should().Be(Guid.Empty);
        trigger.EventType.Should().BeEmpty();
        trigger.SourceModule.Should().BeEmpty();
    }

    [Fact]
    public void AutomationTrigger_Creation_ShouldSetPropertiesCorrectly()
    {
        // Arrange
        var triggerId = Guid.NewGuid();
        var workflowId = Guid.NewGuid();

        // Act
        var trigger = new AutomationTrigger
        {
            Id = triggerId,
            WorkflowId = workflowId,
            EventType = "Identity.UserCreated",
            SourceModule = "Identity"
        };

        // Assert
        trigger.Id.Should().Be(triggerId);
        trigger.WorkflowId.Should().Be(workflowId);
        trigger.EventType.Should().Be("Identity.UserCreated");
        trigger.SourceModule.Should().Be("Identity");
    }

    [Theory]
    [InlineData("Auth.SignInSucceeded", "Auth")]
    [InlineData("Auth.HighRiskSignInDetected", "Auth")]
    [InlineData("Identity.UserCreated", "Identity")]
    [InlineData("Identity.UserDeleted", "Identity")]
    [InlineData("Policy.ViolationDetected", "Policy")]
    public void AutomationTrigger_VariousEventTypes_ShouldBeValid(string eventType, string sourceModule)
    {
        // Arrange & Act
        var trigger = new AutomationTrigger
        {
            Id = Guid.NewGuid(),
            WorkflowId = Guid.NewGuid(),
            EventType = eventType,
            SourceModule = sourceModule
        };

        // Assert
        trigger.EventType.Should().Be(eventType);
        trigger.SourceModule.Should().Be(sourceModule);
    }

    #endregion

    #region AutomationCondition Entity Tests

    [Fact]
    public void AutomationCondition_Creation_ShouldInitializeWithDefaultValues()
    {
        // Arrange & Act
        var condition = new AutomationCondition();

        // Assert
        condition.Id.Should().Be(Guid.Empty);
        condition.WorkflowId.Should().Be(Guid.Empty);
        condition.ExpressionType.Should().Be(ExpressionType.JsonLogic);
        condition.Expression.Should().BeEmpty();
        condition.Order.Should().Be(0);
    }

    [Fact]
    public void AutomationCondition_Creation_ShouldSetPropertiesCorrectly()
    {
        // Arrange
        var conditionId = Guid.NewGuid();
        var workflowId = Guid.NewGuid();
        var expression = @"{"">"": [{""var"": ""riskScore""}, 80]}";

        // Act
        var condition = new AutomationCondition
        {
            Id = conditionId,
            WorkflowId = workflowId,
            ExpressionType = ExpressionType.JsonLogic,
            Expression = expression,
            Order = 1
        };

        // Assert
        condition.Id.Should().Be(conditionId);
        condition.WorkflowId.Should().Be(workflowId);
        condition.ExpressionType.Should().Be(ExpressionType.JsonLogic);
        condition.Expression.Should().Be(expression);
        condition.Order.Should().Be(1);
    }

    [Theory]
    [InlineData(ExpressionType.JsonLogic, @"{""=="": [{""var"": ""status""}, ""Active""]}")]
    [InlineData(ExpressionType.SimpleRule, "riskScore >= 80")]
    public void AutomationCondition_DifferentExpressionTypes_ShouldBeValid(ExpressionType expressionType, string expression)
    {
        // Arrange & Act
        var condition = new AutomationCondition
        {
            Id = Guid.NewGuid(),
            WorkflowId = Guid.NewGuid(),
            ExpressionType = expressionType,
            Expression = expression,
            Order = 0
        };

        // Assert
        condition.ExpressionType.Should().Be(expressionType);
        condition.Expression.Should().Be(expression);
    }

    #endregion

    #region AutomationAction Entity Tests

    [Fact]
    public void AutomationAction_Creation_ShouldInitializeWithDefaultValues()
    {
        // Arrange & Act
        var action = new AutomationAction();

        // Assert
        action.Id.Should().Be(Guid.Empty);
        action.WorkflowId.Should().Be(Guid.Empty);
        action.ActionType.Should().Be(ActionType.RevokeSessions);
        action.Order.Should().Be(0);
        action.ConfigJson.Should().Be("{}");
        action.IsCritical.Should().BeFalse();
    }

    [Fact]
    public void AutomationAction_Creation_ShouldSetPropertiesCorrectly()
    {
        // Arrange
        var actionId = Guid.NewGuid();
        var workflowId = Guid.NewGuid();
        var configJson = @"{""recipients"": [""admin@contoso.com""], ""subject"": ""Security Alert""}";

        // Act
        var action = new AutomationAction
        {
            Id = actionId,
            WorkflowId = workflowId,
            ActionType = ActionType.SendEmail,
            Order = 2,
            ConfigJson = configJson,
            IsCritical = true
        };

        // Assert
        action.Id.Should().Be(actionId);
        action.WorkflowId.Should().Be(workflowId);
        action.ActionType.Should().Be(ActionType.SendEmail);
        action.Order.Should().Be(2);
        action.ConfigJson.Should().Be(configJson);
        action.IsCritical.Should().BeTrue();
    }

    [Theory]
    [InlineData(ActionType.RevokeSessions, true)]
    [InlineData(ActionType.RequireMfaNextSignIn, true)]
    [InlineData(ActionType.LockUserAccount, true)]
    [InlineData(ActionType.DisableAppAccess, true)]
    [InlineData(ActionType.SendEmail, false)]
    [InlineData(ActionType.SendToChannel, false)]
    [InlineData(ActionType.InvokeWebhook, false)]
    public void AutomationAction_AllActionTypes_ShouldBeConfigurable(ActionType actionType, bool isCritical)
    {
        // Arrange & Act
        var action = new AutomationAction
        {
            Id = Guid.NewGuid(),
            WorkflowId = Guid.NewGuid(),
            ActionType = actionType,
            Order = 0,
            ConfigJson = "{}",
            IsCritical = isCritical
        };

        // Assert
        action.ActionType.Should().Be(actionType);
        action.IsCritical.Should().Be(isCritical);
    }

    #endregion

    #region Enum Tests - WorkflowScopeType

    [Fact]
    public void WorkflowScopeType_Enum_ShouldHaveCorrectValues()
    {
        // Assert
        ((int)WorkflowScopeType.Tenant).Should().Be(0);
        ((int)WorkflowScopeType.Global).Should().Be(1);
    }

    [Theory]
    [InlineData(WorkflowScopeType.Tenant, "Tenant")]
    [InlineData(WorkflowScopeType.Global, "Global")]
    public void WorkflowScopeType_Enum_ShouldHaveCorrectNames(WorkflowScopeType scopeType, string expectedName)
    {
        // Assert
        scopeType.ToString().Should().Be(expectedName);
    }

    [Fact]
    public void WorkflowScopeType_Enum_ShouldHaveTwoValues()
    {
        // Arrange
        var values = Enum.GetValues<WorkflowScopeType>();

        // Assert
        values.Should().HaveCount(2);
    }

    #endregion

    #region Enum Tests - WorkflowSeverity

    [Fact]
    public void WorkflowSeverity_Enum_ShouldHaveCorrectValues()
    {
        // Assert
        ((int)WorkflowSeverity.Info).Should().Be(0);
        ((int)WorkflowSeverity.Warning).Should().Be(1);
        ((int)WorkflowSeverity.Critical).Should().Be(2);
    }

    [Theory]
    [InlineData(WorkflowSeverity.Info, "Info")]
    [InlineData(WorkflowSeverity.Warning, "Warning")]
    [InlineData(WorkflowSeverity.Critical, "Critical")]
    public void WorkflowSeverity_Enum_ShouldHaveCorrectNames(WorkflowSeverity severity, string expectedName)
    {
        // Assert
        severity.ToString().Should().Be(expectedName);
    }

    [Fact]
    public void WorkflowSeverity_Enum_ShouldHaveThreeValues()
    {
        // Arrange
        var values = Enum.GetValues<WorkflowSeverity>();

        // Assert
        values.Should().HaveCount(3);
    }

    #endregion

    #region Enum Tests - ActionType

    [Fact]
    public void ActionType_Enum_ShouldHaveCorrectValues()
    {
        // Assert
        ((int)ActionType.RevokeSessions).Should().Be(0);
        ((int)ActionType.RequireMfaNextSignIn).Should().Be(1);
        ((int)ActionType.LockUserAccount).Should().Be(2);
        ((int)ActionType.DisableAppAccess).Should().Be(3);
        ((int)ActionType.TriggerAccessReview).Should().Be(4);
        ((int)ActionType.SendEmail).Should().Be(5);
        ((int)ActionType.SendToChannel).Should().Be(6);
        ((int)ActionType.InvokeWebhook).Should().Be(7);
        ((int)ActionType.PushEventToQueue).Should().Be(8);
    }

    [Theory]
    [InlineData(ActionType.RevokeSessions, "RevokeSessions")]
    [InlineData(ActionType.RequireMfaNextSignIn, "RequireMfaNextSignIn")]
    [InlineData(ActionType.LockUserAccount, "LockUserAccount")]
    [InlineData(ActionType.DisableAppAccess, "DisableAppAccess")]
    [InlineData(ActionType.TriggerAccessReview, "TriggerAccessReview")]
    [InlineData(ActionType.SendEmail, "SendEmail")]
    [InlineData(ActionType.SendToChannel, "SendToChannel")]
    [InlineData(ActionType.InvokeWebhook, "InvokeWebhook")]
    [InlineData(ActionType.PushEventToQueue, "PushEventToQueue")]
    public void ActionType_Enum_ShouldHaveCorrectNames(ActionType actionType, string expectedName)
    {
        // Assert
        actionType.ToString().Should().Be(expectedName);
    }

    [Fact]
    public void ActionType_Enum_ShouldHaveNineValues()
    {
        // Arrange
        var values = Enum.GetValues<ActionType>();

        // Assert
        values.Should().HaveCount(9);
    }

    #endregion

    #region Enum Tests - ExpressionType

    [Fact]
    public void ExpressionType_Enum_ShouldHaveCorrectValues()
    {
        // Assert
        ((int)ExpressionType.JsonLogic).Should().Be(0);
        ((int)ExpressionType.SimpleRule).Should().Be(1);
    }

    [Theory]
    [InlineData(ExpressionType.JsonLogic, "JsonLogic")]
    [InlineData(ExpressionType.SimpleRule, "SimpleRule")]
    public void ExpressionType_Enum_ShouldHaveCorrectNames(ExpressionType expressionType, string expectedName)
    {
        // Assert
        expressionType.ToString().Should().Be(expectedName);
    }

    [Fact]
    public void ExpressionType_Enum_ShouldHaveTwoValues()
    {
        // Arrange
        var values = Enum.GetValues<ExpressionType>();

        // Assert
        values.Should().HaveCount(2);
    }

    #endregion

    #region Repository Tests with Mocking

    [Fact]
    public async Task Repository_GetByIdAsync_ShouldReturnWorkflow()
    {
        // Arrange
        var repositoryMock = new Mock<IAutomationWorkflowRepository>();
        var workflowId = Guid.NewGuid();
        var expectedWorkflow = new AutomationWorkflow
        {
            Id = workflowId,
            TenantId = Guid.NewGuid(),
            Name = "Test Workflow",
            IsEnabled = true
        };

        repositoryMock.Setup(r => r.GetByIdAsync(workflowId, It.IsAny<CancellationToken>()))
            .ReturnsAsync(expectedWorkflow);

        // Act
        var result = await repositoryMock.Object.GetByIdAsync(workflowId);

        // Assert
        result.Should().NotBeNull();
        result!.Id.Should().Be(workflowId);
        result.Name.Should().Be("Test Workflow");
        repositoryMock.Verify(r => r.GetByIdAsync(workflowId, It.IsAny<CancellationToken>()), Times.Once);
    }

    [Fact]
    public async Task Repository_GetByIdAsync_ShouldReturnNullWhenNotFound()
    {
        // Arrange
        var repositoryMock = new Mock<IAutomationWorkflowRepository>();
        var nonExistentId = Guid.NewGuid();

        repositoryMock.Setup(r => r.GetByIdAsync(nonExistentId, It.IsAny<CancellationToken>()))
            .ReturnsAsync((AutomationWorkflow?)null);

        // Act
        var result = await repositoryMock.Object.GetByIdAsync(nonExistentId);

        // Assert
        result.Should().BeNull();
    }

    [Fact]
    public async Task Repository_GetByIdWithDetailsAsync_ShouldIncludeAllRelations()
    {
        // Arrange
        var repositoryMock = new Mock<IAutomationWorkflowRepository>();
        var workflowId = Guid.NewGuid();
        var workflow = new AutomationWorkflow
        {
            Id = workflowId,
            TenantId = Guid.NewGuid(),
            Name = "Complete Workflow",
            Triggers = new List<AutomationTrigger>
            {
                new() { Id = Guid.NewGuid(), WorkflowId = workflowId, EventType = "Auth.SignIn", SourceModule = "Auth" }
            },
            Conditions = new List<AutomationCondition>
            {
                new() { Id = Guid.NewGuid(), WorkflowId = workflowId, ExpressionType = ExpressionType.JsonLogic, Expression = "{}", Order = 0 }
            },
            Actions = new List<AutomationAction>
            {
                new() { Id = Guid.NewGuid(), WorkflowId = workflowId, ActionType = ActionType.SendEmail, Order = 0 }
            }
        };

        repositoryMock.Setup(r => r.GetByIdWithDetailsAsync(workflowId, It.IsAny<CancellationToken>()))
            .ReturnsAsync(workflow);

        // Act
        var result = await repositoryMock.Object.GetByIdWithDetailsAsync(workflowId);

        // Assert
        result.Should().NotBeNull();
        result!.Triggers.Should().HaveCount(1);
        result.Conditions.Should().HaveCount(1);
        result.Actions.Should().HaveCount(1);
    }

    [Fact]
    public async Task Repository_GetByTenantIdAsync_ShouldReturnTenantWorkflows()
    {
        // Arrange
        var repositoryMock = new Mock<IAutomationWorkflowRepository>();
        var tenantId = Guid.NewGuid();
        var workflows = new List<AutomationWorkflow>
        {
            new() { Id = Guid.NewGuid(), TenantId = tenantId, Name = "Workflow 1" },
            new() { Id = Guid.NewGuid(), TenantId = tenantId, Name = "Workflow 2" }
        };

        repositoryMock.Setup(r => r.GetByTenantIdAsync(tenantId, It.IsAny<CancellationToken>()))
            .ReturnsAsync(workflows);

        // Act
        var result = await repositoryMock.Object.GetByTenantIdAsync(tenantId);

        // Assert
        result.Should().HaveCount(2);
        result.Should().OnlyContain(w => w.TenantId == tenantId);
    }

    [Fact]
    public async Task Repository_GetGlobalTemplatesAsync_ShouldReturnOnlyTemplates()
    {
        // Arrange
        var repositoryMock = new Mock<IAutomationWorkflowRepository>();
        var templates = new List<AutomationWorkflow>
        {
            new() { Id = Guid.NewGuid(), TenantId = null, Name = "Global Template 1", ScopeType = WorkflowScopeType.Global, IsTemplate = true },
            new() { Id = Guid.NewGuid(), TenantId = null, Name = "Global Template 2", ScopeType = WorkflowScopeType.Global, IsTemplate = true }
        };

        repositoryMock.Setup(r => r.GetGlobalTemplatesAsync(It.IsAny<CancellationToken>()))
            .ReturnsAsync(templates);

        // Act
        var result = await repositoryMock.Object.GetGlobalTemplatesAsync();

        // Assert
        result.Should().HaveCount(2);
        result.Should().OnlyContain(w => w.IsTemplate && w.ScopeType == WorkflowScopeType.Global);
    }

    [Fact]
    public async Task Repository_GetEnforcedGlobalWorkflowsAsync_ShouldReturnEnforcedWorkflows()
    {
        // Arrange
        var repositoryMock = new Mock<IAutomationWorkflowRepository>();
        var enforcedWorkflows = new List<AutomationWorkflow>
        {
            new() { Id = Guid.NewGuid(), Name = "Enforced Policy 1", ScopeType = WorkflowScopeType.Global, IsEnforced = true },
            new() { Id = Guid.NewGuid(), Name = "Enforced Policy 2", ScopeType = WorkflowScopeType.Global, IsEnforced = true }
        };

        repositoryMock.Setup(r => r.GetEnforcedGlobalWorkflowsAsync(It.IsAny<CancellationToken>()))
            .ReturnsAsync(enforcedWorkflows);

        // Act
        var result = await repositoryMock.Object.GetEnforcedGlobalWorkflowsAsync();

        // Assert
        result.Should().HaveCount(2);
        result.Should().OnlyContain(w => w.IsEnforced);
    }

    [Theory]
    [InlineData("Auth.HighRiskSignInDetected")]
    [InlineData("Identity.UserCreated")]
    [InlineData("Policy.ViolationDetected")]
    public async Task Repository_GetByEventTypeAsync_ShouldReturnMatchingWorkflows(string eventType)
    {
        // Arrange
        var repositoryMock = new Mock<IAutomationWorkflowRepository>();
        var tenantId = Guid.NewGuid();
        var workflowId = Guid.NewGuid();
        var workflows = new List<AutomationWorkflow>
        {
            new()
            {
                Id = workflowId,
                TenantId = tenantId,
                Name = $"Workflow for {eventType}",
                Triggers = new List<AutomationTrigger>
                {
                    new() { Id = Guid.NewGuid(), WorkflowId = workflowId, EventType = eventType, SourceModule = "TestModule" }
                }
            }
        };

        repositoryMock.Setup(r => r.GetByEventTypeAsync(tenantId, eventType, It.IsAny<CancellationToken>()))
            .ReturnsAsync(workflows);

        // Act
        var result = await repositoryMock.Object.GetByEventTypeAsync(tenantId, eventType);

        // Assert
        result.Should().HaveCount(1);
        result[0].Triggers.Should().Contain(t => t.EventType == eventType);
    }

    [Fact]
    public async Task Repository_AddAsync_ShouldAddWorkflow()
    {
        // Arrange
        var repositoryMock = new Mock<IAutomationWorkflowRepository>();
        var workflow = new AutomationWorkflow
        {
            Id = Guid.NewGuid(),
            TenantId = Guid.NewGuid(),
            Name = "New Workflow",
            CreatedAt = DateTimeOffset.UtcNow,
            CreatedByUserId = Guid.NewGuid()
        };

        repositoryMock.Setup(r => r.AddAsync(It.IsAny<AutomationWorkflow>(), It.IsAny<CancellationToken>()))
            .Returns(Task.CompletedTask);

        // Act
        await repositoryMock.Object.AddAsync(workflow);

        // Assert
        repositoryMock.Verify(r => r.AddAsync(workflow, It.IsAny<CancellationToken>()), Times.Once);
    }

    [Fact]
    public async Task Repository_UpdateAsync_ShouldUpdateWorkflow()
    {
        // Arrange
        var repositoryMock = new Mock<IAutomationWorkflowRepository>();
        var workflow = new AutomationWorkflow
        {
            Id = Guid.NewGuid(),
            TenantId = Guid.NewGuid(),
            Name = "Updated Workflow",
            IsEnabled = true,
            UpdatedAt = DateTimeOffset.UtcNow,
            UpdatedByUserId = Guid.NewGuid()
        };

        repositoryMock.Setup(r => r.UpdateAsync(It.IsAny<AutomationWorkflow>(), It.IsAny<CancellationToken>()))
            .Returns(Task.CompletedTask);

        // Act
        await repositoryMock.Object.UpdateAsync(workflow);

        // Assert
        repositoryMock.Verify(r => r.UpdateAsync(workflow, It.IsAny<CancellationToken>()), Times.Once);
    }

    [Fact]
    public async Task Repository_DeleteAsync_ShouldDeleteWorkflow()
    {
        // Arrange
        var repositoryMock = new Mock<IAutomationWorkflowRepository>();
        var workflowId = Guid.NewGuid();

        repositoryMock.Setup(r => r.DeleteAsync(workflowId, It.IsAny<CancellationToken>()))
            .Returns(Task.CompletedTask);

        // Act
        await repositoryMock.Object.DeleteAsync(workflowId);

        // Assert
        repositoryMock.Verify(r => r.DeleteAsync(workflowId, It.IsAny<CancellationToken>()), Times.Once);
    }

    #endregion

    #region Workflow Execution Tests

    [Fact]
    public void WorkflowExecution_ConditionsOrdering_ShouldBeRespected()
    {
        // Arrange
        var workflow = new AutomationWorkflow
        {
            Id = Guid.NewGuid(),
            Name = "Ordered Conditions Workflow"
        };

        // Act
        workflow.Conditions.Add(new AutomationCondition { Id = Guid.NewGuid(), WorkflowId = workflow.Id, Order = 2, Expression = "condition3" });
        workflow.Conditions.Add(new AutomationCondition { Id = Guid.NewGuid(), WorkflowId = workflow.Id, Order = 0, Expression = "condition1" });
        workflow.Conditions.Add(new AutomationCondition { Id = Guid.NewGuid(), WorkflowId = workflow.Id, Order = 1, Expression = "condition2" });

        var orderedConditions = workflow.Conditions.OrderBy(c => c.Order).ToList();

        // Assert
        orderedConditions[0].Expression.Should().Be("condition1");
        orderedConditions[1].Expression.Should().Be("condition2");
        orderedConditions[2].Expression.Should().Be("condition3");
    }

    [Fact]
    public void WorkflowExecution_ActionsOrdering_ShouldBeRespected()
    {
        // Arrange
        var workflow = new AutomationWorkflow
        {
            Id = Guid.NewGuid(),
            Name = "Ordered Actions Workflow"
        };

        // Act
        workflow.Actions.Add(new AutomationAction { Id = Guid.NewGuid(), WorkflowId = workflow.Id, ActionType = ActionType.SendEmail, Order = 2 });
        workflow.Actions.Add(new AutomationAction { Id = Guid.NewGuid(), WorkflowId = workflow.Id, ActionType = ActionType.RevokeSessions, Order = 0 });
        workflow.Actions.Add(new AutomationAction { Id = Guid.NewGuid(), WorkflowId = workflow.Id, ActionType = ActionType.LockUserAccount, Order = 1 });

        var orderedActions = workflow.Actions.OrderBy(a => a.Order).ToList();

        // Assert
        orderedActions[0].ActionType.Should().Be(ActionType.RevokeSessions);
        orderedActions[1].ActionType.Should().Be(ActionType.LockUserAccount);
        orderedActions[2].ActionType.Should().Be(ActionType.SendEmail);
    }

    [Fact]
    public void WorkflowExecution_CriticalActions_ShouldBeIdentifiable()
    {
        // Arrange
        var workflow = new AutomationWorkflow
        {
            Id = Guid.NewGuid(),
            Name = "Critical Actions Workflow"
        };

        workflow.Actions.Add(new AutomationAction { Id = Guid.NewGuid(), WorkflowId = workflow.Id, ActionType = ActionType.RevokeSessions, IsCritical = true, Order = 0 });
        workflow.Actions.Add(new AutomationAction { Id = Guid.NewGuid(), WorkflowId = workflow.Id, ActionType = ActionType.SendEmail, IsCritical = false, Order = 1 });
        workflow.Actions.Add(new AutomationAction { Id = Guid.NewGuid(), WorkflowId = workflow.Id, ActionType = ActionType.LockUserAccount, IsCritical = true, Order = 2 });

        // Act
        var criticalActions = workflow.Actions.Where(a => a.IsCritical).ToList();

        // Assert
        criticalActions.Should().HaveCount(2);
        criticalActions.Should().Contain(a => a.ActionType == ActionType.RevokeSessions);
        criticalActions.Should().Contain(a => a.ActionType == ActionType.LockUserAccount);
    }

    #endregion

    #region Edge Cases and Error Handling

    [Fact]
    public void AutomationWorkflow_EmptyCollections_ShouldBeValid()
    {
        // Arrange & Act
        var workflow = new AutomationWorkflow
        {
            Id = Guid.NewGuid(),
            TenantId = Guid.NewGuid(),
            Name = "Empty Workflow"
        };

        // Assert
        workflow.Triggers.Should().BeEmpty();
        workflow.Conditions.Should().BeEmpty();
        workflow.Actions.Should().BeEmpty();
        workflow.Should().NotBeNull();
    }

    [Fact]
    public void AutomationWorkflow_NullDescription_ShouldBeValid()
    {
        // Arrange & Act
        var workflow = new AutomationWorkflow
        {
            Id = Guid.NewGuid(),
            Name = "Workflow without description",
            Description = null
        };

        // Assert
        workflow.Description.Should().BeNull();
    }

    [Fact]
    public void AutomationWorkflow_UpdatedFields_ShouldBeNullableInitially()
    {
        // Arrange & Act
        var workflow = new AutomationWorkflow
        {
            Id = Guid.NewGuid(),
            Name = "New Workflow"
        };

        // Assert
        workflow.UpdatedAt.Should().BeNull();
        workflow.UpdatedByUserId.Should().BeNull();
    }

    [Fact]
    public async Task Repository_GetByIdAsync_WithCancellation_ShouldSupportCancellation()
    {
        // Arrange
        var repositoryMock = new Mock<IAutomationWorkflowRepository>();
        var cancellationToken = new CancellationToken(true);
        var workflowId = Guid.NewGuid();

        repositoryMock.Setup(r => r.GetByIdAsync(workflowId, cancellationToken))
            .ThrowsAsync(new OperationCanceledException());

        // Act & Assert
        await Assert.ThrowsAsync<OperationCanceledException>(() =>
            repositoryMock.Object.GetByIdAsync(workflowId, cancellationToken));
    }

    [Fact]
    public void AutomationAction_EmptyConfigJson_ShouldDefaultToEmptyObject()
    {
        // Arrange & Act
        var action = new AutomationAction();

        // Assert
        action.ConfigJson.Should().Be("{}");
    }

    [Theory]
    [InlineData(WorkflowSeverity.Info)]
    [InlineData(WorkflowSeverity.Warning)]
    [InlineData(WorkflowSeverity.Critical)]
    public void AutomationWorkflow_AllSeverityLevels_ShouldBeAssignable(WorkflowSeverity severity)
    {
        // Arrange & Act
        var workflow = new AutomationWorkflow
        {
            Id = Guid.NewGuid(),
            Name = $"Workflow with {severity} severity",
            Severity = severity
        };

        // Assert
        workflow.Severity.Should().Be(severity);
    }

    [Fact]
    public void AutomationWorkflow_TenantOverrideFlags_ShouldBeConfigurable()
    {
        // Arrange & Act
        var workflow = new AutomationWorkflow
        {
            Id = Guid.NewGuid(),
            Name = "Configurable Workflow",
            ScopeType = WorkflowScopeType.Global,
            IsEnforced = true,
            TenantCanDisable = true,
            TenantCanOverrideConditions = true
        };

        // Assert
        workflow.IsEnforced.Should().BeTrue();
        workflow.TenantCanDisable.Should().BeTrue();
        workflow.TenantCanOverrideConditions.Should().BeTrue();
    }

    #endregion
}
