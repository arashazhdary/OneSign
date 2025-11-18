using FluentAssertions;
using Onesign.Modules.Privacy.Application.DTOs;
using Onesign.Modules.Privacy.Domain.Entities;
using Onesign.Modules.Privacy.Domain.Enums;
using Onesign.Modules.Privacy.Infrastructure.EfCore.Entities;
using Xunit;

namespace Onesign.Api.Tests.Privacy;

public class PrivacyEntityTests
{
    #region DataSubjectRequest Entity Tests

    [Fact]
    public void DataSubjectRequest_CanBeCreated_WithAllProperties()
    {
        // Arrange & Act
        var id = Guid.NewGuid();
        var tenantId = Guid.NewGuid();
        var subjectId = Guid.NewGuid();
        var requestedBy = Guid.NewGuid();
        var requestedAt = DateTime.UtcNow;
        var completedAt = DateTime.UtcNow.AddHours(1);

        var request = new DataSubjectRequest
        {
            Id = id,
            TenantId = tenantId,
            SubjectId = subjectId,
            Type = DataSubjectRequestType.Export,
            Status = DataSubjectRequestStatus.Completed,
            RequestedAt = requestedAt,
            RequestedBy = requestedBy,
            CompletedAt = completedAt,
            ResultLocation = "/exports/data.zip",
            Reason = "GDPR request"
        };

        // Assert
        request.Id.Should().Be(id);
        request.TenantId.Should().Be(tenantId);
        request.SubjectId.Should().Be(subjectId);
        request.Type.Should().Be(DataSubjectRequestType.Export);
        request.Status.Should().Be(DataSubjectRequestStatus.Completed);
        request.RequestedAt.Should().Be(requestedAt);
        request.RequestedBy.Should().Be(requestedBy);
        request.CompletedAt.Should().Be(completedAt);
        request.ResultLocation.Should().Be("/exports/data.zip");
        request.Reason.Should().Be("GDPR request");
    }

    [Fact]
    public void DataSubjectRequest_DefaultValues_AreCorrect()
    {
        // Arrange & Act
        var request = new DataSubjectRequest();

        // Assert
        request.Id.Should().Be(Guid.Empty);
        request.TenantId.Should().Be(Guid.Empty);
        request.SubjectId.Should().Be(Guid.Empty);
        request.RequestedBy.Should().Be(Guid.Empty);
        request.CompletedAt.Should().BeNull();
        request.ResultLocation.Should().BeNull();
        request.Reason.Should().BeNull();
    }

    #endregion

    #region DataRetentionPolicy Entity Tests

    [Fact]
    public void DataRetentionPolicy_CanBeCreated_WithAllProperties()
    {
        // Arrange & Act
        var id = Guid.NewGuid();
        var tenantId = Guid.NewGuid();
        var createdAt = DateTime.UtcNow.AddDays(-30);
        var updatedAt = DateTime.UtcNow;

        var policy = new DataRetentionPolicy
        {
            Id = id,
            TenantId = tenantId,
            DataCategory = DataCategory.AuditLogs,
            RetentionPeriodDays = 180,
            HardDeleteAfter = true,
            Enabled = true,
            CreatedAt = createdAt,
            UpdatedAt = updatedAt
        };

        // Assert
        policy.Id.Should().Be(id);
        policy.TenantId.Should().Be(tenantId);
        policy.DataCategory.Should().Be(DataCategory.AuditLogs);
        policy.RetentionPeriodDays.Should().Be(180);
        policy.HardDeleteAfter.Should().BeTrue();
        policy.Enabled.Should().BeTrue();
        policy.CreatedAt.Should().Be(createdAt);
        policy.UpdatedAt.Should().Be(updatedAt);
    }

    [Fact]
    public void DataRetentionPolicy_DefaultValues_AreCorrect()
    {
        // Arrange & Act
        var policy = new DataRetentionPolicy();

        // Assert
        policy.Id.Should().Be(Guid.Empty);
        policy.TenantId.Should().Be(Guid.Empty);
        policy.RetentionPeriodDays.Should().Be(0);
        policy.HardDeleteAfter.Should().BeFalse();
        policy.Enabled.Should().BeFalse();
    }

