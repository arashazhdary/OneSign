using FluentAssertions;
using Microsoft.EntityFrameworkCore;
using Moq;
using Onesign.Api.Data;
using Onesign.Modules.Tenants.Application.Queries;
using Onesign.Modules.Tenants.Domain.Entities;
using Onesign.Modules.Tenants.Domain.Repositories;
using Onesign.Modules.Tenants.Infrastructure.EfCore.Repositories;
using Xunit;

namespace Onesign.Api.Tests.Tenants;

public class GetTenantSettingsQueryHandlerTests
{
    [Fact]
    public async Task Handle_ExistingConfig_ReturnsSettings()
    {
        // Arrange
        var options = new DbContextOptionsBuilder<OnesignDbContext>()
            .UseInMemoryDatabase(databaseName: Guid.NewGuid().ToString())
            .Options;

        using var context = new OnesignDbContext(options);
        var tenantConfigRepository = new TenantConfigRepository(context);

        var tenantId = Guid.NewGuid();
        var config = new TenantConfig
        {
            Id = Guid.NewGuid(),
            TenantId = tenantId,
            LogoUrl = "https://example.com/logo.png",
            PrimaryColor = "#FF5733",
            CreatedAt = DateTime.UtcNow
        };
        await tenantConfigRepository.AddAsync(config, CancellationToken.None);

        var handler = new GetTenantSettingsQueryHandler(tenantConfigRepository);

        var query = new GetTenantSettingsQuery
        {
            TenantId = tenantId
        };

        // Act
        var result = await handler.Handle(query, CancellationToken.None);

        // Assert
        result.Should().NotBeNull();
        result!.LogoUrl.Should().Be("https://example.com/logo.png");
        result.PrimaryColor.Should().Be("#FF5733");
    }

    [Fact]
    public async Task Handle_NonExistingConfig_ReturnsNull()
    {
        // Arrange
        var options = new DbContextOptionsBuilder<OnesignDbContext>()
            .UseInMemoryDatabase(databaseName: Guid.NewGuid().ToString())
            .Options;

        using var context = new OnesignDbContext(options);
        var tenantConfigRepository = new TenantConfigRepository(context);

        var handler = new GetTenantSettingsQueryHandler(tenantConfigRepository);

        var query = new GetTenantSettingsQuery
        {
            TenantId = Guid.NewGuid() // Non-existent tenant
        };

        // Act
        var result = await handler.Handle(query, CancellationToken.None);

        // Assert
        result.Should().BeNull();
    }

    [Fact]
    public async Task Handle_ConfigWithNullLogoUrl_ReturnsNullLogoUrl()
    {
        // Arrange
        var options = new DbContextOptionsBuilder<OnesignDbContext>()
            .UseInMemoryDatabase(databaseName: Guid.NewGuid().ToString())
            .Options;

        using var context = new OnesignDbContext(options);
        var tenantConfigRepository = new TenantConfigRepository(context);

        var tenantId = Guid.NewGuid();
        var config = new TenantConfig
        {
            Id = Guid.NewGuid(),
            TenantId = tenantId,
            LogoUrl = null,
            PrimaryColor = "#FF5733",
            CreatedAt = DateTime.UtcNow
        };
        await tenantConfigRepository.AddAsync(config, CancellationToken.None);

        var handler = new GetTenantSettingsQueryHandler(tenantConfigRepository);

        var query = new GetTenantSettingsQuery
        {
            TenantId = tenantId
        };

        // Act
        var result = await handler.Handle(query, CancellationToken.None);

        // Assert
        result.Should().NotBeNull();
        result!.LogoUrl.Should().BeNull();
        result.PrimaryColor.Should().Be("#FF5733");
    }

    [Fact]
    public async Task Handle_ConfigWithNullPrimaryColor_ReturnsNullPrimaryColor()
    {
        // Arrange
        var options = new DbContextOptionsBuilder<OnesignDbContext>()
            .UseInMemoryDatabase(databaseName: Guid.NewGuid().ToString())
            .Options;

        using var context = new OnesignDbContext(options);
        var tenantConfigRepository = new TenantConfigRepository(context);

        var tenantId = Guid.NewGuid();
        var config = new TenantConfig
        {
            Id = Guid.NewGuid(),
            TenantId = tenantId,
            LogoUrl = "https://example.com/logo.png",
            PrimaryColor = null,
            CreatedAt = DateTime.UtcNow
        };
        await tenantConfigRepository.AddAsync(config, CancellationToken.None);

        var handler = new GetTenantSettingsQueryHandler(tenantConfigRepository);

        var query = new GetTenantSettingsQuery
        {
            TenantId = tenantId
        };

        // Act
        var result = await handler.Handle(query, CancellationToken.None);

        // Assert
        result.Should().NotBeNull();
        result!.LogoUrl.Should().Be("https://example.com/logo.png");
        result.PrimaryColor.Should().BeNull();
    }

