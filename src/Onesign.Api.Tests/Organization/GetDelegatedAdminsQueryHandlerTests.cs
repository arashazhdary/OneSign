using FluentAssertions;
using Microsoft.Extensions.Logging;
using Moq;
using Onesign.Modules.Identity.Domain.Entities;
using Onesign.Modules.Identity.Domain.Repositories;
using Onesign.Modules.Organization.Application.Queries;
using Onesign.Modules.Organization.Domain.Entities;
using Onesign.Modules.Organization.Domain.Enums;
using Onesign.Modules.Organization.Domain.Repositories;
using Xunit;

namespace Onesign.Api.Tests.Organization;

public class GetDelegatedAdminsQueryHandlerTests
{
    private readonly Mock<IDelegatedAdminRepository> _delegatedAdminRepository;
    private readonly Mock<IOrgUnitRepository> _orgUnitRepository;
    private readonly Mock<ITenantUserRepository> _tenantUserRepository;
    private readonly Mock<IGlobalUserRepository> _globalUserRepository;
    private readonly Mock<ILogger<GetDelegatedAdminsQueryHandler>> _logger;
    private readonly GetDelegatedAdminsQueryHandler _handler;

    public GetDelegatedAdminsQueryHandlerTests()
    {
        _delegatedAdminRepository = new Mock<IDelegatedAdminRepository>();
        _orgUnitRepository = new Mock<IOrgUnitRepository>();
        _tenantUserRepository = new Mock<ITenantUserRepository>();
        _globalUserRepository = new Mock<IGlobalUserRepository>();
        _logger = new Mock<ILogger<GetDelegatedAdminsQueryHandler>>();

        _handler = new GetDelegatedAdminsQueryHandler(
            _delegatedAdminRepository.Object,
            _orgUnitRepository.Object,
            _tenantUserRepository.Object,
            _globalUserRepository.Object,
            _logger.Object);
    }

    [Fact]
    public async Task Handle_WithDelegatedAdmins_ReturnsAllDelegatedAdmins()
    {
        // Arrange
        var query = new GetDelegatedAdminsQuery
        {
            TenantId = Guid.NewGuid()
        };

        var globalUserId = Guid.NewGuid();
        var tenantUserId = Guid.NewGuid();
        var orgUnitId = Guid.NewGuid();

        var delegatedAdmins = new List<DelegatedAdminScope>
        {
            new DelegatedAdminScope
            {
                Id = Guid.NewGuid(),
                TenantUserId = tenantUserId,
                OrgUnitId = orgUnitId,
                ScopeType = AdminScopeType.OrgAndDescendants,
                CreatedAt = DateTime.UtcNow
            }
        };

        var tenantUser = new TenantUser
        {
            Id = tenantUserId,
            GlobalUserId = globalUserId
        };

        var globalUser = new GlobalUser
        {
            Id = globalUserId,
            Email = "admin@example.com"
        };

        var orgUnit = new OrgUnit
        {
            Id = orgUnitId,
            Name = "Department A"
        };

        _delegatedAdminRepository.Setup(x => x.GetByTenantIdAsync(query.TenantId, It.IsAny<CancellationToken>()))
            .ReturnsAsync(delegatedAdmins);
        _tenantUserRepository.Setup(x => x.GetByIdAsync(tenantUserId, It.IsAny<CancellationToken>()))
            .ReturnsAsync(tenantUser);
        _globalUserRepository.Setup(x => x.GetByIdAsync(globalUserId, It.IsAny<CancellationToken>()))
            .ReturnsAsync(globalUser);
        _orgUnitRepository.Setup(x => x.GetByIdAsync(orgUnitId, It.IsAny<CancellationToken>()))
            .ReturnsAsync(orgUnit);

        // Act
        var result = await _handler.Handle(query, CancellationToken.None);

        // Assert
        result.IsSuccess.Should().BeTrue();
        result.Value.Should().HaveCount(1);
        var dto = result.Value.First();
        dto.TenantUserId.Should().Be(tenantUserId);
        dto.OrgUnitId.Should().Be(orgUnitId);
        dto.OrgUnitName.Should().Be("Department A");
        dto.UserEmail.Should().Be("admin@example.com");
        dto.ScopeType.Should().Be(AdminScopeType.OrgAndDescendants);
    }