    #endregion

    #region DataSubjectRequestDto Tests

    [Fact]
    public void DataSubjectRequestDto_CanBeCreated_WithAllProperties()
    {
        // Arrange & Act
        var dto = new DataSubjectRequestDto
        {
            Id = Guid.NewGuid(),
            TenantId = Guid.NewGuid(),
            SubjectId = Guid.NewGuid(),
            Type = "Export",
            Status = "Completed",
            RequestedAt = DateTime.UtcNow,
            RequestedBy = Guid.NewGuid(),
            CompletedAt = DateTime.UtcNow.AddHours(1),
            ResultLocation = "/exports/data.zip",
            Reason = "Test reason"
        };

        // Assert
        dto.Id.Should().NotBeEmpty();
        dto.TenantId.Should().NotBeEmpty();
        dto.SubjectId.Should().NotBeEmpty();
        dto.Type.Should().Be("Export");
        dto.Status.Should().Be("Completed");
        dto.RequestedBy.Should().NotBeEmpty();
        dto.CompletedAt.Should().NotBeNull();
        dto.ResultLocation.Should().Be("/exports/data.zip");
        dto.Reason.Should().Be("Test reason");
    }

    [Fact]
    public void DataSubjectRequestDto_DefaultValues_AreCorrect()
    {
        // Arrange & Act
        var dto = new DataSubjectRequestDto();

        // Assert
        dto.Type.Should().BeEmpty();
        dto.Status.Should().BeEmpty();
        dto.CompletedAt.Should().BeNull();
        dto.ResultLocation.Should().BeNull();
        dto.Reason.Should().BeNull();
    }

    #endregion

    #region DataRetentionPolicyDto Tests

    [Fact]
    public void DataRetentionPolicyDto_CanBeCreated_WithAllProperties()
    {
        // Arrange & Act
        var dto = new DataRetentionPolicyDto
        {
            Id = Guid.NewGuid(),
            TenantId = Guid.NewGuid(),
            DataCategory = "AuditLogs",
            RetentionPeriodDays = 180,
            HardDeleteAfter = true,
            Enabled = true,
            CreatedAt = DateTime.UtcNow.AddDays(-30),
            UpdatedAt = DateTime.UtcNow
        };

        // Assert
        dto.Id.Should().NotBeEmpty();
        dto.TenantId.Should().NotBeEmpty();
        dto.DataCategory.Should().Be("AuditLogs");
        dto.RetentionPeriodDays.Should().Be(180);
        dto.HardDeleteAfter.Should().BeTrue();
        dto.Enabled.Should().BeTrue();
    }

    [Fact]
    public void DataRetentionPolicyDto_DefaultValues_AreCorrect()
    {
        // Arrange & Act
        var dto = new DataRetentionPolicyDto();

        // Assert
        dto.DataCategory.Should().BeEmpty();
        dto.RetentionPeriodDays.Should().Be(0);
        dto.HardDeleteAfter.Should().BeFalse();
        dto.Enabled.Should().BeFalse();
    }

    #endregion

    #region EfCore Entity Tests

    [Fact]
    public void DataSubjectRequestEntity_CanBeCreated_WithAllProperties()
    {
        // Arrange & Act
        var entity = new DataSubjectRequestEntity
        {
            Id = Guid.NewGuid(),
            TenantId = Guid.NewGuid(),
            SubjectId = Guid.NewGuid(),
            Type = 1,
            Status = 5,
            RequestedAt = DateTime.UtcNow,
            RequestedBy = Guid.NewGuid(),
            CompletedAt = DateTime.UtcNow.AddHours(1),
            ResultLocation = "/exports/data.zip",
            Reason = "Test reason"
        };

        // Assert
        entity.Id.Should().NotBeEmpty();
        entity.Type.Should().Be(1);
        entity.Status.Should().Be(5);
        entity.CompletedAt.Should().NotBeNull();
        entity.ResultLocation.Should().Be("/exports/data.zip");
        entity.Reason.Should().Be("Test reason");
    }

