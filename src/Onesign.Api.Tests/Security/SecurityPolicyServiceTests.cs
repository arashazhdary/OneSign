using Xunit;
using Moq;
using Onesign.Modules.Security.Infrastructure.Services;
using Onesign.Modules.Security.Domain.Entities;
using Onesign.Modules.Security.Domain.Enums;
using Onesign.Modules.Security.Domain.Repositories;

namespace Onesign.Api.Tests.Security;

public class SecurityPolicyServiceTests
{
    private readonly Mock<ISecurityPolicyRepository> _policyRepoMock;
    private readonly Mock<IOrgUnitMfaRuleRepository> _ruleRepoMock;
    private readonly Mock<IUserMfaMethodRepository> _methodRepoMock;
    private readonly SecurityPolicyService _service;

    public SecurityPolicyServiceTests()
    {
        _policyRepoMock = new Mock<ISecurityPolicyRepository>();
        _ruleRepoMock = new Mock<IOrgUnitMfaRuleRepository>();
        _methodRepoMock = new Mock<IUserMfaMethodRepository>();

        _service = new SecurityPolicyService(
            _policyRepoMock.Object,
            _ruleRepoMock.Object,
            _methodRepoMock.Object
        );
    }

    [Fact]
    public async Task IsMfaRequiredAsync_WhenPolicyIsNone_ShouldReturnFalse()
    {
        // Arrange
        var tenantId = Guid.NewGuid();
        var userId = Guid.NewGuid();
        var policy = SecurityPolicy.Create(tenantId, MfaRequirementLevel.None, false, 30, 30, 5);

        _policyRepoMock.Setup(r => r.GetByTenantIdAsync(tenantId, It.IsAny<CancellationToken>()))
            .ReturnsAsync(policy);

        // Act
        var result = await _service.IsMfaRequiredAsync(tenantId, userId, null, false, CancellationToken.None);

        // Assert
        Assert.False(result);
    }

    [Fact]
    public async Task IsMfaRequiredAsync_WhenPolicyIsAllUsers_ShouldReturnTrue()
    {
        // Arrange
        var tenantId = Guid.NewGuid();
        var userId = Guid.NewGuid();
        var policy = SecurityPolicy.Create(tenantId, MfaRequirementLevel.AllUsers, false, 30, 30, 5);

        _policyRepoMock.Setup(r => r.GetByTenantIdAsync(tenantId, It.IsAny<CancellationToken>()))
            .ReturnsAsync(policy);

        // Act
        var result = await _service.IsMfaRequiredAsync(tenantId, userId, null, false, CancellationToken.None);

        // Assert
        Assert.True(result);
    }

    [Fact]
    public async Task IsMfaRequiredAsync_WhenPolicyIsAdminsOnlyAndUserIsAdmin_ShouldReturnTrue()
    {
        // Arrange
        var tenantId = Guid.NewGuid();
        var userId = Guid.NewGuid();
        var policy = SecurityPolicy.Create(tenantId, MfaRequirementLevel.AdminsOnly, false, 30, 30, 5);

        _policyRepoMock.Setup(r => r.GetByTenantIdAsync(tenantId, It.IsAny<CancellationToken>()))
            .ReturnsAsync(policy);

        // Act
        var result = await _service.IsMfaRequiredAsync(tenantId, userId, null, true, CancellationToken.None);

        // Assert
        Assert.True(result);
    }

    [Fact]
    public async Task IsMfaRequiredAsync_WhenPolicyIsAdminsOnlyAndUserIsNotAdmin_ShouldReturnFalse()
    {
        // Arrange
        var tenantId = Guid.NewGuid();
        var userId = Guid.NewGuid();
        var policy = SecurityPolicy.Create(tenantId, MfaRequirementLevel.AdminsOnly, false, 30, 30, 5);

        _policyRepoMock.Setup(r => r.GetByTenantIdAsync(tenantId, It.IsAny<CancellationToken>()))
            .ReturnsAsync(policy);

        // Act
        var result = await _service.IsMfaRequiredAsync(tenantId, userId, null, false, CancellationToken.None);

        // Assert
        Assert.False(result);
    }

    [Fact]
    public async Task IsMfaRequiredAsync_WithOrgUnitOverride_ShouldUseOrgUnitRule()
    {
        // Arrange
        var tenantId = Guid.NewGuid();
        var userId = Guid.NewGuid();
        var orgUnitId = Guid.NewGuid();

        // Tenant policy is None
        var policy = SecurityPolicy.Create(tenantId, MfaRequirementLevel.None, false, 30, 30, 5);

        // But org unit requires all users
        var orgRule = OrgUnitMfaRule.Create(tenantId, orgUnitId, MfaRequirementLevel.AllUsers);

        _policyRepoMock.Setup(r => r.GetByTenantIdAsync(tenantId, It.IsAny<CancellationToken>()))
            .ReturnsAsync(policy);

        _ruleRepoMock.Setup(r => r.GetByTenantAndOrgUnitAsync(tenantId, orgUnitId, It.IsAny<CancellationToken>()))
            .ReturnsAsync(orgRule);

        // Act
        var result = await _service.IsMfaRequiredAsync(tenantId, userId, orgUnitId, false, CancellationToken.None);

        // Assert
        Assert.True(result);
    }

    [Fact]
    public async Task IsMfaRequiredAsync_WhenNoPolicyExists_ShouldReturnFalse()
    {
        // Arrange
        var tenantId = Guid.NewGuid();
        var userId = Guid.NewGuid();

        _policyRepoMock.Setup(r => r.GetByTenantIdAsync(tenantId, It.IsAny<CancellationToken>()))
            .ReturnsAsync((SecurityPolicy?)null);

        // Act
        var result = await _service.IsMfaRequiredAsync(tenantId, userId, null, false, CancellationToken.None);

        // Assert
        Assert.False(result);
    }

    [Fact]
    public async Task HasMfaMethodAsync_WhenUserHasMethods_ShouldReturnTrue()
    {
        // Arrange
        var userId = Guid.NewGuid();
        var methods = new List<UserMfaMethod>
        {
            UserMfaMethod.Create(userId, Guid.NewGuid(), MfaMethodType.Totp, "encrypted", true)
        };

        _methodRepoMock.Setup(r => r.GetByUserIdAsync(userId, It.IsAny<CancellationToken>()))
            .ReturnsAsync(methods);

        // Act
        var result = await _service.HasMfaMethodAsync(userId, CancellationToken.None);

        // Assert
        Assert.True(result);
    }

    [Fact]
    public async Task HasMfaMethodAsync_WhenUserHasNoMethods_ShouldReturnFalse()
    {
        // Arrange
        var userId = Guid.NewGuid();

        _methodRepoMock.Setup(r => r.GetByUserIdAsync(userId, It.IsAny<CancellationToken>()))
            .ReturnsAsync(new List<UserMfaMethod>());

        // Act
        var result = await _service.HasMfaMethodAsync(userId, CancellationToken.None);

        // Assert
        Assert.False(result);
    }
}
