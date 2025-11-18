using FluentAssertions;
using Moq;
using Onesign.Modules.Governance.Domain.Entities;
using Onesign.Modules.Governance.Domain.Enums;
using Onesign.Modules.Governance.Domain.Repositories;
using Xunit;

namespace Onesign.Api.Tests.Governance;

public class GovernanceRepositoryInterfaceTests
{
    #region IAccessReviewCampaignRepository Tests

    [Fact]
    public async Task IAccessReviewCampaignRepository_GetByTenantIdAsync_ReturnsListOfCampaigns()
    {
        // Arrange
        var tenantId = Guid.NewGuid();
        var expectedCampaigns = new List<AccessReviewCampaign>
        {
            new()
            {
                Id = Guid.NewGuid(),
                TenantId = tenantId,
                Name = "Campaign 1",
                Status = CampaignStatus.Active
            },
            new()
            {
                Id = Guid.NewGuid(),
                TenantId = tenantId,
                Name = "Campaign 2",
                Status = CampaignStatus.Completed
            }
        };

        var mockRepository = new Mock<IAccessReviewCampaignRepository>();
        mockRepository
            .Setup(x => x.GetByTenantIdAsync(tenantId, It.IsAny<CancellationToken>()))
            .ReturnsAsync(expectedCampaigns);

        // Act
        var result = await mockRepository.Object.GetByTenantIdAsync(tenantId);

        // Assert
        result.Should().HaveCount(2);
        result.Should().BeEquivalentTo(expectedCampaigns);
    }

    [Fact]
    public async Task IAccessReviewCampaignRepository_GetByIdAsync_ReturnsCampaignOrNull()
    {
        // Arrange
        var campaignId = Guid.NewGuid();
        var expectedCampaign = new AccessReviewCampaign
        {
            Id = campaignId,
            TenantId = Guid.NewGuid(),
            Name = "Test Campaign",
            Status = CampaignStatus.Active
        };

        var mockRepository = new Mock<IAccessReviewCampaignRepository>();
        mockRepository
            .Setup(x => x.GetByIdAsync(campaignId, It.IsAny<CancellationToken>()))
            .ReturnsAsync(expectedCampaign);

        // Act
        var result = await mockRepository.Object.GetByIdAsync(campaignId);

        // Assert
        result.Should().NotBeNull();
        result!.Id.Should().Be(campaignId);
    }

    [Fact]
    public async Task IAccessReviewCampaignRepository_GetByIdAsync_ReturnsNullWhenNotFound()
    {
        // Arrange
        var nonExistentId = Guid.NewGuid();
        var mockRepository = new Mock<IAccessReviewCampaignRepository>();
        mockRepository
            .Setup(x => x.GetByIdAsync(nonExistentId, It.IsAny<CancellationToken>()))
            .ReturnsAsync((AccessReviewCampaign?)null);

        // Act
        var result = await mockRepository.Object.GetByIdAsync(nonExistentId);

        // Assert
        result.Should().BeNull();
    }

    [Fact]
    public async Task IAccessReviewCampaignRepository_AddAsync_ReturnsCampaign()
    {
        // Arrange
        var campaign = new AccessReviewCampaign
        {
            Id = Guid.NewGuid(),
            TenantId = Guid.NewGuid(),
            Name = "New Campaign",
            Status = CampaignStatus.Draft
        };

        var mockRepository = new Mock<IAccessReviewCampaignRepository>();
        mockRepository
            .Setup(x => x.AddAsync(campaign, It.IsAny<CancellationToken>()))
            .ReturnsAsync(campaign);

        // Act
        var result = await mockRepository.Object.AddAsync(campaign);

        // Assert
        result.Should().NotBeNull();
        result.Id.Should().Be(campaign.Id);
    }

    [Fact]
    public async Task IAccessReviewCampaignRepository_UpdateAsync_CompletesWithoutError()
    {
        // Arrange
        var campaign = new AccessReviewCampaign
        {
            Id = Guid.NewGuid(),
            TenantId = Guid.NewGuid(),
            Name = "Updated Campaign",
            Status = CampaignStatus.Completed
        };

        var mockRepository = new Mock<IAccessReviewCampaignRepository>();
        mockRepository
            .Setup(x => x.UpdateAsync(campaign, It.IsAny<CancellationToken>()))
            .Returns(Task.CompletedTask);

        // Act & Assert
        await mockRepository.Object.Invoking(r => r.UpdateAsync(campaign))
            .Should().NotThrowAsync();
    }

