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
            Category = IncidentCategory.Security,
            Severity = IncidentSeverity.Critical,
            DetectionSource = DetectionSource.Manual,
            PrimaryUserId = Guid.NewGuid(),
            AffectedUsersCount = 2,
            AffectedAppsCount = 1
        };

        // Assert
        command.Title.Should().Be("Security Breach Detected");
        command.Severity.Should().Be(IncidentSeverity.Critical);
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
            Id = Guid.NewGuid(),
            Title = "Updated Title",
            Description = "Updated description",
            Category = IncidentCategory.Security,
            Severity = IncidentSeverity.High,
            UpdatedByUserId = Guid.NewGuid()
        };

        // Assert
        command.Id.Should().NotBeEmpty();
        command.Title.Should().Be("Updated Title");
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
            Id = Guid.NewGuid(),
            AssignToUserId = Guid.NewGuid(),
            AssignedByUserId = Guid.NewGuid(),
            Note = "Assigned for investigation"
        };

        // Assert
        command.AssignToUserId.Should().NotBeEmpty();
        command.AssignedByUserId.Should().NotBeEmpty();
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
            Id = Guid.NewGuid(),
            ResolvedByUserId = Guid.NewGuid(),
            ResolutionSummary = "Issue resolved by patching vulnerability"
        };

        // Assert
        command.ResolutionSummary.Should().Contain("resolved");
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
            Id = Guid.NewGuid(),
            ClosedByUserId = Guid.NewGuid(),
            FinalNote = "Incident closed after verification"
        };

        // Assert
        command.FinalNote.Should().Contain("closed");
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
            Status = IncidentStatus.New,
            Severity = IncidentSeverity.Critical,
            PrimaryUserId = Guid.NewGuid(),
            From = DateTime.UtcNow.AddDays(-30),
            To = DateTime.UtcNow,
            Page = 1,
            PageSize = 20
        };

        // Assert
        query.Status.Should().Be(IncidentStatus.New);
        query.Severity.Should().Be(IncidentSeverity.Critical);
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
        var incidentId = Guid.NewGuid();
        var query = new GetIncidentTimelineQuery
        {
            IncidentId = incidentId
        };

        // Assert
        query.IncidentId.Should().Be(incidentId);
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
    public void Incident_ShouldBeCreatedWithNewStatus()
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
        incident.Status.Should().Be(IncidentStatus.New);
        incident.Title.Should().Be("Test Incident");
    }

    [Fact]
    public void Incident_Assign_ShouldSetAssignee()
    {
        // Arrange
        var incident = new Incident(
            Guid.NewGuid(),
            Guid.NewGuid(),
            "Test Incident",
            "Description",
            IncidentSeverity.Medium,
            "Test");
        var assigneeId = Guid.NewGuid();

        // Act
        incident.Assign(assigneeId);

        // Assert
        incident.AssignedTo.Should().Be(assigneeId);
    }

    [Fact]
    public void Incident_Resolve_ShouldSetResolvedStatus()
    {
        // Arrange
        var incident = new Incident(
            Guid.NewGuid(),
            Guid.NewGuid(),
            "Test Incident",
            "Description",
            IncidentSeverity.Medium,
            "Test");
        var userId = Guid.NewGuid();

        // Act
        incident.Resolve(userId, "Fixed the issue", "Root cause identified");

        // Assert
        incident.Status.Should().Be(IncidentStatus.Resolved);
        incident.ResolvedByUserId.Should().Be(userId);
        incident.ResolutionSummary.Should().Be("Fixed the issue");
        incident.RootCause.Should().Be("Root cause identified");
    }

    [Fact]
    public void Incident_Close_ShouldSetClosedStatus()
    {
        // Arrange
        var incident = new Incident(
            Guid.NewGuid(),
            Guid.NewGuid(),
            "Test Incident",
            "Description",
            IncidentSeverity.Medium,
            "Test");
        var userId = Guid.NewGuid();

        // Act
        incident.Close(userId, "Closing notes");

        // Assert
        incident.Status.Should().Be(IncidentStatus.Closed);
        incident.ClosedByUserId.Should().Be(userId);
        incident.ClosingNotes.Should().Be("Closing notes");
    }

    [Fact]
    public void Incident_Escalate_ShouldSetEscalatedFlag()
    {
        // Arrange
        var incident = new Incident(
            Guid.NewGuid(),
            Guid.NewGuid(),
            "Test Incident",
            "Description",
            IncidentSeverity.Medium,
            "Test");
        var userId = Guid.NewGuid();

        // Act
        incident.Escalate(userId, "Needs senior review");

        // Assert
        incident.IsEscalated.Should().BeTrue();
        incident.EscalationReason.Should().Be("Needs senior review");
    }

    [Fact]
    public void Incident_AddComment_ShouldAddToCommentsList()
    {
        // Arrange
        var incident = new Incident(
            Guid.NewGuid(),
            Guid.NewGuid(),
            "Test Incident",
            "Description",
            IncidentSeverity.Medium,
            "Test");
        var userId = Guid.NewGuid();

        // Act
        incident.AddComment(userId, "Test comment");

        // Assert
        incident.Comments.Should().HaveCount(1);
        incident.Comments[0].Text.Should().Be("Test comment");
        incident.Comments[0].UserId.Should().Be(userId);
    }

    [Theory]
    [InlineData(IncidentStatus.New)]
    [InlineData(IncidentStatus.Acknowledged)]
    [InlineData(IncidentStatus.Investigating)]
    [InlineData(IncidentStatus.Resolved)]
    [InlineData(IncidentStatus.Closed)]
    public void Incident_StatusValues_ShouldBeValid(IncidentStatus status)
    {
        // Assert
        Enum.IsDefined(typeof(IncidentStatus), status).Should().BeTrue();
    }

    [Theory]
    [InlineData(IncidentSeverity.Low)]
    [InlineData(IncidentSeverity.Medium)]
    [InlineData(IncidentSeverity.High)]
    [InlineData(IncidentSeverity.Critical)]
    public void Incident_SeverityValues_ShouldBeValid(IncidentSeverity severity)
    {
        // Assert
        Enum.IsDefined(typeof(IncidentSeverity), severity).Should().BeTrue();
    }
}

#endregion
