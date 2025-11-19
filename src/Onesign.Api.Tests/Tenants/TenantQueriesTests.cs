using FluentAssertions;
using Onesign.Modules.Tenants.Application.Queries;
using Xunit;

namespace Onesign.Api.Tests.Tenants;

public class TenantQueriesTests
{
    [Fact]
    public void GetTenantsQuery_WhenCreated_HasDefaultValues()
    {
        // Arrange & Act
        var query = new GetTenantsQuery();

        // Assert
        query.PageNumber.Should().Be(1);
        query.PageSize.Should().Be(10);
    }

    [Fact]
    public void GetTenantsQuery_WhenPropertiesSet_ReturnsCorrectValues()
    {
        // Arrange & Act
        var query = new GetTenantsQuery
        {
            PageNumber = 5,
            PageSize = 25
        };

        // Assert
        query.PageNumber.Should().Be(5);
        query.PageSize.Should().Be(25);
    }

    [Theory]
    [InlineData(1, 10)]
    [InlineData(2, 20)]
    [InlineData(100, 100)]
    public void GetTenantsQuery_AcceptsVariousPageConfigurations(int pageNumber, int pageSize)
    {
        // Arrange & Act
        var query = new GetTenantsQuery
        {
            PageNumber = pageNumber,
            PageSize = pageSize
        };

        // Assert
        query.PageNumber.Should().Be(pageNumber);
        query.PageSize.Should().Be(pageSize);
    }

    [Fact]
    public void GetTenantsQuery_PageNumberCanBeZero()
    {
        // Arrange & Act
        var query = new GetTenantsQuery
        {
            PageNumber = 0,
            PageSize = 10
        };

        // Assert
        query.PageNumber.Should().Be(0);
    }

    [Fact]
    public void GetTenantsQuery_PageSizeCanBeZero()
    {
        // Arrange & Act
        var query = new GetTenantsQuery
        {
            PageNumber = 1,
            PageSize = 0
        };

        // Assert
        query.PageSize.Should().Be(0);
    }

    [Fact]
    public void GetTenantSettingsQuery_WhenCreated_HasDefaultValues()
    {
        // Arrange & Act
        var query = new GetTenantSettingsQuery();

        // Assert
        query.TenantId.Should().Be(Guid.Empty);
    }

    [Fact]
    public void GetTenantSettingsQuery_WhenTenantIdSet_ReturnsCorrectValue()
    {
        // Arrange
        var tenantId = Guid.NewGuid();

        // Act
        var query = new GetTenantSettingsQuery
        {
            TenantId = tenantId
        };

        // Assert
        query.TenantId.Should().Be(tenantId);
    }

    [Theory]
    [InlineData(1)]
    [InlineData(5)]
    [InlineData(10)]
    [InlineData(50)]
    [InlineData(100)]
    public void GetTenantsQuery_PageSize_AcceptsVariousSizes(int pageSize)
    {
        // Arrange & Act
        var query = new GetTenantsQuery
        {
            PageNumber = 1,
            PageSize = pageSize
        };

        // Assert
        query.PageSize.Should().Be(pageSize);
    }

    [Fact]
    public void GetTenantsQuery_MultipleInstances_AreIndependent()
    {
        // Arrange & Act
        var query1 = new GetTenantsQuery { PageNumber = 1, PageSize = 10 };
        var query2 = new GetTenantsQuery { PageNumber = 2, PageSize = 20 };

        // Assert
        query1.PageNumber.Should().NotBe(query2.PageNumber);
        query1.PageSize.Should().NotBe(query2.PageSize);
    }

    [Fact]
    public void GetTenantSettingsQuery_MultipleInstances_AreIndependent()
    {
        // Arrange & Act
        var query1 = new GetTenantSettingsQuery { TenantId = Guid.NewGuid() };
        var query2 = new GetTenantSettingsQuery { TenantId = Guid.NewGuid() };

        // Assert
        query1.TenantId.Should().NotBe(query2.TenantId);
    }

    [Fact]
    public void GetTenantsQuery_LargePageNumber_IsAccepted()
    {
        // Arrange & Act
        var query = new GetTenantsQuery
        {
            PageNumber = int.MaxValue,
            PageSize = 10
        };

        // Assert
        query.PageNumber.Should().Be(int.MaxValue);
    }

    [Fact]
    public void GetTenantsQuery_LargePageSize_IsAccepted()
    {
        // Arrange & Act
        var query = new GetTenantsQuery
        {
            PageNumber = 1,
            PageSize = int.MaxValue
        };

        // Assert
        query.PageSize.Should().Be(int.MaxValue);
    }

    [Fact]
    public void GetTenantsQuery_NegativePageNumber_IsAccepted()
    {
        // Arrange & Act
        var query = new GetTenantsQuery
        {
            PageNumber = -1,
            PageSize = 10
        };

        // Assert - Query object accepts any value, validation is done elsewhere
        query.PageNumber.Should().Be(-1);
    }

    [Fact]
    public void GetTenantsQuery_NegativePageSize_IsAccepted()
    {
        // Arrange & Act
        var query = new GetTenantsQuery
        {
            PageNumber = 1,
            PageSize = -1
        };

        // Assert - Query object accepts any value, validation is done elsewhere
        query.PageSize.Should().Be(-1);
    }
}
