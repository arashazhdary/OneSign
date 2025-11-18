using Xunit;
using Moq;
using FluentAssertions;
using Onesign.Modules.Security.Infrastructure.Services;
using Onesign.Modules.Security.Domain.Entities;
using Onesign.Modules.Security.Domain.Enums;
using Onesign.Modules.Security.Domain.Repositories;

namespace Onesign.Api.Tests.Security;

public class SecurityPolicyServiceTests
{
    private readonly Mock<ISecurityPolicyRepository> _policyRepoMock;
    private readonly Mock<IOrgUnitMfaRuleRepository> _ruleRepoMock;
    private readonly SecurityPolicyService _service;

    public SecurityPolicyServiceTests()
    {
        _policyRepoMock = new Mock<ISecurityPolicyRepository>();
        _ruleRepoMock = new Mock<IOrgUnitMfaRuleRepository>();

        _service = new SecurityPolicyService(
            _policyRepoMock.Object,
            _ruleRepoMock.Object
        );
    }

    #region Constructor Tests

    [Fact]
    public void Constructor_WithNullSecurityPolicyRepository_ShouldThrowArgumentNullException()
    {
        // Act & Assert
        var act = () => new SecurityPolicyService(null!, _ruleRepoMock.Object);
        act.Should().Throw<ArgumentNullException>().WithParameterName("securityPolicyRepository");
    }

    [Fact]
    public void Constructor_WithNullOrgUnitMfaRuleRepository_ShouldThrowArgumentNullException()
    {
        // Act & Assert
        var act = () => new SecurityPolicyService(_policyRepoMock.Object, null!);
        act.Should().Throw<ArgumentNullException>().WithParameterName("orgUnitMfaRuleRepository");
    }

    #endregion

    #region GetPolicyForTenantAsync Tests

    [Fact]
    public async Task GetPolicyForTenantAsync_WhenPolicyExists_ShouldReturnPolicy()
    {
        // Arrange
        var tenantId = Guid.NewGuid();
        var policy = new SecurityPolicy(
            tenantId: tenantId,
            mfaRequirementLevel: MfaRequirementLevel.AllUsers,
            allowMfaRememberDevice: true,
            rememberDeviceDays: 30,
            requireMfaForSensitiveApps: true,
            maxFailedLoginAttempts: 5,
            enableGeoAnomalyDetection: true,
            blockLevel: RiskLevel.High
        );

        _policyRepoMock.Setup(r => r.GetByTenantIdAsync(tenantId, It.IsAny<CancellationToken>()))
            .ReturnsAsync(policy);

        // Act
        var result = await _service.GetPolicyForTenantAsync(tenantId);

        // Assert
        result.Should().NotBeNull();
        result.TenantId.Should().Be(tenantId);
        result.MfaRequirementLevel.Should().Be(MfaRequirementLevel.AllUsers);
    }

    [Fact]
    public async Task GetPolicyForTenantAsync_WhenNoPolicyExists_ShouldCreateDefaultPolicy()
    {
        // Arrange
        var tenantId = Guid.NewGuid();

        _policyRepoMock.Setup(r => r.GetByTenantIdAsync(tenantId, It.IsAny<CancellationToken>()))
            .ReturnsAsync((SecurityPolicy?)null);

        // Act
        var result = await _service.GetPolicyForTenantAsync(tenantId);

        // Assert
        result.Should().NotBeNull();
        result.TenantId.Should().Be(tenantId);
        result.MfaRequirementLevel.Should().Be(MfaRequirementLevel.None);
        result.AllowMfaRememberDevice.Should().BeTrue();
        result.RememberDeviceDays.Should().Be(30);
        result.MaxFailedLoginAttempts.Should().Be(5);
        result.BlockLevel.Should().Be(RiskLevel.High);

        _policyRepoMock.Verify(r => r.AddAsync(It.IsAny<SecurityPolicy>(), It.IsAny<CancellationToken>()), Times.Once);
    }

