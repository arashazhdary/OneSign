using FluentAssertions;
using Moq;
using Onesign.Modules.IdentityInsights.Domain.Entities;
using Onesign.Modules.IdentityInsights.Domain.Enums;
using Onesign.Modules.IdentityInsights.Domain.Repositories;
using Xunit;

namespace Onesign.Api.Tests.IdentityInsights;

public class RepositoryInterfaceTests
{
    #region IInsightRepository Interface Tests

    [Fact]
    public async Task IInsightRepository_GetByIdAsync_CanBeMocked()
    {
        // Arrange
        var mockRepo = new Mock<IInsightRepository>();
        var insightId = Guid.NewGuid();
        var expectedInsight = new Insight { Id = insightId, Title = "Test Insight" };

        mockRepo.Setup(x => x.GetByIdAsync(insightId, It.IsAny<CancellationToken>()))
            .ReturnsAsync(expectedInsight);

        // Act
        var result = await mockRepo.Object.GetByIdAsync(insightId, CancellationToken.None);

        // Assert
        result.Should().NotBeNull();
        result!.Id.Should().Be(insightId);
    }

    [Fact]
    public async Task IInsightRepository_GetByTenantIdAsync_CanBeMocked()
    {
        // Arrange
        var mockRepo = new Mock<IInsightRepository>();
        var tenantId = Guid.NewGuid();
        var expectedInsights = new List<Insight>
        {
            new() { Id = Guid.NewGuid(), TenantId = tenantId },
            new() { Id = Guid.NewGuid(), TenantId = tenantId }
        };

        mockRepo.Setup(x => x.GetByTenantIdAsync(tenantId, It.IsAny<CancellationToken>()))
            .ReturnsAsync(expectedInsights);

        // Act
        var result = await mockRepo.Object.GetByTenantIdAsync(tenantId, CancellationToken.None);

        // Assert
        result.Should().HaveCount(2);
    }

    [Fact]
    public async Task IInsightRepository_GetByTenantAndStatusAsync_CanBeMocked()
    {
        // Arrange
        var mockRepo = new Mock<IInsightRepository>();
        var tenantId = Guid.NewGuid();
        var status = InsightStatus.Open;
        var expectedInsights = new List<Insight>
        {
            new() { Id = Guid.NewGuid(), TenantId = tenantId, Status = status }
        };

        mockRepo.Setup(x => x.GetByTenantAndStatusAsync(tenantId, status, It.IsAny<CancellationToken>()))
            .ReturnsAsync(expectedInsights);

        // Act
        var result = await mockRepo.Object.GetByTenantAndStatusAsync(tenantId, status, CancellationToken.None);

        // Assert
        result.Should().HaveCount(1);
        result[0].Status.Should().Be(InsightStatus.Open);
    }

    [Fact]
    public async Task IInsightRepository_GetBySeverityAsync_CanBeMocked()
    {
        // Arrange
        var mockRepo = new Mock<IInsightRepository>();
        var tenantId = Guid.NewGuid();
        var severity = InsightSeverity.Critical;
        var expectedInsights = new List<Insight>
        {
            new() { Id = Guid.NewGuid(), TenantId = tenantId, Severity = severity }
        };

        mockRepo.Setup(x => x.GetBySeverityAsync(tenantId, severity, It.IsAny<CancellationToken>()))
            .ReturnsAsync(expectedInsights);

        // Act
        var result = await mockRepo.Object.GetBySeverityAsync(tenantId, severity, CancellationToken.None);

        // Assert
        result.Should().HaveCount(1);
        result[0].Severity.Should().Be(InsightSeverity.Critical);
    }

    [Fact]
    public async Task IInsightRepository_GetByScopeAsync_CanBeMocked()
    {
        // Arrange
        var mockRepo = new Mock<IInsightRepository>();
        var tenantId = Guid.NewGuid();
        var scopeId = Guid.NewGuid();
        var expectedInsights = new List<Insight>
        {
            new() { Id = Guid.NewGuid(), TenantId = tenantId, ScopeType = "User", ScopeId = scopeId }
        };

        mockRepo.Setup(x => x.GetByScopeAsync(tenantId, "User", scopeId, It.IsAny<CancellationToken>()))
            .ReturnsAsync(expectedInsights);

        // Act
        var result = await mockRepo.Object.GetByScopeAsync(tenantId, "User", scopeId, CancellationToken.None);

        // Assert
        result.Should().HaveCount(1);
        result[0].ScopeType.Should().Be("User");
    }

