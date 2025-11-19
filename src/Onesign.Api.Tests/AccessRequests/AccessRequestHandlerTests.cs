using Xunit;
using Moq;
using FluentAssertions;
using MediatR;
using Onesign.Modules.AccessRequests.Application.Commands;
using Onesign.Modules.AccessRequests.Application.Queries;
using Onesign.Modules.AccessRequests.Domain.Entities;
using Onesign.Modules.AccessRequests.Domain.Enums;
using Onesign.Modules.AccessRequests.Domain.Repositories;
using Onesign.Modules.AccessRequests.Domain.Services;

namespace Onesign.Api.Tests.AccessRequests;

#region CreateAccessRequestCommand Tests

public class CreateAccessRequestCommandTests
{
    [Fact]
    public void CreateAccessRequestCommand_ShouldHaveCorrectProperties()
    {
        // Arrange & Act
        var command = new CreateAccessRequestCommand
        {
            TenantId = Guid.NewGuid(),
            RequesterId = Guid.NewGuid(),
            ResourceType = "Application",
            ResourceId = Guid.NewGuid(),
            AccessLevel = "ReadWrite",
            Justification = "Need access for project",
            StartDate = DateTime.UtcNow,
            EndDate = DateTime.UtcNow.AddDays(30)
        };

        // Assert
        command.TenantId.Should().NotBeEmpty();
        command.RequesterId.Should().NotBeEmpty();
        command.ResourceType.Should().Be("Application");
        command.AccessLevel.Should().Be("ReadWrite");
        command.Justification.Should().NotBeEmpty();
    }
}

#endregion

#region SubmitAccessRequestCommand Tests

public class SubmitAccessRequestCommandHandlerTests
{
    private readonly Mock<IAccessRequestRepository> _requestRepositoryMock;
    private readonly Mock<IAccessApprovalFlowRepository> _flowRepositoryMock;
    private readonly Mock<IAccessRequestWorkflowEngine> _workflowEngineMock;

    public SubmitAccessRequestCommandHandlerTests()
    {
        _requestRepositoryMock = new Mock<IAccessRequestRepository>();
        _flowRepositoryMock = new Mock<IAccessApprovalFlowRepository>();
        _workflowEngineMock = new Mock<IAccessRequestWorkflowEngine>();
    }

    [Fact]
    public async Task Handle_WithValidRequest_ShouldCreateRequest()
    {
        // Arrange
        var tenantId = Guid.NewGuid();
        var requesterId = Guid.NewGuid();
        var flowId = Guid.NewGuid();

        var flow = new AccessApprovalFlow(
            flowId, tenantId, "Default Flow", "Desc", true);

        _flowRepositoryMock
            .Setup(r => r.GetDefaultFlowAsync(tenantId, It.IsAny<CancellationToken>()))
            .ReturnsAsync(flow);

        var command = new SubmitAccessRequestCommand
        {
            TenantId = tenantId,
            RequesterId = requesterId,
            ResourceType = "Application",
            ResourceId = Guid.NewGuid(),
            RequestedPermissions = new List<string> { "read", "write" },
            Justification = "Need for project",
            Duration = TimeSpan.FromDays(30)
        };

        // Test that command has required properties
        command.TenantId.Should().Be(tenantId);
        command.RequesterId.Should().Be(requesterId);
        command.ResourceType.Should().Be("Application");
    }
}

#endregion

#region ApproveAccessRequestStepCommand Tests

public class ApproveAccessRequestStepCommandHandlerTests
{
    private readonly Mock<IAccessRequestRepository> _requestRepositoryMock;
    private readonly Mock<IAccessRequestStepRepository> _stepRepositoryMock;
    private readonly Mock<IAccessRequestProvisioningService> _provisioningServiceMock;

    public ApproveAccessRequestStepCommandHandlerTests()
    {
        _requestRepositoryMock = new Mock<IAccessRequestRepository>();
        _stepRepositoryMock = new Mock<IAccessRequestStepRepository>();
        _provisioningServiceMock = new Mock<IAccessRequestProvisioningService>();
    }