    [Fact]
    public async Task IAccessReviewCampaignRepository_GetByTenantIdAsync_ReturnsEmptyWhenNoCampaigns()
    {
        // Arrange
        var tenantId = Guid.NewGuid();
        var mockRepository = new Mock<IAccessReviewCampaignRepository>();
        mockRepository
            .Setup(x => x.GetByTenantIdAsync(tenantId, It.IsAny<CancellationToken>()))
            .ReturnsAsync(new List<AccessReviewCampaign>());

        // Act
        var result = await mockRepository.Object.GetByTenantIdAsync(tenantId);

        // Assert
        result.Should().BeEmpty();
    }

    #endregion

    #region ISodViolationRepository Tests

    [Fact]
    public async Task ISodViolationRepository_GetByTenantIdAsync_ReturnsFilteredViolations()
    {
        // Arrange
        var tenantId = Guid.NewGuid();
        var violations = new List<SodViolation>
        {
            new()
            {
                Id = Guid.NewGuid(),
                TenantId = tenantId,
                UserId = Guid.NewGuid(),
                Severity = ViolationSeverity.High,
                Resolved = false
            },
            new()
            {
                Id = Guid.NewGuid(),
                TenantId = tenantId,
                UserId = Guid.NewGuid(),
                Severity = ViolationSeverity.Critical,
                Resolved = false
            }
        };

        var mockRepository = new Mock<ISodViolationRepository>();
        mockRepository
            .Setup(x => x.GetByTenantIdAsync(tenantId, false, It.IsAny<CancellationToken>()))
            .ReturnsAsync(violations);

        // Act
        var result = await mockRepository.Object.GetByTenantIdAsync(tenantId, false);

        // Assert
        result.Should().HaveCount(2);
        result.All(v => !v.Resolved).Should().BeTrue();
    }

    [Fact]
    public async Task ISodViolationRepository_GetByTenantIdAsync_ReturnsResolvedViolations()
    {
        // Arrange
        var tenantId = Guid.NewGuid();
        var violations = new List<SodViolation>
        {
            new()
            {
                Id = Guid.NewGuid(),
                TenantId = tenantId,
                Severity = ViolationSeverity.Medium,
                Resolved = true,
                ResolvedAt = DateTime.UtcNow
            }
        };

        var mockRepository = new Mock<ISodViolationRepository>();
        mockRepository
            .Setup(x => x.GetByTenantIdAsync(tenantId, true, It.IsAny<CancellationToken>()))
            .ReturnsAsync(violations);

        // Act
        var result = await mockRepository.Object.GetByTenantIdAsync(tenantId, true);

        // Assert
        result.Should().HaveCount(1);
        result.All(v => v.Resolved).Should().BeTrue();
    }

    [Fact]
    public async Task ISodViolationRepository_GetByTenantIdAsync_ReturnsAllWhenResolvedIsNull()
    {
        // Arrange
        var tenantId = Guid.NewGuid();
        var violations = new List<SodViolation>
        {
            new() { Resolved = true },
            new() { Resolved = false },
            new() { Resolved = true }
        };

        var mockRepository = new Mock<ISodViolationRepository>();
        mockRepository
            .Setup(x => x.GetByTenantIdAsync(tenantId, null, It.IsAny<CancellationToken>()))
            .ReturnsAsync(violations);

        // Act
        var result = await mockRepository.Object.GetByTenantIdAsync(tenantId, null);

        // Assert
        result.Should().HaveCount(3);
    }

    [Fact]
    public async Task ISodViolationRepository_AddAsync_ReturnsViolation()
    {
        // Arrange
        var violation = new SodViolation
        {
            Id = Guid.NewGuid(),
            TenantId = Guid.NewGuid(),
            RuleId = Guid.NewGuid(),
            UserId = Guid.NewGuid(),
            Severity = ViolationSeverity.Critical,
            Description = "Critical SoD violation",
            DetectedAt = DateTime.UtcNow,
            Resolved = false
        };

        var mockRepository = new Mock<ISodViolationRepository>();
        mockRepository
            .Setup(x => x.AddAsync(violation, It.IsAny<CancellationToken>()))
            .ReturnsAsync(violation);

        // Act
        var result = await mockRepository.Object.AddAsync(violation);

        // Assert
        result.Should().NotBeNull();
        result.Id.Should().Be(violation.Id);
        result.Severity.Should().Be(ViolationSeverity.Critical);
    }