    [Fact]
    public async Task GetPolicyForTenantAsync_WithEmptyTenantId_ShouldThrowArgumentException()
    {
        // Act & Assert
        var act = async () => await _service.GetPolicyForTenantAsync(Guid.Empty);
        await act.Should().ThrowAsync<ArgumentException>().WithParameterName("tenantId");
    }

    #endregion

    #region UpdatePolicyAsync Tests

    [Fact]
    public async Task UpdatePolicyAsync_WhenPolicyExists_ShouldUpdatePolicy()
    {
        // Arrange
        var tenantId = Guid.NewGuid();
        var existingPolicy = new SecurityPolicy(
            tenantId: tenantId,
            mfaRequirementLevel: MfaRequirementLevel.None,
            allowMfaRememberDevice: false,
            rememberDeviceDays: 7,
            requireMfaForSensitiveApps: false,
            maxFailedLoginAttempts: 3,
            enableGeoAnomalyDetection: false,
            blockLevel: RiskLevel.Medium
        );

        _policyRepoMock.Setup(r => r.GetByTenantIdAsync(tenantId, It.IsAny<CancellationToken>()))
            .ReturnsAsync(existingPolicy);

        // Act
        var result = await _service.UpdatePolicyAsync(
            tenantId: tenantId,
            mfaRequirementLevel: MfaRequirementLevel.AllUsers,
            allowMfaRememberDevice: true,
            rememberDeviceDays: 30,
            requireMfaForSensitiveApps: true,
            maxFailedLoginAttempts: 5,
            enableGeoAnomalyDetection: true,
            blockLevel: RiskLevel.High
        );

        // Assert
        result.MfaRequirementLevel.Should().Be(MfaRequirementLevel.AllUsers);
        result.AllowMfaRememberDevice.Should().BeTrue();
        result.RememberDeviceDays.Should().Be(30);
        result.RequireMfaForSensitiveApps.Should().BeTrue();
        result.MaxFailedLoginAttempts.Should().Be(5);
        result.EnableGeoAnomalyDetection.Should().BeTrue();
        result.BlockLevel.Should().Be(RiskLevel.High);

        _policyRepoMock.Verify(r => r.UpdateAsync(It.IsAny<SecurityPolicy>(), It.IsAny<CancellationToken>()), Times.Once);
    }

    [Fact]
    public async Task UpdatePolicyAsync_WhenNoPolicyExists_ShouldCreateNewPolicy()
    {
        // Arrange
        var tenantId = Guid.NewGuid();

        _policyRepoMock.Setup(r => r.GetByTenantIdAsync(tenantId, It.IsAny<CancellationToken>()))
            .ReturnsAsync((SecurityPolicy?)null);

        // Act
        var result = await _service.UpdatePolicyAsync(
            tenantId: tenantId,
            mfaRequirementLevel: MfaRequirementLevel.AdminsOnly,
            allowMfaRememberDevice: true,
            rememberDeviceDays: 14,
            requireMfaForSensitiveApps: true,
            maxFailedLoginAttempts: 10,
            enableGeoAnomalyDetection: false,
            blockLevel: RiskLevel.Medium
        );

        // Assert
        result.TenantId.Should().Be(tenantId);
        result.MfaRequirementLevel.Should().Be(MfaRequirementLevel.AdminsOnly);

        _policyRepoMock.Verify(r => r.AddAsync(It.IsAny<SecurityPolicy>(), It.IsAny<CancellationToken>()), Times.Once);
    }

    [Fact]
    public async Task UpdatePolicyAsync_WithEmptyTenantId_ShouldThrowArgumentException()
    {
        // Act & Assert
        var act = async () => await _service.UpdatePolicyAsync(
            Guid.Empty, MfaRequirementLevel.None, true, 30, true, 5, true, RiskLevel.High);
        await act.Should().ThrowAsync<ArgumentException>().WithParameterName("tenantId");
    }

