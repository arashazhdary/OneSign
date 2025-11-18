using FluentAssertions;
using Onesign.Modules.IdentityInsights.Domain.Enums;
using Xunit;

namespace Onesign.Api.Tests.IdentityInsights;

public class InsightEnumsTests
{
    #region InsightType Tests

    [Fact]
    public void InsightType_ShouldHaveCorrectValues()
    {
        // Assert
        ((int)InsightType.HighRiskUser).Should().Be(1);
        ((int)InsightType.ZombieAccount).Should().Be(2);
        ((int)InsightType.ExcessivePrivileges).Should().Be(3);
        ((int)InsightType.TenantHighRisk).Should().Be(4);
        ((int)InsightType.SuspiciousLogin).Should().Be(5);
        ((int)InsightType.MfaNotEnabled).Should().Be(6);
    }

    [Fact]
    public void InsightType_ShouldHaveExpectedCount()
    {
        // Arrange
        var values = Enum.GetValues<InsightType>();

        // Assert
        values.Should().HaveCount(6);
    }

    [Theory]
    [InlineData(InsightType.HighRiskUser, "HighRiskUser")]
    [InlineData(InsightType.ZombieAccount, "ZombieAccount")]
    [InlineData(InsightType.ExcessivePrivileges, "ExcessivePrivileges")]
    [InlineData(InsightType.TenantHighRisk, "TenantHighRisk")]
    [InlineData(InsightType.SuspiciousLogin, "SuspiciousLogin")]
    [InlineData(InsightType.MfaNotEnabled, "MfaNotEnabled")]
    public void InsightType_ShouldHaveCorrectNames(InsightType type, string expectedName)
    {
        // Assert
        type.ToString().Should().Be(expectedName);
    }

    [Theory]
    [InlineData("HighRiskUser", InsightType.HighRiskUser)]
    [InlineData("ZombieAccount", InsightType.ZombieAccount)]
    [InlineData("ExcessivePrivileges", InsightType.ExcessivePrivileges)]
    [InlineData("TenantHighRisk", InsightType.TenantHighRisk)]
    [InlineData("SuspiciousLogin", InsightType.SuspiciousLogin)]
    [InlineData("MfaNotEnabled", InsightType.MfaNotEnabled)]
    public void InsightType_ShouldParseFromString(string name, InsightType expectedType)
    {
        // Act
        var result = Enum.Parse<InsightType>(name);

        // Assert
        result.Should().Be(expectedType);
    }

    [Theory]
    [InlineData(1, InsightType.HighRiskUser)]
    [InlineData(2, InsightType.ZombieAccount)]
    [InlineData(3, InsightType.ExcessivePrivileges)]
    [InlineData(4, InsightType.TenantHighRisk)]
    [InlineData(5, InsightType.SuspiciousLogin)]
    [InlineData(6, InsightType.MfaNotEnabled)]
    public void InsightType_ShouldCastFromInt(int value, InsightType expectedType)
    {
        // Act
        var result = (InsightType)value;

        // Assert
        result.Should().Be(expectedType);
    }

    [Fact]
    public void InsightType_AllValues_ShouldBeDefined()
    {
        // Arrange
        var values = Enum.GetValues<InsightType>();

        // Assert
        foreach (var value in values)
        {
            Enum.IsDefined(typeof(InsightType), value).Should().BeTrue();
        }
    }

    #endregion

    #region InsightSeverity Tests

    [Fact]
    public void InsightSeverity_ShouldHaveCorrectValues()
    {
        // Assert
        ((int)InsightSeverity.Info).Should().Be(1);
        ((int)InsightSeverity.Low).Should().Be(2);
        ((int)InsightSeverity.Medium).Should().Be(3);
        ((int)InsightSeverity.High).Should().Be(4);
        ((int)InsightSeverity.Critical).Should().Be(5);
    }

    [Fact]
    public void InsightSeverity_ShouldHaveExpectedCount()
    {
        // Arrange
        var values = Enum.GetValues<InsightSeverity>();

        // Assert
        values.Should().HaveCount(5);
    }

    [Theory]
    [InlineData(InsightSeverity.Info, "Info")]
    [InlineData(InsightSeverity.Low, "Low")]
    [InlineData(InsightSeverity.Medium, "Medium")]
    [InlineData(InsightSeverity.High, "High")]
    [InlineData(InsightSeverity.Critical, "Critical")]
    public void InsightSeverity_ShouldHaveCorrectNames(InsightSeverity severity, string expectedName)
    {
        // Assert
        severity.ToString().Should().Be(expectedName);
    }

    [Theory]
    [InlineData("Info", InsightSeverity.Info)]
    [InlineData("Low", InsightSeverity.Low)]
    [InlineData("Medium", InsightSeverity.Medium)]
    [InlineData("High", InsightSeverity.High)]
    [InlineData("Critical", InsightSeverity.Critical)]
    public void InsightSeverity_ShouldParseFromString(string name, InsightSeverity expectedSeverity)
    {
        // Act
        var result = Enum.Parse<InsightSeverity>(name);

        // Assert
        result.Should().Be(expectedSeverity);
    }

