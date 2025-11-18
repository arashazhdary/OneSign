using FluentAssertions;
using Onesign.Modules.Governance.Application.DTOs;
using Onesign.Modules.Governance.Domain.Entities;
using Onesign.Modules.Governance.Domain.Enums;
using Xunit;

namespace Onesign.Api.Tests.Governance;

public class GovernanceEntityTests
{
    #region AccessReviewCampaign Entity Tests

    [Fact]
    public void AccessReviewCampaign_CanBeCreated_WithAllProperties()
    {
        // Arrange & Act
        var id = Guid.NewGuid();
        var tenantId = Guid.NewGuid();
        var createdBy = Guid.NewGuid();
        var createdAt = DateTime.UtcNow;
        var startDate = DateTime.UtcNow.AddDays(1);
        var endDate = DateTime.UtcNow.AddDays(30);

        var campaign = new AccessReviewCampaign
        {
            Id = id,
            TenantId = tenantId,
            Name = "Q4 Access Review",
            Description = "Quarterly access review for all departments",
            Status = CampaignStatus.Active,
            StartDate = startDate,
            EndDate = endDate,
            TargetRoles = new List<string> { "Admin", "Manager", "Developer" },
            TargetResources = new List<string> { "Database", "API", "Dashboard" },
            CreatedBy = createdBy,
            CreatedAt = createdAt
        };

        // Assert
        campaign.Id.Should().Be(id);
        campaign.TenantId.Should().Be(tenantId);
        campaign.Name.Should().Be("Q4 Access Review");
        campaign.Description.Should().Be("Quarterly access review for all departments");
        campaign.Status.Should().Be(CampaignStatus.Active);
        campaign.StartDate.Should().Be(startDate);
        campaign.EndDate.Should().Be(endDate);
        campaign.TargetRoles.Should().HaveCount(3);
        campaign.TargetRoles.Should().Contain("Admin");
        campaign.TargetResources.Should().HaveCount(3);
        campaign.TargetResources.Should().Contain("Database");
        campaign.CreatedBy.Should().Be(createdBy);
        campaign.CreatedAt.Should().Be(createdAt);
    }

    [Fact]
    public void AccessReviewCampaign_DefaultValues_AreCorrect()
    {
        // Arrange & Act
        var campaign = new AccessReviewCampaign();

        // Assert
        campaign.Id.Should().Be(Guid.Empty);
        campaign.TenantId.Should().Be(Guid.Empty);
        campaign.Name.Should().BeEmpty();
        campaign.Description.Should().BeEmpty();
        campaign.TargetRoles.Should().NotBeNull();
        campaign.TargetRoles.Should().BeEmpty();
        campaign.TargetResources.Should().NotBeNull();
        campaign.TargetResources.Should().BeEmpty();
        campaign.CreatedBy.Should().Be(Guid.Empty);
        campaign.ReviewItems.Should().NotBeNull();
        campaign.ReviewItems.Should().BeEmpty();
    }

    [Fact]
    public void AccessReviewCampaign_CanAddReviewItems()
    {
        // Arrange
        var campaign = new AccessReviewCampaign
        {
            Id = Guid.NewGuid(),
            Name = "Test Campaign"
        };

        var reviewItem = new AccessReviewItem
        {
            Id = Guid.NewGuid(),
            CampaignId = campaign.Id,
            UserId = Guid.NewGuid(),
            ResourceType = "Application",
            ResourceId = "app-1",
            AccessLevel = "Read"
        };

        // Act
        campaign.ReviewItems.Add(reviewItem);

        // Assert
        campaign.ReviewItems.Should().HaveCount(1);
        campaign.ReviewItems.First().CampaignId.Should().Be(campaign.Id);
    }

    #endregion

    #region AccessReviewItem Entity Tests

