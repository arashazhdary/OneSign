using FluentAssertions;
using Microsoft.Extensions.Logging;
using Moq;
using Onesign.Modules.Applications.Domain.Repositories;
using Onesign.Modules.Identity.Domain.Entities;
using Onesign.Modules.Identity.Domain.Enums;
using Onesign.Modules.Identity.Domain.Repositories;
using Onesign.Modules.Organization.Domain.Entities;
using Onesign.Modules.Organization.Domain.Enums;
using Onesign.Modules.Organization.Domain.Repositories;
using Onesign.Modules.Organization.Infrastructure.Services;
using Xunit;

namespace Onesign.Api.Tests.Organization;

public class OrgAuthorizationServiceUnitTests
{
    private readonly Mock<ITenantUserRepository> _tenantUserRepository;
    private readonly Mock<IOrgUnitRepository> _orgUnitRepository;
    private readonly Mock<IUserOrgUnitRepository> _userOrgUnitRepository;
    private readonly Mock<IApplicationOrgUnitRepository> _applicationOrgUnitRepository;
    private readonly Mock<IDelegatedAdminRepository> _delegatedAdminRepository;
    private readonly Mock<IApplicationClientRepository> _applicationClientRepository;
    private readonly Mock<ILogger<OrgAuthorizationService>> _logger;
    private readonly OrgAuthorizationService _service;

    public OrgAuthorizationServiceUnitTests()
    {
        _tenantUserRepository = new Mock<ITenantUserRepository>();
        _orgUnitRepository = new Mock<IOrgUnitRepository>();
        _userOrgUnitRepository = new Mock<IUserOrgUnitRepository>();
        _applicationOrgUnitRepository = new Mock<IApplicationOrgUnitRepository>();
        _delegatedAdminRepository = new Mock<IDelegatedAdminRepository>();
        _applicationClientRepository = new Mock<IApplicationClientRepository>();
        _logger = new Mock<ILogger<OrgAuthorizationService>>();

        _service = new OrgAuthorizationService(
            _tenantUserRepository.Object,
            _orgUnitRepository.Object,
            _userOrgUnitRepository.Object,
            _applicationOrgUnitRepository.Object,
            _delegatedAdminRepository.Object,
            _applicationClientRepository.Object,
            _logger.Object);
    }

    #region GetEffectiveScopeAsync Tests

    [Fact]
    public async Task GetEffectiveScopeAsync_WithNonExistentUser_ReturnsNonAdminScope()
    {
        // Arrange
        var userId = Guid.NewGuid();

        _tenantUserRepository.Setup(x => x.GetByIdAsync(userId, It.IsAny<CancellationToken>()))
            .ReturnsAsync((TenantUser?)null);

        // Act
        var result = await _service.GetEffectiveScopeAsync(userId);

        // Assert
        result.Should().NotBeNull();
        result.IsGlobalAdmin.Should().BeFalse();
        result.AllowedOrgUnitIds.Should().BeEmpty();
    }

    [Fact]
    public async Task GetEffectiveScopeAsync_WithGlobalAdminNoScopes_ReturnsFullAccess()
    {
        // Arrange
        var userId = Guid.NewGuid();
        var tenantId = Guid.NewGuid();
        var orgUnitId = Guid.NewGuid();

        var tenantUser = new TenantUser
        {
            Id = userId,
            TenantId = tenantId,
            GlobalUserId = Guid.NewGuid(),
            Role = TenantUserRole.TenantAdmin,
            Status = TenantUserStatus.Active
        };

        var orgUnits = new List<OrgUnit>
        {
            new OrgUnit { Id = orgUnitId, TenantId = tenantId, ParentId = null }
        };

        _tenantUserRepository.Setup(x => x.GetByIdAsync(userId, It.IsAny<CancellationToken>()))
            .ReturnsAsync(tenantUser);
        _delegatedAdminRepository.Setup(x => x.GetByTenantUserIdAsync(userId, It.IsAny<CancellationToken>()))
            .ReturnsAsync(new List<DelegatedAdminScope>());
        _orgUnitRepository.Setup(x => x.GetByTenantIdAsync(tenantId, It.IsAny<CancellationToken>()))
            .ReturnsAsync(orgUnits);

        // Act
        var result = await _service.GetEffectiveScopeAsync(userId);

        // Assert
        result.Should().NotBeNull();
        result.IsGlobalAdmin.Should().BeTrue();
        result.AllowedOrgUnitIds.Should().Contain(orgUnitId);
        result.RootOrgUnitIds.Should().Contain(orgUnitId);
    }

