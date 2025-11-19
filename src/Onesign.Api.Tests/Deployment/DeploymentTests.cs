using Xunit;
using Moq;
using FluentAssertions;
using Onesign.Modules.Deployment.Application.Commands;
using Onesign.Modules.Deployment.Application.Queries;
using Onesign.Modules.Deployment.Domain.Entities;
using Onesign.Modules.Deployment.Domain.Enums;
using Onesign.Modules.Deployment.Domain.Repositories;

namespace Onesign.Api.Tests.Deployment;

#region CreateDeploymentCommand Tests

public class CreateDeploymentCommandTests
{
    [Fact]
    public void CreateDeploymentCommand_ShouldHaveRequiredProperties()
    {
        // Arrange & Act
        var command = new CreateDeploymentCommand
        {
            TenantId = Guid.NewGuid(),
            Name = "Production Release v2.0",
            Description = "Major release with new features",
            Environment = (int)DeploymentEnvironment.Production,
            Version = "2.0.0",
            ScheduledAt = DateTime.UtcNow.AddHours(2),
            CreatedBy = Guid.NewGuid(),
            Configuration = new Dictionary<string, string>
            {
                { "replicas", "3" },
                { "memory", "2Gi" }
            }
        };

        // Assert
        command.Name.Should().Be("Production Release v2.0");
        command.Environment.Should().Be((int)DeploymentEnvironment.Production);
        command.Version.Should().Be("2.0.0");
    }
}

#endregion

#region StartDeploymentCommand Tests

public class StartDeploymentCommandTests
{
    [Fact]
    public void StartDeploymentCommand_ShouldHaveRequiredProperties()
    {
        // Arrange & Act
        var command = new StartDeploymentCommand
        {
            TenantId = Guid.NewGuid(),
            DeploymentId = Guid.NewGuid(),
            StartedBy = Guid.NewGuid()
        };

        // Assert
        command.DeploymentId.Should().NotBeEmpty();
        command.StartedBy.Should().NotBeEmpty();
    }
}

#endregion

#region CancelDeploymentCommand Tests

public class CancelDeploymentCommandTests
{
    [Fact]
    public void CancelDeploymentCommand_ShouldHaveRequiredProperties()
    {
        // Arrange & Act
        var command = new CancelDeploymentCommand
        {
            TenantId = Guid.NewGuid(),
            DeploymentId = Guid.NewGuid(),
            CancelledBy = Guid.NewGuid(),
            Reason = "Configuration issue found"
        };

        // Assert
        command.Reason.Should().Be("Configuration issue found");
    }
}

#endregion

#region RollbackDeploymentCommand Tests

public class RollbackDeploymentCommandTests
{
    [Fact]
    public void RollbackDeploymentCommand_ShouldHaveRequiredProperties()
    {
        // Arrange & Act
        var command = new RollbackDeploymentCommand
        {
            TenantId = Guid.NewGuid(),
            DeploymentId = Guid.NewGuid(),
            RolledBackBy = Guid.NewGuid(),
            Reason = "Performance degradation detected",
            TargetVersion = "1.9.5"
        };

        // Assert
        command.Reason.Should().Be("Performance degradation detected");
        command.TargetVersion.Should().Be("1.9.5");
    }
}

#endregion

#region ApproveDeploymentCommand Tests

public class ApproveDeploymentCommandTests
{
    [Fact]
    public void ApproveDeploymentCommand_ShouldHaveRequiredProperties()
    {
        // Arrange & Act
        var command = new ApproveDeploymentCommand
        {
            TenantId = Guid.NewGuid(),
            DeploymentId = Guid.NewGuid(),
            ApprovedBy = Guid.NewGuid(),
            Comments = "Approved for production"
        };

        // Assert
        command.Comments.Should().Be("Approved for production");
    }
}

#endregion

#region GetDeploymentsQuery Tests

public class GetDeploymentsQueryTests
{
    [Fact]
    public void GetDeploymentsQuery_ShouldHaveFilters()
    {
        // Arrange & Act
        var query = new GetDeploymentsQuery
        {
            TenantId = Guid.NewGuid(),
            Environment = (int)DeploymentEnvironment.Production,
            Status = (int)DeploymentStatus.Completed,
            StartDate = DateTime.UtcNow.AddDays(-30),
            EndDate = DateTime.UtcNow,
            PageNumber = 1,
            PageSize = 20
        };

        // Assert
        query.Environment.Should().Be((int)DeploymentEnvironment.Production);
        query.Status.Should().Be((int)DeploymentStatus.Completed);
    }
}