    [Fact]
    public void AccessReviewItem_CanBeCreated_WithAllProperties()
    {
        // Arrange & Act
        var id = Guid.NewGuid();
        var campaignId = Guid.NewGuid();
        var tenantId = Guid.NewGuid();
        var userId = Guid.NewGuid();
        var reviewedBy = Guid.NewGuid();
        var reviewedAt = DateTime.UtcNow;

        var item = new AccessReviewItem
        {
            Id = id,
            CampaignId = campaignId,
            TenantId = tenantId,
            UserId = userId,
            ResourceType = "Application",
            ResourceId = "app-123",
            AccessLevel = "Admin",
            Decision = ReviewDecision.Approved,
            ReviewedBy = reviewedBy,
            ReviewedAt = reviewedAt,
            ReviewComment = "Access is still required for this user"
        };

        // Assert
        item.Id.Should().Be(id);
        item.CampaignId.Should().Be(campaignId);
        item.TenantId.Should().Be(tenantId);
        item.UserId.Should().Be(userId);
        item.ResourceType.Should().Be("Application");
        item.ResourceId.Should().Be("app-123");
        item.AccessLevel.Should().Be("Admin");
        item.Decision.Should().Be(ReviewDecision.Approved);
        item.ReviewedBy.Should().Be(reviewedBy);
        item.ReviewedAt.Should().Be(reviewedAt);
        item.ReviewComment.Should().Be("Access is still required for this user");
    }

    [Fact]
    public void AccessReviewItem_DefaultValues_AreCorrect()
    {
        // Arrange & Act
        var item = new AccessReviewItem();

        // Assert
        item.Id.Should().Be(Guid.Empty);
        item.CampaignId.Should().Be(Guid.Empty);
        item.TenantId.Should().Be(Guid.Empty);
        item.UserId.Should().Be(Guid.Empty);
        item.ResourceType.Should().BeEmpty();
        item.ResourceId.Should().BeEmpty();
        item.AccessLevel.Should().BeEmpty();
        item.ReviewedBy.Should().BeNull();
        item.ReviewedAt.Should().BeNull();
        item.ReviewComment.Should().BeNull();
        item.Campaign.Should().BeNull();
    }

    #endregion

    #region SodRule Entity Tests

    [Fact]
    public void SodRule_CanBeCreated_WithAllProperties()
    {
        // Arrange & Act
        var id = Guid.NewGuid();
        var tenantId = Guid.NewGuid();
        var createdAt = DateTime.UtcNow;

        var rule = new SodRule
        {
            Id = id,
            TenantId = tenantId,
            Name = "Payment Processing SoD",
            Description = "Users cannot have both payment initiation and approval roles",
            ConflictingRoles = new List<string> { "PaymentInitiator", "PaymentApprover" },
            ConflictingPermissions = new List<string> { "payment.initiate", "payment.approve" },
            Enabled = true,
            CreatedAt = createdAt
        };

        // Assert
        rule.Id.Should().Be(id);
        rule.TenantId.Should().Be(tenantId);
        rule.Name.Should().Be("Payment Processing SoD");
        rule.Description.Should().Be("Users cannot have both payment initiation and approval roles");
        rule.ConflictingRoles.Should().HaveCount(2);
        rule.ConflictingRoles.Should().Contain("PaymentInitiator");
        rule.ConflictingRoles.Should().Contain("PaymentApprover");
        rule.ConflictingPermissions.Should().HaveCount(2);
        rule.Enabled.Should().BeTrue();
        rule.CreatedAt.Should().Be(createdAt);
    }

    [Fact]
    public void SodRule_DefaultValues_AreCorrect()
    {
        // Arrange & Act
        var rule = new SodRule();

        // Assert
        rule.Id.Should().Be(Guid.Empty);
        rule.TenantId.Should().Be(Guid.Empty);
        rule.Name.Should().BeEmpty();
        rule.Description.Should().BeEmpty();
        rule.ConflictingRoles.Should().NotBeNull();
        rule.ConflictingRoles.Should().BeEmpty();
        rule.ConflictingPermissions.Should().NotBeNull();
        rule.ConflictingPermissions.Should().BeEmpty();
        rule.Enabled.Should().BeFalse();
    }

    #endregion

    #region SodViolation Entity Tests

