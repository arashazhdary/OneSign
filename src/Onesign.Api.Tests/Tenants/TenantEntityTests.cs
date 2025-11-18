using FluentAssertions;
using Onesign.Modules.Tenants.Domain.Entities;
using Onesign.Modules.Tenants.Domain.Enums;
using Xunit;

namespace Onesign.Api.Tests.Tenants;

public class TenantEntityTests
{
    [Fact]
    public void Tenant_WhenCreated_HasDefaultValues()
    {
        // Arrange & Act
        var tenant = new Tenant();

        // Assert
        tenant.Id.Should().Be(Guid.Empty);
        tenant.Name.Should().BeEmpty();
        tenant.Slug.Should().BeEmpty();
        tenant.Status.Should().Be(default(TenantStatus));
        tenant.CreatedAt.Should().Be(default);
        tenant.UpdatedAt.Should().BeNull();
    }

    [Fact]
    public void Tenant_WhenPropertiesSet_ReturnsCorrectValues()
    {
        // Arrange
        var tenantId = Guid.NewGuid();
        var createdAt = DateTime.UtcNow;
        var updatedAt = DateTime.UtcNow.AddDays(1);

        // Act
        var tenant = new Tenant
        {
            Id = tenantId,
            Name = "Test Tenant",
            Slug = "test-tenant",
            Status = TenantStatus.Active,
            CreatedAt = createdAt,
            UpdatedAt = updatedAt
        };

        // Assert
        tenant.Id.Should().Be(tenantId);
        tenant.Name.Should().Be("Test Tenant");
        tenant.Slug.Should().Be("test-tenant");
        tenant.Status.Should().Be(TenantStatus.Active);
        tenant.CreatedAt.Should().Be(createdAt);
        tenant.UpdatedAt.Should().Be(updatedAt);
    }

    [Theory]
    [InlineData(TenantStatus.Active)]
    [InlineData(TenantStatus.Suspended)]
    [InlineData(TenantStatus.Inactive)]
    public void Tenant_StatusProperty_AcceptsAllValidStatuses(TenantStatus status)
    {
        // Arrange & Act
        var tenant = new Tenant { Status = status };

        // Assert
        tenant.Status.Should().Be(status);
    }

    [Fact]
    public void Tenant_UpdatedAt_CanBeNull()
    {
        // Arrange & Act
        var tenant = new Tenant
        {
            Id = Guid.NewGuid(),
            Name = "Test",
            Slug = "test",
            Status = TenantStatus.Active,
            CreatedAt = DateTime.UtcNow,
            UpdatedAt = null
        };

        // Assert
        tenant.UpdatedAt.Should().BeNull();
    }

    [Fact]
    public void Tenant_UpdatedAt_CanHaveValue()
    {
        // Arrange
        var updateTime = DateTime.UtcNow;

        // Act
        var tenant = new Tenant
        {
            Id = Guid.NewGuid(),
            Name = "Test",
            Slug = "test",
            Status = TenantStatus.Active,
            CreatedAt = DateTime.UtcNow,
            UpdatedAt = updateTime
        };

        // Assert
        tenant.UpdatedAt.Should().Be(updateTime);
    }

    [Fact]
    public void Tenant_Name_CanContainSpecialCharacters()
    {
        // Arrange & Act
        var tenant = new Tenant
        {
            Name = "Acme Corp & Sons (2024)"
        };

        // Assert
        tenant.Name.Should().Be("Acme Corp & Sons (2024)");
    }

    [Fact]
    public void Tenant_Slug_CanContainHyphensAndNumbers()
    {
        // Arrange & Act
        var tenant = new Tenant
        {
            Slug = "my-company-2024"
        };

        // Assert
        tenant.Slug.Should().Be("my-company-2024");
    }

    [Fact]
    public void TenantStatus_HasCorrectValues()
    {
        // Assert
        ((int)TenantStatus.Active).Should().Be(1);
        ((int)TenantStatus.Suspended).Should().Be(2);
        ((int)TenantStatus.Inactive).Should().Be(3);
    }
}
