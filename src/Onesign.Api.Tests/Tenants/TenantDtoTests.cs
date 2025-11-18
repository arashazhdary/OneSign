using FluentAssertions;
using Onesign.Modules.Tenants.Application.DTOs;
using Onesign.Modules.Tenants.Domain.Enums;
using Xunit;

namespace Onesign.Api.Tests.Tenants;

public class TenantDtoTests
{
    [Fact]
    public void TenantDto_WhenCreated_HasDefaultValues()
    {
        // Arrange & Act
        var dto = new TenantDto();

        // Assert
        dto.Id.Should().Be(Guid.Empty);
        dto.Name.Should().BeEmpty();
        dto.Slug.Should().BeEmpty();
        dto.Status.Should().Be(default(TenantStatus));
        dto.CreatedAt.Should().Be(default);
        dto.UpdatedAt.Should().BeNull();
    }

    [Fact]
    public void TenantDto_WhenPropertiesSet_ReturnsCorrectValues()
    {
        // Arrange
        var id = Guid.NewGuid();
        var createdAt = DateTime.UtcNow;
        var updatedAt = DateTime.UtcNow.AddDays(1);

        // Act
        var dto = new TenantDto
        {
            Id = id,
            Name = "Test Tenant",
            Slug = "test-tenant",
            Status = TenantStatus.Active,
            CreatedAt = createdAt,
            UpdatedAt = updatedAt
        };

        // Assert
        dto.Id.Should().Be(id);
        dto.Name.Should().Be("Test Tenant");
        dto.Slug.Should().Be("test-tenant");
        dto.Status.Should().Be(TenantStatus.Active);
        dto.CreatedAt.Should().Be(createdAt);
        dto.UpdatedAt.Should().Be(updatedAt);
    }

    [Fact]
    public void TenantSummaryDto_WhenCreated_HasDefaultValues()
    {
        // Arrange & Act
        var dto = new TenantSummaryDto();

        // Assert
        dto.Id.Should().Be(Guid.Empty);
        dto.Name.Should().BeEmpty();
        dto.Slug.Should().BeEmpty();
        dto.Status.Should().Be(default(TenantStatus));
    }

    [Fact]
    public void TenantSummaryDto_WhenPropertiesSet_ReturnsCorrectValues()
    {
        // Arrange
        var id = Guid.NewGuid();

        // Act
        var dto = new TenantSummaryDto
        {
            Id = id,
            Name = "Summary Tenant",
            Slug = "summary-tenant",
            Status = TenantStatus.Suspended
        };

        // Assert
        dto.Id.Should().Be(id);
        dto.Name.Should().Be("Summary Tenant");
        dto.Slug.Should().Be("summary-tenant");
        dto.Status.Should().Be(TenantStatus.Suspended);
    }

    [Fact]
    public void TenantSettingsDto_WhenCreated_HasNullValues()
    {
        // Arrange & Act
        var dto = new TenantSettingsDto();

        // Assert
        dto.LogoUrl.Should().BeNull();
        dto.PrimaryColor.Should().BeNull();
    }

    [Fact]
    public void TenantSettingsDto_WhenPropertiesSet_ReturnsCorrectValues()
    {
        // Arrange & Act
        var dto = new TenantSettingsDto
        {
            LogoUrl = "https://example.com/logo.png",
            PrimaryColor = "#FF5733"
        };

        // Assert
        dto.LogoUrl.Should().Be("https://example.com/logo.png");
        dto.PrimaryColor.Should().Be("#FF5733");
    }

    [Fact]
    public void CreateTenantRequest_WhenCreated_HasDefaultValues()
    {
        // Arrange & Act
        var request = new CreateTenantRequest();

        // Assert
        request.Name.Should().BeEmpty();
        request.Slug.Should().BeEmpty();
    }

    [Fact]
    public void CreateTenantRequest_WhenPropertiesSet_ReturnsCorrectValues()
    {
        // Arrange & Act
        var request = new CreateTenantRequest
        {
            Name = "New Tenant",
            Slug = "new-tenant"
        };

        // Assert
        request.Name.Should().Be("New Tenant");
        request.Slug.Should().Be("new-tenant");
    }

    [Theory]
    [InlineData(TenantStatus.Active)]
    [InlineData(TenantStatus.Suspended)]
    [InlineData(TenantStatus.Inactive)]
    public void TenantDto_Status_AcceptsAllStatuses(TenantStatus status)
    {
        // Arrange & Act
        var dto = new TenantDto { Status = status };

        // Assert
        dto.Status.Should().Be(status);
    }

    [Theory]
    [InlineData(TenantStatus.Active)]
    [InlineData(TenantStatus.Suspended)]
    [InlineData(TenantStatus.Inactive)]
    public void TenantSummaryDto_Status_AcceptsAllStatuses(TenantStatus status)
    {
        // Arrange & Act
        var dto = new TenantSummaryDto { Status = status };

        // Assert
        dto.Status.Should().Be(status);
    }

    [Fact]
    public void TenantDto_UpdatedAt_CanBeNull()
    {
        // Arrange & Act
        var dto = new TenantDto
        {
            Id = Guid.NewGuid(),
            Name = "Test",
            Slug = "test",
            Status = TenantStatus.Active,
            CreatedAt = DateTime.UtcNow,
            UpdatedAt = null
        };

        // Assert
        dto.UpdatedAt.Should().BeNull();
    }

    [Fact]
    public void TenantSettingsDto_CanHaveNullLogoUrl()
    {
        // Arrange & Act
        var dto = new TenantSettingsDto
        {
            LogoUrl = null,
            PrimaryColor = "#FF5733"
        };

        // Assert
        dto.LogoUrl.Should().BeNull();
        dto.PrimaryColor.Should().Be("#FF5733");
    }

    [Fact]
    public void TenantSettingsDto_CanHaveNullPrimaryColor()
    {
        // Arrange & Act
        var dto = new TenantSettingsDto
        {
            LogoUrl = "https://example.com/logo.png",
            PrimaryColor = null
        };

        // Assert
        dto.LogoUrl.Should().Be("https://example.com/logo.png");
        dto.PrimaryColor.Should().BeNull();
    }
}