    [Fact]
    public void SodViolation_CanBeCreated_WithAllProperties()
    {
        // Arrange & Act
        var id = Guid.NewGuid();
        var tenantId = Guid.NewGuid();
        var ruleId = Guid.NewGuid();
        var userId = Guid.NewGuid();
        var detectedAt = DateTime.UtcNow;
        var resolvedAt = DateTime.UtcNow.AddHours(2);

        var violation = new SodViolation
        {
            Id = id,
            TenantId = tenantId,
            RuleId = ruleId,
            UserId = userId,
            Severity = ViolationSeverity.High,
            Description = "User has conflicting roles: PaymentInitiator and PaymentApprover",
            DetectedAt = detectedAt,
            Resolved = true,
            ResolvedAt = resolvedAt,
            ResolutionNotes = "Removed PaymentApprover role from user"
        };

        // Assert
        violation.Id.Should().Be(id);
        violation.TenantId.Should().Be(tenantId);
        violation.RuleId.Should().Be(ruleId);
        violation.UserId.Should().Be(userId);
        violation.Severity.Should().Be(ViolationSeverity.High);
        violation.Description.Should().Be("User has conflicting roles: PaymentInitiator and PaymentApprover");
        violation.DetectedAt.Should().Be(detectedAt);
        violation.Resolved.Should().BeTrue();
        violation.ResolvedAt.Should().Be(resolvedAt);
        violation.ResolutionNotes.Should().Be("Removed PaymentApprover role from user");
    }

    [Fact]
    public void SodViolation_DefaultValues_AreCorrect()
    {
        // Arrange & Act
        var violation = new SodViolation();

        // Assert
        violation.Id.Should().Be(Guid.Empty);
        violation.TenantId.Should().Be(Guid.Empty);
        violation.RuleId.Should().Be(Guid.Empty);
        violation.UserId.Should().Be(Guid.Empty);
        violation.Description.Should().BeEmpty();
        violation.Resolved.Should().BeFalse();
        violation.ResolvedAt.Should().BeNull();
        violation.ResolutionNotes.Should().BeNull();
        violation.Rule.Should().BeNull();
    }

    [Fact]
    public void SodViolation_CanReferenceRule()
    {
        // Arrange
        var rule = new SodRule
        {
            Id = Guid.NewGuid(),
            Name = "Test Rule"
        };

        var violation = new SodViolation
        {
            Id = Guid.NewGuid(),
            RuleId = rule.Id,
            Rule = rule
        };

        // Assert
        violation.Rule.Should().NotBeNull();
        violation.Rule!.Id.Should().Be(rule.Id);
        violation.Rule.Name.Should().Be("Test Rule");
    }

    #endregion

    #region CampaignDto Tests

    [Fact]
    public void CampaignDto_CanBeCreated_WithAllProperties()
    {
        // Arrange & Act
        var dto = new CampaignDto
        {
            Id = Guid.NewGuid(),
            Name = "Annual Review",
            Description = "Annual access certification",
            Status = "Active",
            StartDate = DateTime.UtcNow,
            EndDate = DateTime.UtcNow.AddDays(30),
            TotalItems = 100,
            ReviewedItems = 45
        };

        // Assert
        dto.Id.Should().NotBeEmpty();
        dto.Name.Should().Be("Annual Review");
        dto.Description.Should().Be("Annual access certification");
        dto.Status.Should().Be("Active");
        dto.TotalItems.Should().Be(100);
        dto.ReviewedItems.Should().Be(45);
    }

    [Fact]
    public void CampaignDto_DefaultValues_AreCorrect()
    {
        // Arrange & Act
        var dto = new CampaignDto();

        // Assert
        dto.Name.Should().BeEmpty();
        dto.Description.Should().BeEmpty();
        dto.Status.Should().BeEmpty();
        dto.TotalItems.Should().Be(0);
        dto.ReviewedItems.Should().Be(0);
    }

    #endregion

    #region ViolationDto Tests

    [Fact]
    public void ViolationDto_CanBeCreated_WithAllProperties()
    {
        // Arrange & Act
        var dto = new ViolationDto
        {
            Id = Guid.NewGuid(),
            UserId = Guid.NewGuid(),
            Severity = "Critical",
            Description = "Critical SoD violation detected",
            DetectedAt = DateTime.UtcNow,
            Resolved = false
        };

        // Assert
        dto.Id.Should().NotBeEmpty();
        dto.UserId.Should().NotBeEmpty();
        dto.Severity.Should().Be("Critical");
        dto.Description.Should().Be("Critical SoD violation detected");
        dto.Resolved.Should().BeFalse();
    }

