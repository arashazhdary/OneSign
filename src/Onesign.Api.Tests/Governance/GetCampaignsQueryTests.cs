using FluentAssertions;
using Onesign.Modules.Governance.Application.DTOs;
using Onesign.Modules.Governance.Application.Queries;
using Onesign.Shared.Result;
using Xunit;

namespace Onesign.Api.Tests.Governance;

public class GetCampaignsQueryTests
{
    [Fact]
    public void Query_CanBeCreated_WithTenantId()
    {
        // Arrange
        var tenantId = Guid.NewGuid();

        // Act
        var query = new GetCampaignsQuery
        {
            TenantId = tenantId
        };

        // Assert
        query.TenantId.Should().Be(tenantId);
    }

    [Fact]
    public void Query_DefaultValues_AreCorrect()
    {
        // Arrange & Act
        var query = new GetCampaignsQuery();

        // Assert
        query.TenantId.Should().Be(Guid.Empty);
    }

    [Fact]
    public void Query_ImplementsIRequest_WithCorrectResultType()
    {
        // Arrange
        var query = new GetCampaignsQuery();

        // Assert
        query.Should().BeAssignableTo<MediatR.IRequest<Result<List<CampaignDto>>>>();
    }

    [Fact]
    public void Query_CanSetTenantId_ToEmptyGuid()
    {
        // Arrange & Act
        var query = new GetCampaignsQuery
        {
            TenantId = Guid.Empty
        };

        // Assert
        query.TenantId.Should().Be(Guid.Empty);
    }

    [Fact]
    public void Query_MultipleInstances_AreIndependent()
    {
        // Arrange
        var tenantId1 = Guid.NewGuid();
        var tenantId2 = Guid.NewGuid();

        // Act
        var query1 = new GetCampaignsQuery { TenantId = tenantId1 };
        var query2 = new GetCampaignsQuery { TenantId = tenantId2 };

        // Assert
        query1.TenantId.Should().NotBe(query2.TenantId);
    }

    [Fact]
    public void Query_CanUpdateTenantId()
    {
        // Arrange
        var originalTenantId = Guid.NewGuid();
        var newTenantId = Guid.NewGuid();

        var query = new GetCampaignsQuery
        {
            TenantId = originalTenantId
        };

        // Act
        query.TenantId = newTenantId;

        // Assert
        query.TenantId.Should().Be(newTenantId);
        query.TenantId.Should().NotBe(originalTenantId);
    }

    [Fact]
    public void Query_ManyInstances_AllHaveUniqueTenantIds()
    {
        // Arrange & Act
        var queries = Enumerable.Range(0, 100)
            .Select(_ => new GetCampaignsQuery { TenantId = Guid.NewGuid() })
            .ToList();

        // Assert
        var distinctTenantIds = queries.Select(q => q.TenantId).Distinct().Count();
        distinctTenantIds.Should().Be(100);
    }

    [Fact]
    public void Query_SameTenantIdForMultipleQueries_IsAllowed()
    {
        // Arrange
        var sharedTenantId = Guid.NewGuid();

        // Act
        var queries = Enumerable.Range(0, 5)
            .Select(_ => new GetCampaignsQuery { TenantId = sharedTenantId })
            .ToList();

        // Assert
        queries.All(q => q.TenantId == sharedTenantId).Should().BeTrue();
    }

    [Fact]
    public void Query_TenantIdProperty_IsSettable()
    {
        // Arrange
        var query = new GetCampaignsQuery();

        // Act
        var tenantId = Guid.NewGuid();
        query.TenantId = tenantId;

        // Assert
        query.TenantId.Should().Be(tenantId);
    }

    [Fact]
    public void Query_TenantIdProperty_IsGettable()
    {
        // Arrange
        var tenantId = Guid.NewGuid();
        var query = new GetCampaignsQuery { TenantId = tenantId };

        // Act
        var retrievedTenantId = query.TenantId;

        // Assert
        retrievedTenantId.Should().Be(tenantId);
    }

    [Fact]
    public void Query_ResultType_IsList()
    {
        // This test verifies the command returns a list of CampaignDto
        // Arrange
        var query = new GetCampaignsQuery();

        // Assert - The query is typed to return Result<List<CampaignDto>>
        query.Should().BeAssignableTo<MediatR.IRequest<Result<List<CampaignDto>>>>();
    }
}
