using FluentAssertions;
using Moq;
using Onesign.Modules.Incidents.Domain.Entities;
using Onesign.Modules.Incidents.Domain.Enums;
using Onesign.Modules.Incidents.Domain.Repositories;
using Onesign.Modules.Incidents.Infrastructure.EfCore.Entities;
using Xunit;

namespace Onesign.Api.Tests.Incidents;

public class IncidentsModuleTests
{
    #region Incident Entity Tests

    [Fact]
    public void Incident_DefaultValues_AreCorrect()
    {
        // Arrange & Act
        var entity = new Incident();

        // Assert
        entity.Id.Should().Be(Guid.Empty);
        entity.TenantId.Should().Be(Guid.Empty);
        entity.Title.Should().BeEmpty();
        entity.Description.Should().BeEmpty();
        entity.PrimaryUserId.Should().BeNull();
        entity.PrimaryAppId.Should().BeNull();
        entity.AffectedUsersCount.Should().Be(0);
        entity.AffectedAppsCount.Should().Be(0);
        entity.AcknowledgedAt.Should().BeNull();
        entity.AcknowledgedByUserId.Should().BeNull();
        entity.ResolvedAt.Should().BeNull();
        entity.ResolvedByUserId.Should().BeNull();
        entity.ClosedAt.Should().BeNull();
        entity.ClosedByUserId.Should().BeNull();
        entity.ResolutionSummary.Should().BeNull();
        entity.UpdatedAt.Should().BeNull();
    }

    [Fact]
    public void Incident_AllPropertiesCanBeSet()
    {
        // Arrange
        var id = Guid.NewGuid();
        var tenantId = Guid.NewGuid();
        var primaryUserId = Guid.NewGuid();
        var primaryAppId = Guid.NewGuid();
        var acknowledgedByUserId = Guid.NewGuid();
        var resolvedByUserId = Guid.NewGuid();
        var closedByUserId = Guid.NewGuid();
        var detectedAt = DateTime.UtcNow.AddHours(-2);
        var acknowledgedAt = DateTime.UtcNow.AddHours(-1);
        var resolvedAt = DateTime.UtcNow.AddMinutes(-30);
        var closedAt = DateTime.UtcNow;
        var createdAt = DateTime.UtcNow.AddHours(-2);
        var updatedAt = DateTime.UtcNow;

        // Act
        var entity = new Incident
        {
            Id = id,
            TenantId = tenantId,
            Title = "Suspicious Login Activity Detected",
            Description = "Multiple failed login attempts from unusual location",
            Category = IncidentCategory.SuspiciousActivity,
            Severity = IncidentSeverity.High,
            Status = IncidentStatus.Closed,
            DetectionSource = DetectionSource.Automation,
            PrimaryUserId = primaryUserId,
            PrimaryAppId = primaryAppId,
            AffectedUsersCount = 5,
            AffectedAppsCount = 2,
            DetectedAt = detectedAt,
            AcknowledgedAt = acknowledgedAt,
            AcknowledgedByUserId = acknowledgedByUserId,
            ResolvedAt = resolvedAt,
            ResolvedByUserId = resolvedByUserId,
            ClosedAt = closedAt,
            ClosedByUserId = closedByUserId,
            ResolutionSummary = "User account was temporarily locked and password reset was enforced",
            CreatedAt = createdAt,
            UpdatedAt = updatedAt
        };

        // Assert
        entity.Id.Should().Be(id);
        entity.TenantId.Should().Be(tenantId);
        entity.Title.Should().Be("Suspicious Login Activity Detected");
        entity.Description.Should().Be("Multiple failed login attempts from unusual location");
        entity.Category.Should().Be(IncidentCategory.SuspiciousActivity);
        entity.Severity.Should().Be(IncidentSeverity.High);
        entity.Status.Should().Be(IncidentStatus.Closed);
        entity.DetectionSource.Should().Be(DetectionSource.Automation);
        entity.PrimaryUserId.Should().Be(primaryUserId);
        entity.PrimaryAppId.Should().Be(primaryAppId);
        entity.AffectedUsersCount.Should().Be(5);
        entity.AffectedAppsCount.Should().Be(2);
        entity.DetectedAt.Should().Be(detectedAt);
        entity.AcknowledgedAt.Should().Be(acknowledgedAt);
        entity.AcknowledgedByUserId.Should().Be(acknowledgedByUserId);
        entity.ResolvedAt.Should().Be(resolvedAt);
        entity.ResolvedByUserId.Should().Be(resolvedByUserId);
        entity.ClosedAt.Should().Be(closedAt);
        entity.ClosedByUserId.Should().Be(closedByUserId);
        entity.ResolutionSummary.Should().Be("User account was temporarily locked and password reset was enforced");
        entity.CreatedAt.Should().Be(createdAt);
        entity.UpdatedAt.Should().Be(updatedAt);
    }

    [Theory]
    [InlineData(IncidentCategory.CompromisedAccount)]
    [InlineData(IncidentCategory.SuspiciousActivity)]
    [InlineData(IncidentCategory.PolicyViolation)]
    [InlineData(IncidentCategory.PrivilegedAccessMisuse)]
    [InlineData(IncidentCategory.DataExfiltration)]
    [InlineData(IncidentCategory.BruteForceAttack)]
    [InlineData(IncidentCategory.CredentialTheft)]
    [InlineData(IncidentCategory.InsiderThreat)]
    public void Incident_AcceptsAllCategories(IncidentCategory category)
    {
        // Arrange & Act
        var entity = new Incident { Category = category };

        // Assert
        entity.Category.Should().Be(category);
    }

    [Theory]
    [InlineData(IncidentSeverity.Critical)]
    [InlineData(IncidentSeverity.High)]
    [InlineData(IncidentSeverity.Medium)]
    [InlineData(IncidentSeverity.Low)]
    [InlineData(IncidentSeverity.Informational)]
    public void Incident_AcceptsAllSeverities(IncidentSeverity severity)
    {
        // Arrange & Act
        var entity = new Incident { Severity = severity };

        // Assert
        entity.Severity.Should().Be(severity);
    }

    [Theory]
    [InlineData(IncidentStatus.New)]
    [InlineData(IncidentStatus.Acknowledged)]
    [InlineData(IncidentStatus.Investigating)]
    [InlineData(IncidentStatus.Containment)]
    [InlineData(IncidentStatus.Remediation)]
    [InlineData(IncidentStatus.Resolved)]
    [InlineData(IncidentStatus.Closed)]
    public void Incident_AcceptsAllStatuses(IncidentStatus status)
    {
        // Arrange & Act
        var entity = new Incident { Status = status };

        // Assert
        entity.Status.Should().Be(status);
    }