    [Fact]
    public async Task Handle_ConfigWithBothNullValues_ReturnsNullValues()
    {
        // Arrange
        var options = new DbContextOptionsBuilder<OnesignDbContext>()
            .UseInMemoryDatabase(databaseName: Guid.NewGuid().ToString())
            .Options;

        using var context = new OnesignDbContext(options);
        var tenantConfigRepository = new TenantConfigRepository(context);

        var tenantId = Guid.NewGuid();
        var config = new TenantConfig
        {
            Id = Guid.NewGuid(),
            TenantId = tenantId,
            LogoUrl = null,
            PrimaryColor = null,
            CreatedAt = DateTime.UtcNow
        };
        await tenantConfigRepository.AddAsync(config, CancellationToken.None);

        var handler = new GetTenantSettingsQueryHandler(tenantConfigRepository);

        var query = new GetTenantSettingsQuery
        {
            TenantId = tenantId
        };

        // Act
        var result = await handler.Handle(query, CancellationToken.None);

        // Assert
        result.Should().NotBeNull();
        result!.LogoUrl.Should().BeNull();
        result.PrimaryColor.Should().BeNull();
    }

    [Fact]
    public async Task Handle_WithMockedRepository_WorksCorrectly()
    {
        // Arrange
        var mockRepository = new Mock<ITenantConfigRepository>();
        var tenantId = Guid.NewGuid();
        var config = new TenantConfig
        {
            Id = Guid.NewGuid(),
            TenantId = tenantId,
            LogoUrl = "https://example.com/logo.png",
            PrimaryColor = "#FF5733",
            CreatedAt = DateTime.UtcNow
        };

        mockRepository
            .Setup(r => r.GetByTenantIdAsync(tenantId, It.IsAny<CancellationToken>()))
            .ReturnsAsync(config);

        var handler = new GetTenantSettingsQueryHandler(mockRepository.Object);

        var query = new GetTenantSettingsQuery
        {
            TenantId = tenantId
        };

        // Act
        var result = await handler.Handle(query, CancellationToken.None);

        // Assert
        result.Should().NotBeNull();
        result!.LogoUrl.Should().Be("https://example.com/logo.png");
        result.PrimaryColor.Should().Be("#FF5733");
        mockRepository.Verify(r => r.GetByTenantIdAsync(tenantId, It.IsAny<CancellationToken>()), Times.Once);
    }

    [Fact]
    public async Task Handle_WithMockedRepository_ReturningNull_ReturnsNull()
    {
        // Arrange
        var mockRepository = new Mock<ITenantConfigRepository>();
        var tenantId = Guid.NewGuid();

        mockRepository
            .Setup(r => r.GetByTenantIdAsync(tenantId, It.IsAny<CancellationToken>()))
            .ReturnsAsync((TenantConfig?)null);

        var handler = new GetTenantSettingsQueryHandler(mockRepository.Object);

        var query = new GetTenantSettingsQuery
        {
            TenantId = tenantId
        };

        // Act
        var result = await handler.Handle(query, CancellationToken.None);

        // Assert
        result.Should().BeNull();
        mockRepository.Verify(r => r.GetByTenantIdAsync(tenantId, It.IsAny<CancellationToken>()), Times.Once);
    }