    [Fact]
    public async Task GetEffectiveScopeAsync_WithDelegatedAdminOrgOnly_ReturnsLimitedScope()
    {
        // Arrange
        var userId = Guid.NewGuid();
        var tenantId = Guid.NewGuid();
        var orgUnitId = Guid.NewGuid();

        var tenantUser = new TenantUser
        {
            Id = userId,
            TenantId = tenantId,
            GlobalUserId = Guid.NewGuid(),
            Role = TenantUserRole.Member,
            Status = TenantUserStatus.Active
        };

        var delegatedScope = new DelegatedAdminScope
        {
            Id = Guid.NewGuid(),
            TenantUserId = userId,
            OrgUnitId = orgUnitId,
            ScopeType = AdminScopeType.OrgOnly
        };

        _tenantUserRepository.Setup(x => x.GetByIdAsync(userId, It.IsAny<CancellationToken>()))
            .ReturnsAsync(tenantUser);
        _delegatedAdminRepository.Setup(x => x.GetByTenantUserIdAsync(userId, It.IsAny<CancellationToken>()))
            .ReturnsAsync(new List<DelegatedAdminScope> { delegatedScope });

        // Act
        var result = await _service.GetEffectiveScopeAsync(userId);

        // Assert
        result.Should().NotBeNull();
        result.IsGlobalAdmin.Should().BeFalse();
        result.AllowedOrgUnitIds.Should().ContainSingle().Which.Should().Be(orgUnitId);
        result.RootOrgUnitIds.Should().ContainSingle().Which.Should().Be(orgUnitId);
    }

    [Fact]
    public async Task GetEffectiveScopeAsync_WithDelegatedAdminOrgAndDescendants_ReturnsExpandedScope()
    {
        // Arrange
        var userId = Guid.NewGuid();
        var tenantId = Guid.NewGuid();
        var rootOrgUnitId = Guid.NewGuid();
        var childOrgUnitId = Guid.NewGuid();

        var tenantUser = new TenantUser
        {
            Id = userId,
            TenantId = tenantId,
            GlobalUserId = Guid.NewGuid(),
            Role = TenantUserRole.Member,
            Status = TenantUserStatus.Active
        };

        var delegatedScope = new DelegatedAdminScope
        {
            Id = Guid.NewGuid(),
            TenantUserId = userId,
            OrgUnitId = rootOrgUnitId,
            ScopeType = AdminScopeType.OrgAndDescendants
        };

        var descendants = new List<OrgUnit>
        {
            new OrgUnit { Id = childOrgUnitId, ParentId = rootOrgUnitId }
        };

        _tenantUserRepository.Setup(x => x.GetByIdAsync(userId, It.IsAny<CancellationToken>()))
            .ReturnsAsync(tenantUser);
        _delegatedAdminRepository.Setup(x => x.GetByTenantUserIdAsync(userId, It.IsAny<CancellationToken>()))
            .ReturnsAsync(new List<DelegatedAdminScope> { delegatedScope });
        _orgUnitRepository.Setup(x => x.GetDescendantsAsync(rootOrgUnitId, It.IsAny<CancellationToken>()))
            .ReturnsAsync(descendants);

        // Act
        var result = await _service.GetEffectiveScopeAsync(userId);

        // Assert
        result.Should().NotBeNull();
        result.IsGlobalAdmin.Should().BeFalse();
        result.AllowedOrgUnitIds.Should().HaveCount(2);
        result.AllowedOrgUnitIds.Should().Contain(rootOrgUnitId);
        result.AllowedOrgUnitIds.Should().Contain(childOrgUnitId);
        result.RootOrgUnitIds.Should().ContainSingle().Which.Should().Be(rootOrgUnitId);
    }