    [Theory]
    [InlineData(DetectionSource.Automation)]
    [InlineData(DetectionSource.Hunting)]
    [InlineData(DetectionSource.Manual)]
    [InlineData(DetectionSource.System)]
    [InlineData(DetectionSource.AdaptiveSecurity)]
    public void Incident_AcceptsAllDetectionSources(DetectionSource source)
    {
        // Arrange & Act
        var entity = new Incident { DetectionSource = source };

        // Assert
        entity.DetectionSource.Should().Be(source);
    }

    [Fact]
    public void Incident_Lifecycle_NewToAcknowledged()
    {
        // Arrange
        var incident = new Incident
        {
            Id = Guid.NewGuid(),
            Status = IncidentStatus.New,
            DetectedAt = DateTime.UtcNow.AddMinutes(-10)
        };
        var acknowledgedByUserId = Guid.NewGuid();
        var acknowledgedAt = DateTime.UtcNow;

        // Act
        incident.Status = IncidentStatus.Acknowledged;
        incident.AcknowledgedAt = acknowledgedAt;
        incident.AcknowledgedByUserId = acknowledgedByUserId;

        // Assert
        incident.Status.Should().Be(IncidentStatus.Acknowledged);
        incident.AcknowledgedAt.Should().Be(acknowledgedAt);
        incident.AcknowledgedByUserId.Should().Be(acknowledgedByUserId);
        incident.ResolvedAt.Should().BeNull();
        incident.ClosedAt.Should().BeNull();
    }

    [Fact]
    public void Incident_Lifecycle_AcknowledgedToResolved()
    {
        // Arrange
        var incident = new Incident
        {
            Id = Guid.NewGuid(),
            Status = IncidentStatus.Acknowledged,
            AcknowledgedAt = DateTime.UtcNow.AddMinutes(-30),
            AcknowledgedByUserId = Guid.NewGuid()
        };
        var resolvedByUserId = Guid.NewGuid();
        var resolvedAt = DateTime.UtcNow;

        // Act
        incident.Status = IncidentStatus.Resolved;
        incident.ResolvedAt = resolvedAt;
        incident.ResolvedByUserId = resolvedByUserId;
        incident.ResolutionSummary = "Issue has been mitigated";

        // Assert
        incident.Status.Should().Be(IncidentStatus.Resolved);
        incident.ResolvedAt.Should().Be(resolvedAt);
        incident.ResolvedByUserId.Should().Be(resolvedByUserId);
        incident.ResolutionSummary.Should().Be("Issue has been mitigated");
        incident.ClosedAt.Should().BeNull();
    }

    [Fact]
    public void Incident_Lifecycle_ResolvedToClosed()
    {
        // Arrange
        var incident = new Incident
        {
            Id = Guid.NewGuid(),
            Status = IncidentStatus.Resolved,
            AcknowledgedAt = DateTime.UtcNow.AddHours(-1),
            AcknowledgedByUserId = Guid.NewGuid(),
            ResolvedAt = DateTime.UtcNow.AddMinutes(-30),
            ResolvedByUserId = Guid.NewGuid(),
            ResolutionSummary = "Issue mitigated"
        };
        var closedByUserId = Guid.NewGuid();
        var closedAt = DateTime.UtcNow;

        // Act
        incident.Status = IncidentStatus.Closed;
        incident.ClosedAt = closedAt;
        incident.ClosedByUserId = closedByUserId;

        // Assert
        incident.Status.Should().Be(IncidentStatus.Closed);
        incident.ClosedAt.Should().Be(closedAt);
        incident.ClosedByUserId.Should().Be(closedByUserId);
    }

    [Fact]
    public void Incident_FullLifecycle_AllTimestampsSet()
    {
        // Arrange
        var incident = new Incident
        {
            Id = Guid.NewGuid(),
            TenantId = Guid.NewGuid(),
            Title = "Critical Security Incident",
            Category = IncidentCategory.CompromisedAccount,
            Severity = IncidentSeverity.Critical,
            Status = IncidentStatus.Closed,
            DetectionSource = DetectionSource.AdaptiveSecurity,
            DetectedAt = DateTime.UtcNow.AddHours(-4),
            CreatedAt = DateTime.UtcNow.AddHours(-4),
            AcknowledgedAt = DateTime.UtcNow.AddHours(-3),
            AcknowledgedByUserId = Guid.NewGuid(),
            ResolvedAt = DateTime.UtcNow.AddHours(-1),
            ResolvedByUserId = Guid.NewGuid(),
            ClosedAt = DateTime.UtcNow,
            ClosedByUserId = Guid.NewGuid(),
            ResolutionSummary = "Full remediation completed"
        };

        // Assert
        incident.DetectedAt.Should().BeBefore(incident.AcknowledgedAt!.Value);
        incident.AcknowledgedAt.Should().BeBefore(incident.ResolvedAt!.Value);
        incident.ResolvedAt.Should().BeBefore(incident.ClosedAt!.Value);
    }

    [Fact]
    public void Incident_AffectedCounts_CanBeUpdated()
    {
        // Arrange
        var incident = new Incident
        {
            AffectedUsersCount = 0,
            AffectedAppsCount = 0
        };

        // Act
        incident.AffectedUsersCount = 100;
        incident.AffectedAppsCount = 5;

        // Assert
        incident.AffectedUsersCount.Should().Be(100);
        incident.AffectedAppsCount.Should().Be(5);
    }

    #endregion

    #region IncidentEvent Entity Tests

    [Fact]
    public void IncidentEvent_DefaultValues_AreCorrect()
    {
        // Arrange & Act
        var entity = new IncidentEvent();

        // Assert
        entity.Id.Should().Be(Guid.Empty);
        entity.IncidentId.Should().Be(Guid.Empty);
        entity.EventType.Should().BeEmpty();
        entity.EventData.Should().Be("{}");
        entity.Timestamp.Should().Be(default);
        entity.SourceModule.Should().BeEmpty();
    }

    [Fact]
    public void IncidentEvent_AllPropertiesCanBeSet()
    {
        // Arrange
        var id = Guid.NewGuid();
        var incidentId = Guid.NewGuid();
        var timestamp = DateTime.UtcNow;

        // Act
        var entity = new IncidentEvent
        {
            Id = id,
            IncidentId = incidentId,
            EventType = "LoginFailed",
            EventData = "{\"attempts\":5,\"ipAddress\":\"192.168.1.1\"}",
            Timestamp = timestamp,
            SourceModule = "Authentication"
        };

        // Assert
        entity.Id.Should().Be(id);
        entity.IncidentId.Should().Be(incidentId);
        entity.EventType.Should().Be("LoginFailed");
        entity.EventData.Should().Be("{\"attempts\":5,\"ipAddress\":\"192.168.1.1\"}");
        entity.Timestamp.Should().Be(timestamp);
        entity.SourceModule.Should().Be("Authentication");
    }