    [Fact]
    public async Task IInsightRepository_AddAsync_CanBeMocked()
    {
        // Arrange
        var mockRepo = new Mock<IInsightRepository>();
        var insight = new Insight { Id = Guid.NewGuid(), Title = "New Insight" };

        mockRepo.Setup(x => x.AddAsync(insight, It.IsAny<CancellationToken>()))
            .Returns(Task.CompletedTask);

        // Act
        await mockRepo.Object.AddAsync(insight, CancellationToken.None);

        // Assert
        mockRepo.Verify(x => x.AddAsync(insight, It.IsAny<CancellationToken>()), Times.Once);
    }

    [Fact]
    public async Task IInsightRepository_UpdateAsync_CanBeMocked()
    {
        // Arrange
        var mockRepo = new Mock<IInsightRepository>();
        var insight = new Insight { Id = Guid.NewGuid(), Title = "Updated Insight" };

        mockRepo.Setup(x => x.UpdateAsync(insight, It.IsAny<CancellationToken>()))
            .Returns(Task.CompletedTask);

        // Act
        await mockRepo.Object.UpdateAsync(insight, CancellationToken.None);

        // Assert
        mockRepo.Verify(x => x.UpdateAsync(insight, It.IsAny<CancellationToken>()), Times.Once);
    }

    [Fact]
    public async Task IInsightRepository_DeleteAsync_CanBeMocked()
    {
        // Arrange
        var mockRepo = new Mock<IInsightRepository>();
        var insightId = Guid.NewGuid();

        mockRepo.Setup(x => x.DeleteAsync(insightId, It.IsAny<CancellationToken>()))
            .Returns(Task.CompletedTask);

        // Act
        await mockRepo.Object.DeleteAsync(insightId, CancellationToken.None);

        // Assert
        mockRepo.Verify(x => x.DeleteAsync(insightId, It.IsAny<CancellationToken>()), Times.Once);
    }

    #endregion

    #region IUserRiskProfileRepository Interface Tests

    [Fact]
    public async Task IUserRiskProfileRepository_GetByUserIdAsync_CanBeMocked()
    {
        // Arrange
        var mockRepo = new Mock<IUserRiskProfileRepository>();
        var tenantId = Guid.NewGuid();
        var userId = Guid.NewGuid();
        var expectedProfile = new UserRiskProfile
        {
            Id = Guid.NewGuid(),
            TenantId = tenantId,
            UserId = userId,
            RiskScore = 75
        };

        mockRepo.Setup(x => x.GetByUserIdAsync(tenantId, userId, It.IsAny<CancellationToken>()))
            .ReturnsAsync(expectedProfile);

        // Act
        var result = await mockRepo.Object.GetByUserIdAsync(tenantId, userId, CancellationToken.None);

        // Assert
        result.Should().NotBeNull();
        result!.UserId.Should().Be(userId);
        result.RiskScore.Should().Be(75);
    }

    [Fact]
    public async Task IUserRiskProfileRepository_GetHighRiskUsersAsync_CanBeMocked()
    {
        // Arrange
        var mockRepo = new Mock<IUserRiskProfileRepository>();
        var tenantId = Guid.NewGuid();
        var minRiskScore = 70;
        var expectedProfiles = new List<UserRiskProfile>
        {
            new() { Id = Guid.NewGuid(), TenantId = tenantId, RiskScore = 85 },
            new() { Id = Guid.NewGuid(), TenantId = tenantId, RiskScore = 75 }
        };

        mockRepo.Setup(x => x.GetHighRiskUsersAsync(tenantId, minRiskScore, It.IsAny<CancellationToken>()))
            .ReturnsAsync(expectedProfiles);

        // Act
        var result = await mockRepo.Object.GetHighRiskUsersAsync(tenantId, minRiskScore, CancellationToken.None);

        // Assert
        result.Should().HaveCount(2);
        result.All(p => p.RiskScore >= minRiskScore).Should().BeTrue();
    }

    [Fact]
    public async Task IUserRiskProfileRepository_AddAsync_CanBeMocked()
    {
        // Arrange
        var mockRepo = new Mock<IUserRiskProfileRepository>();
        var profile = new UserRiskProfile
        {
            Id = Guid.NewGuid(),
            TenantId = Guid.NewGuid(),
            UserId = Guid.NewGuid(),
            RiskScore = 50
        };

        mockRepo.Setup(x => x.AddAsync(profile, It.IsAny<CancellationToken>()))
            .Returns(Task.CompletedTask);

        // Act
        await mockRepo.Object.AddAsync(profile, CancellationToken.None);

        // Assert
        mockRepo.Verify(x => x.AddAsync(profile, It.IsAny<CancellationToken>()), Times.Once);
    }