    [Theory]
    [InlineData(0)]
    [InlineData(-1)]
    public async Task UpdatePolicyAsync_WithInvalidRememberDeviceDays_ShouldThrowArgumentException(int days)
    {
        // Act & Assert
        var act = async () => await _service.UpdatePolicyAsync(
            Guid.NewGuid(), MfaRequirementLevel.None, true, days, true, 5, true, RiskLevel.High);
        await act.Should().ThrowAsync<ArgumentException>().WithParameterName("rememberDeviceDays");
    }

    [Theory]
    [InlineData(0)]
    [InlineData(-1)]
    public async Task UpdatePolicyAsync_WithInvalidMaxFailedAttempts_ShouldThrowArgumentException(int attempts)
    {
        // Act & Assert
        var act = async () => await _service.UpdatePolicyAsync(
            Guid.NewGuid(), MfaRequirementLevel.None, true, 30, true, attempts, true, RiskLevel.High);
        await act.Should().ThrowAsync<ArgumentException>().WithParameterName("maxFailedLoginAttempts");
    }

    #endregion

    #region GetEffectiveMfaRequirementAsync Tests

    [Fact]
    public async Task GetEffectiveMfaRequirementAsync_WithAllUsersPolicy_ShouldReturnTrue()
    {
        // Arrange
        var tenantId = Guid.NewGuid();
        var userId = Guid.NewGuid();
        var policy = new SecurityPolicy(
            tenantId, MfaRequirementLevel.AllUsers, true, 30, true, 5, true, RiskLevel.High);

        _policyRepoMock.Setup(r => r.GetByTenantIdAsync(tenantId, It.IsAny<CancellationToken>()))
            .ReturnsAsync(policy);

        // Act
        var result = await _service.GetEffectiveMfaRequirementAsync(
            userId, tenantId, new List<Guid>(), false, false, RiskLevel.Low);

        // Assert
        result.Should().BeTrue();
    }

    [Fact]
    public async Task GetEffectiveMfaRequirementAsync_WithAdminsOnlyPolicyAndAdmin_ShouldReturnTrue()
    {
        // Arrange
        var tenantId = Guid.NewGuid();
        var userId = Guid.NewGuid();
        var policy = new SecurityPolicy(
            tenantId, MfaRequirementLevel.AdminsOnly, true, 30, true, 5, true, RiskLevel.High);

        _policyRepoMock.Setup(r => r.GetByTenantIdAsync(tenantId, It.IsAny<CancellationToken>()))
            .ReturnsAsync(policy);

        // Act
        var result = await _service.GetEffectiveMfaRequirementAsync(
            userId, tenantId, new List<Guid>(), true, false, RiskLevel.Low);

        // Assert
        result.Should().BeTrue();
    }

    [Fact]
    public async Task GetEffectiveMfaRequirementAsync_WithAdminsOnlyPolicyAndNonAdmin_ShouldReturnFalse()
    {
        // Arrange
        var tenantId = Guid.NewGuid();
        var userId = Guid.NewGuid();
        var policy = new SecurityPolicy(
            tenantId, MfaRequirementLevel.AdminsOnly, true, 30, true, 5, true, RiskLevel.High);

        _policyRepoMock.Setup(r => r.GetByTenantIdAsync(tenantId, It.IsAny<CancellationToken>()))
            .ReturnsAsync(policy);

        // Act
        var result = await _service.GetEffectiveMfaRequirementAsync(
            userId, tenantId, new List<Guid>(), false, false, RiskLevel.Low);

        // Assert
        result.Should().BeFalse();
    }

    [Fact]
    public async Task GetEffectiveMfaRequirementAsync_WithMediumRisk_ShouldReturnTrue()
    {
        // Arrange
        var tenantId = Guid.NewGuid();
        var userId = Guid.NewGuid();
        var policy = new SecurityPolicy(
            tenantId, MfaRequirementLevel.None, true, 30, true, 5, true, RiskLevel.High);

        _policyRepoMock.Setup(r => r.GetByTenantIdAsync(tenantId, It.IsAny<CancellationToken>()))
            .ReturnsAsync(policy);

        // Act
        var result = await _service.GetEffectiveMfaRequirementAsync(
            userId, tenantId, new List<Guid>(), false, true, RiskLevel.Medium);

        // Assert
        result.Should().BeTrue();
    }

