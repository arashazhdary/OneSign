using FluentAssertions;
using Moq;
using Onesign.Modules.IdentityInsights.Domain.Entities;
using Onesign.Modules.IdentityInsights.Domain.Services;
using Xunit;

namespace Onesign.Api.Tests.IdentityInsights;

public class ServiceInterfaceTests
{
    #region IInsightGenerationService Tests

    [Fact]
    public async Task IInsightGenerationService_GenerateInsightsForTenantAsync_CanBeMocked()
    {
        // Arrange
        var mockService = new Mock<IInsightGenerationService>();
        var tenantId = Guid.NewGuid();

        mockService
            .Setup(x => x.GenerateInsightsForTenantAsync(tenantId, It.IsAny<CancellationToken>()))
            .Returns(Task.CompletedTask);

        // Act
        await mockService.Object.GenerateInsightsForTenantAsync(tenantId, CancellationToken.None);

        // Assert
        mockService.Verify(x => x.GenerateInsightsForTenantAsync(tenantId, It.IsAny<CancellationToken>()), Times.Once);
    }

    [Fact]
    public async Task IInsightGenerationService_GetOpenInsightsAsync_CanBeMocked()
    {
        // Arrange
        var mockService = new Mock<IInsightGenerationService>();
        var tenantId = Guid.NewGuid();

        var expectedInsights = new List<Insight>
        {
            new()
            {
                Id = Guid.NewGuid(),
                TenantId = tenantId,
                Title = "Test Insight 1"
            },
            new()
            {
                Id = Guid.NewGuid(),
                TenantId = tenantId,
                Title = "Test Insight 2"
            }
        };

        mockService
            .Setup(x => x.GetOpenInsightsAsync(tenantId, It.IsAny<CancellationToken>()))
            .ReturnsAsync(expectedInsights);

        // Act
        var result = await mockService.Object.GetOpenInsightsAsync(tenantId, CancellationToken.None);

        // Assert
        result.Should().HaveCount(2);
        result[0].Title.Should().Be("Test Insight 1");
        result[1].Title.Should().Be("Test Insight 2");
    }

    [Fact]
    public async Task IInsightGenerationService_GetOpenInsightsAsync_ReturnsEmptyList()
    {
        // Arrange
        var mockService = new Mock<IInsightGenerationService>();
        var tenantId = Guid.NewGuid();

        mockService
            .Setup(x => x.GetOpenInsightsAsync(tenantId, It.IsAny<CancellationToken>()))
            .ReturnsAsync(new List<Insight>());

        // Act
        var result = await mockService.Object.GetOpenInsightsAsync(tenantId, CancellationToken.None);

        // Assert
        result.Should().BeEmpty();
    }

    #endregion

    #region IUserRiskScoringService Tests

    [Fact]
    public async Task IUserRiskScoringService_CalculateRiskAsync_CanBeMocked()
    {
        // Arrange
        var mockService = new Mock<IUserRiskScoringService>();
        var tenantId = Guid.NewGuid();
        var userId = Guid.NewGuid();

        var expectedProfile = new UserRiskProfile
        {
            Id = Guid.NewGuid(),
            TenantId = tenantId,
            UserId = userId,
            RiskScore = 75,
            UserDisplayName = "Test User"
        };

        mockService
            .Setup(x => x.CalculateRiskAsync(tenantId, userId, It.IsAny<CancellationToken>()))
            .ReturnsAsync(expectedProfile);

        // Act
        var result = await mockService.Object.CalculateRiskAsync(tenantId, userId, CancellationToken.None);

        // Assert
        result.Should().NotBeNull();
        result.UserId.Should().Be(userId);
        result.RiskScore.Should().Be(75);
    }

    [Fact]
    public async Task IUserRiskScoringService_GetHighRiskUsersAsync_CanBeMocked()
    {
        // Arrange
        var mockService = new Mock<IUserRiskScoringService>();
        var tenantId = Guid.NewGuid();
        var threshold = 70;

        var expectedProfiles = new List<UserRiskProfile>
        {
            new()
            {
                Id = Guid.NewGuid(),
                TenantId = tenantId,
                UserId = Guid.NewGuid(),
                RiskScore = 85
            },
            new()
            {
                Id = Guid.NewGuid(),
                TenantId = tenantId,
                UserId = Guid.NewGuid(),
                RiskScore = 75
            }
        };

        mockService
            .Setup(x => x.GetHighRiskUsersAsync(tenantId, threshold, It.IsAny<CancellationToken>()))
            .ReturnsAsync(expectedProfiles);

        // Act
        var result = await mockService.Object.GetHighRiskUsersAsync(tenantId, threshold, CancellationToken.None);

        // Assert
        result.Should().HaveCount(2);
        result.All(p => p.RiskScore >= threshold).Should().BeTrue();
    }

