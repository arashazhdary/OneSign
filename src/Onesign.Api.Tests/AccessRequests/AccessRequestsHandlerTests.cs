using FluentAssertions;
using Moq;
using Onesign.Modules.AccessRequests.Application.Commands;
using Onesign.Modules.AccessRequests.Application.DTOs;
using Onesign.Modules.AccessRequests.Application.Handlers;
using Onesign.Modules.AccessRequests.Application.Queries;
using Onesign.Modules.AccessRequests.Domain.Entities;
using Onesign.Modules.AccessRequests.Domain.Enums;
using Onesign.Modules.AccessRequests.Domain.Repositories;
using Onesign.Modules.AccessRequests.Domain.Services;

namespace Onesign.Api.Tests.AccessRequests;

public class AccessRequestsHandlerTests
{
    private readonly Mock<IAccessRequestRepository> _repositoryMock;
    private readonly Mock<IWorkflowEngine> _workflowEngineMock;

    public AccessRequestsHandlerTests()
    {
        _repositoryMock = new Mock<IAccessRequestRepository>();
        _workflowEngineMock = new Mock<IWorkflowEngine>();
    }

    #region CreateAccessRequestCommandHandler Tests

    [Fact]
    public async Task CreateAccessRequest_WithValidCommand_ReturnsSuccess()
    {
        // Arrange
        var handler = new CreateAccessRequestCommandHandler(_repositoryMock.Object, _workflowEngineMock.Object);

        var command = new CreateAccessRequestCommand
        {
            TenantId = Guid.NewGuid(),
            RequesterId = Guid.NewGuid(),
            RequesterName = "John Doe",
            Justification = "Need access for project",
            Items = new List<AccessRequestItemDto>
            {
                new AccessRequestItemDto
                {
                    AccessType = "Role",
                    TargetId = Guid.NewGuid(),
                    TargetName = "Admin",
                    DurationMinutes = 60
                }
            }
        };

        // Act
        var result = await handler.Handle(command, CancellationToken.None);

        // Assert
        result.IsSuccess.Should().BeTrue();
        result.Value.Should().NotBeNull();
        result.Value!.RequesterName.Should().Be("John Doe");
        result.Value.Status.Should().Be("Pending");
        _repositoryMock.Verify(
            x => x.AddAsync(It.IsAny<AccessRequest>(), It.IsAny<CancellationToken>()),
            Times.Once);
        _workflowEngineMock.Verify(
            x => x.InitializeWorkflowAsync(It.IsAny<AccessRequest>(), It.IsAny<CancellationToken>()),
            Times.Once);
    }

    [Fact]
    public async Task CreateAccessRequest_CreatesCorrectNumberOfItems()
    {
        // Arrange
        var handler = new CreateAccessRequestCommandHandler(_repositoryMock.Object, _workflowEngineMock.Object);

        var command = new CreateAccessRequestCommand
        {
            TenantId = Guid.NewGuid(),
            RequesterId = Guid.NewGuid(),
            RequesterName = "John Doe",
            Items = new List<AccessRequestItemDto>
            {
                new AccessRequestItemDto { AccessType = "Role", TargetId = Guid.NewGuid(), TargetName = "Admin" },
                new AccessRequestItemDto { AccessType = "Group", TargetId = Guid.NewGuid(), TargetName = "Developers" }
            }
        };

        // Act
        var result = await handler.Handle(command, CancellationToken.None);

        // Assert
        result.Value!.Items.Should().HaveCount(2);
    }

    [Fact]
    public async Task CreateAccessRequest_SetsCorrectStatus()
    {
        // Arrange
        var handler = new CreateAccessRequestCommandHandler(_repositoryMock.Object, _workflowEngineMock.Object);

        var command = new CreateAccessRequestCommand
        {
            TenantId = Guid.NewGuid(),
            RequesterId = Guid.NewGuid(),
            RequesterName = "John Doe",
            Items = new List<AccessRequestItemDto>
            {
                new AccessRequestItemDto { AccessType = "Role", TargetId = Guid.NewGuid(), TargetName = "Admin" }
            }
        };

        AccessRequest? savedRequest = null;
        _repositoryMock
            .Setup(x => x.AddAsync(It.IsAny<AccessRequest>(), It.IsAny<CancellationToken>()))
            .Callback<AccessRequest, CancellationToken>((r, ct) => savedRequest = r)
            .Returns(Task.CompletedTask);

        // Act
        await handler.Handle(command, CancellationToken.None);

        // Assert
        savedRequest!.Status.Should().Be(RequestStatus.Pending);
        savedRequest.Items.All(i => i.Status == RequestStatus.Pending).Should().BeTrue();
    }

