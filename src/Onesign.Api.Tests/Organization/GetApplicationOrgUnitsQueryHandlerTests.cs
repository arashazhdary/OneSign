using FluentAssertions;
using Microsoft.Extensions.Logging;
using Moq;
using Onesign.Modules.Organization.Application.Queries;
using Onesign.Modules.Organization.Domain.Entities;
using Onesign.Modules.Organization.Domain.Repositories;
using Xunit;

namespace Onesign.Api.Tests.Organization;

public class GetApplicationOrgUnitsQueryHandlerTests
{
    private readonly Mock<IApplicationOrgUnitRepository> _applicationOrgUnitRepository;
    private readonly Mock<ILogger<GetApplicationOrgUnitsQueryHandler>> _logger;
    private readonly GetApplicationOrgUnitsQueryHandler _handler;

    public GetApplicationOrgUnitsQueryHandlerTests()
    {
        _applicationOrgUnitRepository = new Mock<IApplicationOrgUnitRepository>();
        _logger = new Mock<ILogger<GetApplicationOrgUnitsQueryHandler>>();

        _handler = new GetApplicationOrgUnitsQueryHandler(
            _applicationOrgUnitRepository.Object,
            _logger.Object);
    }

    [Fact]
    public async Task Handle_WithApplicationHavingOrgUnits_ReturnsAllOrgUnits()
    {
        // Arrange
        var query = new GetApplicationOrgUnitsQuery
        {
            ApplicationClientId = Guid.NewGuid(),
            TenantId = Guid.NewGuid()
        };

        var orgUnitIds = new List<Guid>
        {
            Guid.NewGuid(),
            Guid.NewGuid(),
            Guid.NewGuid()
        };

        var applicationOrgUnits = orgUnitIds.Select(id => new ApplicationOrgUnit
        {
            ApplicationClientId = query.ApplicationClientId,
            OrgUnitId = id
        }).ToList();

        _applicationOrgUnitRepository.Setup(x => x.GetByApplicationClientIdAsync(query.ApplicationClientId, It.IsAny<CancellationToken>()))
            .ReturnsAsync(applicationOrgUnits);

        // Act
        var result = await _handler.Handle(query, CancellationToken.None);

        // Assert
        result.IsSuccess.Should().BeTrue();
        result.Value.OrgUnitIds.Should().HaveCount(3);
        foreach (var id in orgUnitIds)
        {
            result.Value.OrgUnitIds.Should().Contain(id);
        }
    }

    [Fact]
    public async Task Handle_WithApplicationHavingNoOrgUnits_ReturnsEmptyList()
    {
        // Arrange
        var query = new GetApplicationOrgUnitsQuery
        {
            ApplicationClientId = Guid.NewGuid(),
            TenantId = Guid.NewGuid()
        };

        _applicationOrgUnitRepository.Setup(x => x.GetByApplicationClientIdAsync(query.ApplicationClientId, It.IsAny<CancellationToken>()))
            .ReturnsAsync(new List<ApplicationOrgUnit>());

        // Act
        var result = await _handler.Handle(query, CancellationToken.None);

        // Assert
        result.IsSuccess.Should().BeTrue();
        result.Value.OrgUnitIds.Should().BeEmpty();
    }

    [Fact]
    public async Task Handle_WithSingleOrgUnit_ReturnsSingleOrgUnit()
    {
        // Arrange
        var query = new GetApplicationOrgUnitsQuery
        {
            ApplicationClientId = Guid.NewGuid(),
            TenantId = Guid.NewGuid()
        };

        var orgUnitId = Guid.NewGuid();
        var applicationOrgUnits = new List<ApplicationOrgUnit>
        {
            new ApplicationOrgUnit
            {
                ApplicationClientId = query.ApplicationClientId,
                OrgUnitId = orgUnitId
            }
        };

        _applicationOrgUnitRepository.Setup(x => x.GetByApplicationClientIdAsync(query.ApplicationClientId, It.IsAny<CancellationToken>()))
            .ReturnsAsync(applicationOrgUnits);

        // Act
        var result = await _handler.Handle(query, CancellationToken.None);

        // Assert
        result.IsSuccess.Should().BeTrue();
        result.Value.OrgUnitIds.Should().ContainSingle().Which.Should().Be(orgUnitId);
    }
}