    [Fact]
    public async Task GetEffectiveScopeAsync_WithMultipleDelegatedScopes_CombinesScopes()
    {
        // Arrange
        var userId = Guid.NewGuid();
        var tenantId = Guid.NewGuid();
        var orgUnitId1 = Guid.NewGuid();
        var orgUnitId2 = Guid.NewGuid();

        var tenantUser = new TenantUser
        {
            Id = userId,
            TenantId = tenantId,
            GlobalUserId = Guid.NewGuid(),
            Role = TenantUserRole.Member,
            Status = TenantUserStatus.Active
        };

        var delegatedScopes = new List<DelegatedAdminScope>
        {
            new DelegatedAdminScope
            {
                Id = Guid.NewGuid(),
                TenantUserId = userId,
                OrgUnitId = orgUnitId1,
                ScopeType = AdminScopeType.OrgOnly
            },
            new DelegatedAdminScope
            {
                Id = Guid.NewGuid(),
                TenantUserId = userId,
                OrgUnitId = orgUnitId2,
                ScopeType = AdminScopeType.OrgOnly
            }
        };

        _tenantUserRepository.Setup(x => x.GetByIdAsync(userId, It.IsAny<CancellationToken>()))
            .ReturnsAsync(tenantUser);
        _delegatedAdminRepository.Setup(x => x.GetByTenantUserIdAsync(userId, It.IsAny<CancellationToken>()))
            .ReturnsAsync(delegatedScopes);

        // Act
        var result = await _service.GetEffectiveScopeAsync(userId);

        // Assert
        result.Should().NotBeNull();
        result.IsGlobalAdmin.Should().BeFalse();
        result.AllowedOrgUnitIds.Should().HaveCount(2);
        result.RootOrgUnitIds.Should().HaveCount(2);
    }

    [Fact]
    public async Task GetEffectiveScopeAsync_WithNonAdminNoScopes_ReturnsEmptyScope()
    {
        // Arrange
        var userId = Guid.NewGuid();
        var tenantId = Guid.NewGuid();

        var tenantUser = new TenantUser
        {
            Id = userId,
            TenantId = tenantId,
            GlobalUserId = Guid.NewGuid(),
            Role = TenantUserRole.Member,
            Status = TenantUserStatus.Active
        };

        _tenantUserRepository.Setup(x => x.GetByIdAsync(userId, It.IsAny<CancellationToken>()))
            .ReturnsAsync(tenantUser);
        _delegatedAdminRepository.Setup(x => x.GetByTenantUserIdAsync(userId, It.IsAny<CancellationToken>()))
            .ReturnsAsync(new List<DelegatedAdminScope>());

        // Act
        var result = await _service.GetEffectiveScopeAsync(userId);

        // Assert
        result.Should().NotBeNull();
        result.IsGlobalAdmin.Should().BeFalse();
        result.AllowedOrgUnitIds.Should().BeEmpty();
        result.RootOrgUnitIds.Should().BeEmpty();
    }

    #endregion

    #region CanManageUserAsync Tests

    [Fact]
    public async Task CanManageUserAsync_WithGlobalAdmin_ReturnsTrue()
    {
        // Arrange
        var adminId = Guid.NewGuid();
        var targetUserId = Guid.NewGuid();
        var tenantId = Guid.NewGuid();

        var adminUser = new TenantUser
        {
            Id = adminId,
            TenantId = tenantId,
            GlobalUserId = Guid.NewGuid(),
            Role = TenantUserRole.TenantAdmin,
            Status = TenantUserStatus.Active
        };

        _tenantUserRepository.Setup(x => x.GetByIdAsync(adminId, It.IsAny<CancellationToken>()))
            .ReturnsAsync(adminUser);
        _delegatedAdminRepository.Setup(x => x.GetByTenantUserIdAsync(adminId, It.IsAny<CancellationToken>()))
            .ReturnsAsync(new List<DelegatedAdminScope>());
        _orgUnitRepository.Setup(x => x.GetByTenantIdAsync(tenantId, It.IsAny<CancellationToken>()))
            .ReturnsAsync(new List<OrgUnit>());

        // Act
        var result = await _service.CanManageUserAsync(adminId, targetUserId);

        // Assert
        result.Should().BeTrue();
    }

