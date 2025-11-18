using FluentAssertions;
using Microsoft.Extensions.Logging;
using Moq;
using Onesign.Modules.Organization.Application.Queries;
using Onesign.Modules.Organization.Domain.Services;
using Xunit;

namespace Onesign.Api.Tests.Organization;

public class GetCurrentUserScopeQueryHandlerTests
{
    private readonly Mock<IOrgAuthorizationService> _orgAuthorizationService;
    private readonly Mock<ILogger<GetCurrentUserScopeQueryHandler>> _logger;
    private readonly GetCurrentUserScopeQueryHandler _handler;

    public GetCurrentUserScopeQueryHandlerTests()
    {
        _orgAuthorizationService = new Mock<IOrgAuthorizationService>();
        _logger = new Mock<ILogger<GetCurrentUserScopeQueryHandler>>();

        _handler = new GetCurrentUserScopeQueryHandler(
            _orgAuthorizationService.Object,
            _logger.Object);
    }

    [Fact]
    public async Task Handle_WithGlobalAdmin_ReturnsGlobalAdminScope()
    {
        // Arrange
        var query = new GetCurrentUserScopeQuery
        {
            TenantUserId = Guid.NewGuid()
        };

        var orgUnitIds = new List<Guid> { Guid.NewGuid(), Guid.NewGuid() };
        var rootIds = new List<Guid> { Guid.NewGuid() };

        var scope = new OrgScope
        {
            IsGlobalAdmin = true,
            AllowedOrgUnitIds = orgUnitIds,
            RootOrgUnitIds = rootIds
        };

        _orgAuthorizationService.Setup(x => x.GetEffectiveScopeAsync(query.TenantUserId, It.IsAny<CancellationToken>()))
            .ReturnsAsync(scope);

        // Act
        var result = await _handler.Handle(query, CancellationToken.None);

        // Assert
        result.IsSuccess.Should().BeTrue();
        result.Value.UserId.Should().Be(query.TenantUserId);
        result.Value.IsGlobalAdmin.Should().BeTrue();
        result.Value.AllowedOrgUnitIds.Should().HaveCount(2);
        result.Value.RootOrgUnitIds.Should().HaveCount(1);
    }

    [Fact]
    public async Task Handle_WithDelegatedAdmin_ReturnsDelegatedScope()
    {
        // Arrange
        var query = new GetCurrentUserScopeQuery
        {
            TenantUserId = Guid.NewGuid()
        };

        var orgUnitId = Guid.NewGuid();
        var scope = new OrgScope
        {
            IsGlobalAdmin = false,
            AllowedOrgUnitIds = new List<Guid> { orgUnitId },
            RootOrgUnitIds = new List<Guid> { orgUnitId }
        };

        _orgAuthorizationService.Setup(x => x.GetEffectiveScopeAsync(query.TenantUserId, It.IsAny<CancellationToken>()))
            .ReturnsAsync(scope);

        // Act
        var result = await _handler.Handle(query, CancellationToken.None);

        // Assert
        result.IsSuccess.Should().BeTrue();
        result.Value.IsGlobalAdmin.Should().BeFalse();
        result.Value.AllowedOrgUnitIds.Should().ContainSingle().Which.Should().Be(orgUnitId);
        result.Value.RootOrgUnitIds.Should().ContainSingle().Which.Should().Be(orgUnitId);
    }

    [Fact]
    public async Task Handle_WithNoAdminRights_ReturnsEmptyScope()
    {
        // Arrange
        var query = new GetCurrentUserScopeQuery
        {
            TenantUserId = Guid.NewGuid()
        };

        var scope = new OrgScope
        {
            IsGlobalAdmin = false,
            AllowedOrgUnitIds = new List<Guid>(),
            RootOrgUnitIds = new List<Guid>()
        };

        _orgAuthorizationService.Setup(x => x.GetEffectiveScopeAsync(query.TenantUserId, It.IsAny<CancellationToken>()))
            .ReturnsAsync(scope);

        // Act
        var result = await _handler.Handle(query, CancellationToken.None);

        // Assert
        result.IsSuccess.Should().BeTrue();
        result.Value.IsGlobalAdmin.Should().BeFalse();
        result.Value.AllowedOrgUnitIds.Should().BeEmpty();
        result.Value.RootOrgUnitIds.Should().BeEmpty();
    }

    [Fact]
    public async Task Handle_WhenServiceThrowsException_ReturnsFailure()
    {
        // Arrange
        var query = new GetCurrentUserScopeQuery
        {
            TenantUserId = Guid.NewGuid()
        };

        _orgAuthorizationService.Setup(x => x.GetEffectiveScopeAsync(query.TenantUserId, It.IsAny<CancellationToken>()))
            .ThrowsAsync(new Exception("Database connection failed"));

        // Act
        var result = await _handler.Handle(query, CancellationToken.None);

        // Assert
        result.IsSuccess.Should().BeFalse();
        result.Error.Code.Should().Be("GET_SCOPE_FAILED");
    }

    [Fact]
    public async Task Handle_WithMultipleScopes_CombinesAllOrgUnits()
    {
        // Arrange
        var query = new GetCurrentUserScopeQuery
        {
            TenantUserId = Guid.NewGuid()
        };

        var allowedIds = new List<Guid>
        {
            Guid.NewGuid(),
            Guid.NewGuid(),
            Guid.NewGuid(),
            Guid.NewGuid(),
            Guid.NewGuid()
        };

        var rootIds = new List<Guid>
        {
            Guid.NewGuid(),
            Guid.NewGuid()
        };

        var scope = new OrgScope
        {
            IsGlobalAdmin = false,
            AllowedOrgUnitIds = allowedIds,
            RootOrgUnitIds = rootIds
        };

        _orgAuthorizationService.Setup(x => x.GetEffectiveScopeAsync(query.TenantUserId, It.IsAny<CancellationToken>()))
            .ReturnsAsync(scope);

        // Act
        var result = await _handler.Handle(query, CancellationToken.None);

        // Assert
        result.IsSuccess.Should().BeTrue();
        result.Value.AllowedOrgUnitIds.Should().HaveCount(5);
        result.Value.RootOrgUnitIds.Should().HaveCount(2);
    }
}