    [Fact]
    public async Task Handle_MultipleTenantConfigs_ReturnsCorrectOne()
    {
        // Arrange
        var options = new DbContextOptionsBuilder<OnesignDbContext>()
            .UseInMemoryDatabase(databaseName: Guid.NewGuid().ToString())
            .Options;

        using var context = new OnesignDbContext(options);
        var tenantConfigRepository = new TenantConfigRepository(context);

        var tenant1Id = Guid.NewGuid();
        var tenant2Id = Guid.NewGuid();

        var config1 = new TenantConfig
        {
            Id = Guid.NewGuid(),
            TenantId = tenant1Id,
            LogoUrl = "https://tenant1.com/logo.png",
            PrimaryColor = "#FF0000",
            CreatedAt = DateTime.UtcNow
        };
        var config2 = new TenantConfig
        {
            Id = Guid.NewGuid(),
            TenantId = tenant2Id,
            LogoUrl = "https://tenant2.com/logo.png",
            PrimaryColor = "#00FF00",
            CreatedAt = DateTime.UtcNow
        };

        await tenantConfigRepository.AddAsync(config1, CancellationToken.None);
        await tenantConfigRepository.AddAsync(config2, CancellationToken.None);

        var handler = new GetTenantSettingsQueryHandler(tenantConfigRepository);

        var query = new GetTenantSettingsQuery
        {
            TenantId = tenant2Id
        };

        // Act
        var result = await handler.Handle(query, CancellationToken.None);

        // Assert
        result.Should().NotBeNull();
        result!.LogoUrl.Should().Be("https://tenant2.com/logo.png");
        result.PrimaryColor.Should().Be("#00FF00");
    }

    [Fact]
    public async Task Handle_ConfigWithComplexLogoUrl_ReturnsCorrectUrl()
    {
        // Arrange
        var options = new DbContextOptionsBuilder<OnesignDbContext>()
            .UseInMemoryDatabase(databaseName: Guid.NewGuid().ToString())
            .Options;

        using var context = new OnesignDbContext(options);
        var tenantConfigRepository = new TenantConfigRepository(context);

        var tenantId = Guid.NewGuid();
        var complexUrl = "https://cdn.example.com/tenants/123/logo.png?v=2&size=large";
        var config = new TenantConfig
        {
            Id = Guid.NewGuid(),
            TenantId = tenantId,
            LogoUrl = complexUrl,
            PrimaryColor = "#FF5733",
            CreatedAt = DateTime.UtcNow
        };
        await tenantConfigRepository.AddAsync(config, CancellationToken.None);

        var handler = new GetTenantSettingsQueryHandler(tenantConfigRepository);

        var query = new GetTenantSettingsQuery
        {
            TenantId = tenantId
        };

        // Act
        var result = await handler.Handle(query, CancellationToken.None);

        // Assert
        result.Should().NotBeNull();
        result!.LogoUrl.Should().Be(complexUrl);
    }

    [Theory]
    [InlineData("#FFF")]
    [InlineData("#FFFFFF")]
    [InlineData("#ff5733")]
    [InlineData("rgb(255, 87, 51)")]
    [InlineData("rgba(255, 87, 51, 0.5)")]
    public async Task Handle_ConfigWithVariousColorFormats_ReturnsCorrectColor(string colorFormat)
    {
        // Arrange
        var options = new DbContextOptionsBuilder<OnesignDbContext>()
            .UseInMemoryDatabase(databaseName: Guid.NewGuid().ToString())
            .Options;

        using var context = new OnesignDbContext(options);
        var tenantConfigRepository = new TenantConfigRepository(context);

        var tenantId = Guid.NewGuid();
        var config = new TenantConfig
        {
            Id = Guid.NewGuid(),
            TenantId = tenantId,
            LogoUrl = "https://example.com/logo.png",
            PrimaryColor = colorFormat,
            CreatedAt = DateTime.UtcNow
        };
        await tenantConfigRepository.AddAsync(config, CancellationToken.None);

        var handler = new GetTenantSettingsQueryHandler(tenantConfigRepository);

        var query = new GetTenantSettingsQuery
        {
            TenantId = tenantId
        };

        // Act
        var result = await handler.Handle(query, CancellationToken.None);

        // Assert
        result.Should().NotBeNull();
        result!.PrimaryColor.Should().Be(colorFormat);
    }

    [Fact]
    public async Task Handle_CancellationRequested_RespectsCancellation()
    {
        // Arrange
        var mockRepository = new Mock<ITenantConfigRepository>();
        var tenantId = Guid.NewGuid();
        var cancellationTokenSource = new CancellationTokenSource();

        mockRepository
            .Setup(r => r.GetByTenantIdAsync(tenantId, It.IsAny<CancellationToken>()))
            .Returns(async (Guid id, CancellationToken ct) =>
            {
                await Task.Delay(100, ct);
                return new TenantConfig { TenantId = id };
            });

        var handler = new GetTenantSettingsQueryHandler(mockRepository.Object);

        var query = new GetTenantSettingsQuery
        {
            TenantId = tenantId
        };

        // Act & Assert
        cancellationTokenSource.Cancel();
        await Assert.ThrowsAsync<TaskCanceledException>(() =>
            handler.Handle(query, cancellationTokenSource.Token));
    }
}