    [Fact]
    public async Task CanManageUserAsync_WithDelegatedAdminAndUserInScope_ReturnsTrue()
    {
        // Arrange
        var adminId = Guid.NewGuid();
        var targetUserId = Guid.NewGuid();
        var tenantId = Guid.NewGuid();
        var orgUnitId = Guid.NewGuid();

        var adminUser = new TenantUser
        {
            Id = adminId,
            TenantId = tenantId,
            GlobalUserId = Guid.NewGuid(),
            Role = TenantUserRole.Member,
            Status = TenantUserStatus.Active
        };

        var delegatedScope = new DelegatedAdminScope
        {
            Id = Guid.NewGuid(),
            TenantUserId = adminId,
            OrgUnitId = orgUnitId,
            ScopeType = AdminScopeType.OrgOnly
        };

        var targetUserOrgUnits = new List<UserOrgUnit>
        {
            new UserOrgUnit { TenantUserId = targetUserId, OrgUnitId = orgUnitId, IsPrimary = true }
        };

        _tenantUserRepository.Setup(x => x.GetByIdAsync(adminId, It.IsAny<CancellationToken>()))
            .ReturnsAsync(adminUser);
        _delegatedAdminRepository.Setup(x => x.GetByTenantUserIdAsync(adminId, It.IsAny<CancellationToken>()))
            .ReturnsAsync(new List<DelegatedAdminScope> { delegatedScope });
        _userOrgUnitRepository.Setup(x => x.GetByTenantUserIdAsync(targetUserId, It.IsAny<CancellationToken>()))
            .ReturnsAsync(targetUserOrgUnits);

        // Act
        var result = await _service.CanManageUserAsync(adminId, targetUserId);

        // Assert
        result.Should().BeTrue();
    }

    [Fact]
    public async Task CanManageUserAsync_WithDelegatedAdminAndUserOutOfScope_ReturnsFalse()
    {
        // Arrange
        var adminId = Guid.NewGuid();
        var targetUserId = Guid.NewGuid();
        var tenantId = Guid.NewGuid();
        var orgUnitId1 = Guid.NewGuid();
        var orgUnitId2 = Guid.NewGuid();

        var adminUser = new TenantUser
        {
            Id = adminId,
            TenantId = tenantId,
            GlobalUserId = Guid.NewGuid(),
            Role = TenantUserRole.Member,
            Status = TenantUserStatus.Active
        };

        var delegatedScope = new DelegatedAdminScope
        {
            Id = Guid.NewGuid(),
            TenantUserId = adminId,
            OrgUnitId = orgUnitId1,
            ScopeType = AdminScopeType.OrgOnly
        };

        var targetUserOrgUnits = new List<UserOrgUnit>
        {
            new UserOrgUnit { TenantUserId = targetUserId, OrgUnitId = orgUnitId2, IsPrimary = true }
        };

        _tenantUserRepository.Setup(x => x.GetByIdAsync(adminId, It.IsAny<CancellationToken>()))
            .ReturnsAsync(adminUser);
        _delegatedAdminRepository.Setup(x => x.GetByTenantUserIdAsync(adminId, It.IsAny<CancellationToken>()))
            .ReturnsAsync(new List<DelegatedAdminScope> { delegatedScope });
        _userOrgUnitRepository.Setup(x => x.GetByTenantUserIdAsync(targetUserId, It.IsAny<CancellationToken>()))
            .ReturnsAsync(targetUserOrgUnits);

        // Act
        var result = await _service.CanManageUserAsync(adminId, targetUserId);

        // Assert
        result.Should().BeFalse();
    }

    [Fact]
    public async Task CanManageUserAsync_WithNoAdminRights_ReturnsFalse()
    {
        // Arrange
        var userId = Guid.NewGuid();
        var targetUserId = Guid.NewGuid();
        var tenantId = Guid.NewGuid();

        var user = new TenantUser
        {
            Id = userId,
            TenantId = tenantId,
            GlobalUserId = Guid.NewGuid(),
            Role = TenantUserRole.Member,
            Status = TenantUserStatus.Active
        };

        _tenantUserRepository.Setup(x => x.GetByIdAsync(userId, It.IsAny<CancellationToken>()))
            .ReturnsAsync(user);
        _delegatedAdminRepository.Setup(x => x.GetByTenantUserIdAsync(userId, It.IsAny<CancellationToken>()))
            .ReturnsAsync(new List<DelegatedAdminScope>());
        _userOrgUnitRepository.Setup(x => x.GetByTenantUserIdAsync(targetUserId, It.IsAny<CancellationToken>()))
            .ReturnsAsync(new List<UserOrgUnit>());

        // Act
        var result = await _service.CanManageUserAsync(userId, targetUserId);

        // Assert
        result.Should().BeFalse();
    }

    #endregion

    #region CanManageApplicationAsync Tests