#endregion

#region GetDeploymentDetailsQuery Tests

public class GetDeploymentDetailsQueryTests
{
    [Fact]
    public void GetDeploymentDetailsQuery_ShouldHaveDeploymentId()
    {
        // Arrange & Act
        var deploymentId = Guid.NewGuid();
        var query = new GetDeploymentDetailsQuery
        {
            TenantId = Guid.NewGuid(),
            DeploymentId = deploymentId
        };

        // Assert
        query.DeploymentId.Should().Be(deploymentId);
    }
}

#endregion

#region GetDeploymentLogsQuery Tests

public class GetDeploymentLogsQueryTests
{
    [Fact]
    public void GetDeploymentLogsQuery_ShouldHaveFilters()
    {
        // Arrange & Act
        var query = new GetDeploymentLogsQuery
        {
            TenantId = Guid.NewGuid(),
            DeploymentId = Guid.NewGuid(),
            PageNumber = 1,
            PageSize = 100
        };

        // Assert
        query.DeploymentId.Should().NotBeEmpty();
        query.PageSize.Should().Be(100);
    }
}

#endregion

#region GetEnvironmentStatusQuery Tests

public class GetEnvironmentStatusQueryTests
{
    [Fact]
    public void GetEnvironmentStatusQuery_ShouldHaveEnvironment()
    {
        // Arrange & Act
        var query = new GetEnvironmentStatusQuery
        {
            TenantId = Guid.NewGuid(),
            Environment = (int)DeploymentEnvironment.Staging
        };

        // Assert
        query.Environment.Should().Be((int)DeploymentEnvironment.Staging);
    }
}

#endregion

#region Deployment Entity Tests

public class DeploymentEntityTests
{
    [Fact]
    public void Deployment_ShouldBeCreatedWithPendingStatus()
    {
        // Arrange & Act
        var deployment = new Deployment(
            Guid.NewGuid(),
            Guid.NewGuid(),
            "Test Deployment",
            "Description",
            DeploymentEnvironment.Development,
            "1.0.0",
            Guid.NewGuid());

        // Assert
        deployment.Status.Should().Be(DeploymentStatus.Pending);
        deployment.Name.Should().Be("Test Deployment");
    }

    [Fact]
    public void Deployment_Start_ShouldChangeStatusToInProgress()
    {
        // Arrange
        var deployment = new Deployment(
            Guid.NewGuid(),
            Guid.NewGuid(),
            "Deployment",
            "Desc",
            DeploymentEnvironment.Development,
            "1.0.0",
            Guid.NewGuid());

        // Act
        deployment.Start(Guid.NewGuid());

        // Assert
        deployment.Status.Should().Be(DeploymentStatus.InProgress);
        deployment.StartedAt.Should().NotBeNull();
    }

    [Fact]
    public void Deployment_Complete_ShouldChangeStatusToCompleted()
    {
        // Arrange
        var deployment = new Deployment(
            Guid.NewGuid(),
            Guid.NewGuid(),
            "Deployment",
            "Desc",
            DeploymentEnvironment.Development,
            "1.0.0",
            Guid.NewGuid());
        deployment.Start(Guid.NewGuid());

        // Act
        deployment.Complete();

        // Assert
        deployment.Status.Should().Be(DeploymentStatus.Completed);
        deployment.CompletedAt.Should().NotBeNull();
    }

    [Fact]
    public void Deployment_Fail_ShouldChangeStatusToFailed()
    {
        // Arrange
        var deployment = new Deployment(
            Guid.NewGuid(),
            Guid.NewGuid(),
            "Deployment",
            "Desc",
            DeploymentEnvironment.Development,
            "1.0.0",
            Guid.NewGuid());
        deployment.Start(Guid.NewGuid());

        // Act
        deployment.Fail("Database migration failed");

        // Assert
        deployment.Status.Should().Be(DeploymentStatus.Failed);
        deployment.ErrorMessage.Should().Be("Database migration failed");
    }

    [Fact]
    public void Deployment_Cancel_ShouldChangeStatusToCancelled()
    {
        // Arrange
        var deployment = new Deployment(
            Guid.NewGuid(),
            Guid.NewGuid(),
            "Deployment",
            "Desc",
            DeploymentEnvironment.Development,
            "1.0.0",
            Guid.NewGuid());

        // Act
        deployment.Cancel(Guid.NewGuid(), "No longer needed");

        // Assert
        deployment.Status.Should().Be(DeploymentStatus.Cancelled);
    }

