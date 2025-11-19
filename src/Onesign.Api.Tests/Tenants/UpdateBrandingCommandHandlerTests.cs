using FluentAssertions;
using Microsoft.EntityFrameworkCore;
using Moq;
using Onesign.Data.Contexts;
using Onesign.Modules.Tenants.Application.Commands;
using Onesign.Modules.Tenants.Domain.Entities;
using Onesign.Modules.Tenants.Domain.Repositories;
using Onesign.Modules.Tenants.Infrastructure.EfCore.Repositories;
using Xunit;

namespace Onesign.Api.Tests.Tenants;

public class UpdateBrandingCommandHandlerTests
{
    [Fact]
    public async Task Handle_ValidRequest_UpdatesBrandingSuccessfully()
    {
        // Arrange
        var options = new DbContextOptionsBuilder<OnesignDbContext>()
            .UseInMemoryDatabase(databaseName: Guid.NewGuid().ToString())
            .Options;

        using var context = new OnesignDbContext(options);
        var tenantConfigRepository = new TenantConfigRepository(context);

        var tenantId = Guid.NewGuid();
        var existingConfig = new TenantConfig
        {
            Id = Guid.NewGuid(),
            TenantId = tenantId,
            LogoUrl = "https://old.com/logo.png",
            PrimaryColor = "#000000",
            CreatedAt = DateTime.UtcNow
        };
        await tenantConfigRepository.AddAsync(existingConfig, CancellationToken.None);

        var handler = new UpdateBrandingCommandHandler(tenantConfigRepository);

        var command = new UpdateBrandingCommand
        {
            TenantId = tenantId,
            LogoUrl = "https://new.com/logo.png",
            PrimaryColor = "#FF5733"
        };

        // Act
        var result = await handler.Handle(command, CancellationToken.None);

        // Assert
        result.IsSuccess.Should().BeTrue();
        result.Value.Should().NotBeNull();
        result.Value!.LogoUrl.Should().Be("https://new.com/logo.png");
        result.Value.PrimaryColor.Should().Be("#FF5733");

        // Verify database was updated
        var updatedConfig = await tenantConfigRepository.GetByTenantIdAsync(tenantId, CancellationToken.None);
        updatedConfig.Should().NotBeNull();
        updatedConfig!.LogoUrl.Should().Be("https://new.com/logo.png");
        updatedConfig.PrimaryColor.Should().Be("#FF5733");
    }

    [Fact]
    public async Task Handle_ConfigNotFound_ReturnsFailure()
    {
        // Arrange
        var options = new DbContextOptionsBuilder<OnesignDbContext>()
            .UseInMemoryDatabase(databaseName: Guid.NewGuid().ToString())
            .Options;

        using var context = new OnesignDbContext(options);
        var tenantConfigRepository = new TenantConfigRepository(context);

        var handler = new UpdateBrandingCommandHandler(tenantConfigRepository);

        var command = new UpdateBrandingCommand
        {
            TenantId = Guid.NewGuid(), // Non-existent tenant
            LogoUrl = "https://new.com/logo.png",
            PrimaryColor = "#FF5733"
        };

        // Act
        var result = await handler.Handle(command, CancellationToken.None);

        // Assert
        result.IsFailure.Should().BeTrue();
        result.ErrorCode.Should().Be("TENANT_CONFIG_NOT_FOUND");
        result.ErrorMessage.Should().Be("Tenant configuration not found");
    }

    [Fact]
    public async Task Handle_NullLogoUrl_UpdatesToNull()
    {
        // Arrange
        var options = new DbContextOptionsBuilder<OnesignDbContext>()
            .UseInMemoryDatabase(databaseName: Guid.NewGuid().ToString())
            .Options;

        using var context = new OnesignDbContext(options);
        var tenantConfigRepository = new TenantConfigRepository(context);

        var tenantId = Guid.NewGuid();
        var existingConfig = new TenantConfig
        {
            Id = Guid.NewGuid(),
            TenantId = tenantId,
            LogoUrl = "https://old.com/logo.png",
            PrimaryColor = "#000000",
            CreatedAt = DateTime.UtcNow
        };
        await tenantConfigRepository.AddAsync(existingConfig, CancellationToken.None);

        var handler = new UpdateBrandingCommandHandler(tenantConfigRepository);

        var command = new UpdateBrandingCommand
        {
            TenantId = tenantId,
            LogoUrl = null,
            PrimaryColor = "#FF5733"
        };

        // Act
        var result = await handler.Handle(command, CancellationToken.None);

        // Assert
        result.IsSuccess.Should().BeTrue();
        result.Value!.LogoUrl.Should().BeNull();
        result.Value.PrimaryColor.Should().Be("#FF5733");
    }