    [Fact]
    public async Task CanManageApplicationAsync_WithGlobalAdmin_ReturnsTrue()
    {
        // Arrange
        var adminId = Guid.NewGuid();
        var applicationClientId = Guid.NewGuid();
        var tenantId = Guid.NewGuid();

        var adminUser = new TenantUser
        {
            Id = adminId,
            TenantId = tenantId,
            GlobalUserId = Guid.NewGuid(),
            Role = TenantUserRole.TenantAdmin,
            Status = TenantUserStatus.Active
        };

        _tenantUserRepository.Setup(x => x.GetByIdAsync(adminId, It.IsAny<CancellationToken>()))
            .ReturnsAsync(adminUser);
        _delegatedAdminRepository.Setup(x => x.GetByTenantUserIdAsync(adminId, It.IsAny<CancellationToken>()))
            .ReturnsAsync(new List<DelegatedAdminScope>());
        _orgUnitRepository.Setup(x => x.GetByTenantIdAsync(tenantId, It.IsAny<CancellationToken>()))
            .ReturnsAsync(new List<OrgUnit>());

        // Act
        var result = await _service.CanManageApplicationAsync(adminId, applicationClientId);

        // Assert
        result.Should().BeTrue();
    }

    [Fact]
    public async Task CanManageApplicationAsync_WithDelegatedAdminAndAppInScope_ReturnsTrue()
    {
        // Arrange
        var adminId = Guid.NewGuid();
        var applicationClientId = Guid.NewGuid();
        var tenantId = Guid.NewGuid();
        var orgUnitId = Guid.NewGuid();

        var adminUser = new TenantUser
        {
            Id = adminId,
            TenantId = tenantId,
            GlobalUserId = Guid.NewGuid(),
            Role = TenantUserRole.Member,
            Status = TenantUserStatus.Active
        };

        var delegatedScope = new DelegatedAdminScope
        {
            Id = Guid.NewGuid(),
            TenantUserId = adminId,
            OrgUnitId = orgUnitId,
            ScopeType = AdminScopeType.OrgOnly
        };

        var applicationOrgUnits = new List<ApplicationOrgUnit>
        {
            new ApplicationOrgUnit { ApplicationClientId = applicationClientId, OrgUnitId = orgUnitId }
        };

        _tenantUserRepository.Setup(x => x.GetByIdAsync(adminId, It.IsAny<CancellationToken>()))
            .ReturnsAsync(adminUser);
        _delegatedAdminRepository.Setup(x => x.GetByTenantUserIdAsync(adminId, It.IsAny<CancellationToken>()))
            .ReturnsAsync(new List<DelegatedAdminScope> { delegatedScope });
        _applicationOrgUnitRepository.Setup(x => x.GetByApplicationClientIdAsync(applicationClientId, It.IsAny<CancellationToken>()))
            .ReturnsAsync(applicationOrgUnits);

        // Act
        var result = await _service.CanManageApplicationAsync(adminId, applicationClientId);

        // Assert
        result.Should().BeTrue();
    }

    [Fact]
    public async Task CanManageApplicationAsync_WithDelegatedAdminAndAppOutOfScope_ReturnsFalse()
    {
        // Arrange
        var adminId = Guid.NewGuid();
        var applicationClientId = Guid.NewGuid();
        var tenantId = Guid.NewGuid();
        var orgUnitId1 = Guid.NewGuid();
        var orgUnitId2 = Guid.NewGuid();

        var adminUser = new TenantUser
        {
            Id = adminId,
            TenantId = tenantId,
            GlobalUserId = Guid.NewGuid(),
            Role = TenantUserRole.Member,
            Status = TenantUserStatus.Active
        };

        var delegatedScope = new DelegatedAdminScope
        {
            Id = Guid.NewGuid(),
            TenantUserId = adminId,
            OrgUnitId = orgUnitId1,
            ScopeType = AdminScopeType.OrgOnly
        };

        var applicationOrgUnits = new List<ApplicationOrgUnit>
        {
            new ApplicationOrgUnit { ApplicationClientId = applicationClientId, OrgUnitId = orgUnitId2 }
        };

        _tenantUserRepository.Setup(x => x.GetByIdAsync(adminId, It.IsAny<CancellationToken>()))
            .ReturnsAsync(adminUser);
        _delegatedAdminRepository.Setup(x => x.GetByTenantUserIdAsync(adminId, It.IsAny<CancellationToken>()))
            .ReturnsAsync(new List<DelegatedAdminScope> { delegatedScope });
        _applicationOrgUnitRepository.Setup(x => x.GetByApplicationClientIdAsync(applicationClientId, It.IsAny<CancellationToken>()))
            .ReturnsAsync(applicationOrgUnits);

        // Act
        var result = await _service.CanManageApplicationAsync(adminId, applicationClientId);

        // Assert
        result.Should().BeFalse();
    }

