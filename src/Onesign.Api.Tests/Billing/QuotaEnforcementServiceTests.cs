using FluentAssertions;
using Microsoft.EntityFrameworkCore;
using Moq;
using Onesign.Modules.Applications.Infrastructure.EfCore.Entities;
using Onesign.Modules.Billing.Application.Services;
using Onesign.Modules.Billing.Domain.Entities;
using Onesign.Modules.Billing.Domain.Enums;
using Onesign.Modules.Billing.Domain.Repositories;
using Onesign.Modules.Federation.Infrastructure.EfCore.Entities;
using Onesign.Modules.Identity.Infrastructure.EfCore.Entities;
using Onesign.Modules.OrgHierarchy.Infrastructure.EfCore.Entities;
using Xunit;

namespace Onesign.Api.Tests.Billing;

public class QuotaEnforcementServiceTests
{
    private readonly Mock<ISubscriptionRepository> _subscriptionRepositoryMock;
    private readonly Mock<DbContext> _dbContextMock;

    public QuotaEnforcementServiceTests()
    {
        _subscriptionRepositoryMock = new Mock<ISubscriptionRepository>();
        _dbContextMock = new Mock<DbContext>();
    }

    private QuotaEnforcementService CreateService()
    {
        return new QuotaEnforcementService(_subscriptionRepositoryMock.Object, _dbContextMock.Object);
    }

    #region CheckCanCreateUserAsync Tests

    [Fact]
    public async Task CheckCanCreateUserAsync_NoSubscription_ThrowsInvalidOperationException()
    {
        // Arrange
        var tenantId = Guid.NewGuid();
        _subscriptionRepositoryMock.Setup(x => x.GetByTenantIdAsync(tenantId, It.IsAny<CancellationToken>()))
            .ReturnsAsync((TenantSubscription?)null);

        var service = CreateService();

        // Act & Assert
        var exception = await Assert.ThrowsAsync<InvalidOperationException>(
            () => service.CheckCanCreateUserAsync(tenantId));

        exception.Message.Should().Contain("subscription");
    }

    [Fact]
    public async Task CheckCanCreateUserAsync_NoPlan_ThrowsInvalidOperationException()
    {
        // Arrange
        var tenantId = Guid.NewGuid();
        var subscription = new TenantSubscription
        {
            Id = Guid.NewGuid(),
            TenantId = tenantId,
            Plan = null
        };

        _subscriptionRepositoryMock.Setup(x => x.GetByTenantIdAsync(tenantId, It.IsAny<CancellationToken>()))
            .ReturnsAsync(subscription);

        var service = CreateService();

        // Act & Assert
        var exception = await Assert.ThrowsAsync<InvalidOperationException>(
            () => service.CheckCanCreateUserAsync(tenantId));

        exception.Message.Should().Contain("subscription");
    }

    [Fact]
    public async Task CheckCanCreateUserAsync_NoMaxUsersFeature_DoesNotThrow()
    {
        // Arrange
        var tenantId = Guid.NewGuid();
        var subscription = new TenantSubscription
        {
            Id = Guid.NewGuid(),
            TenantId = tenantId,
            Plan = new Plan
            {
                Id = Guid.NewGuid(),
                Name = "Unlimited",
                Features = new List<PlanFeature>() // No MaxUsers feature
            }
        };

        _subscriptionRepositoryMock.Setup(x => x.GetByTenantIdAsync(tenantId, It.IsAny<CancellationToken>()))
            .ReturnsAsync(subscription);

        var service = CreateService();

        // Act & Assert - Should not throw
        await service.CheckCanCreateUserAsync(tenantId);
    }

    #endregion

    #region CheckCanCreateApplicationAsync Tests

    [Fact]
    public async Task CheckCanCreateApplicationAsync_NoSubscription_ThrowsInvalidOperationException()
    {
        // Arrange
        var tenantId = Guid.NewGuid();
        _subscriptionRepositoryMock.Setup(x => x.GetByTenantIdAsync(tenantId, It.IsAny<CancellationToken>()))
            .ReturnsAsync((TenantSubscription?)null);

        var service = CreateService();

        // Act & Assert
        var exception = await Assert.ThrowsAsync<InvalidOperationException>(
            () => service.CheckCanCreateApplicationAsync(tenantId));

        exception.Message.Should().Contain("subscription");
    }

    [Fact]
    public async Task CheckCanCreateApplicationAsync_NoMaxApplicationsFeature_DoesNotThrow()
    {
        // Arrange
        var tenantId = Guid.NewGuid();
        var subscription = new TenantSubscription
        {
            Id = Guid.NewGuid(),
            TenantId = tenantId,
            Plan = new Plan
            {
                Id = Guid.NewGuid(),
                Name = "Unlimited",
                Features = new List<PlanFeature>()
            }
        };

        _subscriptionRepositoryMock.Setup(x => x.GetByTenantIdAsync(tenantId, It.IsAny<CancellationToken>()))
            .ReturnsAsync(subscription);

        var service = CreateService();

        // Act & Assert
        await service.CheckCanCreateApplicationAsync(tenantId);
    }