    [Theory]
    [InlineData(1, InsightSeverity.Info)]
    [InlineData(2, InsightSeverity.Low)]
    [InlineData(3, InsightSeverity.Medium)]
    [InlineData(4, InsightSeverity.High)]
    [InlineData(5, InsightSeverity.Critical)]
    public void InsightSeverity_ShouldCastFromInt(int value, InsightSeverity expectedSeverity)
    {
        // Act
        var result = (InsightSeverity)value;

        // Assert
        result.Should().Be(expectedSeverity);
    }

    [Fact]
    public void InsightSeverity_ShouldBeOrderedByImportance()
    {
        // Assert
        InsightSeverity.Info.Should().BeLessThan(InsightSeverity.Low);
        InsightSeverity.Low.Should().BeLessThan(InsightSeverity.Medium);
        InsightSeverity.Medium.Should().BeLessThan(InsightSeverity.High);
        InsightSeverity.High.Should().BeLessThan(InsightSeverity.Critical);
    }

    [Fact]
    public void InsightSeverity_AllValues_ShouldBeDefined()
    {
        // Arrange
        var values = Enum.GetValues<InsightSeverity>();

        // Assert
        foreach (var value in values)
        {
            Enum.IsDefined(typeof(InsightSeverity), value).Should().BeTrue();
        }
    }

    #endregion

    #region InsightStatus Tests

    [Fact]
    public void InsightStatus_ShouldHaveCorrectValues()
    {
        // Assert
        ((int)InsightStatus.Open).Should().Be(1);
        ((int)InsightStatus.Resolved).Should().Be(2);
        ((int)InsightStatus.Dismissed).Should().Be(3);
    }

    [Fact]
    public void InsightStatus_ShouldHaveExpectedCount()
    {
        // Arrange
        var values = Enum.GetValues<InsightStatus>();

        // Assert
        values.Should().HaveCount(3);
    }

    [Theory]
    [InlineData(InsightStatus.Open, "Open")]
    [InlineData(InsightStatus.Resolved, "Resolved")]
    [InlineData(InsightStatus.Dismissed, "Dismissed")]
    public void InsightStatus_ShouldHaveCorrectNames(InsightStatus status, string expectedName)
    {
        // Assert
        status.ToString().Should().Be(expectedName);
    }

    [Theory]
    [InlineData("Open", InsightStatus.Open)]
    [InlineData("Resolved", InsightStatus.Resolved)]
    [InlineData("Dismissed", InsightStatus.Dismissed)]
    public void InsightStatus_ShouldParseFromString(string name, InsightStatus expectedStatus)
    {
        // Act
        var result = Enum.Parse<InsightStatus>(name);

        // Assert
        result.Should().Be(expectedStatus);
    }

    [Theory]
    [InlineData(1, InsightStatus.Open)]
    [InlineData(2, InsightStatus.Resolved)]
    [InlineData(3, InsightStatus.Dismissed)]
    public void InsightStatus_ShouldCastFromInt(int value, InsightStatus expectedStatus)
    {
        // Act
        var result = (InsightStatus)value;

        // Assert
        result.Should().Be(expectedStatus);
    }

    [Fact]
    public void InsightStatus_AllValues_ShouldBeDefined()
    {
        // Arrange
        var values = Enum.GetValues<InsightStatus>();

        // Assert
        foreach (var value in values)
        {
            Enum.IsDefined(typeof(InsightStatus), value).Should().BeTrue();
        }
    }

    #endregion

    #region Cross-Enum Tests

    [Fact]
    public void AllEnums_ShouldStartFromOne()
    {
        // Assert - All enums start from 1, not 0
        Enum.GetValues<InsightType>().Cast<int>().Min().Should().Be(1);
        Enum.GetValues<InsightSeverity>().Cast<int>().Min().Should().Be(1);
        Enum.GetValues<InsightStatus>().Cast<int>().Min().Should().Be(1);
    }

    [Fact]
    public void InsightType_InvalidValue_ShouldNotBeDefined()
    {
        // Assert
        Enum.IsDefined(typeof(InsightType), 0).Should().BeFalse();
        Enum.IsDefined(typeof(InsightType), 7).Should().BeFalse();
        Enum.IsDefined(typeof(InsightType), 100).Should().BeFalse();
    }

    [Fact]
    public void InsightSeverity_InvalidValue_ShouldNotBeDefined()
    {
        // Assert
        Enum.IsDefined(typeof(InsightSeverity), 0).Should().BeFalse();
        Enum.IsDefined(typeof(InsightSeverity), 6).Should().BeFalse();
        Enum.IsDefined(typeof(InsightSeverity), 100).Should().BeFalse();
    }

    [Fact]
    public void InsightStatus_InvalidValue_ShouldNotBeDefined()
    {
        // Assert
        Enum.IsDefined(typeof(InsightStatus), 0).Should().BeFalse();
        Enum.IsDefined(typeof(InsightStatus), 4).Should().BeFalse();
        Enum.IsDefined(typeof(InsightStatus), 100).Should().BeFalse();
    }

    #endregion
}