    #endregion

    #region CanViewOrgUnitAsync Tests

    [Fact]
    public async Task CanViewOrgUnitAsync_WithGlobalAdmin_ReturnsTrue()
    {
        // Arrange
        var adminId = Guid.NewGuid();
        var orgUnitId = Guid.NewGuid();
        var tenantId = Guid.NewGuid();

        var adminUser = new TenantUser
        {
            Id = adminId,
            TenantId = tenantId,
            GlobalUserId = Guid.NewGuid(),
            Role = TenantUserRole.TenantAdmin,
            Status = TenantUserStatus.Active
        };

        _tenantUserRepository.Setup(x => x.GetByIdAsync(adminId, It.IsAny<CancellationToken>()))
            .ReturnsAsync(adminUser);
        _delegatedAdminRepository.Setup(x => x.GetByTenantUserIdAsync(adminId, It.IsAny<CancellationToken>()))
            .ReturnsAsync(new List<DelegatedAdminScope>());
        _orgUnitRepository.Setup(x => x.GetByTenantIdAsync(tenantId, It.IsAny<CancellationToken>()))
            .ReturnsAsync(new List<OrgUnit>());

        // Act
        var result = await _service.CanViewOrgUnitAsync(adminId, orgUnitId);

        // Assert
        result.Should().BeTrue();
    }

    [Fact]
    public async Task CanViewOrgUnitAsync_WithDelegatedAdminInScope_ReturnsTrue()
    {
        // Arrange
        var adminId = Guid.NewGuid();
        var orgUnitId = Guid.NewGuid();
        var tenantId = Guid.NewGuid();

        var adminUser = new TenantUser
        {
            Id = adminId,
            TenantId = tenantId,
            GlobalUserId = Guid.NewGuid(),
            Role = TenantUserRole.Member,
            Status = TenantUserStatus.Active
        };

        var delegatedScope = new DelegatedAdminScope
        {
            Id = Guid.NewGuid(),
            TenantUserId = adminId,
            OrgUnitId = orgUnitId,
            ScopeType = AdminScopeType.OrgOnly
        };

        _tenantUserRepository.Setup(x => x.GetByIdAsync(adminId, It.IsAny<CancellationToken>()))
            .ReturnsAsync(adminUser);
        _delegatedAdminRepository.Setup(x => x.GetByTenantUserIdAsync(adminId, It.IsAny<CancellationToken>()))
            .ReturnsAsync(new List<DelegatedAdminScope> { delegatedScope });

        // Act
        var result = await _service.CanViewOrgUnitAsync(adminId, orgUnitId);

        // Assert
        result.Should().BeTrue();
    }

    [Fact]
    public async Task CanViewOrgUnitAsync_WithDelegatedAdminOutOfScope_ReturnsFalse()
    {
        // Arrange
        var adminId = Guid.NewGuid();
        var orgUnitId1 = Guid.NewGuid();
        var orgUnitId2 = Guid.NewGuid();
        var tenantId = Guid.NewGuid();

        var adminUser = new TenantUser
        {
            Id = adminId,
            TenantId = tenantId,
            GlobalUserId = Guid.NewGuid(),
            Role = TenantUserRole.Member,
            Status = TenantUserStatus.Active
        };

        var delegatedScope = new DelegatedAdminScope
        {
            Id = Guid.NewGuid(),
            TenantUserId = adminId,
            OrgUnitId = orgUnitId1,
            ScopeType = AdminScopeType.OrgOnly
        };

        _tenantUserRepository.Setup(x => x.GetByIdAsync(adminId, It.IsAny<CancellationToken>()))
            .ReturnsAsync(adminUser);
        _delegatedAdminRepository.Setup(x => x.GetByTenantUserIdAsync(adminId, It.IsAny<CancellationToken>()))
            .ReturnsAsync(new List<DelegatedAdminScope> { delegatedScope });

        // Act
        var result = await _service.CanViewOrgUnitAsync(adminId, orgUnitId2);

        // Assert
        result.Should().BeFalse();
    }

    #endregion

    #region CanManageOrgUnitAsync Tests