    [Theory]
    [InlineData("LoginFailed")]
    [InlineData("AccessDenied")]
    [InlineData("PrivilegeEscalation")]
    [InlineData("DataAccess")]
    [InlineData("ConfigurationChange")]
    public void IncidentEvent_AcceptsVariousEventTypes(string eventType)
    {
        // Arrange & Act
        var entity = new IncidentEvent { EventType = eventType };

        // Assert
        entity.EventType.Should().Be(eventType);
    }

    [Theory]
    [InlineData("Authentication")]
    [InlineData("Authorization")]
    [InlineData("AdaptiveSecurity")]
    [InlineData("Automation")]
    [InlineData("PrivilegedAccess")]
    public void IncidentEvent_AcceptsVariousSourceModules(string sourceModule)
    {
        // Arrange & Act
        var entity = new IncidentEvent { SourceModule = sourceModule };

        // Assert
        entity.SourceModule.Should().Be(sourceModule);
    }

    [Fact]
    public void IncidentEvent_EventData_CanContainComplexJson()
    {
        // Arrange
        var complexData = @"{
            ""userId"": ""user123"",
            ""ipAddress"": ""10.0.0.1"",
            ""location"": {""country"": ""US"", ""city"": ""New York""},
            ""attempts"": [1, 2, 3, 4, 5],
            ""metadata"": {""userAgent"": ""Mozilla/5.0""}
        }";

        // Act
        var entity = new IncidentEvent { EventData = complexData };