    [Fact]
    public void Deployment_Rollback_ShouldChangeStatusToRolledBack()
    {
        // Arrange
        var deployment = new Deployment(
            Guid.NewGuid(),
            Guid.NewGuid(),
            "Deployment",
            "Desc",
            DeploymentEnvironment.Development,
            "1.0.0",
            Guid.NewGuid());
        deployment.Start(Guid.NewGuid());
        deployment.Complete();

        // Act
        deployment.Rollback(Guid.NewGuid(), "Issue found");

        // Assert
        deployment.Status.Should().Be(DeploymentStatus.RolledBack);
    }

    [Fact]
    public void Deployment_Approve_ShouldSetApprovalDetails()
    {
        // Arrange
        var deployment = new Deployment(
            Guid.NewGuid(),
            Guid.NewGuid(),
            "Deployment",
            "Desc",
            DeploymentEnvironment.Production,
            "1.0.0",
            Guid.NewGuid());

        var approverId = Guid.NewGuid();

        // Act
        deployment.Approve(approverId, "Approved");

        // Assert
        deployment.ApprovedBy.Should().Be(approverId);
        deployment.ApprovedAt.Should().NotBeNull();
    }

    [Fact]
    public void Deployment_AddLog_ShouldAddLogEntry()
    {
        // Arrange
        var deployment = new Deployment(
            Guid.NewGuid(),
            Guid.NewGuid(),
            "Deployment",
            "Desc",
            DeploymentEnvironment.Development,
            "1.0.0",
            Guid.NewGuid());

        // Act
        deployment.AddLog("Starting deployment", DeploymentLogLevel.Info);
        deployment.AddLog("Deployment complete", DeploymentLogLevel.Info);

        // Assert
        deployment.Logs.Should().HaveCount(2);
    }
}

#endregion

#region DeploymentLog Entity Tests

public class DeploymentLogEntityTests
{
    [Fact]
    public void DeploymentLog_ShouldBeCreatedCorrectly()
    {
        // Arrange & Act
        var log = new DeploymentLog(
            Guid.NewGuid(),
            Guid.NewGuid(),
            "Log message",
            DeploymentLogLevel.Info);

        // Assert
        log.Message.Should().Be("Log message");
        log.Level.Should().Be(DeploymentLogLevel.Info);
        log.Timestamp.Should().BeCloseTo(DateTime.UtcNow, TimeSpan.FromSeconds(1));
    }
}

#endregion

#region DeploymentEnvironment Enum Tests

public class DeploymentEnvironmentEnumTests
{
    [Theory]
    [InlineData(DeploymentEnvironment.Development)]
    [InlineData(DeploymentEnvironment.Testing)]
    [InlineData(DeploymentEnvironment.Staging)]
    [InlineData(DeploymentEnvironment.Production)]
    public void DeploymentEnvironment_ShouldHaveCorrectValues(DeploymentEnvironment environment)
    {
        // Assert
        environment.Should().BeDefined();
    }
}

#endregion

#region DeploymentStatus Enum Tests

public class DeploymentStatusEnumTests
{
    [Theory]
    [InlineData(DeploymentStatus.Pending)]
    [InlineData(DeploymentStatus.Approved)]
    [InlineData(DeploymentStatus.InProgress)]
    [InlineData(DeploymentStatus.Completed)]
    [InlineData(DeploymentStatus.Failed)]
    [InlineData(DeploymentStatus.Cancelled)]
    [InlineData(DeploymentStatus.RolledBack)]
    public void DeploymentStatus_ShouldHaveCorrectValues(DeploymentStatus status)
    {
        // Assert
        status.Should().BeDefined();
    }
}

#endregion

#region DeploymentLogLevel Enum Tests

public class DeploymentLogLevelEnumTests
{
    [Theory]
    [InlineData(DeploymentLogLevel.Debug)]
    [InlineData(DeploymentLogLevel.Info)]
    [InlineData(DeploymentLogLevel.Warning)]
    [InlineData(DeploymentLogLevel.Error)]
    public void DeploymentLogLevel_ShouldHaveCorrectValues(DeploymentLogLevel level)
    {
        // Assert
        level.Should().BeDefined();
    }
}

#endregion