    #endregion

    #region ProcessApprovalCommandHandler Tests

    [Fact]
    public async Task ProcessApproval_WithApproved_ReturnsSuccess()
    {
        // Arrange
        var handler = new ProcessApprovalCommandHandler(_workflowEngineMock.Object);

        var command = new ProcessApprovalCommand
        {
            RequestId = Guid.NewGuid(),
            ApproverId = Guid.NewGuid(),
            Approved = true,
            Comment = "Looks good"
        };

        // Act
        var result = await handler.Handle(command, CancellationToken.None);

        // Assert
        result.IsSuccess.Should().BeTrue();
        result.Value.Should().BeTrue();
        _workflowEngineMock.Verify(
            x => x.ProcessApprovalAsync(command.RequestId, command.ApproverId, true, "Looks good", It.IsAny<CancellationToken>()),
            Times.Once);
    }

    [Fact]
    public async Task ProcessApproval_WithRejected_ReturnsSuccess()
    {
        // Arrange
        var handler = new ProcessApprovalCommandHandler(_workflowEngineMock.Object);

        var command = new ProcessApprovalCommand
        {
            RequestId = Guid.NewGuid(),
            ApproverId = Guid.NewGuid(),
            Approved = false,
            Comment = "Not justified"
        };

        // Act
        var result = await handler.Handle(command, CancellationToken.None);

        // Assert
        result.IsSuccess.Should().BeTrue();
        _workflowEngineMock.Verify(
            x => x.ProcessApprovalAsync(command.RequestId, command.ApproverId, false, "Not justified", It.IsAny<CancellationToken>()),
            Times.Once);
    }

    [Fact]
    public async Task ProcessApproval_WhenWorkflowEngineThrows_ReturnsFailure()
    {
        // Arrange
        var handler = new ProcessApprovalCommandHandler(_workflowEngineMock.Object);

        var command = new ProcessApprovalCommand
        {
            RequestId = Guid.NewGuid(),
            ApproverId = Guid.NewGuid(),
            Approved = true
        };

        _workflowEngineMock
            .Setup(x => x.ProcessApprovalAsync(It.IsAny<Guid>(), It.IsAny<Guid>(), It.IsAny<bool>(), It.IsAny<string?>(), It.IsAny<CancellationToken>()))
            .ThrowsAsync(new Exception("Request not found"));

        // Act
        var result = await handler.Handle(command, CancellationToken.None);

        // Assert
        result.IsFailure.Should().BeTrue();
        result.ErrorCode.Should().Be("ProcessApprovalFailed");
    }

    #endregion

    #region GetAccessRequestsQueryHandler Tests

    [Fact]
    public async Task GetAccessRequests_ByTenant_ReturnsRequests()
    {
        // Arrange
        var handler = new GetAccessRequestsQueryHandler(_repositoryMock.Object);

        var tenantId = Guid.NewGuid();
        var requests = new List<AccessRequest>
        {
            new AccessRequest { Id = Guid.NewGuid(), RequesterName = "John", Status = RequestStatus.Pending, Items = new List<AccessRequestItem>(), ApprovalSteps = new List<ApprovalStep>() },
            new AccessRequest { Id = Guid.NewGuid(), RequesterName = "Jane", Status = RequestStatus.Approved, Items = new List<AccessRequestItem>(), ApprovalSteps = new List<ApprovalStep>() }
        };

        var query = new GetAccessRequestsQuery { TenantId = tenantId };

        _repositoryMock
            .Setup(x => x.GetByTenantIdAsync(tenantId, It.IsAny<CancellationToken>()))
            .ReturnsAsync(requests);

        // Act
        var result = await handler.Handle(query, CancellationToken.None);

        // Assert
        result.IsSuccess.Should().BeTrue();
        result.Value.Should().HaveCount(2);
    }

    [Fact]
    public async Task GetAccessRequests_ByRequester_ReturnsFilteredRequests()
    {
        // Arrange
        var handler = new GetAccessRequestsQueryHandler(_repositoryMock.Object);

        var tenantId = Guid.NewGuid();
        var requesterId = Guid.NewGuid();
        var requests = new List<AccessRequest>
        {
            new AccessRequest { Id = Guid.NewGuid(), RequesterId = requesterId, RequesterName = "John", Status = RequestStatus.Pending, Items = new List<AccessRequestItem>(), ApprovalSteps = new List<ApprovalStep>() }
        };

        var query = new GetAccessRequestsQuery { TenantId = tenantId, RequesterId = requesterId };

        _repositoryMock
            .Setup(x => x.GetByRequesterAsync(tenantId, requesterId, It.IsAny<CancellationToken>()))
            .ReturnsAsync(requests);

        // Act
        var result = await handler.Handle(query, CancellationToken.None);

        // Assert
        result.IsSuccess.Should().BeTrue();
        result.Value.Should().HaveCount(1);
    }