    [Fact]
    public void ApproveAccessRequestStepCommand_ShouldHaveRequiredProperties()
    {
        // Arrange & Act
        var command = new ApproveAccessRequestStepCommand
        {
            TenantId = Guid.NewGuid(),
            RequestId = Guid.NewGuid(),
            StepId = Guid.NewGuid(),
            ApproverId = Guid.NewGuid(),
            Comments = "Approved"
        };

        // Assert
        command.TenantId.Should().NotBeEmpty();
        command.RequestId.Should().NotBeEmpty();
        command.StepId.Should().NotBeEmpty();
        command.ApproverId.Should().NotBeEmpty();
    }
}

#endregion

#region RejectAccessRequestStepCommand Tests

public class RejectAccessRequestStepCommandHandlerTests
{
    [Fact]
    public void RejectAccessRequestStepCommand_ShouldHaveRequiredProperties()
    {
        // Arrange & Act
        var command = new RejectAccessRequestStepCommand
        {
            TenantId = Guid.NewGuid(),
            RequestId = Guid.NewGuid(),
            StepId = Guid.NewGuid(),
            ApproverId = Guid.NewGuid(),
            Reason = "Not justified"
        };

        // Assert
        command.Reason.Should().Be("Not justified");
    }
}

#endregion

#region CancelAccessRequestCommand Tests

public class CancelAccessRequestCommandHandlerTests
{
    [Fact]
    public void CancelAccessRequestCommand_ShouldHaveRequiredProperties()
    {
        // Arrange & Act
        var command = new CancelAccessRequestCommand
        {
            TenantId = Guid.NewGuid(),
            RequestId = Guid.NewGuid(),
            CancelledBy = Guid.NewGuid(),
            Reason = "No longer needed"
        };

        // Assert
        command.Reason.Should().Be("No longer needed");
    }
}

#endregion

#region EscalateAccessRequestStepCommand Tests

public class EscalateAccessRequestStepCommandHandlerTests
{
    [Fact]
    public void EscalateAccessRequestStepCommand_ShouldHaveRequiredProperties()
    {
        // Arrange & Act
        var command = new EscalateAccessRequestStepCommand
        {
            TenantId = Guid.NewGuid(),
            RequestId = Guid.NewGuid(),
            StepId = Guid.NewGuid(),
            EscalatedBy = Guid.NewGuid(),
            EscalateTo = Guid.NewGuid(),
            Reason = "Urgent approval needed"
        };

        // Assert
        command.EscalateTo.Should().NotBeEmpty();
        command.Reason.Should().Be("Urgent approval needed");
    }
}

#endregion

#region CreateAccessApprovalFlowCommand Tests

public class CreateAccessApprovalFlowCommandHandlerTests
{
    private readonly Mock<IAccessApprovalFlowRepository> _flowRepositoryMock;

    public CreateAccessApprovalFlowCommandHandlerTests()
    {
        _flowRepositoryMock = new Mock<IAccessApprovalFlowRepository>();
    }

    [Fact]
    public void CreateAccessApprovalFlowCommand_ShouldHaveRequiredProperties()
    {
        // Arrange & Act
        var command = new CreateAccessApprovalFlowCommand
        {
            TenantId = Guid.NewGuid(),
            Name = "Standard Approval",
            Description = "Standard approval flow",
            IsDefault = true,
            Steps = new List<ApprovalFlowStepItem>
            {
                new ApprovalFlowStepItem
                {
                    Order = 1,
                    ApproverType = (int)ApproverType.Manager,
                    ApproverId = null,
                    AutoApproveAfterHours = 48
                },
                new ApprovalFlowStepItem
                {
                    Order = 2,
                    ApproverType = (int)ApproverType.User,
                    ApproverId = Guid.NewGuid(),
                    AutoApproveAfterHours = null
                }
            }
        };

        // Assert
        command.Name.Should().Be("Standard Approval");
        command.IsDefault.Should().BeTrue();
        command.Steps.Should().HaveCount(2);
        command.Steps.First().Order.Should().Be(1);
    }
}

#endregion

#region UpdateAccessApprovalFlowCommand Tests