    [Fact]
    public void DataRetentionPolicyEntity_CanBeCreated_WithAllProperties()
    {
        // Arrange & Act
        var entity = new DataRetentionPolicyEntity
        {
            Id = Guid.NewGuid(),
            TenantId = Guid.NewGuid(),
            DataCategory = 3,
            RetentionPeriodDays = 180,
            HardDeleteAfter = true,
            Enabled = true,
            CreatedAt = DateTime.UtcNow.AddDays(-30),
            UpdatedAt = DateTime.UtcNow
        };

        // Assert
        entity.Id.Should().NotBeEmpty();
        entity.DataCategory.Should().Be(3);
        entity.RetentionPeriodDays.Should().Be(180);
        entity.HardDeleteAfter.Should().BeTrue();
        entity.Enabled.Should().BeTrue();
    }

    #endregion

    #region Enum Tests

    [Fact]
    public void DataSubjectRequestStatus_HasCorrectValues()
    {
        // Assert
        ((int)DataSubjectRequestStatus.Requested).Should().Be(1);
        ((int)DataSubjectRequestStatus.InReview).Should().Be(2);
        ((int)DataSubjectRequestStatus.Approved).Should().Be(3);
        ((int)DataSubjectRequestStatus.Processing).Should().Be(4);
        ((int)DataSubjectRequestStatus.Completed).Should().Be(5);
        ((int)DataSubjectRequestStatus.Rejected).Should().Be(6);
    }

    [Fact]
    public void DataSubjectRequestType_HasCorrectValues()
    {
        // Assert
        ((int)DataSubjectRequestType.Export).Should().Be(1);
        ((int)DataSubjectRequestType.Delete).Should().Be(2);
    }

    [Fact]
    public void DataCategory_HasCorrectValues()
    {
        // Assert
        ((int)DataCategory.IdentityProfile).Should().Be(1);
        ((int)DataCategory.AuthEvents).Should().Be(2);
        ((int)DataCategory.AuditLogs).Should().Be(3);
        ((int)DataCategory.FederationLogs).Should().Be(4);
        ((int)DataCategory.AccessRequests).Should().Be(5);
        ((int)DataCategory.LifecycleHistory).Should().Be(6);
    }

    [Fact]
    public void DataSubjectRequestStatus_CanBeParsed()
    {
        // Assert
        Enum.Parse<DataSubjectRequestStatus>("Requested").Should().Be(DataSubjectRequestStatus.Requested);
        Enum.Parse<DataSubjectRequestStatus>("InReview").Should().Be(DataSubjectRequestStatus.InReview);
        Enum.Parse<DataSubjectRequestStatus>("Approved").Should().Be(DataSubjectRequestStatus.Approved);
        Enum.Parse<DataSubjectRequestStatus>("Processing").Should().Be(DataSubjectRequestStatus.Processing);
        Enum.Parse<DataSubjectRequestStatus>("Completed").Should().Be(DataSubjectRequestStatus.Completed);
        Enum.Parse<DataSubjectRequestStatus>("Rejected").Should().Be(DataSubjectRequestStatus.Rejected);
    }

    [Fact]
    public void DataSubjectRequestType_CanBeParsed()
    {
        // Assert
        Enum.Parse<DataSubjectRequestType>("Export").Should().Be(DataSubjectRequestType.Export);
        Enum.Parse<DataSubjectRequestType>("Delete").Should().Be(DataSubjectRequestType.Delete);
    }

    [Fact]
    public void DataCategory_CanBeParsed()
    {
        // Assert
        Enum.Parse<DataCategory>("IdentityProfile").Should().Be(DataCategory.IdentityProfile);
        Enum.Parse<DataCategory>("AuthEvents").Should().Be(DataCategory.AuthEvents);
        Enum.Parse<DataCategory>("AuditLogs").Should().Be(DataCategory.AuditLogs);
        Enum.Parse<DataCategory>("FederationLogs").Should().Be(DataCategory.FederationLogs);
        Enum.Parse<DataCategory>("AccessRequests").Should().Be(DataCategory.AccessRequests);
        Enum.Parse<DataCategory>("LifecycleHistory").Should().Be(DataCategory.LifecycleHistory);
    }

    #endregion
}