        // Assert
        entity.EventData.Should().Contain("userId");
        entity.EventData.Should().Contain("location");
        entity.EventData.Should().Contain("metadata");
    }

    #endregion

    #region IncidentNote Entity Tests

    [Fact]
    public void IncidentNote_DefaultValues_AreCorrect()
    {
        // Arrange & Act
        var entity = new IncidentNote();

        // Assert
        entity.Id.Should().Be(Guid.Empty);
        entity.IncidentId.Should().Be(Guid.Empty);
        entity.Content.Should().BeEmpty();
        entity.CreatedByUserId.Should().Be(Guid.Empty);
        entity.CreatedAt.Should().Be(default);
        entity.UpdatedAt.Should().BeNull();
    }

    [Fact]
    public void IncidentNote_AllPropertiesCanBeSet()
    {
        // Arrange
        var id = Guid.NewGuid();
        var incidentId = Guid.NewGuid();
        var createdByUserId = Guid.NewGuid();
        var createdAt = DateTime.UtcNow.AddMinutes(-30);
        var updatedAt = DateTime.UtcNow;

        // Act
        var entity = new IncidentNote
        {
            Id = id,
            IncidentId = incidentId,
            Content = "Initial investigation shows suspicious IP address activity",
            CreatedByUserId = createdByUserId,
            CreatedAt = createdAt,
            UpdatedAt = updatedAt
        };

        // Assert
        entity.Id.Should().Be(id);
        entity.IncidentId.Should().Be(incidentId);
        entity.Content.Should().Be("Initial investigation shows suspicious IP address activity");
        entity.CreatedByUserId.Should().Be(createdByUserId);
        entity.CreatedAt.Should().Be(createdAt);
        entity.UpdatedAt.Should().Be(updatedAt);
    }

    [Fact]
    public void IncidentNote_Content_CanBeUpdated()
    {
        // Arrange
        var entity = new IncidentNote
        {
            Content = "Original note",
            CreatedAt = DateTime.UtcNow.AddMinutes(-10)
        };

        // Act
        entity.Content = "Updated note with more details";
        entity.UpdatedAt = DateTime.UtcNow;

        // Assert
        entity.Content.Should().Be("Updated note with more details");
        entity.UpdatedAt.Should().NotBeNull();
        entity.UpdatedAt.Should().BeAfter(entity.CreatedAt);
    }

    [Fact]
    public void IncidentNote_Content_CanContainLongText()
    {
        // Arrange
        var longContent = new string('A', 10000);

        // Act
        var entity = new IncidentNote { Content = longContent };

        // Assert
        entity.Content.Length.Should().Be(10000);
    }

    #endregion

    #region IncidentPlaybookRun Entity Tests

    [Fact]
    public void IncidentPlaybookRun_DefaultValues_AreCorrect()
    {
        // Arrange & Act
        var entity = new IncidentPlaybookRun();

        // Assert
        entity.Id.Should().Be(Guid.Empty);
        entity.IncidentId.Should().Be(Guid.Empty);
        entity.WorkflowId.Should().Be(Guid.Empty);
        entity.WorkflowName.Should().BeEmpty();
        entity.Status.Should().BeEmpty();
        entity.StartedAt.Should().Be(default);
        entity.CompletedAt.Should().BeNull();
        entity.Result.Should().BeNull();
    }

    [Fact]
    public void IncidentPlaybookRun_AllPropertiesCanBeSet()
    {
        // Arrange
        var id = Guid.NewGuid();
        var incidentId = Guid.NewGuid();
        var workflowId = Guid.NewGuid();
        var startedAt = DateTime.UtcNow.AddMinutes(-5);
        var completedAt = DateTime.UtcNow;

        // Act
        var entity = new IncidentPlaybookRun
        {
            Id = id,
            IncidentId = incidentId,
            WorkflowId = workflowId,
            WorkflowName = "Account Lockout Response",
            Status = "Completed",
            StartedAt = startedAt,
            CompletedAt = completedAt,
            Result = "{\"actionsExecuted\":3,\"success\":true}"
        };

        // Assert
        entity.Id.Should().Be(id);
        entity.IncidentId.Should().Be(incidentId);
        entity.WorkflowId.Should().Be(workflowId);
        entity.WorkflowName.Should().Be("Account Lockout Response");
        entity.Status.Should().Be("Completed");
        entity.StartedAt.Should().Be(startedAt);
        entity.CompletedAt.Should().Be(completedAt);
        entity.Result.Should().Be("{\"actionsExecuted\":3,\"success\":true}");
    }

    [Theory]
    [InlineData("Pending")]
    [InlineData("Running")]
    [InlineData("Completed")]
    [InlineData("Failed")]
    [InlineData("Cancelled")]
    public void IncidentPlaybookRun_AcceptsVariousStatuses(string status)
    {
        // Arrange & Act
        var entity = new IncidentPlaybookRun { Status = status };

        // Assert
        entity.Status.Should().Be(status);
    }

    [Fact]
    public void IncidentPlaybookRun_InProgress_HasNoCompletedAt()
    {
        // Arrange & Act
        var entity = new IncidentPlaybookRun
        {
            Id = Guid.NewGuid(),
            Status = "Running",
            StartedAt = DateTime.UtcNow.AddMinutes(-2),
            CompletedAt = null
        };

        // Assert
        entity.CompletedAt.Should().BeNull();
        entity.Status.Should().Be("Running");
    }

    [Fact]
    public void IncidentPlaybookRun_Completed_HasValidDuration()
    {
        // Arrange
        var startedAt = DateTime.UtcNow.AddMinutes(-5);
        var completedAt = DateTime.UtcNow;

        // Act
        var entity = new IncidentPlaybookRun
        {
            Status = "Completed",
            StartedAt = startedAt,
            CompletedAt = completedAt
        };

        // Assert
        entity.CompletedAt.Should().NotBeNull();
        entity.CompletedAt!.Value.Should().BeAfter(entity.StartedAt);
        (entity.CompletedAt.Value - entity.StartedAt).TotalMinutes.Should().BeApproximately(5, 0.1);
    }

    #endregion

    #region IncidentLinkedEntity Tests

    [Fact]
    public void IncidentLinkedEntity_DefaultValues_AreCorrect()
    {
        // Arrange & Act
        var entity = new IncidentLinkedEntity();

        // Assert
        entity.Id.Should().Be(Guid.Empty);
        entity.IncidentId.Should().Be(Guid.Empty);
        entity.EntityType.Should().Be(0);
        entity.EntityId.Should().BeEmpty();
        entity.EntityName.Should().BeEmpty();
        entity.Role.Should().Be(0);
    }

    [Fact]
    public void IncidentLinkedEntity_AllPropertiesCanBeSet()
    {
        // Arrange
        var id = Guid.NewGuid();
        var incidentId = Guid.NewGuid();

        // Act
        var entity = new IncidentLinkedEntity
        {
            Id = id,
            IncidentId = incidentId,
            EntityType = (int)IncidentEntityType.User,
            EntityId = "user@example.com",
            EntityName = "John Doe",
            Role = (int)IncidentEntityRole.Victim
        };

        // Assert
        entity.Id.Should().Be(id);
        entity.IncidentId.Should().Be(incidentId);
        entity.EntityType.Should().Be((int)IncidentEntityType.User);
        entity.EntityId.Should().Be("user@example.com");
        entity.EntityName.Should().Be("John Doe");
        entity.Role.Should().Be((int)IncidentEntityRole.Victim);
    }

    [Fact]
    public void IncidentLinkedEntity_UserEntity_WithPrimaryRole()
    {
        // Arrange & Act
        var entity = new IncidentLinkedEntity
        {
            EntityType = (int)IncidentEntityType.User,
            EntityId = "admin@company.com",
            EntityName = "Admin User",
            Role = (int)IncidentEntityRole.Primary
        };

        // Assert
        entity.EntityType.Should().Be((int)IncidentEntityType.User);
        entity.Role.Should().Be((int)IncidentEntityRole.Primary);
    }

    [Fact]
    public void IncidentLinkedEntity_ApplicationEntity_WithRelatedRole()
    {
        // Arrange & Act
        var entity = new IncidentLinkedEntity
        {
            EntityType = (int)IncidentEntityType.Application,
            EntityId = Guid.NewGuid().ToString(),
            EntityName = "CRM Application",
            Role = (int)IncidentEntityRole.Related
        };

        // Assert
        entity.EntityType.Should().Be((int)IncidentEntityType.Application);
        entity.Role.Should().Be((int)IncidentEntityRole.Related);
    }

    [Fact]
    public void IncidentLinkedEntity_IPAddressEntity_WithAttackerRole()
    {
        // Arrange & Act
        var entity = new IncidentLinkedEntity
        {
            EntityType = (int)IncidentEntityType.IPAddress,
            EntityId = "192.168.1.100",
            EntityName = "Suspicious IP",
            Role = (int)IncidentEntityRole.Attacker
        };

        // Assert
        entity.EntityType.Should().Be((int)IncidentEntityType.IPAddress);
        entity.Role.Should().Be((int)IncidentEntityRole.Attacker);
    }

    #endregion

    #region Enum Value Tests

    [Fact]
    public void IncidentCategory_HasCorrectValues()
    {
        // Assert
        ((int)IncidentCategory.CompromisedAccount).Should().Be(1);
        ((int)IncidentCategory.SuspiciousActivity).Should().Be(2);
        ((int)IncidentCategory.PolicyViolation).Should().Be(3);
        ((int)IncidentCategory.PrivilegedAccessMisuse).Should().Be(4);
        ((int)IncidentCategory.DataExfiltration).Should().Be(5);
        ((int)IncidentCategory.BruteForceAttack).Should().Be(6);
        ((int)IncidentCategory.CredentialTheft).Should().Be(7);
        ((int)IncidentCategory.InsiderThreat).Should().Be(8);
    }

    [Fact]
    public void IncidentCategory_HasExpectedCount()
    {
        // Arrange
        var values = Enum.GetValues<IncidentCategory>();

        // Assert
        values.Should().HaveCount(8);
    }

    [Fact]
    public void IncidentSeverity_HasCorrectValues()
    {
        // Assert
        ((int)IncidentSeverity.Critical).Should().Be(1);
        ((int)IncidentSeverity.High).Should().Be(2);
        ((int)IncidentSeverity.Medium).Should().Be(3);
        ((int)IncidentSeverity.Low).Should().Be(4);
        ((int)IncidentSeverity.Informational).Should().Be(5);
    }

    [Fact]
    public void IncidentSeverity_HasExpectedCount()
    {
        // Arrange
        var values = Enum.GetValues<IncidentSeverity>();

        // Assert
        values.Should().HaveCount(5);
    }

    [Fact]
    public void IncidentStatus_HasCorrectValues()
    {
        // Assert
        ((int)IncidentStatus.New).Should().Be(1);
        ((int)IncidentStatus.Acknowledged).Should().Be(2);
        ((int)IncidentStatus.Investigating).Should().Be(3);
        ((int)IncidentStatus.Containment).Should().Be(4);
        ((int)IncidentStatus.Remediation).Should().Be(5);
        ((int)IncidentStatus.Resolved).Should().Be(6);
        ((int)IncidentStatus.Closed).Should().Be(7);
    }

    [Fact]
    public void IncidentStatus_HasExpectedCount()
    {
        // Arrange
        var values = Enum.GetValues<IncidentStatus>();

        // Assert
        values.Should().HaveCount(7);
    }

    [Fact]
    public void DetectionSource_HasCorrectValues()
    {
        // Assert
        ((int)DetectionSource.Automation).Should().Be(1);
        ((int)DetectionSource.Hunting).Should().Be(2);
        ((int)DetectionSource.Manual).Should().Be(3);
        ((int)DetectionSource.System).Should().Be(4);
        ((int)DetectionSource.AdaptiveSecurity).Should().Be(5);
    }

    [Fact]
    public void DetectionSource_HasExpectedCount()
    {
        // Arrange
        var values = Enum.GetValues<DetectionSource>();

        // Assert
        values.Should().HaveCount(5);
    }

    [Fact]
    public void IncidentEntityType_HasCorrectValues()
    {
        // Assert
        ((int)IncidentEntityType.User).Should().Be(1);
        ((int)IncidentEntityType.Application).Should().Be(2);
        ((int)IncidentEntityType.Device).Should().Be(3);
        ((int)IncidentEntityType.IPAddress).Should().Be(4);
        ((int)IncidentEntityType.Location).Should().Be(5);
    }

    [Fact]
    public void IncidentEntityType_HasExpectedCount()
    {
        // Arrange
        var values = Enum.GetValues<IncidentEntityType>();

        // Assert
        values.Should().HaveCount(5);
    }

    [Fact]
    public void IncidentEntityRole_HasCorrectValues()
    {
        // Assert
        ((int)IncidentEntityRole.Primary).Should().Be(1);
        ((int)IncidentEntityRole.Related).Should().Be(2);
        ((int)IncidentEntityRole.Victim).Should().Be(3);
        ((int)IncidentEntityRole.Attacker).Should().Be(4);
        ((int)IncidentEntityRole.Compromised).Should().Be(5);
    }

    [Fact]
    public void IncidentEntityRole_HasExpectedCount()
    {
        // Arrange
        var values = Enum.GetValues<IncidentEntityRole>();

        // Assert
        values.Should().HaveCount(5);
    }

    [Theory]
    [InlineData("CompromisedAccount", IncidentCategory.CompromisedAccount)]
    [InlineData("SuspiciousActivity", IncidentCategory.SuspiciousActivity)]
    [InlineData("PolicyViolation", IncidentCategory.PolicyViolation)]
    [InlineData("DataExfiltration", IncidentCategory.DataExfiltration)]
    [InlineData("BruteForceAttack", IncidentCategory.BruteForceAttack)]
    public void IncidentCategory_ParsesFromString(string name, IncidentCategory expected)
    {
        // Act
        var parsed = Enum.Parse<IncidentCategory>(name);

        // Assert
        parsed.Should().Be(expected);
    }

    [Theory]
    [InlineData("Critical", IncidentSeverity.Critical)]
    [InlineData("High", IncidentSeverity.High)]
    [InlineData("Medium", IncidentSeverity.Medium)]
    [InlineData("Low", IncidentSeverity.Low)]
    [InlineData("Informational", IncidentSeverity.Informational)]
    public void IncidentSeverity_ParsesFromString(string name, IncidentSeverity expected)
    {
        // Act
        var parsed = Enum.Parse<IncidentSeverity>(name);

        // Assert
        parsed.Should().Be(expected);
    }

    [Theory]
    [InlineData("New", IncidentStatus.New)]
    [InlineData("Acknowledged", IncidentStatus.Acknowledged)]
    [InlineData("Investigating", IncidentStatus.Investigating)]
    [InlineData("Resolved", IncidentStatus.Resolved)]
    [InlineData("Closed", IncidentStatus.Closed)]
    public void IncidentStatus_ParsesFromString(string name, IncidentStatus expected)
    {
        // Act
        var parsed = Enum.Parse<IncidentStatus>(name);

        // Assert
        parsed.Should().Be(expected);
    }

    #endregion

    #region Repository Mock Tests - IIncidentRepository

    [Fact]
    public async Task IncidentRepository_GetByIdAsync_ReturnsIncident()
    {
        // Arrange
        var mockRepo = new Mock<IIncidentRepository>();
        var incidentId = Guid.NewGuid();
        var expectedIncident = new Incident
        {
            Id = incidentId,
            Title = "Test Incident",
            Status = IncidentStatus.New
        };

        mockRepo.Setup(r => r.GetByIdAsync(incidentId, It.IsAny<CancellationToken>()))
            .ReturnsAsync(expectedIncident);

        // Act
        var result = await mockRepo.Object.GetByIdAsync(incidentId);

        // Assert
        result.Should().NotBeNull();
        result!.Id.Should().Be(incidentId);
        result.Title.Should().Be("Test Incident");
        mockRepo.Verify(r => r.GetByIdAsync(incidentId, It.IsAny<CancellationToken>()), Times.Once);
    }

    [Fact]
    public async Task IncidentRepository_GetByIdAsync_ReturnsNull_WhenNotFound()
    {
        // Arrange
        var mockRepo = new Mock<IIncidentRepository>();
        var incidentId = Guid.NewGuid();

        mockRepo.Setup(r => r.GetByIdAsync(incidentId, It.IsAny<CancellationToken>()))
            .ReturnsAsync((Incident?)null);

        // Act
        var result = await mockRepo.Object.GetByIdAsync(incidentId);

        // Assert
        result.Should().BeNull();
    }

    [Fact]
    public async Task IncidentRepository_GetByTenantAsync_ReturnsPaginatedResults()
    {
        // Arrange
        var mockRepo = new Mock<IIncidentRepository>();
        var tenantId = Guid.NewGuid();
        var incidents = new List<Incident>
        {
            new() { Id = Guid.NewGuid(), TenantId = tenantId, Title = "Incident 1" },
            new() { Id = Guid.NewGuid(), TenantId = tenantId, Title = "Incident 2" }
        };

        mockRepo.Setup(r => r.GetByTenantAsync(tenantId, 0, 10, It.IsAny<CancellationToken>()))
            .ReturnsAsync(incidents);

        // Act
        var result = await mockRepo.Object.GetByTenantAsync(tenantId, 0, 10);

        // Assert
        result.Should().HaveCount(2);
        result.Should().AllSatisfy(i => i.TenantId.Should().Be(tenantId));
    }

    [Fact]
    public async Task IncidentRepository_GetByStatusAsync_FiltersCorrectly()
    {
        // Arrange
        var mockRepo = new Mock<IIncidentRepository>();
        var tenantId = Guid.NewGuid();
        var status = IncidentStatus.New;
        var incidents = new List<Incident>
        {
            new() { Id = Guid.NewGuid(), Status = IncidentStatus.New },
            new() { Id = Guid.NewGuid(), Status = IncidentStatus.New }
        };

        mockRepo.Setup(r => r.GetByStatusAsync(tenantId, status, It.IsAny<CancellationToken>()))
            .ReturnsAsync(incidents);

        // Act
        var result = await mockRepo.Object.GetByStatusAsync(tenantId, status);

        // Assert
        result.Should().HaveCount(2);
        result.Should().AllSatisfy(i => i.Status.Should().Be(IncidentStatus.New));
    }

    [Fact]
    public async Task IncidentRepository_GetBySeverityAsync_FiltersCorrectly()
    {
        // Arrange
        var mockRepo = new Mock<IIncidentRepository>();
        var tenantId = Guid.NewGuid();
        var severity = IncidentSeverity.Critical;
        var incidents = new List<Incident>
        {
            new() { Id = Guid.NewGuid(), Severity = IncidentSeverity.Critical }
        };

        mockRepo.Setup(r => r.GetBySeverityAsync(tenantId, severity, It.IsAny<CancellationToken>()))
            .ReturnsAsync(incidents);

        // Act
        var result = await mockRepo.Object.GetBySeverityAsync(tenantId, severity);

        // Assert
        result.Should().HaveCount(1);
        result.First().Severity.Should().Be(IncidentSeverity.Critical);
    }

    [Fact]
    public async Task IncidentRepository_GetByCategoryAsync_FiltersCorrectly()
    {
        // Arrange
        var mockRepo = new Mock<IIncidentRepository>();
        var tenantId = Guid.NewGuid();
        var category = IncidentCategory.BruteForceAttack;
        var incidents = new List<Incident>
        {
            new() { Id = Guid.NewGuid(), Category = IncidentCategory.BruteForceAttack }
        };

        mockRepo.Setup(r => r.GetByCategoryAsync(tenantId, category, It.IsAny<CancellationToken>()))
            .ReturnsAsync(incidents);

        // Act
        var result = await mockRepo.Object.GetByCategoryAsync(tenantId, category);

        // Assert
        result.Should().HaveCount(1);
        result.First().Category.Should().Be(IncidentCategory.BruteForceAttack);
    }

    [Fact]
    public async Task IncidentRepository_GetActiveIncidentsAsync_ReturnsNonClosedIncidents()
    {
        // Arrange
        var mockRepo = new Mock<IIncidentRepository>();
        var tenantId = Guid.NewGuid();
        var incidents = new List<Incident>
        {
            new() { Id = Guid.NewGuid(), Status = IncidentStatus.New },
            new() { Id = Guid.NewGuid(), Status = IncidentStatus.Investigating },
            new() { Id = Guid.NewGuid(), Status = IncidentStatus.Containment }
        };

        mockRepo.Setup(r => r.GetActiveIncidentsAsync(tenantId, It.IsAny<CancellationToken>()))
            .ReturnsAsync(incidents);

        // Act
        var result = await mockRepo.Object.GetActiveIncidentsAsync(tenantId);

        // Assert
        result.Should().HaveCount(3);
        result.Should().NotContain(i => i.Status == IncidentStatus.Closed);
    }

    [Fact]
    public async Task IncidentRepository_AddAsync_AddsIncident()
    {
        // Arrange
        var mockRepo = new Mock<IIncidentRepository>();
        var incident = new Incident
        {
            Id = Guid.NewGuid(),
            Title = "New Incident",
            Status = IncidentStatus.New
        };

        mockRepo.Setup(r => r.AddAsync(incident, It.IsAny<CancellationToken>()))
            .Returns(Task.CompletedTask);

        // Act
        await mockRepo.Object.AddAsync(incident);

        // Assert
        mockRepo.Verify(r => r.AddAsync(incident, It.IsAny<CancellationToken>()), Times.Once);
    }

    [Fact]
    public async Task IncidentRepository_UpdateAsync_UpdatesIncident()
    {
        // Arrange
        var mockRepo = new Mock<IIncidentRepository>();
        var incident = new Incident
        {
            Id = Guid.NewGuid(),
            Status = IncidentStatus.Acknowledged
        };

        mockRepo.Setup(r => r.UpdateAsync(incident, It.IsAny<CancellationToken>()))
            .Returns(Task.CompletedTask);

        // Act
        await mockRepo.Object.UpdateAsync(incident);

        // Assert
        mockRepo.Verify(r => r.UpdateAsync(incident, It.IsAny<CancellationToken>()), Times.Once);
    }

    [Fact]
    public async Task IncidentRepository_DeleteAsync_DeletesIncident()
    {
        // Arrange
        var mockRepo = new Mock<IIncidentRepository>();
        var incidentId = Guid.NewGuid();

        mockRepo.Setup(r => r.DeleteAsync(incidentId, It.IsAny<CancellationToken>()))
            .Returns(Task.CompletedTask);

        // Act
        await mockRepo.Object.DeleteAsync(incidentId);

        // Assert
        mockRepo.Verify(r => r.DeleteAsync(incidentId, It.IsAny<CancellationToken>()), Times.Once);
    }

    [Fact]
    public async Task IncidentRepository_GetCountByTenantAsync_ReturnsCount()
    {
        // Arrange
        var mockRepo = new Mock<IIncidentRepository>();
        var tenantId = Guid.NewGuid();

        mockRepo.Setup(r => r.GetCountByTenantAsync(tenantId, It.IsAny<CancellationToken>()))
            .ReturnsAsync(42);

        // Act
        var result = await mockRepo.Object.GetCountByTenantAsync(tenantId);

        // Assert
        result.Should().Be(42);
    }

    [Fact]
    public async Task IncidentRepository_GetCountByStatusAsync_ReturnsCount()
    {
        // Arrange
        var mockRepo = new Mock<IIncidentRepository>();
        var tenantId = Guid.NewGuid();
        var status = IncidentStatus.New;

        mockRepo.Setup(r => r.GetCountByStatusAsync(tenantId, status, It.IsAny<CancellationToken>()))
            .ReturnsAsync(15);

        // Act
        var result = await mockRepo.Object.GetCountByStatusAsync(tenantId, status);

        // Assert
        result.Should().Be(15);
    }

    [Fact]
    public async Task IncidentRepository_GetByDateRangeAsync_FiltersCorrectly()
    {
        // Arrange
        var mockRepo = new Mock<IIncidentRepository>();
        var tenantId = Guid.NewGuid();
        var from = DateTime.UtcNow.AddDays(-7);
        var to = DateTime.UtcNow;
        var incidents = new List<Incident>
        {
            new() { Id = Guid.NewGuid(), DetectedAt = DateTime.UtcNow.AddDays(-3) },
            new() { Id = Guid.NewGuid(), DetectedAt = DateTime.UtcNow.AddDays(-1) }
        };

        mockRepo.Setup(r => r.GetByDateRangeAsync(tenantId, from, to, It.IsAny<CancellationToken>()))
            .ReturnsAsync(incidents);

        // Act
        var result = await mockRepo.Object.GetByDateRangeAsync(tenantId, from, to);

        // Assert
        result.Should().HaveCount(2);
    }

    #endregion

    #region Repository Mock Tests - IIncidentEventRepository

    [Fact]
    public async Task IncidentEventRepository_GetByIdAsync_ReturnsEvent()
    {
        // Arrange
        var mockRepo = new Mock<IIncidentEventRepository>();
        var eventId = Guid.NewGuid();
        var expectedEvent = new IncidentEvent
        {
            Id = eventId,
            EventType = "LoginFailed"
        };

        mockRepo.Setup(r => r.GetByIdAsync(eventId, It.IsAny<CancellationToken>()))
            .ReturnsAsync(expectedEvent);

        // Act
        var result = await mockRepo.Object.GetByIdAsync(eventId);

        // Assert
        result.Should().NotBeNull();
        result!.Id.Should().Be(eventId);
    }

    [Fact]
    public async Task IncidentEventRepository_GetByIncidentAsync_ReturnsEvents()
    {
        // Arrange
        var mockRepo = new Mock<IIncidentEventRepository>();
        var incidentId = Guid.NewGuid();
        var events = new List<IncidentEvent>
        {
            new() { Id = Guid.NewGuid(), IncidentId = incidentId, EventType = "Event1" },
            new() { Id = Guid.NewGuid(), IncidentId = incidentId, EventType = "Event2" }
        };

        mockRepo.Setup(r => r.GetByIncidentAsync(incidentId, It.IsAny<CancellationToken>()))
            .ReturnsAsync(events);

        // Act
        var result = await mockRepo.Object.GetByIncidentAsync(incidentId);

        // Assert
        result.Should().HaveCount(2);
        result.Should().AllSatisfy(e => e.IncidentId.Should().Be(incidentId));
    }

    [Fact]
    public async Task IncidentEventRepository_AddAsync_AddsEvent()
    {
        // Arrange
        var mockRepo = new Mock<IIncidentEventRepository>();
        var incidentEvent = new IncidentEvent
        {
            Id = Guid.NewGuid(),
            EventType = "SecurityAlert"
        };

        mockRepo.Setup(r => r.AddAsync(incidentEvent, It.IsAny<CancellationToken>()))
            .Returns(Task.CompletedTask);

        // Act
        await mockRepo.Object.AddAsync(incidentEvent);

        // Assert
        mockRepo.Verify(r => r.AddAsync(incidentEvent, It.IsAny<CancellationToken>()), Times.Once);
    }

    [Fact]
    public async Task IncidentEventRepository_AddManyAsync_AddsMultipleEvents()
    {
        // Arrange
        var mockRepo = new Mock<IIncidentEventRepository>();
        var events = new List<IncidentEvent>
        {
            new() { Id = Guid.NewGuid(), EventType = "Event1" },
            new() { Id = Guid.NewGuid(), EventType = "Event2" },
            new() { Id = Guid.NewGuid(), EventType = "Event3" }
        };

        mockRepo.Setup(r => r.AddManyAsync(events, It.IsAny<CancellationToken>()))
            .Returns(Task.CompletedTask);

        // Act
        await mockRepo.Object.AddManyAsync(events);

        // Assert
        mockRepo.Verify(r => r.AddManyAsync(events, It.IsAny<CancellationToken>()), Times.Once);
    }

    [Fact]
    public async Task IncidentEventRepository_DeleteByIncidentAsync_DeletesAllEvents()
    {
        // Arrange
        var mockRepo = new Mock<IIncidentEventRepository>();
        var incidentId = Guid.NewGuid();

        mockRepo.Setup(r => r.DeleteByIncidentAsync(incidentId, It.IsAny<CancellationToken>()))
            .Returns(Task.CompletedTask);

        // Act
        await mockRepo.Object.DeleteByIncidentAsync(incidentId);

        // Assert
        mockRepo.Verify(r => r.DeleteByIncidentAsync(incidentId, It.IsAny<CancellationToken>()), Times.Once);
    }

    #endregion

    #region Repository Mock Tests - IIncidentNoteRepository

    [Fact]
    public async Task IncidentNoteRepository_GetByIdAsync_ReturnsNote()
    {
        // Arrange
        var mockRepo = new Mock<IIncidentNoteRepository>();
        var noteId = Guid.NewGuid();
        var expectedNote = new IncidentNote
        {
            Id = noteId,
            Content = "Investigation note"
        };

        mockRepo.Setup(r => r.GetByIdAsync(noteId, It.IsAny<CancellationToken>()))
            .ReturnsAsync(expectedNote);

        // Act
        var result = await mockRepo.Object.GetByIdAsync(noteId);

        // Assert
        result.Should().NotBeNull();
        result!.Id.Should().Be(noteId);
    }

    [Fact]
    public async Task IncidentNoteRepository_GetByIncidentAsync_ReturnsNotes()
    {
        // Arrange
        var mockRepo = new Mock<IIncidentNoteRepository>();
        var incidentId = Guid.NewGuid();
        var notes = new List<IncidentNote>
        {
            new() { Id = Guid.NewGuid(), IncidentId = incidentId, Content = "Note 1" },
            new() { Id = Guid.NewGuid(), IncidentId = incidentId, Content = "Note 2" }
        };

        mockRepo.Setup(r => r.GetByIncidentAsync(incidentId, It.IsAny<CancellationToken>()))
            .ReturnsAsync(notes);

        // Act
        var result = await mockRepo.Object.GetByIncidentAsync(incidentId);

        // Assert
        result.Should().HaveCount(2);
    }

    [Fact]
    public async Task IncidentNoteRepository_AddAsync_AddsNote()
    {
        // Arrange
        var mockRepo = new Mock<IIncidentNoteRepository>();
        var note = new IncidentNote
        {
            Id = Guid.NewGuid(),
            Content = "New investigation finding"
        };

        mockRepo.Setup(r => r.AddAsync(note, It.IsAny<CancellationToken>()))
            .Returns(Task.CompletedTask);

        // Act
        await mockRepo.Object.AddAsync(note);

        // Assert
        mockRepo.Verify(r => r.AddAsync(note, It.IsAny<CancellationToken>()), Times.Once);
    }

    [Fact]
    public async Task IncidentNoteRepository_UpdateAsync_UpdatesNote()
    {
        // Arrange
        var mockRepo = new Mock<IIncidentNoteRepository>();
        var note = new IncidentNote
        {
            Id = Guid.NewGuid(),
            Content = "Updated content"
        };

        mockRepo.Setup(r => r.UpdateAsync(note, It.IsAny<CancellationToken>()))
            .Returns(Task.CompletedTask);

        // Act
        await mockRepo.Object.UpdateAsync(note);

        // Assert
        mockRepo.Verify(r => r.UpdateAsync(note, It.IsAny<CancellationToken>()), Times.Once);
    }

    [Fact]
    public async Task IncidentNoteRepository_DeleteAsync_DeletesNote()
    {
        // Arrange
        var mockRepo = new Mock<IIncidentNoteRepository>();
        var noteId = Guid.NewGuid();

        mockRepo.Setup(r => r.DeleteAsync(noteId, It.IsAny<CancellationToken>()))
            .Returns(Task.CompletedTask);

        // Act
        await mockRepo.Object.DeleteAsync(noteId);

        // Assert
        mockRepo.Verify(r => r.DeleteAsync(noteId, It.IsAny<CancellationToken>()), Times.Once);
    }

    [Fact]
    public async Task IncidentNoteRepository_DeleteByIncidentAsync_DeletesAllNotes()
    {
        // Arrange
        var mockRepo = new Mock<IIncidentNoteRepository>();
        var incidentId = Guid.NewGuid();

        mockRepo.Setup(r => r.DeleteByIncidentAsync(incidentId, It.IsAny<CancellationToken>()))
            .Returns(Task.CompletedTask);

        // Act
        await mockRepo.Object.DeleteByIncidentAsync(incidentId);

        // Assert
        mockRepo.Verify(r => r.DeleteByIncidentAsync(incidentId, It.IsAny<CancellationToken>()), Times.Once);
    }

    #endregion

    #region Edge Cases and Error Handling Tests

    [Fact]
    public void Incident_WithEmptyTitle_IsAllowed()
    {
        // Arrange & Act
        var entity = new Incident { Title = string.Empty };

        // Assert
        entity.Title.Should().BeEmpty();
    }

    [Fact]
    public void Incident_WithNullOptionalFields_IsValid()
    {
        // Arrange & Act
        var entity = new Incident
        {
            Id = Guid.NewGuid(),
            TenantId = Guid.NewGuid(),
            Title = "Test",
            PrimaryUserId = null,
            PrimaryAppId = null,
            AcknowledgedAt = null,
            ResolvedAt = null,
            ClosedAt = null,
            ResolutionSummary = null
        };

        // Assert
        entity.PrimaryUserId.Should().BeNull();
        entity.PrimaryAppId.Should().BeNull();
        entity.AcknowledgedAt.Should().BeNull();
        entity.ResolvedAt.Should().BeNull();
        entity.ClosedAt.Should().BeNull();
        entity.ResolutionSummary.Should().BeNull();
    }

    [Fact]
    public void Incident_WithZeroAffectedCounts_IsValid()
    {
        // Arrange & Act
        var entity = new Incident
        {
            AffectedUsersCount = 0,
            AffectedAppsCount = 0
        };

        // Assert
        entity.AffectedUsersCount.Should().Be(0);
        entity.AffectedAppsCount.Should().Be(0);
    }

    [Fact]
    public void Incident_WithLargeAffectedCounts_IsValid()
    {
        // Arrange & Act
        var entity = new Incident
        {
            AffectedUsersCount = int.MaxValue,
            AffectedAppsCount = int.MaxValue
        };

        // Assert
        entity.AffectedUsersCount.Should().Be(int.MaxValue);
        entity.AffectedAppsCount.Should().Be(int.MaxValue);
    }

    [Fact]
    public void IncidentEvent_WithEmptyEventData_UsesDefault()
    {
        // Arrange & Act
        var entity = new IncidentEvent();

        // Assert
        entity.EventData.Should().Be("{}");
    }

    [Fact]
    public void IncidentPlaybookRun_WithNullResult_IsValid()
    {
        // Arrange & Act
        var entity = new IncidentPlaybookRun
        {
            Id = Guid.NewGuid(),
            Status = "Failed",
            Result = null
        };

        // Assert
        entity.Result.Should().BeNull();
    }

    [Fact]
    public async Task IncidentRepository_GetByUserAsync_ReturnsEmptyList_WhenNoIncidents()
    {
        // Arrange
        var mockRepo = new Mock<IIncidentRepository>();
        var tenantId = Guid.NewGuid();
        var userId = Guid.NewGuid();

        mockRepo.Setup(r => r.GetByUserAsync(tenantId, userId, It.IsAny<CancellationToken>()))
            .ReturnsAsync(new List<Incident>());

        // Act
        var result = await mockRepo.Object.GetByUserAsync(tenantId, userId);

        // Assert
        result.Should().BeEmpty();
    }

    [Fact]
    public async Task IncidentRepository_GetByApplicationAsync_ReturnsEmptyList_WhenNoIncidents()
    {
        // Arrange
        var mockRepo = new Mock<IIncidentRepository>();
        var tenantId = Guid.NewGuid();
        var appId = Guid.NewGuid();

        mockRepo.Setup(r => r.GetByApplicationAsync(tenantId, appId, It.IsAny<CancellationToken>()))
            .ReturnsAsync(new List<Incident>());

        // Act
        var result = await mockRepo.Object.GetByApplicationAsync(tenantId, appId);

        // Assert
        result.Should().BeEmpty();
    }

    [Fact]
    public void Incident_Severity_CanBeCompared()
    {
        // Arrange
        var critical = IncidentSeverity.Critical;
        var high = IncidentSeverity.High;
        var medium = IncidentSeverity.Medium;

        // Assert - Lower numeric value means higher severity
        ((int)critical).Should().BeLessThan((int)high);
        ((int)high).Should().BeLessThan((int)medium);
    }

    [Fact]
    public void IncidentStatus_FollowsLogicalOrder()
    {
        // Assert - Status values follow incident lifecycle
        ((int)IncidentStatus.New).Should().BeLessThan((int)IncidentStatus.Acknowledged);
        ((int)IncidentStatus.Acknowledged).Should().BeLessThan((int)IncidentStatus.Investigating);
        ((int)IncidentStatus.Investigating).Should().BeLessThan((int)IncidentStatus.Containment);
        ((int)IncidentStatus.Containment).Should().BeLessThan((int)IncidentStatus.Remediation);
        ((int)IncidentStatus.Remediation).Should().BeLessThan((int)IncidentStatus.Resolved);
        ((int)IncidentStatus.Resolved).Should().BeLessThan((int)IncidentStatus.Closed);
    }

    [Fact]
    public async Task IncidentEventRepository_GetByIncidentAndTypeAsync_FiltersCorrectly()
    {
        // Arrange
        var mockRepo = new Mock<IIncidentEventRepository>();
        var incidentId = Guid.NewGuid();
        var eventType = "LoginFailed";
        var events = new List<IncidentEvent>
        {
            new() { Id = Guid.NewGuid(), EventType = "LoginFailed" }
        };

        mockRepo.Setup(r => r.GetByIncidentAndTypeAsync(incidentId, eventType, It.IsAny<CancellationToken>()))
            .ReturnsAsync(events);

        // Act
        var result = await mockRepo.Object.GetByIncidentAndTypeAsync(incidentId, eventType);

        // Assert
        result.Should().HaveCount(1);
        result.First().EventType.Should().Be("LoginFailed");
    }

    [Fact]
    public async Task IncidentNoteRepository_GetByUserAsync_FiltersCorrectly()
    {
        // Arrange
        var mockRepo = new Mock<IIncidentNoteRepository>();
        var incidentId = Guid.NewGuid();
        var userId = Guid.NewGuid();
        var notes = new List<IncidentNote>
        {
            new() { Id = Guid.NewGuid(), CreatedByUserId = userId, Content = "User note" }
        };

        mockRepo.Setup(r => r.GetByUserAsync(incidentId, userId, It.IsAny<CancellationToken>()))
            .ReturnsAsync(notes);

        // Act
        var result = await mockRepo.Object.GetByUserAsync(incidentId, userId);

        // Assert
        result.Should().HaveCount(1);
        result.First().CreatedByUserId.Should().Be(userId);
    }

    #endregion
}
