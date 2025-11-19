using Xunit;
using Moq;
using FluentAssertions;
using Onesign.Modules.Incidents.Application.Commands;
using Onesign.Modules.Incidents.Application.Queries;
using Onesign.Modules.Incidents.Domain.Entities;
using Onesign.Modules.Incidents.Domain.Enums;
using Onesign.Modules.Incidents.Domain.Repositories;

namespace Onesign.Api.Tests.Incidents;

#region CreateIncidentCommand Tests

public class CreateIncidentCommandTests
{
    [Fact]
    public void CreateIncidentCommand_ShouldHaveRequiredProperties()
    {
        // Arrange & Act
        var command = new CreateIncidentCommand
        {
            TenantId = Guid.NewGuid(),
            Title = "Security Breach Detected",
            Description = "Unauthorized access attempt detected",
            Severity = (int)IncidentSeverity.Critical,
            Source = "SecurityMonitor",
            AffectedResources = new List<string> { "user:123", "app:456" },
            Tags = new List<string> { "security", "urgent" }
        };

        // Assert
        command.Title.Should().Be("Security Breach Detected");
        command.Severity.Should().Be((int)IncidentSeverity.Critical);
        command.AffectedResources.Should().HaveCount(2);
    }
}

#endregion

#region UpdateIncidentCommand Tests

public class UpdateIncidentCommandTests
{
    [Fact]
    public void UpdateIncidentCommand_ShouldHaveRequiredProperties()
    {
        // Arrange & Act
        var command = new UpdateIncidentCommand
        {
            TenantId = Guid.NewGuid(),
            IncidentId = Guid.NewGuid(),
            Title = "Updated Title",
            Description = "Updated description",
            Severity = (int)IncidentSeverity.High,
            AssignedTo = Guid.NewGuid()
        };

        // Assert
        command.IncidentId.Should().NotBeEmpty();
        command.AssignedTo.Should().NotBeEmpty();
    }
}

#endregion

#region AssignIncidentCommand Tests

public class AssignIncidentCommandTests
{
    [Fact]
    public void AssignIncidentCommand_ShouldHaveRequiredProperties()
    {
        // Arrange & Act
        var command = new AssignIncidentCommand
        {
            TenantId = Guid.NewGuid(),
            IncidentId = Guid.NewGuid(),
            AssignedTo = Guid.NewGuid(),
            AssignedBy = Guid.NewGuid()
        };

        // Assert
        command.AssignedTo.Should().NotBeEmpty();
        command.AssignedBy.Should().NotBeEmpty();
    }
}

#endregion

#region ResolveIncidentCommand Tests

public class ResolveIncidentCommandTests
{
    [Fact]
    public void ResolveIncidentCommand_ShouldHaveRequiredProperties()
    {
        // Arrange & Act
        var command = new ResolveIncidentCommand
        {
            TenantId = Guid.NewGuid(),
            IncidentId = Guid.NewGuid(),
            ResolvedBy = Guid.NewGuid(),
            Resolution = "Issue resolved by blocking IP",
            RootCause = "Brute force attack"
        };

        // Assert
        command.Resolution.Should().Be("Issue resolved by blocking IP");
        command.RootCause.Should().Be("Brute force attack");
    }
}

#endregion

#region CloseIncidentCommand Tests

public class CloseIncidentCommandTests
{
    [Fact]
    public void CloseIncidentCommand_ShouldHaveRequiredProperties()
    {
        // Arrange & Act
        var command = new CloseIncidentCommand
        {
            TenantId = Guid.NewGuid(),
            IncidentId = Guid.NewGuid(),
            ClosedBy = Guid.NewGuid(),
            ClosureNotes = "Verified resolution is effective"
        };

        // Assert
        command.ClosureNotes.Should().Be("Verified resolution is effective");
    }
}

#endregion

#region AddIncidentCommentCommand Tests