    #endregion

    #region CheckCanCreateIdpAsync Tests

    [Fact]
    public async Task CheckCanCreateIdpAsync_NoSubscription_ThrowsInvalidOperationException()
    {
        // Arrange
        var tenantId = Guid.NewGuid();
        _subscriptionRepositoryMock.Setup(x => x.GetByTenantIdAsync(tenantId, It.IsAny<CancellationToken>()))
            .ReturnsAsync((TenantSubscription?)null);

        var service = CreateService();

        // Act & Assert
        var exception = await Assert.ThrowsAsync<InvalidOperationException>(
            () => service.CheckCanCreateIdpAsync(tenantId));

        exception.Message.Should().Contain("subscription");
    }

    [Fact]
    public async Task CheckCanCreateIdpAsync_NoMaxIdpConnectionsFeature_DoesNotThrow()
    {
        // Arrange
        var tenantId = Guid.NewGuid();
        var subscription = new TenantSubscription
        {
            Id = Guid.NewGuid(),
            TenantId = tenantId,
            Plan = new Plan
            {
                Id = Guid.NewGuid(),
                Name = "Unlimited",
                Features = new List<PlanFeature>()
            }
        };

        _subscriptionRepositoryMock.Setup(x => x.GetByTenantIdAsync(tenantId, It.IsAny<CancellationToken>()))
            .ReturnsAsync(subscription);

        var service = CreateService();

        // Act & Assert
        await service.CheckCanCreateIdpAsync(tenantId);
    }

    #endregion

    #region CheckCanCreateOrgUnitAsync Tests

    [Fact]
    public async Task CheckCanCreateOrgUnitAsync_NoSubscription_ThrowsInvalidOperationException()
    {
        // Arrange
        var tenantId = Guid.NewGuid();
        _subscriptionRepositoryMock.Setup(x => x.GetByTenantIdAsync(tenantId, It.IsAny<CancellationToken>()))
            .ReturnsAsync((TenantSubscription?)null);

        var service = CreateService();

        // Act & Assert
        var exception = await Assert.ThrowsAsync<InvalidOperationException>(
            () => service.CheckCanCreateOrgUnitAsync(tenantId));

        exception.Message.Should().Contain("subscription");
    }

    [Fact]
    public async Task CheckCanCreateOrgUnitAsync_NoMaxOrgUnitsFeature_DoesNotThrow()
    {
        // Arrange
        var tenantId = Guid.NewGuid();
        var subscription = new TenantSubscription
        {
            Id = Guid.NewGuid(),
            TenantId = tenantId,
            Plan = new Plan
            {
                Id = Guid.NewGuid(),
                Name = "Unlimited",
                Features = new List<PlanFeature>()
            }
        };

        _subscriptionRepositoryMock.Setup(x => x.GetByTenantIdAsync(tenantId, It.IsAny<CancellationToken>()))
            .ReturnsAsync(subscription);

        var service = CreateService();

        // Act & Assert
        await service.CheckCanCreateOrgUnitAsync(tenantId);
    }

    #endregion

    #region CheckFeatureEnabledAsync Tests

    [Fact]
    public async Task CheckFeatureEnabledAsync_NoSubscription_ThrowsInvalidOperationException()
    {
        // Arrange
        var tenantId = Guid.NewGuid();
        _subscriptionRepositoryMock.Setup(x => x.GetByTenantIdAsync(tenantId, It.IsAny<CancellationToken>()))
            .ReturnsAsync((TenantSubscription?)null);

        var service = CreateService();

        // Act & Assert
        var exception = await Assert.ThrowsAsync<InvalidOperationException>(
            () => service.CheckFeatureEnabledAsync(tenantId, "SsoEnabled"));

        exception.Message.Should().Contain("subscription");
    }

    [Fact]
    public async Task CheckFeatureEnabledAsync_FeatureNotFound_ThrowsFeatureNotAvailableException()
    {
        // Arrange
        var tenantId = Guid.NewGuid();
        var subscription = new TenantSubscription
        {
            Id = Guid.NewGuid(),
            TenantId = tenantId,
            Plan = new Plan
            {
                Id = Guid.NewGuid(),
                Name = "Basic",
                Features = new List<PlanFeature>()
            }
        };

        _subscriptionRepositoryMock.Setup(x => x.GetByTenantIdAsync(tenantId, It.IsAny<CancellationToken>()))
            .ReturnsAsync(subscription);

        var service = CreateService();

        // Act & Assert
        var exception = await Assert.ThrowsAsync<FeatureNotAvailableException>(
            () => service.CheckFeatureEnabledAsync(tenantId, "SsoEnabled"));

        exception.ErrorCode.Should().Be("FEATURE_NOT_AVAILABLE");
        exception.Message.Should().Contain("SsoEnabled");
    }