    [Fact]
    public async Task Handle_NullPrimaryColor_UpdatesToNull()
    {
        // Arrange
        var options = new DbContextOptionsBuilder<OnesignDbContext>()
            .UseInMemoryDatabase(databaseName: Guid.NewGuid().ToString())
            .Options;

        using var context = new OnesignDbContext(options);
        var tenantConfigRepository = new TenantConfigRepository(context);

        var tenantId = Guid.NewGuid();
        var existingConfig = new TenantConfig
        {
            Id = Guid.NewGuid(),
            TenantId = tenantId,
            LogoUrl = "https://old.com/logo.png",
            PrimaryColor = "#000000",
            CreatedAt = DateTime.UtcNow
        };
        await tenantConfigRepository.AddAsync(existingConfig, CancellationToken.None);

        var handler = new UpdateBrandingCommandHandler(tenantConfigRepository);

        var command = new UpdateBrandingCommand
        {
            TenantId = tenantId,
            LogoUrl = "https://new.com/logo.png",
            PrimaryColor = null
        };

        // Act
        var result = await handler.Handle(command, CancellationToken.None);

        // Assert
        result.IsSuccess.Should().BeTrue();
        result.Value!.LogoUrl.Should().Be("https://new.com/logo.png");
        result.Value.PrimaryColor.Should().BeNull();
    }

    [Fact]
    public async Task Handle_BothValuesNull_UpdatesBothToNull()
    {
        // Arrange
        var options = new DbContextOptionsBuilder<OnesignDbContext>()
            .UseInMemoryDatabase(databaseName: Guid.NewGuid().ToString())
            .Options;

        using var context = new OnesignDbContext(options);
        var tenantConfigRepository = new TenantConfigRepository(context);

        var tenantId = Guid.NewGuid();
        var existingConfig = new TenantConfig
        {
            Id = Guid.NewGuid(),
            TenantId = tenantId,
            LogoUrl = "https://old.com/logo.png",
            PrimaryColor = "#000000",
            CreatedAt = DateTime.UtcNow
        };
        await tenantConfigRepository.AddAsync(existingConfig, CancellationToken.None);

        var handler = new UpdateBrandingCommandHandler(tenantConfigRepository);

        var command = new UpdateBrandingCommand
        {
            TenantId = tenantId,
            LogoUrl = null,
            PrimaryColor = null
        };

        // Act
        var result = await handler.Handle(command, CancellationToken.None);

        // Assert
        result.IsSuccess.Should().BeTrue();
        result.Value!.LogoUrl.Should().BeNull();
        result.Value.PrimaryColor.Should().BeNull();
    }

    [Fact]
    public async Task Handle_WithMockedRepository_WorksCorrectly()
    {
        // Arrange
        var mockRepository = new Mock<ITenantConfigRepository>();
        var tenantId = Guid.NewGuid();
        var existingConfig = new TenantConfig
        {
            Id = Guid.NewGuid(),
            TenantId = tenantId,
            LogoUrl = "https://old.com/logo.png",
            PrimaryColor = "#000000",
            CreatedAt = DateTime.UtcNow
        };

        mockRepository
            .Setup(r => r.GetByTenantIdAsync(tenantId, It.IsAny<CancellationToken>()))
            .ReturnsAsync(existingConfig);
        mockRepository
            .Setup(r => r.UpdateAsync(It.IsAny<TenantConfig>(), It.IsAny<CancellationToken>()))
            .Returns(Task.CompletedTask);

        var handler = new UpdateBrandingCommandHandler(mockRepository.Object);

        var command = new UpdateBrandingCommand
        {
            TenantId = tenantId,
            LogoUrl = "https://new.com/logo.png",
            PrimaryColor = "#FF5733"
        };

        // Act
        var result = await handler.Handle(command, CancellationToken.None);

        // Assert
        result.IsSuccess.Should().BeTrue();
        mockRepository.Verify(r => r.GetByTenantIdAsync(tenantId, It.IsAny<CancellationToken>()), Times.Once);
        mockRepository.Verify(r => r.UpdateAsync(It.Is<TenantConfig>(c =>
            c.LogoUrl == "https://new.com/logo.png" &&
            c.PrimaryColor == "#FF5733"), It.IsAny<CancellationToken>()), Times.Once);
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

        var handler = new UpdateBrandingCommandHandler(mockRepository.Object);

        var command = new UpdateBrandingCommand
        {
            TenantId = tenantId,
            LogoUrl = "https://new.com/logo.png",
            PrimaryColor = "#FF5733"
        };

        // Act & Assert
        cancellationTokenSource.Cancel();
        await Assert.ThrowsAsync<TaskCanceledException>(() =>
            handler.Handle(command, cancellationTokenSource.Token));
    }
}
