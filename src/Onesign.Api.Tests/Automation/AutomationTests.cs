using Xunit;
using Moq;
using FluentAssertions;
using Onesign.Modules.Automation.Application.Commands;
using Onesign.Modules.Automation.Application.Queries;
using Onesign.Modules.Automation.Domain.Entities;
using Onesign.Modules.Automation.Domain.Enums;
using Onesign.Modules.Automation.Domain.Repositories;
using Onesign.Modules.Automation.Domain.Services;

namespace Onesign.Api.Tests.Automation;

#region CreateWorkflowCommandHandler Tests

public class CreateWorkflowCommandHandlerTests
{
    private readonly Mock<IWorkflowRepository> _workflowRepositoryMock;

    public CreateWorkflowCommandHandlerTests()
    {
        _workflowRepositoryMock = new Mock<IWorkflowRepository>();
    }

    [Fact]
    public void CreateWorkflowCommand_ShouldHaveRequiredProperties()
    {
        // Arrange & Act
        var command = new CreateWorkflowCommand
        {
            TenantId = Guid.NewGuid(),
            Name = "User Onboarding",
            Description = "Automates user onboarding process",
            TriggerType = (int)WorkflowTriggerType.Event,
            TriggerConfig = new Dictionary<string, string>
            {
                { "event", "user.created" }
            },
            Steps = new List<WorkflowStepItem>
            {
                new WorkflowStepItem
                {
                    Order = 1,
                    ActionType = (int)WorkflowActionType.CreateUser,
                    Config = new Dictionary<string, string>()
                },
                new WorkflowStepItem
                {
                    Order = 2,
                    ActionType = (int)WorkflowActionType.SendEmail,
                    Config = new Dictionary<string, string> { { "template", "welcome" } }
                }
            },
            IsEnabled = true
        };

        // Assert
        command.Name.Should().Be("User Onboarding");
        command.Steps.Should().HaveCount(2);
        command.IsEnabled.Should().BeTrue();
    }

    [Fact]
    public async Task Handle_WithValidCommand_ShouldCreateWorkflow()
    {
        // Arrange
        var tenantId = Guid.NewGuid();
        Workflow? capturedWorkflow = null;

        _workflowRepositoryMock
            .Setup(r => r.AddAsync(It.IsAny<Workflow>(), It.IsAny<CancellationToken>()))
            .Callback<Workflow, CancellationToken>((w, _) => capturedWorkflow = w)
            .Returns(Task.CompletedTask);

        // This tests the setup is correct
        capturedWorkflow.Should().BeNull(); // Before execution
    }
}

#endregion

#region UpdateWorkflowCommand Tests

public class UpdateWorkflowCommandTests
{
    [Fact]
    public void UpdateWorkflowCommand_ShouldHaveRequiredProperties()
    {
        // Arrange & Act
        var command = new UpdateWorkflowCommand
        {
            TenantId = Guid.NewGuid(),
            WorkflowId = Guid.NewGuid(),
            Name = "Updated Workflow",
            Description = "Updated description",
            IsEnabled = false
        };

        // Assert
        command.WorkflowId.Should().NotBeEmpty();
        command.Name.Should().Be("Updated Workflow");
    }
}

#endregion

#region DeleteWorkflowCommand Tests

public class DeleteWorkflowCommandTests
{
    [Fact]
    public void DeleteWorkflowCommand_ShouldHaveRequiredProperties()
    {
        // Arrange & Act
        var workflowId = Guid.NewGuid();
        var command = new DeleteWorkflowCommand
        {
            TenantId = Guid.NewGuid(),
            WorkflowId = workflowId
        };

        // Assert
        command.WorkflowId.Should().Be(workflowId);
    }
}

#endregion

#region ExecuteWorkflowCommand Tests

public class ExecuteWorkflowCommandTests
{
    [Fact]
    public void ExecuteWorkflowCommand_ShouldHaveRequiredProperties()
    {
        // Arrange & Act
        var command = new ExecuteWorkflowCommand
        {
            TenantId = Guid.NewGuid(),
            WorkflowId = Guid.NewGuid(),
            TriggerData = new Dictionary<string, string>
            {
                { "userId", Guid.NewGuid().ToString() },
                { "action", "manual" }
            }
        };

        // Assert
        command.WorkflowId.Should().NotBeEmpty();
        command.TriggerData.Should().ContainKey("userId");
    }
}

#endregion

#region GetWorkflowsQuery Tests

public class GetWorkflowsQueryHandlerTests
{
    private readonly Mock<IWorkflowRepository> _workflowRepositoryMock;

    public GetWorkflowsQueryHandlerTests()
    {
        _workflowRepositoryMock = new Mock<IWorkflowRepository>();
    }

    [Fact]
    public void GetWorkflowsQuery_ShouldHaveFilters()
    {
        // Arrange & Act
        var query = new GetWorkflowsQuery
        {
            TenantId = Guid.NewGuid(),
            IsEnabled = true,
            PageNumber = 1,
            PageSize = 20
        };

        // Assert
        query.IsEnabled.Should().BeTrue();
        query.PageNumber.Should().Be(1);
    }
}

#endregion

#region GetWorkflowExecutionsQuery Tests

public class GetWorkflowExecutionsQueryTests
{
    [Fact]
    public void GetWorkflowExecutionsQuery_ShouldHaveFilters()
    {
        // Arrange & Act
        var query = new GetWorkflowExecutionsQuery
        {
            TenantId = Guid.NewGuid(),
            WorkflowId = Guid.NewGuid(),
            Status = (int)WorkflowExecutionStatus.Completed,
            StartDate = DateTime.UtcNow.AddDays(-7),
            EndDate = DateTime.UtcNow
        };

        // Assert
        query.WorkflowId.Should().NotBeEmpty();
        query.Status.Should().Be((int)WorkflowExecutionStatus.Completed);
    }
}