    [Fact]
    public async Task GetAccessRequests_ByApprover_ReturnsPendingForApprover()
    {
        // Arrange
        var handler = new GetAccessRequestsQueryHandler(_repositoryMock.Object);

        var tenantId = Guid.NewGuid();
        var approverId = Guid.NewGuid();
        var requests = new List<AccessRequest>
        {
            new AccessRequest { Id = Guid.NewGuid(), RequesterName = "John", Status = RequestStatus.Pending, Items = new List<AccessRequestItem>(), ApprovalSteps = new List<ApprovalStep>() }
        };

        var query = new GetAccessRequestsQuery { TenantId = tenantId, ApproverId = approverId };

        _repositoryMock
            .Setup(x => x.GetPendingForApproverAsync(tenantId, approverId, It.IsAny<CancellationToken>()))
            .ReturnsAsync(requests);

        // Act
        var result = await handler.Handle(query, CancellationToken.None);

        // Assert
        result.IsSuccess.Should().BeTrue();
        result.Value.Should().HaveCount(1);
    }

    #endregion

    #region GetPendingApprovalsQueryHandler Tests

    [Fact]
    public async Task GetPendingApprovals_ReturnsPendingRequests()
    {
        // Arrange
        var handler = new GetPendingApprovalsQueryHandler(_repositoryMock.Object);

        var tenantId = Guid.NewGuid();
        var approverId = Guid.NewGuid();
        var requests = new List<AccessRequest>
        {
            new AccessRequest
            {
                Id = Guid.NewGuid(),
                RequesterName = "John",
                Status = RequestStatus.Pending,
                Items = new List<AccessRequestItem>(),
                ApprovalSteps = new List<ApprovalStep>
                {
                    new ApprovalStep { Id = Guid.NewGuid(), ApproverId = approverId, StepNumber = 1 }
                }
            }
        };

        var query = new GetPendingApprovalsQuery { TenantId = tenantId, ApproverId = approverId };

        _repositoryMock
            .Setup(x => x.GetPendingForApproverAsync(tenantId, approverId, It.IsAny<CancellationToken>()))
            .ReturnsAsync(requests);

        // Act
        var result = await handler.Handle(query, CancellationToken.None);

        // Assert
        result.IsSuccess.Should().BeTrue();
        result.Value.Should().HaveCount(1);
    }

    [Fact]
    public async Task GetPendingApprovals_MapsApprovalStepsCorrectly()
    {
        // Arrange
        var handler = new GetPendingApprovalsQueryHandler(_repositoryMock.Object);

        var tenantId = Guid.NewGuid();
        var approverId = Guid.NewGuid();
        var stepId = Guid.NewGuid();

        var requests = new List<AccessRequest>
        {
            new AccessRequest
            {
                Id = Guid.NewGuid(),
                RequesterName = "John",
                Status = RequestStatus.Pending,
                Items = new List<AccessRequestItem>(),
                ApprovalSteps = new List<ApprovalStep>
                {
                    new ApprovalStep
                    {
                        Id = stepId,
                        StepNumber = 1,
                        ApproverId = approverId,
                        ApproverName = "Jane Approver",
                        Action = ApprovalAction.Approved,
                        Comment = "LGTM",
                        ActionAt = DateTime.UtcNow
                    }
                }
            }
        };

        var query = new GetPendingApprovalsQuery { TenantId = tenantId, ApproverId = approverId };

        _repositoryMock
            .Setup(x => x.GetPendingForApproverAsync(tenantId, approverId, It.IsAny<CancellationToken>()))
            .ReturnsAsync(requests);

        // Act
        var result = await handler.Handle(query, CancellationToken.None);

        // Assert
        var step = result.Value![0].ApprovalSteps[0];
        step.Id.Should().Be(stepId);
        step.StepNumber.Should().Be(1);
        step.ApproverId.Should().Be(approverId);
        step.ApproverName.Should().Be("Jane Approver");
        step.Action.Should().Be("Approved");
        step.Comment.Should().Be("LGTM");
    }

    #endregion
}