    [Fact]
    public async Task GetEffectiveMfaRequirementAsync_WithHighRisk_ShouldReturnTrue()
    {
        // Arrange
        var tenantId = Guid.NewGuid();
        var userId = Guid.NewGuid();
        var policy = new SecurityPolicy(
            tenantId, MfaRequirementLevel.None, true, 30, true, 5, true, RiskLevel.High);

        _policyRepoMock.Setup(r => r.GetByTenantIdAsync(tenantId, It.IsAny<CancellationToken>()))
            .ReturnsAsync(policy);

        // Act
        var result = await _service.GetEffectiveMfaRequirementAsync(
            userId, tenantId, new List<Guid>(), false, true, RiskLevel.High);

        // Assert
        result.Should().BeTrue();
    }

    [Fact]
    public async Task GetEffectiveMfaRequirementAsync_WithTrustedDeviceAndAllowRemember_ShouldReturnFalse()
    {
        // Arrange
        var tenantId = Guid.NewGuid();
        var userId = Guid.NewGuid();
        var policy = new SecurityPolicy(
            tenantId, MfaRequirementLevel.None, true, 30, true, 5, true, RiskLevel.High);

        _policyRepoMock.Setup(r => r.GetByTenantIdAsync(tenantId, It.IsAny<CancellationToken>()))
            .ReturnsAsync(policy);

        _ruleRepoMock.Setup(r => r.GetByTenantIdAsync(tenantId, It.IsAny<CancellationToken>()))
            .ReturnsAsync(new List<OrgUnitMfaRule>());

        // Act
        var result = await _service.GetEffectiveMfaRequirementAsync(
            userId, tenantId, new List<Guid>(), false, true, RiskLevel.Low);

        // Assert
        result.Should().BeFalse();
    }

    [Fact]
    public async Task GetEffectiveMfaRequirementAsync_WithOrgUnitRequiringMfa_ShouldReturnTrue()
    {
        // Arrange
        var tenantId = Guid.NewGuid();
        var userId = Guid.NewGuid();
        var orgUnitId = Guid.NewGuid();
        var policy = new SecurityPolicy(
            tenantId, MfaRequirementLevel.None, true, 30, true, 5, true, RiskLevel.High);

        var orgUnitRule = new OrgUnitMfaRule(Guid.NewGuid(), tenantId, orgUnitId, true);

        _policyRepoMock.Setup(r => r.GetByTenantIdAsync(tenantId, It.IsAny<CancellationToken>()))
            .ReturnsAsync(policy);

        _ruleRepoMock.Setup(r => r.GetByTenantIdAsync(tenantId, It.IsAny<CancellationToken>()))
            .ReturnsAsync(new List<OrgUnitMfaRule> { orgUnitRule });

        // Act
        var result = await _service.GetEffectiveMfaRequirementAsync(
            userId, tenantId, new List<Guid> { orgUnitId }, false, false, RiskLevel.Low);

        // Assert
        result.Should().BeTrue();
    }

    [Fact]
    public async Task GetEffectiveMfaRequirementAsync_WithEmptyTenantUserId_ShouldThrowArgumentException()
    {
        // Act & Assert
        var act = async () => await _service.GetEffectiveMfaRequirementAsync(
            Guid.Empty, Guid.NewGuid(), new List<Guid>(), false, false, RiskLevel.Low);
        await act.Should().ThrowAsync<ArgumentException>().WithParameterName("tenantUserId");
    }

    [Fact]
    public async Task GetEffectiveMfaRequirementAsync_WithEmptyTenantId_ShouldThrowArgumentException()
    {
        // Act & Assert
        var act = async () => await _service.GetEffectiveMfaRequirementAsync(
            Guid.NewGuid(), Guid.Empty, new List<Guid>(), false, false, RiskLevel.Low);
        await act.Should().ThrowAsync<ArgumentException>().WithParameterName("tenantId");
    }