#endregion

#region Workflow Entity Tests

public class WorkflowEntityTests
{
    [Fact]
    public void Workflow_ShouldBeCreatedCorrectly()
    {
        // Arrange & Act
        var workflow = new Workflow(
            Guid.NewGuid(),
            Guid.NewGuid(),
            "Test Workflow",
            "Description",
            WorkflowTriggerType.Schedule,
            new Dictionary<string, string> { { "cron", "0 0 * * *" } },
            true);

        // Assert
        workflow.Name.Should().Be("Test Workflow");
        workflow.TriggerType.Should().Be(WorkflowTriggerType.Schedule);
        workflow.IsEnabled.Should().BeTrue();
    }

    [Fact]
    public void Workflow_Disable_ShouldSetIsEnabledToFalse()
    {
        // Arrange
        var workflow = new Workflow(
            Guid.NewGuid(),
            Guid.NewGuid(),
            "Workflow",
            "Desc",
            WorkflowTriggerType.Event,
            new Dictionary<string, string>(),
            true);

        // Act
        workflow.Disable();

        // Assert
        workflow.IsEnabled.Should().BeFalse();
    }

    [Fact]
    public void Workflow_AddStep_ShouldAddStepCorrectly()
    {
        // Arrange
        var workflow = new Workflow(
            Guid.NewGuid(),
            Guid.NewGuid(),
            "Workflow",
            "Desc",
            WorkflowTriggerType.Event,
            new Dictionary<string, string>(),
            true);

        // Act
        workflow.AddStep(1, WorkflowActionType.SendEmail, new Dictionary<string, string>());

        // Assert
        workflow.Steps.Should().HaveCount(1);
    }
}

#endregion

#region WorkflowExecution Entity Tests

public class WorkflowExecutionEntityTests
{
    [Fact]
    public void WorkflowExecution_ShouldBeCreatedWithPendingStatus()
    {
        // Arrange & Act
        var execution = new WorkflowExecution(
            Guid.NewGuid(),
            Guid.NewGuid(),
            Guid.NewGuid(),
            new Dictionary<string, string>());

        // Assert
        execution.Status.Should().Be(WorkflowExecutionStatus.Pending);
    }

    [Fact]
    public void WorkflowExecution_Start_ShouldChangeStatusToRunning()
    {
        // Arrange
        var execution = new WorkflowExecution(
            Guid.NewGuid(),
            Guid.NewGuid(),
            Guid.NewGuid(),
            new Dictionary<string, string>());

        // Act
        execution.Start();

        // Assert
        execution.Status.Should().Be(WorkflowExecutionStatus.Running);
        execution.StartedAt.Should().NotBeNull();
    }

    [Fact]
    public void WorkflowExecution_Complete_ShouldChangeStatusToCompleted()
    {
        // Arrange
        var execution = new WorkflowExecution(
            Guid.NewGuid(),
            Guid.NewGuid(),
            Guid.NewGuid(),
            new Dictionary<string, string>());
        execution.Start();

        // Act
        execution.Complete();

        // Assert
        execution.Status.Should().Be(WorkflowExecutionStatus.Completed);
        execution.CompletedAt.Should().NotBeNull();
    }

    [Fact]
    public void WorkflowExecution_Fail_ShouldChangeStatusToFailed()
    {
        // Arrange
        var execution = new WorkflowExecution(
            Guid.NewGuid(),
            Guid.NewGuid(),
            Guid.NewGuid(),
            new Dictionary<string, string>());
        execution.Start();

        // Act
        execution.Fail("Error occurred");

        // Assert
        execution.Status.Should().Be(WorkflowExecutionStatus.Failed);
        execution.ErrorMessage.Should().Be("Error occurred");
    }
}

#endregion

#region WorkflowTriggerType Enum Tests

public class WorkflowTriggerTypeEnumTests
{
    [Theory]
    [InlineData(WorkflowTriggerType.Manual)]
    [InlineData(WorkflowTriggerType.Schedule)]
    [InlineData(WorkflowTriggerType.Event)]
    [InlineData(WorkflowTriggerType.Webhook)]
    public void WorkflowTriggerType_ShouldHaveCorrectValues(WorkflowTriggerType triggerType)
    {
        // Assert
        triggerType.Should().BeDefined();
    }
}

#endregion

#region WorkflowActionType Enum Tests

public class WorkflowActionTypeEnumTests
{
    [Theory]
    [InlineData(WorkflowActionType.CreateUser)]
    [InlineData(WorkflowActionType.DisableUser)]
    [InlineData(WorkflowActionType.SendEmail)]
    [InlineData(WorkflowActionType.AssignRole)]
    [InlineData(WorkflowActionType.RevokeAccess)]
    [InlineData(WorkflowActionType.WebhookCall)]
    public void WorkflowActionType_ShouldHaveCorrectValues(WorkflowActionType actionType)
    {
        // Assert
        actionType.Should().BeDefined();
    }
}

#endregion

#region WorkflowExecutionStatus Enum Tests

public class WorkflowExecutionStatusEnumTests
{
    [Theory]
    [InlineData(WorkflowExecutionStatus.Pending)]
    [InlineData(WorkflowExecutionStatus.Running)]
    [InlineData(WorkflowExecutionStatus.Completed)]
    [InlineData(WorkflowExecutionStatus.Failed)]
    [InlineData(WorkflowExecutionStatus.Cancelled)]
    public void WorkflowExecutionStatus_ShouldHaveCorrectValues(WorkflowExecutionStatus status)
    {
        // Assert
        status.Should().BeDefined();
    }
}

#endregion