public class AddIncidentCommentCommandTests
{
    [Fact]
    public void AddIncidentCommentCommand_ShouldHaveRequiredProperties()
    {
        // Arrange & Act
        var command = new AddIncidentCommentCommand
        {
            TenantId = Guid.NewGuid(),
            IncidentId = Guid.NewGuid(),
            AuthorId = Guid.NewGuid(),
            Content = "Initial investigation shows suspicious activity from IP 10.0.0.1"
        };

        // Assert
        command.Content.Should().NotBeEmpty();
    }
}

#endregion

#region EscalateIncidentCommand Tests

public class EscalateIncidentCommandTests
{
    [Fact]
    public void EscalateIncidentCommand_ShouldHaveRequiredProperties()
    {
        // Arrange & Act
        var command = new EscalateIncidentCommand
        {
            TenantId = Guid.NewGuid(),
            IncidentId = Guid.NewGuid(),
            EscalatedBy = Guid.NewGuid(),
            EscalateTo = Guid.NewGuid(),
            Reason = "Requires senior security analyst"
        };

        // Assert
        command.Reason.Should().Be("Requires senior security analyst");
    }
}

#endregion

#region GetIncidentsQuery Tests

public class GetIncidentsQueryTests
{
    [Fact]
    public void GetIncidentsQuery_ShouldHaveFilters()
    {
        // Arrange & Act
        var query = new GetIncidentsQuery
        {
            TenantId = Guid.NewGuid(),
            Status = (int)IncidentStatus.Open,
            Severity = (int)IncidentSeverity.Critical,
            AssignedTo = Guid.NewGuid(),
            StartDate = DateTime.UtcNow.AddDays(-30),
            EndDate = DateTime.UtcNow,
            PageNumber = 1,
            PageSize = 20
        };

        // Assert
        query.Status.Should().Be((int)IncidentStatus.Open);
        query.Severity.Should().Be((int)IncidentSeverity.Critical);
    }
}

#endregion

#region GetIncidentDetailsQuery Tests

public class GetIncidentDetailsQueryTests
{
    [Fact]
    public void GetIncidentDetailsQuery_ShouldHaveIncidentId()
    {
        // Arrange & Act
        var incidentId = Guid.NewGuid();
        var query = new GetIncidentDetailsQuery
        {
            TenantId = Guid.NewGuid(),
            IncidentId = incidentId
        };

        // Assert
        query.IncidentId.Should().Be(incidentId);
    }
}

#endregion

#region GetIncidentTimelineQuery Tests

public class GetIncidentTimelineQueryTests
{
    [Fact]
    public void GetIncidentTimelineQuery_ShouldHaveIncidentId()
    {
        // Arrange & Act
        var query = new GetIncidentTimelineQuery
        {
            TenantId = Guid.NewGuid(),
            IncidentId = Guid.NewGuid()
        };

        // Assert
        query.IncidentId.Should().NotBeEmpty();
    }
}

#endregion

#region GetIncidentDashboardQuery Tests

public class GetIncidentDashboardQueryTests
{
    [Fact]
    public void GetIncidentDashboardQuery_ShouldHaveTenantId()
    {
        // Arrange & Act
        var tenantId = Guid.NewGuid();
        var query = new GetIncidentDashboardQuery
        {
            TenantId = tenantId
        };

        // Assert
        query.TenantId.Should().Be(tenantId);
    }
}

#endregion

#region Incident Entity Tests

public class IncidentEntityTests
{
    [Fact]
    public void Incident_ShouldBeCreatedWithOpenStatus()
    {
        // Arrange & Act
        var incident = new Incident(
            Guid.NewGuid(),
            Guid.NewGuid(),
            "Test Incident",
            "Description",
            IncidentSeverity.Medium,
            "Test");

        // Assert
        incident.Status.Should().Be(IncidentStatus.Open);
        incident.Title.Should().Be("Test Incident");
    }