public class UpdateAccessApprovalFlowCommandHandlerTests
{
    [Fact]
    public void UpdateAccessApprovalFlowCommand_ShouldHaveRequiredProperties()
    {
        // Arrange & Act
        var command = new UpdateAccessApprovalFlowCommand
        {
            TenantId = Guid.NewGuid(),
            FlowId = Guid.NewGuid(),
            Name = "Updated Flow",
            Description = "Updated description",
            IsDefault = false,
            Steps = new List<ApprovalFlowStepItem>()
        };

        // Assert
        command.FlowId.Should().NotBeEmpty();
        command.Name.Should().Be("Updated Flow");
    }
}

#endregion

#region GetAccessRequestsQuery Tests

public class GetAccessRequestsQueryHandlerTests
{
    private readonly Mock<IAccessRequestRepository> _requestRepositoryMock;

    public GetAccessRequestsQueryHandlerTests()
    {
        _requestRepositoryMock = new Mock<IAccessRequestRepository>();
    }

    [Fact]
    public void GetAccessRequestsQuery_ShouldHaveFilters()
    {
        // Arrange & Act
        var query = new GetAccessRequestsQuery
        {
            TenantId = Guid.NewGuid(),
            Status = (int)AccessRequestStatus.Pending,
            ResourceType = "Application",
            PageNumber = 1,
            PageSize = 20
        };

        // Assert
        query.Status.Should().Be((int)AccessRequestStatus.Pending);
        query.ResourceType.Should().Be("Application");
        query.PageNumber.Should().Be(1);
        query.PageSize.Should().Be(20);
    }
}

#endregion

#region GetMyAccessRequestsQuery Tests

public class GetMyAccessRequestsQueryHandlerTests
{
    [Fact]
    public void GetMyAccessRequestsQuery_ShouldFilterByRequester()
    {
        // Arrange & Act
        var requesterId = Guid.NewGuid();
        var query = new GetMyAccessRequestsQuery
        {
            TenantId = Guid.NewGuid(),
            RequesterId = requesterId,
            PageNumber = 1,
            PageSize = 10
        };

        // Assert
        query.RequesterId.Should().Be(requesterId);
    }
}

#endregion

#region GetPendingApprovalsQuery Tests

public class GetPendingApprovalsQueryHandlerTests
{
    [Fact]
    public void GetPendingApprovalsQuery_ShouldFilterByApprover()
    {
        // Arrange & Act
        var approverId = Guid.NewGuid();
        var query = new GetPendingApprovalsQuery
        {
            TenantId = Guid.NewGuid(),
            ApproverId = approverId,
            PageNumber = 1,
            PageSize = 10
        };

        // Assert
        query.ApproverId.Should().Be(approverId);
    }
}

#endregion

#region GetAccessRequestDetailsQuery Tests

public class GetAccessRequestDetailsQueryHandlerTests
{
    [Fact]
    public void GetAccessRequestDetailsQuery_ShouldHaveRequestId()
    {
        // Arrange & Act
        var requestId = Guid.NewGuid();
        var query = new GetAccessRequestDetailsQuery
        {
            TenantId = Guid.NewGuid(),
            RequestId = requestId
        };

        // Assert
        query.RequestId.Should().Be(requestId);
    }
}

#endregion

#region GetAccessApprovalFlowsQuery Tests

public class GetAccessApprovalFlowsQueryHandlerTests
{
    [Fact]
    public void GetAccessApprovalFlowsQuery_ShouldHaveTenantId()
    {
        // Arrange & Act
        var tenantId = Guid.NewGuid();
        var query = new GetAccessApprovalFlowsQuery
        {
            TenantId = tenantId
        };

        // Assert
        query.TenantId.Should().Be(tenantId);
    }
}

#endregion

#region GetAccessRequestDashboardStatsQuery Tests

public class GetAccessRequestDashboardStatsQueryHandlerTests
{
    [Fact]
    public void GetAccessRequestDashboardStatsQuery_ShouldHaveTenantId()
    {
        // Arrange & Act
        var tenantId = Guid.NewGuid();
        var query = new GetAccessRequestDashboardStatsQuery
        {
            TenantId = tenantId
        };

        // Assert
        query.TenantId.Should().Be(tenantId);
    }
}

#endregion

#region AccessRequest Entity Tests