    [Fact]
    public async Task ISodViolationRepository_UpdateAsync_CompletesWithoutError()
    {
        // Arrange
        var violation = new SodViolation
        {
            Id = Guid.NewGuid(),
            TenantId = Guid.NewGuid(),
            Resolved = true,
            ResolvedAt = DateTime.UtcNow,
            ResolutionNotes = "Issue resolved"
        };

        var mockRepository = new Mock<ISodViolationRepository>();
        mockRepository
            .Setup(x => x.UpdateAsync(violation, It.IsAny<CancellationToken>()))
            .Returns(Task.CompletedTask);

        // Act & Assert
        await mockRepository.Object.Invoking(r => r.UpdateAsync(violation))
            .Should().NotThrowAsync();
    }

    [Fact]
    public async Task ISodViolationRepository_GetByTenantIdAsync_ReturnsEmptyWhenNoViolations()
    {
        // Arrange
        var tenantId = Guid.NewGuid();
        var mockRepository = new Mock<ISodViolationRepository>();
        mockRepository
            .Setup(x => x.GetByTenantIdAsync(tenantId, null, It.IsAny<CancellationToken>()))
            .ReturnsAsync(new List<SodViolation>());

        // Act
        var result = await mockRepository.Object.GetByTenantIdAsync(tenantId, null);

        // Assert
        result.Should().BeEmpty();
    }

    #endregion

    #region Repository with CancellationToken Tests

    [Fact]
    public async Task IAccessReviewCampaignRepository_SupportsCancellationToken()
    {
        // Arrange
        var mockRepository = new Mock<IAccessReviewCampaignRepository>();
        using var cts = new CancellationTokenSource();

        mockRepository
            .Setup(x => x.GetByTenantIdAsync(It.IsAny<Guid>(), cts.Token))
            .ReturnsAsync(new List<AccessReviewCampaign>());

        // Act
        var result = await mockRepository.Object.GetByTenantIdAsync(Guid.NewGuid(), cts.Token);

        // Assert
        mockRepository.Verify(x => x.GetByTenantIdAsync(It.IsAny<Guid>(), cts.Token), Times.Once);
    }

    [Fact]
    public async Task ISodViolationRepository_SupportsCancellationToken()
    {
        // Arrange
        var mockRepository = new Mock<ISodViolationRepository>();
        using var cts = new CancellationTokenSource();

        mockRepository
            .Setup(x => x.GetByTenantIdAsync(It.IsAny<Guid>(), null, cts.Token))
            .ReturnsAsync(new List<SodViolation>());

        // Act
        var result = await mockRepository.Object.GetByTenantIdAsync(Guid.NewGuid(), null, cts.Token);

        // Assert
        mockRepository.Verify(x => x.GetByTenantIdAsync(It.IsAny<Guid>(), null, cts.Token), Times.Once);
    }

    #endregion

    #region Edge Case Tests

    [Fact]
    public async Task IAccessReviewCampaignRepository_GetByTenantIdAsync_WithEmptyGuid()
    {
        // Arrange
        var mockRepository = new Mock<IAccessReviewCampaignRepository>();
        mockRepository
            .Setup(x => x.GetByTenantIdAsync(Guid.Empty, It.IsAny<CancellationToken>()))
            .ReturnsAsync(new List<AccessReviewCampaign>());

        // Act
        var result = await mockRepository.Object.GetByTenantIdAsync(Guid.Empty);

        // Assert
        result.Should().BeEmpty();
    }

    [Fact]
    public async Task ISodViolationRepository_AddAsync_WithAllSeverityLevels()
    {
        // Arrange
        var mockRepository = new Mock<ISodViolationRepository>();

        foreach (ViolationSeverity severity in Enum.GetValues(typeof(ViolationSeverity)))
        {
            var violation = new SodViolation
            {
                Id = Guid.NewGuid(),
                Severity = severity
            };

            mockRepository
                .Setup(x => x.AddAsync(It.Is<SodViolation>(v => v.Severity == severity), It.IsAny<CancellationToken>()))
                .ReturnsAsync(violation);

            // Act
            var result = await mockRepository.Object.AddAsync(violation);

            // Assert
            result.Severity.Should().Be(severity);
        }
    }

    [Fact]
    public async Task IAccessReviewCampaignRepository_AddAsync_WithAllStatuses()
    {
        // Arrange
        var mockRepository = new Mock<IAccessReviewCampaignRepository>();

        foreach (CampaignStatus status in Enum.GetValues(typeof(CampaignStatus)))
        {
            var campaign = new AccessReviewCampaign
            {
                Id = Guid.NewGuid(),
                Status = status
            };

            mockRepository
                .Setup(x => x.AddAsync(It.Is<AccessReviewCampaign>(c => c.Status == status), It.IsAny<CancellationToken>()))
                .ReturnsAsync(campaign);

            // Act
            var result = await mockRepository.Object.AddAsync(campaign);

            // Assert
            result.Status.Should().Be(status);
        }
    }

    #endregion
}