    [Fact]
    public async Task IUserRiskProfileRepository_UpdateAsync_CanBeMocked()
    {
        // Arrange
        var mockRepo = new Mock<IUserRiskProfileRepository>();
        var profile = new UserRiskProfile
        {
            Id = Guid.NewGuid(),
            RiskScore = 85
        };

        mockRepo.Setup(x => x.UpdateAsync(profile, It.IsAny<CancellationToken>()))
            .Returns(Task.CompletedTask);

        // Act
        await mockRepo.Object.UpdateAsync(profile, CancellationToken.None);

        // Assert
        mockRepo.Verify(x => x.UpdateAsync(profile, It.IsAny<CancellationToken>()), Times.Once);
    }

    #endregion

    #region ITenantRiskProfileRepository Interface Tests

    [Fact]
    public async Task ITenantRiskProfileRepository_GetByTenantIdAsync_CanBeMocked()
    {
        // Arrange
        var mockRepo = new Mock<ITenantRiskProfileRepository>();
        var tenantId = Guid.NewGuid();
        var expectedProfile = new TenantRiskProfile
        {
            Id = Guid.NewGuid(),
            TenantId = tenantId,
            RiskScore = 65
        };

        mockRepo.Setup(x => x.GetByTenantIdAsync(tenantId, It.IsAny<CancellationToken>()))
            .ReturnsAsync(expectedProfile);

        // Act
        var result = await mockRepo.Object.GetByTenantIdAsync(tenantId, CancellationToken.None);

        // Assert
        result.Should().NotBeNull();
        result!.TenantId.Should().Be(tenantId);
        result.RiskScore.Should().Be(65);
    }

    [Fact]
    public async Task ITenantRiskProfileRepository_GetHighRiskTenantsAsync_CanBeMocked()
    {
        // Arrange
        var mockRepo = new Mock<ITenantRiskProfileRepository>();
        var minRiskScore = 70;
        var expectedProfiles = new List<TenantRiskProfile>
        {
            new() { Id = Guid.NewGuid(), TenantId = Guid.NewGuid(), RiskScore = 85 },
            new() { Id = Guid.NewGuid(), TenantId = Guid.NewGuid(), RiskScore = 75 }
        };

        mockRepo.Setup(x => x.GetHighRiskTenantsAsync(minRiskScore, It.IsAny<CancellationToken>()))
            .ReturnsAsync(expectedProfiles);

        // Act
        var result = await mockRepo.Object.GetHighRiskTenantsAsync(minRiskScore, CancellationToken.None);

        // Assert
        result.Should().HaveCount(2);
        result.All(p => p.RiskScore >= minRiskScore).Should().BeTrue();
    }

    [Fact]
    public async Task ITenantRiskProfileRepository_AddAsync_CanBeMocked()
    {
        // Arrange
        var mockRepo = new Mock<ITenantRiskProfileRepository>();
        var profile = new TenantRiskProfile
        {
            Id = Guid.NewGuid(),
            TenantId = Guid.NewGuid(),
            RiskScore = 50
        };

        mockRepo.Setup(x => x.AddAsync(profile, It.IsAny<CancellationToken>()))
            .Returns(Task.CompletedTask);

        // Act
        await mockRepo.Object.AddAsync(profile, CancellationToken.None);

        // Assert
        mockRepo.Verify(x => x.AddAsync(profile, It.IsAny<CancellationToken>()), Times.Once);
    }

    [Fact]
    public async Task ITenantRiskProfileRepository_UpdateAsync_CanBeMocked()
    {
        // Arrange
        var mockRepo = new Mock<ITenantRiskProfileRepository>();
        var profile = new TenantRiskProfile
        {
            Id = Guid.NewGuid(),
            RiskScore = 85
        };

        mockRepo.Setup(x => x.UpdateAsync(profile, It.IsAny<CancellationToken>()))
            .Returns(Task.CompletedTask);

        // Act
        await mockRepo.Object.UpdateAsync(profile, CancellationToken.None);

        // Assert
        mockRepo.Verify(x => x.UpdateAsync(profile, It.IsAny<CancellationToken>()), Times.Once);
    }

    #endregion
}