    [Fact]
    public void ViolationDto_DefaultValues_AreCorrect()
    {
        // Arrange & Act
        var dto = new ViolationDto();

        // Assert
        dto.Severity.Should().BeEmpty();
        dto.Description.Should().BeEmpty();
        dto.Resolved.Should().BeFalse();
    }

    #endregion

    #region Enum Tests

    [Fact]
    public void CampaignStatus_HasCorrectValues()
    {
        // Assert
        ((int)CampaignStatus.Draft).Should().Be(1);
        ((int)CampaignStatus.Active).Should().Be(2);
        ((int)CampaignStatus.Completed).Should().Be(3);
        ((int)CampaignStatus.Cancelled).Should().Be(4);
    }

    [Fact]
    public void ReviewDecision_HasCorrectValues()
    {
        // Assert
        ((int)ReviewDecision.Pending).Should().Be(1);
        ((int)ReviewDecision.Approved).Should().Be(2);
        ((int)ReviewDecision.Revoked).Should().Be(3);
        ((int)ReviewDecision.Escalated).Should().Be(4);
    }

    [Fact]
    public void ViolationSeverity_HasCorrectValues()
    {
        // Assert
        ((int)ViolationSeverity.Low).Should().Be(1);
        ((int)ViolationSeverity.Medium).Should().Be(2);
        ((int)ViolationSeverity.High).Should().Be(3);
        ((int)ViolationSeverity.Critical).Should().Be(4);
    }

    [Fact]
    public void CampaignStatus_CanBeParsed()
    {
        // Assert
        Enum.Parse<CampaignStatus>("Draft").Should().Be(CampaignStatus.Draft);
        Enum.Parse<CampaignStatus>("Active").Should().Be(CampaignStatus.Active);
        Enum.Parse<CampaignStatus>("Completed").Should().Be(CampaignStatus.Completed);
        Enum.Parse<CampaignStatus>("Cancelled").Should().Be(CampaignStatus.Cancelled);
    }

    [Fact]
    public void ReviewDecision_CanBeParsed()
    {
        // Assert
        Enum.Parse<ReviewDecision>("Pending").Should().Be(ReviewDecision.Pending);
        Enum.Parse<ReviewDecision>("Approved").Should().Be(ReviewDecision.Approved);
        Enum.Parse<ReviewDecision>("Revoked").Should().Be(ReviewDecision.Revoked);
        Enum.Parse<ReviewDecision>("Escalated").Should().Be(ReviewDecision.Escalated);
    }

    [Fact]
    public void ViolationSeverity_CanBeParsed()
    {
        // Assert
        Enum.Parse<ViolationSeverity>("Low").Should().Be(ViolationSeverity.Low);
        Enum.Parse<ViolationSeverity>("Medium").Should().Be(ViolationSeverity.Medium);
        Enum.Parse<ViolationSeverity>("High").Should().Be(ViolationSeverity.High);
        Enum.Parse<ViolationSeverity>("Critical").Should().Be(ViolationSeverity.Critical);
    }

    [Fact]
    public void CampaignStatus_ToString_ReturnsCorrectString()
    {
        // Assert
        CampaignStatus.Draft.ToString().Should().Be("Draft");
        CampaignStatus.Active.ToString().Should().Be("Active");
        CampaignStatus.Completed.ToString().Should().Be("Completed");
        CampaignStatus.Cancelled.ToString().Should().Be("Cancelled");
    }

    [Fact]
    public void ReviewDecision_ToString_ReturnsCorrectString()
    {
        // Assert
        ReviewDecision.Pending.ToString().Should().Be("Pending");
        ReviewDecision.Approved.ToString().Should().Be("Approved");
        ReviewDecision.Revoked.ToString().Should().Be("Revoked");
        ReviewDecision.Escalated.ToString().Should().Be("Escalated");
    }

    [Fact]
    public void ViolationSeverity_ToString_ReturnsCorrectString()
    {
        // Assert
        ViolationSeverity.Low.ToString().Should().Be("Low");
        ViolationSeverity.Medium.ToString().Should().Be("Medium");
        ViolationSeverity.High.ToString().Should().Be("High");
        ViolationSeverity.Critical.ToString().Should().Be("Critical");
    }

    #endregion
}