    [Fact]
    public async Task GetEffectiveMfaRequirementAsync_WithNullOrgUnitIds_ShouldNotThrow()
    {
        // Arrange
        var tenantId = Guid.NewGuid();
        var userId = Guid.NewGuid();
        var policy = new SecurityPolicy(
            tenantId, MfaRequirementLevel.None, true, 30, true, 5, true, RiskLevel.High);

        _policyRepoMock.Setup(r => r.GetByTenantIdAsync(tenantId, It.IsAny<CancellationToken>()))
            .ReturnsAsync(policy);

        // Act
        var result = await _service.GetEffectiveMfaRequirementAsync(
            userId, tenantId, null!, false, true, RiskLevel.Low);

        // Assert
        result.Should().BeFalse();
    }

    #endregion

    #region ShouldBlockLoginAsync Tests

    [Fact]
    public async Task ShouldBlockLoginAsync_WithRiskAboveBlockLevel_ShouldReturnTrue()
    {
        // Arrange
        var tenantId = Guid.NewGuid();
        var policy = new SecurityPolicy(
            tenantId, MfaRequirementLevel.None, true, 30, true, 5, true, RiskLevel.Medium);

        _policyRepoMock.Setup(r => r.GetByTenantIdAsync(tenantId, It.IsAny<CancellationToken>()))
            .ReturnsAsync(policy);

        // Act
        var result = await _service.ShouldBlockLoginAsync(RiskLevel.High, tenantId);

        // Assert
        result.Should().BeTrue();
    }

    [Fact]
    public async Task ShouldBlockLoginAsync_WithRiskAtBlockLevel_ShouldReturnTrue()
    {
        // Arrange
        var tenantId = Guid.NewGuid();
        var policy = new SecurityPolicy(
            tenantId, MfaRequirementLevel.None, true, 30, true, 5, true, RiskLevel.Medium);

        _policyRepoMock.Setup(r => r.GetByTenantIdAsync(tenantId, It.IsAny<CancellationToken>()))
            .ReturnsAsync(policy);

        // Act
        var result = await _service.ShouldBlockLoginAsync(RiskLevel.Medium, tenantId);

        // Assert
        result.Should().BeTrue();
    }

    [Fact]
    public async Task ShouldBlockLoginAsync_WithRiskBelowBlockLevel_ShouldReturnFalse()
    {
        // Arrange
        var tenantId = Guid.NewGuid();
        var policy = new SecurityPolicy(
            tenantId, MfaRequirementLevel.None, true, 30, true, 5, true, RiskLevel.High);

        _policyRepoMock.Setup(r => r.GetByTenantIdAsync(tenantId, It.IsAny<CancellationToken>()))
            .ReturnsAsync(policy);

        // Act
        var result = await _service.ShouldBlockLoginAsync(RiskLevel.Medium, tenantId);

        // Assert
        result.Should().BeFalse();
    }

    [Fact]
    public async Task ShouldBlockLoginAsync_WithEmptyTenantId_ShouldThrowArgumentException()
    {
        // Act & Assert
        var act = async () => await _service.ShouldBlockLoginAsync(RiskLevel.High, Guid.Empty);
        await act.Should().ThrowAsync<ArgumentException>().WithParameterName("tenantId");
    }

    [Fact]
    public async Task ShouldBlockLoginAsync_WithLowRiskAndHighBlockLevel_ShouldReturnFalse()
    {
        // Arrange
        var tenantId = Guid.NewGuid();
        var policy = new SecurityPolicy(
            tenantId, MfaRequirementLevel.None, true, 30, true, 5, true, RiskLevel.High);

        _policyRepoMock.Setup(r => r.GetByTenantIdAsync(tenantId, It.IsAny<CancellationToken>()))
            .ReturnsAsync(policy);

        // Act
        var result = await _service.ShouldBlockLoginAsync(RiskLevel.Low, tenantId);

        // Assert
        result.Should().BeFalse();
    }

    #endregion
}