    [Fact]
    public async Task IUserRiskScoringService_GetHighRiskUsersAsync_ReturnsEmptyList()
    {
        // Arrange
        var mockService = new Mock<IUserRiskScoringService>();
        var tenantId = Guid.NewGuid();
        var threshold = 100;

        mockService
            .Setup(x => x.GetHighRiskUsersAsync(tenantId, threshold, It.IsAny<CancellationToken>()))
            .ReturnsAsync(new List<UserRiskProfile>());

        // Act
        var result = await mockService.Object.GetHighRiskUsersAsync(tenantId, threshold, CancellationToken.None);

        // Assert
        result.Should().BeEmpty();
    }

    [Theory]
    [InlineData(0)]
    [InlineData(50)]
    [InlineData(70)]
    [InlineData(100)]
    public async Task IUserRiskScoringService_GetHighRiskUsersAsync_DifferentThresholds(int threshold)
    {
        // Arrange
        var mockService = new Mock<IUserRiskScoringService>();
        var tenantId = Guid.NewGuid();

        mockService
            .Setup(x => x.GetHighRiskUsersAsync(tenantId, threshold, It.IsAny<CancellationToken>()))
            .ReturnsAsync(new List<UserRiskProfile>());

        // Act
        var result = await mockService.Object.GetHighRiskUsersAsync(tenantId, threshold, CancellationToken.None);

        // Assert
        result.Should().NotBeNull();
        mockService.Verify(x => x.GetHighRiskUsersAsync(tenantId, threshold, It.IsAny<CancellationToken>()), Times.Once);
    }

    #endregion

    #region Combined Service Tests

    [Fact]
    public async Task Services_CanBeUsedTogether()
    {
        // Arrange
        var mockInsightService = new Mock<IInsightGenerationService>();
        var mockScoringService = new Mock<IUserRiskScoringService>();
        var tenantId = Guid.NewGuid();
        var userId = Guid.NewGuid();

        mockInsightService
            .Setup(x => x.GenerateInsightsForTenantAsync(tenantId, It.IsAny<CancellationToken>()))
            .Returns(Task.CompletedTask);

        var expectedProfile = new UserRiskProfile
        {
            Id = Guid.NewGuid(),
            TenantId = tenantId,
            UserId = userId,
            RiskScore = 85
        };

        mockScoringService
            .Setup(x => x.CalculateRiskAsync(tenantId, userId, It.IsAny<CancellationToken>()))
            .ReturnsAsync(expectedProfile);

        // Act
        await mockInsightService.Object.GenerateInsightsForTenantAsync(tenantId, CancellationToken.None);
        var profile = await mockScoringService.Object.CalculateRiskAsync(tenantId, userId, CancellationToken.None);

        // Assert
        mockInsightService.Verify(x => x.GenerateInsightsForTenantAsync(tenantId, It.IsAny<CancellationToken>()), Times.Once);
        profile.Should().NotBeNull();
        profile.RiskScore.Should().Be(85);
    }

    [Fact]
    public async Task Services_SupportCancellation()
    {
        // Arrange
        var mockInsightService = new Mock<IInsightGenerationService>();
        var mockScoringService = new Mock<IUserRiskScoringService>();
        var tenantId = Guid.NewGuid();
        var userId = Guid.NewGuid();
        var cts = new CancellationTokenSource();

        mockInsightService
            .Setup(x => x.GenerateInsightsForTenantAsync(tenantId, cts.Token))
            .Returns(Task.CompletedTask);

        mockScoringService
            .Setup(x => x.CalculateRiskAsync(tenantId, userId, cts.Token))
            .ReturnsAsync(new UserRiskProfile { Id = Guid.NewGuid() });

        // Act
        await mockInsightService.Object.GenerateInsightsForTenantAsync(tenantId, cts.Token);
        var profile = await mockScoringService.Object.CalculateRiskAsync(tenantId, userId, cts.Token);

        // Assert
        mockInsightService.Verify(x => x.GenerateInsightsForTenantAsync(tenantId, cts.Token), Times.Once);
        mockScoringService.Verify(x => x.CalculateRiskAsync(tenantId, userId, cts.Token), Times.Once);
        profile.Should().NotBeNull();
    }

    #endregion
}
