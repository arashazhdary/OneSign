using FluentAssertions;
using Onesign.Modules.Tenants.Domain.Entities;
using Xunit;

namespace Onesign.Api.Tests.Tenants;

public class TenantConfigEntityTests
{
    [Fact]
    public void TenantConfig_WhenCreated_HasDefaultValues()
    {
        // Arrange & Act
        var config = new TenantConfig();

        // Assert
        config.Id.Should().Be(Guid.Empty);
        config.TenantId.Should().Be(Guid.Empty);
        config.LogoUrl.Should().BeNull();
        config.PrimaryColor.Should().BeNull();
        config.CreatedAt.Should().Be(default);
        config.UpdatedAt.Should().BeNull();
    }

    [Fact]
    public void TenantConfig_WhenPropertiesSet_ReturnsCorrectValues()
    {
        // Arrange
        var configId = Guid.NewGuid();
        var tenantId = Guid.NewGuid();
        var createdAt = DateTime.UtcNow;
        var updatedAt = DateTime.UtcNow.AddDays(1);

        // Act
        var config = new TenantConfig
        {
            Id = configId,
            TenantId = tenantId,
            LogoUrl = "https://example.com/logo.png",
            PrimaryColor = "#FF5733",
            CreatedAt = createdAt,
            UpdatedAt = updatedAt
        };

        // Assert
        config.Id.Should().Be(configId);
        config.TenantId.Should().Be(tenantId);
        config.LogoUrl.Should().Be("https://example.com/logo.png");
        config.PrimaryColor.Should().Be("#FF5733");
        config.CreatedAt.Should().Be(createdAt);
        config.UpdatedAt.Should().Be(updatedAt);
    }

    [Fact]
    public void TenantConfig_LogoUrl_CanBeNull()
    {
        // Arrange & Act
        var config = new TenantConfig
        {
            Id = Guid.NewGuid(),
            TenantId = Guid.NewGuid(),
            LogoUrl = null,
            CreatedAt = DateTime.UtcNow
        };

        // Assert
        config.LogoUrl.Should().BeNull();
    }

    [Fact]
    public void TenantConfig_PrimaryColor_CanBeNull()
    {
        // Arrange & Act
        var config = new TenantConfig
        {
            Id = Guid.NewGuid(),
            TenantId = Guid.NewGuid(),
            PrimaryColor = null,
            CreatedAt = DateTime.UtcNow
        };

        // Assert
        config.PrimaryColor.Should().BeNull();
    }

    [Fact]
    public void TenantConfig_UpdatedAt_CanBeNull()
    {
        // Arrange & Act
        var config = new TenantConfig
        {
            Id = Guid.NewGuid(),
            TenantId = Guid.NewGuid(),
            CreatedAt = DateTime.UtcNow,
            UpdatedAt = null
        };

        // Assert
        config.UpdatedAt.Should().BeNull();
    }

    [Fact]
    public void TenantConfig_LogoUrl_CanContainVariousUrlFormats()
    {
        // Arrange & Act
        var config = new TenantConfig
        {
            LogoUrl = "https://cdn.example.com/tenants/123/logo.png?v=2"
        };

        // Assert
        config.LogoUrl.Should().Be("https://cdn.example.com/tenants/123/logo.png?v=2");
    }

    [Theory]
    [InlineData("#FFF")]
    [InlineData("#FFFFFF")]
    [InlineData("#ff5733")]
    [InlineData("rgb(255, 87, 51)")]
    [InlineData("rgba(255, 87, 51, 0.5)")]
    [InlineData("hsl(9, 100%, 60%)")]
    public void TenantConfig_PrimaryColor_AcceptsVariousColorFormats(string color)
    {
        // Arrange & Act
        var config = new TenantConfig
        {
            PrimaryColor = color
        };

        // Assert
        config.PrimaryColor.Should().Be(color);
    }

    [Fact]
    public void TenantConfig_CanUpdateAllProperties()
    {
        // Arrange
        var config = new TenantConfig
        {
            Id = Guid.NewGuid(),
            TenantId = Guid.NewGuid(),
            LogoUrl = "https://old.com/logo.png",
            PrimaryColor = "#000000",
            CreatedAt = DateTime.UtcNow
        };

        // Act
        config.LogoUrl = "https://new.com/logo.png";
        config.PrimaryColor = "#FFFFFF";
        config.UpdatedAt = DateTime.UtcNow.AddHours(1);

        // Assert
        config.LogoUrl.Should().Be("https://new.com/logo.png");
        config.PrimaryColor.Should().Be("#FFFFFF");
        config.UpdatedAt.Should().NotBeNull();
    }

    [Fact]
    public void TenantConfig_MultipleConfigs_HaveIndependentValues()
    {
        // Arrange & Act
        var config1 = new TenantConfig
        {
            Id = Guid.NewGuid(),
            TenantId = Guid.NewGuid(),
            LogoUrl = "https://tenant1.com/logo.png",
            PrimaryColor = "#FF0000"
        };

        var config2 = new TenantConfig
        {
            Id = Guid.NewGuid(),
            TenantId = Guid.NewGuid(),
            LogoUrl = "https://tenant2.com/logo.png",
            PrimaryColor = "#00FF00"
        };

        // Assert
        config1.Id.Should().NotBe(config2.Id);
        config1.TenantId.Should().NotBe(config2.TenantId);
        config1.LogoUrl.Should().NotBe(config2.LogoUrl);
        config1.PrimaryColor.Should().NotBe(config2.PrimaryColor);
    }
}