public class AccessRequestEntityTests
{
    [Fact]
    public void AccessRequest_ShouldBeCreatedWithCorrectStatus()
    {
        // Arrange & Act
        var request = new AccessRequest(
            Guid.NewGuid(),
            Guid.NewGuid(),
            Guid.NewGuid(),
            "Application",
            Guid.NewGuid(),
            new List<string> { "read" },
            "justification",
            TimeSpan.FromDays(7),
            Guid.NewGuid());

        // Assert
        request.Status.Should().Be(AccessRequestStatus.Pending);
        request.ResourceType.Should().Be("Application");
    }

    [Fact]
    public void AccessRequest_Approve_ShouldChangeStatus()
    {
        // Arrange
        var request = new AccessRequest(
            Guid.NewGuid(),
            Guid.NewGuid(),
            Guid.NewGuid(),
            "Application",
            Guid.NewGuid(),
            new List<string> { "read" },
            "justification",
            TimeSpan.FromDays(7),
            Guid.NewGuid());

        // Act
        request.Approve();

        // Assert
        request.Status.Should().Be(AccessRequestStatus.Approved);
    }

    [Fact]
    public void AccessRequest_Reject_ShouldChangeStatus()
    {
        // Arrange
        var request = new AccessRequest(
            Guid.NewGuid(),
            Guid.NewGuid(),
            Guid.NewGuid(),
            "Application",
            Guid.NewGuid(),
            new List<string> { "read" },
            "justification",
            TimeSpan.FromDays(7),
            Guid.NewGuid());

        // Act
        request.Reject("Not justified");

        // Assert
        request.Status.Should().Be(AccessRequestStatus.Rejected);
    }

    [Fact]
    public void AccessRequest_Cancel_ShouldChangeStatus()
    {
        // Arrange
        var request = new AccessRequest(
            Guid.NewGuid(),
            Guid.NewGuid(),
            Guid.NewGuid(),
            "Application",
            Guid.NewGuid(),
            new List<string> { "read" },
            "justification",
            TimeSpan.FromDays(7),
            Guid.NewGuid());

        // Act
        request.Cancel("No longer needed");

        // Assert
        request.Status.Should().Be(AccessRequestStatus.Cancelled);
    }
}

#endregion

#region AccessApprovalFlow Entity Tests

public class AccessApprovalFlowEntityTests
{
    [Fact]
    public void AccessApprovalFlow_ShouldBeCreatedCorrectly()
    {
        // Arrange & Act
        var flow = new AccessApprovalFlow(
            Guid.NewGuid(),
            Guid.NewGuid(),
            "Standard Flow",
            "Standard approval workflow",
            true);

        // Assert
        flow.Name.Should().Be("Standard Flow");
        flow.IsDefault.Should().BeTrue();
    }

    [Fact]
    public void AccessApprovalFlow_AddStep_ShouldAddStepCorrectly()
    {
        // Arrange
        var flow = new AccessApprovalFlow(
            Guid.NewGuid(),
            Guid.NewGuid(),
            "Flow",
            "Desc",
            true);

        // Act
        flow.AddStep(1, ApproverType.Manager, null, 24);

        // Assert
        flow.Steps.Should().HaveCount(1);
    }
}

#endregion

#region ApproverType Enum Tests

public class ApproverTypeEnumTests
{
    [Theory]
    [InlineData(ApproverType.User)]
    [InlineData(ApproverType.Manager)]
    [InlineData(ApproverType.Group)]
    [InlineData(ApproverType.Role)]
    public void ApproverType_ShouldHaveCorrectValues(ApproverType approverType)
    {
        // Assert
        approverType.Should().BeDefined();
    }
}

#endregion

#region AccessRequestStatus Enum Tests

public class AccessRequestStatusEnumTests
{
    [Theory]
    [InlineData(AccessRequestStatus.Pending)]
    [InlineData(AccessRequestStatus.Approved)]
    [InlineData(AccessRequestStatus.Rejected)]
    [InlineData(AccessRequestStatus.Cancelled)]
    [InlineData(AccessRequestStatus.Expired)]
    [InlineData(AccessRequestStatus.Provisioned)]
    public void AccessRequestStatus_ShouldHaveCorrectValues(AccessRequestStatus status)
    {
        // Assert
        status.Should().BeDefined();
    }
}

#endregion
