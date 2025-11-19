using FluentAssertions;
using Microsoft.Extensions.Logging;
using Moq;
using Onesign.Modules.Organization.Application.Queries;
using Onesign.Modules.Organization.Domain.Entities;
using Onesign.Modules.Organization.Domain.Repositories;
using Xunit;

namespace Onesign.Api.Tests.Organization;

public class GetUserOrgUnitsQueryHandlerTests
{
    private readonly Mock<IUserOrgUnitRepository> _userOrgUnitRepository;
    private readonly Mock<ILogger<GetUserOrgUnitsQueryHandler>> _logger;
    private readonly GetUserOrgUnitsQueryHandler _handler;

    public GetUserOrgUnitsQueryHandlerTests()
    {
        _userOrgUnitRepository = new Mock<IUserOrgUnitRepository>();
        _logger = new Mock<ILogger<GetUserOrgUnitsQueryHandler>>();

        _handler = new GetUserOrgUnitsQueryHandler(
            _userOrgUnitRepository.Object,
            _logger.Object);
    }

    [Fact]
    public async Task Handle_WithUserHavingPrimaryAndSecondary_ReturnsAllOrgUnits()
    {
        // Arrange
        var query = new GetUserOrgUnitsQuery
        {
            TenantUserId = Guid.NewGuid(),
            TenantId = Guid.NewGuid()
        };

        var primaryOrgUnitId = Guid.NewGuid();
        var secondary1Id = Guid.NewGuid();
        var secondary2Id = Guid.NewGuid();

        var userOrgUnits = new List<UserOrgUnit>
        {
            new UserOrgUnit { TenantUserId = query.TenantUserId, OrgUnitId = primaryOrgUnitId, IsPrimary = true },
            new UserOrgUnit { TenantUserId = query.TenantUserId, OrgUnitId = secondary1Id, IsPrimary = false },
            new UserOrgUnit { TenantUserId = query.TenantUserId, OrgUnitId = secondary2Id, IsPrimary = false }
        };

        _userOrgUnitRepository.Setup(x => x.GetByTenantUserIdAsync(query.TenantUserId, It.IsAny<CancellationToken>()))
            .ReturnsAsync(userOrgUnits);

        // Act
        var result = await _handler.Handle(query, CancellationToken.None);

        // Assert
        result.IsSuccess.Should().BeTrue();
        result.Value.PrimaryOrgUnitId.Should().Be(primaryOrgUnitId);
        result.Value.SecondaryOrgUnitIds.Should().HaveCount(2);
        result.Value.SecondaryOrgUnitIds.Should().Contain(secondary1Id);
        result.Value.SecondaryOrgUnitIds.Should().Contain(secondary2Id);
    }

    [Fact]
    public async Task Handle_WithUserHavingOnlyPrimary_ReturnsOnlyPrimary()
    {
        // Arrange
        var query = new GetUserOrgUnitsQuery
        {
            TenantUserId = Guid.NewGuid(),
            TenantId = Guid.NewGuid()
        };

        var primaryOrgUnitId = Guid.NewGuid();

        var userOrgUnits = new List<UserOrgUnit>
        {
            new UserOrgUnit { TenantUserId = query.TenantUserId, OrgUnitId = primaryOrgUnitId, IsPrimary = true }
        };

        _userOrgUnitRepository.Setup(x => x.GetByTenantUserIdAsync(query.TenantUserId, It.IsAny<CancellationToken>()))
            .ReturnsAsync(userOrgUnits);

        // Act
        var result = await _handler.Handle(query, CancellationToken.None);

        // Assert
        result.IsSuccess.Should().BeTrue();
        result.Value.PrimaryOrgUnitId.Should().Be(primaryOrgUnitId);
        result.Value.SecondaryOrgUnitIds.Should().BeEmpty();
    }

    [Fact]
    public async Task Handle_WithUserHavingNoOrgUnits_ReturnsEmptyGuidForPrimary()
    {
        // Arrange
        var query = new GetUserOrgUnitsQuery
        {
            TenantUserId = Guid.NewGuid(),
            TenantId = Guid.NewGuid()
        };

        _userOrgUnitRepository.Setup(x => x.GetByTenantUserIdAsync(query.TenantUserId, It.IsAny<CancellationToken>()))
            .ReturnsAsync(new List<UserOrgUnit>());

        // Act
        var result = await _handler.Handle(query, CancellationToken.None);

        // Assert
        result.IsSuccess.Should().BeTrue();
        result.Value.PrimaryOrgUnitId.Should().Be(Guid.Empty);
        result.Value.SecondaryOrgUnitIds.Should().BeEmpty();
    }

    [Fact]
    public async Task Handle_WithMultipleSecondaryOrgUnits_ReturnsAllSecondary()
    {
        // Arrange
        var query = new GetUserOrgUnitsQuery
        {
            TenantUserId = Guid.NewGuid(),
            TenantId = Guid.NewGuid()
        };

        var primaryId = Guid.NewGuid();
        var secondaryIds = new List<Guid>
        {
            Guid.NewGuid(),
            Guid.NewGuid(),
            Guid.NewGuid(),
            Guid.NewGuid(),
            Guid.NewGuid()
        };

        var userOrgUnits = new List<UserOrgUnit>
        {
            new UserOrgUnit { TenantUserId = query.TenantUserId, OrgUnitId = primaryId, IsPrimary = true }
        };

        foreach (var id in secondaryIds)
        {
            userOrgUnits.Add(new UserOrgUnit
            {
                TenantUserId = query.TenantUserId,
                OrgUnitId = id,
                IsPrimary = false
            });
        }

        _userOrgUnitRepository.Setup(x => x.GetByTenantUserIdAsync(query.TenantUserId, It.IsAny<CancellationToken>()))
            .ReturnsAsync(userOrgUnits);

        // Act
        var result = await _handler.Handle(query, CancellationToken.None);

        // Assert
        result.IsSuccess.Should().BeTrue();
        result.Value.PrimaryOrgUnitId.Should().Be(primaryId);
        result.Value.SecondaryOrgUnitIds.Should().HaveCount(5);
        foreach (var id in secondaryIds)
        {
            result.Value.SecondaryOrgUnitIds.Should().Contain(id);
        }
    }
}