    [Fact]
    public async Task CheckFeatureEnabledAsync_FeatureDisabled_ThrowsFeatureNotAvailableException()
    {
        // Arrange
        var tenantId = Guid.NewGuid();
        var subscription = new TenantSubscription
        {
            Id = Guid.NewGuid(),
            TenantId = tenantId,
            Plan = new Plan
            {
                Id = Guid.NewGuid(),
                Name = "Basic",
                Features = new List<PlanFeature>
                {
                    new() { Key = "SsoEnabled", Value = "false" }
                }
            }
        };

        _subscriptionRepositoryMock.Setup(x => x.GetByTenantIdAsync(tenantId, It.IsAny<CancellationToken>()))
            .ReturnsAsync(subscription);

        var service = CreateService();

        // Act & Assert
        var exception = await Assert.ThrowsAsync<FeatureNotAvailableException>(
            () => service.CheckFeatureEnabledAsync(tenantId, "SsoEnabled"));

        exception.ErrorCode.Should().Be("FEATURE_DISABLED");
    }

    [Fact]
    public async Task CheckFeatureEnabledAsync_FeatureEnabled_DoesNotThrow()
    {
        // Arrange
        var tenantId = Guid.NewGuid();
        var subscription = new TenantSubscription
        {
            Id = Guid.NewGuid(),
            TenantId = tenantId,
            Plan = new Plan
            {
                Id = Guid.NewGuid(),
                Name = "Pro",
                Features = new List<PlanFeature>
                {
                    new() { Key = "SsoEnabled", Value = "true" }
                }
            }
        };

        _subscriptionRepositoryMock.Setup(x => x.GetByTenantIdAsync(tenantId, It.IsAny<CancellationToken>()))
            .ReturnsAsync(subscription);

        var service = CreateService();

        // Act & Assert
        await service.CheckFeatureEnabledAsync(tenantId, "SsoEnabled");
    }

    [Fact]
    public async Task CheckFeatureEnabledAsync_NonBooleanFeature_DoesNotThrow()
    {
        // Arrange
        var tenantId = Guid.NewGuid();
        var subscription = new TenantSubscription
        {
            Id = Guid.NewGuid(),
            TenantId = tenantId,
            Plan = new Plan
            {
                Id = Guid.NewGuid(),
                Name = "Pro",
                Features = new List<PlanFeature>
                {
                    new() { Key = "MaxUsers", Value = "100" } // Non-boolean value
                }
            }
        };

        _subscriptionRepositoryMock.Setup(x => x.GetByTenantIdAsync(tenantId, It.IsAny<CancellationToken>()))
            .ReturnsAsync(subscription);

        var service = CreateService();

        // Act & Assert - Non-boolean features should pass
        await service.CheckFeatureEnabledAsync(tenantId, "MaxUsers");
    }

    #endregion

    #region Exception Tests

    [Fact]
    public void QuotaExceededException_SetsErrorCodeAndMessage()
    {
        // Arrange & Act
        var exception = new QuotaExceededException("USER_QUOTA_EXCEEDED", "Maximum user limit reached");

        // Assert
        exception.ErrorCode.Should().Be("USER_QUOTA_EXCEEDED");
        exception.Message.Should().Be("Maximum user limit reached");
    }

    [Fact]
    public void FeatureNotAvailableException_SetsErrorCodeAndMessage()
    {
        // Arrange & Act
        var exception = new FeatureNotAvailableException("FEATURE_NOT_AVAILABLE", "SSO is not available");

        // Assert
        exception.ErrorCode.Should().Be("FEATURE_NOT_AVAILABLE");
        exception.Message.Should().Be("SSO is not available");
    }

    #endregion

    #region LimitType Tests

    [Fact]
    public async Task CheckCanCreateUserAsync_SoftLimit_DoesNotThrow()
    {
        // Arrange
        var tenantId = Guid.NewGuid();
        var subscription = new TenantSubscription
        {
            Id = Guid.NewGuid(),
            TenantId = tenantId,
            Plan = new Plan
            {
                Id = Guid.NewGuid(),
                Name = "Pro",
                Features = new List<PlanFeature>
                {
                    new() { Key = "MaxUsers", Value = "10", LimitType = LimitType.Soft }
                }
            }
        };

        _subscriptionRepositoryMock.Setup(x => x.GetByTenantIdAsync(tenantId, It.IsAny<CancellationToken>()))
            .ReturnsAsync(subscription);

        var service = CreateService();

        // Act & Assert - Soft limits should not throw even when exceeded
        // Note: This test assumes the actual count check returns 10 or more
        // In practice, the service checks against the database count
        // For this test, we're just verifying the soft limit type doesn't cause issues
        await service.CheckCanCreateUserAsync(tenantId);
    }

    #endregion
}
