using FluentAssertions;
using Onesign.Shared.Tenant;
using Xunit;

namespace Onesign.Api.Tests.Shared;

public class TenantContextTests
{
    [Fact]
    public void TenantContext_WhenTenantIdIsNull_IsResolvedShouldBeFalse()
    {
        // Arrange
        var context = new TenantContext();

        // Act & Assert
        context.TenantId.Should().BeNull();
        context.IsResolved.Should().BeFalse();
    }

    [Fact]
    public void TenantContext_WhenTenantIdIsSet_IsResolvedShouldBeTrue()
    {
        // Arrange
        var tenantId = Guid.NewGuid();
        var context = new TenantContext
        {
            TenantId = tenantId
        };

        // Act & Assert
        context.TenantId.Should().Be(tenantId);
        context.IsResolved.Should().BeTrue();
    }

    [Fact]
    public void TenantContext_ShouldSetAndGetTenantSlug()
    {
        // Arrange
        var slug = "test-tenant";
        var context = new TenantContext
        {
            TenantSlug = slug
        };

        // Act & Assert
        context.TenantSlug.Should().Be(slug);
    }

    [Fact]
    public void TenantContext_ShouldSetBothTenantIdAndSlug()
    {
        // Arrange
        var tenantId = Guid.NewGuid();
        var slug = "my-tenant";

        // Act
        var context = new TenantContext
        {
            TenantId = tenantId,
            TenantSlug = slug
        };

        // Assert
        context.TenantId.Should().Be(tenantId);
        context.TenantSlug.Should().Be(slug);
        context.IsResolved.Should().BeTrue();
    }

    [Fact]
    public void TenantContext_WhenTenantIdIsCleared_IsResolvedShouldBeFalse()
    {
        // Arrange
        var context = new TenantContext
        {
            TenantId = Guid.NewGuid()
        };

        // Act
        context.TenantId = null;

        // Assert
        context.IsResolved.Should().BeFalse();
    }

    [Fact]
    public void TenantContext_WhenTenantSlugIsNull_ShouldReturnNull()
    {
        // Arrange
        var context = new TenantContext();

        // Act & Assert
        context.TenantSlug.Should().BeNull();
    }

    [Fact]
    public void TenantContext_ShouldAllowEmptyTenantSlug()
    {
        // Arrange
        var context = new TenantContext
        {
            TenantSlug = string.Empty
        };

        // Act & Assert
        context.TenantSlug.Should().BeEmpty();
    }

    [Fact]
    public void TenantContext_ShouldAllowUpdatingValues()
    {
        // Arrange
        var originalTenantId = Guid.NewGuid();
        var newTenantId = Guid.NewGuid();
        var context = new TenantContext
        {
            TenantId = originalTenantId,
            TenantSlug = "original"
        };

        // Act
        context.TenantId = newTenantId;
        context.TenantSlug = "updated";

        // Assert
        context.TenantId.Should().Be(newTenantId);
        context.TenantSlug.Should().Be("updated");
    }
}