    [Fact]
    public void Incident_Assign_ShouldSetAssigneeAndChangeStatus()
    {
        // Arrange
        var incident = new Incident(
            Guid.NewGuid(),
            Guid.NewGuid(),
            "Incident",
            "Desc",
            IncidentSeverity.High,
            "Test");

        var assigneeId = Guid.NewGuid();

        // Act
        incident.Assign(assigneeId);

        // Assert
        incident.AssignedTo.Should().Be(assigneeId);
        incident.Status.Should().Be(IncidentStatus.InProgress);
    }

    [Fact]
    public void Incident_Resolve_ShouldChangeStatusToResolved()
    {
        // Arrange
        var incident = new Incident(
            Guid.NewGuid(),
            Guid.NewGuid(),
            "Incident",
            "Desc",
            IncidentSeverity.High,
            "Test");
        incident.Assign(Guid.NewGuid());

        // Act
        incident.Resolve(Guid.NewGuid(), "Fixed", "Root cause");

        // Assert
        incident.Status.Should().Be(IncidentStatus.Resolved);
        incident.Resolution.Should().Be("Fixed");
        incident.ResolvedAt.Should().NotBeNull();
    }

    [Fact]
    public void Incident_Close_ShouldChangeStatusToClosed()
    {
        // Arrange
        var incident = new Incident(
            Guid.NewGuid(),
            Guid.NewGuid(),
            "Incident",
            "Desc",
            IncidentSeverity.High,
            "Test");
        incident.Assign(Guid.NewGuid());
        incident.Resolve(Guid.NewGuid(), "Fixed", "Root cause");

        // Act
        incident.Close(Guid.NewGuid(), "Verified");

        // Assert
        incident.Status.Should().Be(IncidentStatus.Closed);
        incident.ClosedAt.Should().NotBeNull();
    }

    [Fact]
    public void Incident_Escalate_ShouldSetEscalatedFlag()
    {
        // Arrange
        var incident = new Incident(
            Guid.NewGuid(),
            Guid.NewGuid(),
            "Incident",
            "Desc",
            IncidentSeverity.High,
            "Test");

        // Act
        incident.Escalate(Guid.NewGuid(), "Need help");

        // Assert
        incident.IsEscalated.Should().BeTrue();
    }

    [Fact]
    public void Incident_AddComment_ShouldAddCommentToIncident()
    {
        // Arrange
        var incident = new Incident(
            Guid.NewGuid(),
            Guid.NewGuid(),
            "Incident",
            "Desc",
            IncidentSeverity.High,
            "Test");

        // Act
        incident.AddComment(Guid.NewGuid(), "Investigation started");

        // Assert
        incident.Comments.Should().HaveCount(1);
    }
}

#endregion

#region IncidentComment Entity Tests

public class IncidentCommentEntityTests
{
    [Fact]
    public void IncidentComment_ShouldBeCreatedCorrectly()
    {
        // Arrange & Act
        var comment = new IncidentComment(
            Guid.NewGuid(),
            Guid.NewGuid(),
            Guid.NewGuid(),
            "This is a comment");

        // Assert
        comment.Content.Should().Be("This is a comment");
        comment.CreatedAt.Should().BeCloseTo(DateTime.UtcNow, TimeSpan.FromSeconds(1));
    }
}

#endregion

#region IncidentSeverity Enum Tests

public class IncidentSeverityEnumTests
{
    [Theory]
    [InlineData(IncidentSeverity.Low)]
    [InlineData(IncidentSeverity.Medium)]
    [InlineData(IncidentSeverity.High)]
    [InlineData(IncidentSeverity.Critical)]
    public void IncidentSeverity_ShouldHaveCorrectValues(IncidentSeverity severity)
    {
        // Assert
        severity.Should().BeDefined();
    }
}

#endregion

#region IncidentStatus Enum Tests

public class IncidentStatusEnumTests
{
    [Theory]
    [InlineData(IncidentStatus.Open)]
    [InlineData(IncidentStatus.InProgress)]
    [InlineData(IncidentStatus.Resolved)]
    [InlineData(IncidentStatus.Closed)]
    public void IncidentStatus_ShouldHaveCorrectValues(IncidentStatus status)
    {
        // Assert
        status.Should().BeDefined();
    }
}

#endregion