    [Fact]
    public async Task CanManageOrgUnitAsync_WithGlobalAdmin_ReturnsTrue()
    {
        // Arrange
        var adminId = Guid.NewGuid();
        var orgUnitId = Guid.NewGuid();
        var tenantId = Guid.NewGuid();

        var adminUser = new TenantUser
        {
            Id = adminId,
            TenantId = tenantId,
            GlobalUserId = Guid.NewGuid(),
            Role = TenantUserRole.TenantAdmin,
            Status = TenantUserStatus.Active
        };

        _tenantUserRepository.Setup(x => x.GetByIdAsync(adminId, It.IsAny<CancellationToken>()))
            .ReturnsAsync(adminUser);
        _delegatedAdminRepository.Setup(x => x.GetByTenantUserIdAsync(adminId, It.IsAny<CancellationToken>()))
            .ReturnsAsync(new List<DelegatedAdminScope>());
        _orgUnitRepository.Setup(x => x.GetByTenantIdAsync(tenantId, It.IsAny<CancellationToken>()))
            .ReturnsAsync(new List<OrgUnit>());

        // Act
        var result = await _service.CanManageOrgUnitAsync(adminId, orgUnitId);

        // Assert
        result.Should().BeTrue();
    }

    [Fact]
    public async Task CanManageOrgUnitAsync_WithDelegatedAdminRootScope_ReturnsTrue()
    {
        // Arrange
        var adminId = Guid.NewGuid();
        var orgUnitId = Guid.NewGuid();
        var tenantId = Guid.NewGuid();

        var adminUser = new TenantUser
        {
            Id = adminId,
            TenantId = tenantId,
            GlobalUserId = Guid.NewGuid(),
            Role = TenantUserRole.Member,
            Status = TenantUserStatus.Active
        };

        var delegatedScope = new DelegatedAdminScope
        {
            Id = Guid.NewGuid(),
            TenantUserId = adminId,
            OrgUnitId = orgUnitId,
            ScopeType = AdminScopeType.OrgAndDescendants
        };

        _tenantUserRepository.Setup(x => x.GetByIdAsync(adminId, It.IsAny<CancellationToken>()))
            .ReturnsAsync(adminUser);
        _delegatedAdminRepository.Setup(x => x.GetByTenantUserIdAsync(adminId, It.IsAny<CancellationToken>()))
            .ReturnsAsync(new List<DelegatedAdminScope> { delegatedScope });
        _orgUnitRepository.Setup(x => x.GetDescendantsAsync(orgUnitId, It.IsAny<CancellationToken>()))
            .ReturnsAsync(new List<OrgUnit>());

        // Act
        var result = await _service.CanManageOrgUnitAsync(adminId, orgUnitId);

        // Assert
        result.Should().BeTrue();
    }

    [Fact]
    public async Task CanManageOrgUnitAsync_WithDelegatedAdminButNotRootScope_ReturnsFalse()
    {
        // Arrange
        var adminId = Guid.NewGuid();
        var rootOrgUnitId = Guid.NewGuid();
        var childOrgUnitId = Guid.NewGuid();
        var tenantId = Guid.NewGuid();

        var adminUser = new TenantUser
        {
            Id = adminId,
            TenantId = tenantId,
            GlobalUserId = Guid.NewGuid(),
            Role = TenantUserRole.Member,
            Status = TenantUserStatus.Active
        };

        var delegatedScope = new DelegatedAdminScope
        {
            Id = Guid.NewGuid(),
            TenantUserId = adminId,
            OrgUnitId = rootOrgUnitId,
            ScopeType = AdminScopeType.OrgAndDescendants
        };

        var descendants = new List<OrgUnit>
        {
            new OrgUnit { Id = childOrgUnitId, ParentId = rootOrgUnitId }
        };

        _tenantUserRepository.Setup(x => x.GetByIdAsync(adminId, It.IsAny<CancellationToken>()))
            .ReturnsAsync(adminUser);
        _delegatedAdminRepository.Setup(x => x.GetByTenantUserIdAsync(adminId, It.IsAny<CancellationToken>()))
            .ReturnsAsync(new List<DelegatedAdminScope> { delegatedScope });
        _orgUnitRepository.Setup(x => x.GetDescendantsAsync(rootOrgUnitId, It.IsAny<CancellationToken>()))
            .ReturnsAsync(descendants);

        // Act - trying to manage child (not in root scope)
        var result = await _service.CanManageOrgUnitAsync(adminId, childOrgUnitId);

        // Assert
        result.Should().BeFalse();
    }

    #endregion
}