    [Fact]
    public async Task Handle_WithNoDelegatedAdmins_ReturnsEmptyList()
    {
        // Arrange
        var query = new GetDelegatedAdminsQuery
        {
            TenantId = Guid.NewGuid()
        };

        _delegatedAdminRepository.Setup(x => x.GetByTenantIdAsync(query.TenantId, It.IsAny<CancellationToken>()))
            .ReturnsAsync(new List<DelegatedAdminScope>());

        // Act
        var result = await _handler.Handle(query, CancellationToken.None);

        // Assert
        result.IsSuccess.Should().BeTrue();
        result.Value.Should().BeEmpty();
    }

    [Fact]
    public async Task Handle_WithMissingUserData_ReturnsNullForUserFields()
    {
        // Arrange
        var query = new GetDelegatedAdminsQuery
        {
            TenantId = Guid.NewGuid()
        };

        var tenantUserId = Guid.NewGuid();
        var orgUnitId = Guid.NewGuid();

        var delegatedAdmins = new List<DelegatedAdminScope>
        {
            new DelegatedAdminScope
            {
                Id = Guid.NewGuid(),
                TenantUserId = tenantUserId,
                OrgUnitId = orgUnitId,
                ScopeType = AdminScopeType.OrgOnly,
                CreatedAt = DateTime.UtcNow
            }
        };

        var orgUnit = new OrgUnit
        {
            Id = orgUnitId,
            Name = "Department"
        };

        _delegatedAdminRepository.Setup(x => x.GetByTenantIdAsync(query.TenantId, It.IsAny<CancellationToken>()))
            .ReturnsAsync(delegatedAdmins);
        _tenantUserRepository.Setup(x => x.GetByIdAsync(tenantUserId, It.IsAny<CancellationToken>()))
            .ReturnsAsync((TenantUser?)null);
        _orgUnitRepository.Setup(x => x.GetByIdAsync(orgUnitId, It.IsAny<CancellationToken>()))
            .ReturnsAsync(orgUnit);

        // Act
        var result = await _handler.Handle(query, CancellationToken.None);

        // Assert
        result.IsSuccess.Should().BeTrue();
        result.Value.Should().HaveCount(1);
        var dto = result.Value.First();
        dto.UserEmail.Should().BeNull();
        dto.UserDisplayName.Should().BeNull();
    }

    [Fact]
    public async Task Handle_WithMultipleDelegatedAdmins_ReturnsAllWithDetails()
    {
        // Arrange
        var query = new GetDelegatedAdminsQuery
        {
            TenantId = Guid.NewGuid()
        };

        var delegatedAdmins = new List<DelegatedAdminScope>();
        for (int i = 0; i < 3; i++)
        {
            var globalUserId = Guid.NewGuid();
            var tenantUserId = Guid.NewGuid();
            var orgUnitId = Guid.NewGuid();

            delegatedAdmins.Add(new DelegatedAdminScope
            {
                Id = Guid.NewGuid(),
                TenantUserId = tenantUserId,
                OrgUnitId = orgUnitId,
                ScopeType = i % 2 == 0 ? AdminScopeType.OrgOnly : AdminScopeType.OrgAndDescendants,
                CreatedAt = DateTime.UtcNow
            });

            var tenantUser = new TenantUser
            {
                Id = tenantUserId,
                GlobalUserId = globalUserId
            };

            var globalUser = new GlobalUser
            {
                Id = globalUserId,
                Email = $"admin{i}@example.com"
            };

            var orgUnit = new OrgUnit
            {
                Id = orgUnitId,
                Name = $"Department {i}"
            };

            _tenantUserRepository.Setup(x => x.GetByIdAsync(tenantUserId, It.IsAny<CancellationToken>()))
                .ReturnsAsync(tenantUser);
            _globalUserRepository.Setup(x => x.GetByIdAsync(globalUserId, It.IsAny<CancellationToken>()))
                .ReturnsAsync(globalUser);
            _orgUnitRepository.Setup(x => x.GetByIdAsync(orgUnitId, It.IsAny<CancellationToken>()))
                .ReturnsAsync(orgUnit);
        }

        _delegatedAdminRepository.Setup(x => x.GetByTenantIdAsync(query.TenantId, It.IsAny<CancellationToken>()))
            .ReturnsAsync(delegatedAdmins);

        // Act
        var result = await _handler.Handle(query, CancellationToken.None);

        // Assert
        result.IsSuccess.Should().BeTrue();
        result.Value.Should().HaveCount(3);
    }
}
