using FluentAssertions;
using Microsoft.EntityFrameworkCore;
using Microsoft.EntityFrameworkCore.Metadata.Conventions;
using Onesign.Modules.IdentityInsights.Infrastructure.EfCore.Configurations;
using Onesign.Modules.IdentityInsights.Infrastructure.EfCore.Entities;
using Xunit;

namespace Onesign.Api.Tests.IdentityInsights;

public class EntityTypeConfigurationTests
{
    #region InsightEntityTypeConfiguration Tests

    [Fact]
    public void InsightEntityTypeConfiguration_Configure_SetsTableName()
    {
        // Arrange
        var modelBuilder = CreateModelBuilder();
        var configuration = new InsightEntityTypeConfiguration();

        // Act
        configuration.Configure(modelBuilder.Entity<InsightEntity>());
        var model = modelBuilder.FinalizeModel();
        var entityType = model.FindEntityType(typeof(InsightEntity));

        // Assert
        entityType.Should().NotBeNull();
        entityType!.GetTableName().Should().Be("Insights");
        entityType.GetSchema().Should().Be("IdentityInsights");
    }

    [Fact]
    public void InsightEntityTypeConfiguration_Configure_SetsPrimaryKey()
    {
        // Arrange
        var modelBuilder = CreateModelBuilder();
        var configuration = new InsightEntityTypeConfiguration();

        // Act
        configuration.Configure(modelBuilder.Entity<InsightEntity>());
        var model = modelBuilder.FinalizeModel();
        var entityType = model.FindEntityType(typeof(InsightEntity));

        // Assert
        entityType.Should().NotBeNull();
        var primaryKey = entityType!.FindPrimaryKey();
        primaryKey.Should().NotBeNull();
        primaryKey!.Properties.Should().HaveCount(1);
        primaryKey.Properties[0].Name.Should().Be("Id");
    }

    [Fact]
    public void InsightEntityTypeConfiguration_Configure_ScopeTypeIsRequired()
    {
        // Arrange
        var modelBuilder = CreateModelBuilder();
        var configuration = new InsightEntityTypeConfiguration();

        // Act
        configuration.Configure(modelBuilder.Entity<InsightEntity>());
        var model = modelBuilder.FinalizeModel();
        var entityType = model.FindEntityType(typeof(InsightEntity));

        // Assert
        var property = entityType!.FindProperty("ScopeType");
        property.Should().NotBeNull();
        property!.IsNullable.Should().BeFalse();
        property.GetMaxLength().Should().Be(100);
    }

    [Fact]
    public void InsightEntityTypeConfiguration_Configure_TitleIsRequired()
    {
        // Arrange
        var modelBuilder = CreateModelBuilder();
        var configuration = new InsightEntityTypeConfiguration();

        // Act
        configuration.Configure(modelBuilder.Entity<InsightEntity>());
        var model = modelBuilder.FinalizeModel();
        var entityType = model.FindEntityType(typeof(InsightEntity));

        // Assert
        var property = entityType!.FindProperty("Title");
        property.Should().NotBeNull();
        property!.IsNullable.Should().BeFalse();
        property.GetMaxLength().Should().Be(500);
    }

    [Fact]
    public void InsightEntityTypeConfiguration_Configure_MessageKeyIsRequired()
    {
        // Arrange
        var modelBuilder = CreateModelBuilder();
        var configuration = new InsightEntityTypeConfiguration();

        // Act
        configuration.Configure(modelBuilder.Entity<InsightEntity>());
        var model = modelBuilder.FinalizeModel();
        var entityType = model.FindEntityType(typeof(InsightEntity));

        // Assert
        var property = entityType!.FindProperty("MessageKey");
        property.Should().NotBeNull();
        property!.IsNullable.Should().BeFalse();
        property.GetMaxLength().Should().Be(200);
    }

    [Fact]
    public void InsightEntityTypeConfiguration_Configure_DataJsonIsRequired()
    {
        // Arrange
        var modelBuilder = CreateModelBuilder();
        var configuration = new InsightEntityTypeConfiguration();

        // Act
        configuration.Configure(modelBuilder.Entity<InsightEntity>());
        var model = modelBuilder.FinalizeModel();
        var entityType = model.FindEntityType(typeof(InsightEntity));

        // Assert
        var property = entityType!.FindProperty("DataJson");
        property.Should().NotBeNull();
        property!.IsNullable.Should().BeFalse();
    }

    [Fact]
    public void InsightEntityTypeConfiguration_Configure_HasCompositeIndexes()
    {
        // Arrange
        var modelBuilder = CreateModelBuilder();
        var configuration = new InsightEntityTypeConfiguration();

        // Act
        configuration.Configure(modelBuilder.Entity<InsightEntity>());
        var model = modelBuilder.FinalizeModel();
        var entityType = model.FindEntityType(typeof(InsightEntity));

        // Assert
        var indexes = entityType!.GetIndexes().ToList();
        indexes.Should().HaveCount(2);

        // Check index names
        var indexNames = indexes.Select(i => i.GetDatabaseName()).ToList();
        indexNames.Should().Contain("IX_Insights_TenantId_Type_Status");
        indexNames.Should().Contain("IX_Insights_TenantId_Severity_CreatedAt");
    }

    #endregion

    #region UserRiskProfileEntityTypeConfiguration Tests

    [Fact]
    public void UserRiskProfileEntityTypeConfiguration_Configure_SetsTableName()
    {
        // Arrange
        var modelBuilder = CreateModelBuilder();
        var configuration = new UserRiskProfileEntityTypeConfiguration();

        // Act
        configuration.Configure(modelBuilder.Entity<UserRiskProfileEntity>());
        var model = modelBuilder.FinalizeModel();
        var entityType = model.FindEntityType(typeof(UserRiskProfileEntity));

        // Assert
        entityType.Should().NotBeNull();
        entityType!.GetTableName().Should().Be("UserRiskProfiles");
        entityType.GetSchema().Should().Be("IdentityInsights");
    }

    [Fact]
    public void UserRiskProfileEntityTypeConfiguration_Configure_SetsPrimaryKey()
    {
        // Arrange
        var modelBuilder = CreateModelBuilder();
        var configuration = new UserRiskProfileEntityTypeConfiguration();

        // Act
        configuration.Configure(modelBuilder.Entity<UserRiskProfileEntity>());
        var model = modelBuilder.FinalizeModel();
        var entityType = model.FindEntityType(typeof(UserRiskProfileEntity));

        // Assert
        entityType.Should().NotBeNull();
        var primaryKey = entityType!.FindPrimaryKey();
        primaryKey.Should().NotBeNull();
        primaryKey!.Properties.Should().HaveCount(1);
        primaryKey.Properties[0].Name.Should().Be("Id");
    }

    [Fact]
    public void UserRiskProfileEntityTypeConfiguration_Configure_UserDisplayNameIsRequired()
    {
        // Arrange
        var modelBuilder = CreateModelBuilder();
        var configuration = new UserRiskProfileEntityTypeConfiguration();

        // Act
        configuration.Configure(modelBuilder.Entity<UserRiskProfileEntity>());
        var model = modelBuilder.FinalizeModel();
        var entityType = model.FindEntityType(typeof(UserRiskProfileEntity));

        // Assert
        var property = entityType!.FindProperty("UserDisplayName");
        property.Should().NotBeNull();
        property!.IsNullable.Should().BeFalse();
        property.GetMaxLength().Should().Be(500);
    }

    [Fact]
    public void UserRiskProfileEntityTypeConfiguration_Configure_RiskFactorsJsonIsRequired()
    {
        // Arrange
        var modelBuilder = CreateModelBuilder();
        var configuration = new UserRiskProfileEntityTypeConfiguration();

        // Act
        configuration.Configure(modelBuilder.Entity<UserRiskProfileEntity>());
        var model = modelBuilder.FinalizeModel();
        var entityType = model.FindEntityType(typeof(UserRiskProfileEntity));

        // Assert
        var property = entityType!.FindProperty("RiskFactorsJson");
        property.Should().NotBeNull();
        property!.IsNullable.Should().BeFalse();
    }

    [Fact]
    public void UserRiskProfileEntityTypeConfiguration_Configure_HasUniqueIndexOnTenantIdAndUserId()
    {
        // Arrange
        var modelBuilder = CreateModelBuilder();
        var configuration = new UserRiskProfileEntityTypeConfiguration();

        // Act
        configuration.Configure(modelBuilder.Entity<UserRiskProfileEntity>());
        var model = modelBuilder.FinalizeModel();
        var entityType = model.FindEntityType(typeof(UserRiskProfileEntity));

        // Assert
        var index = entityType!.GetIndexes()
            .FirstOrDefault(i => i.GetDatabaseName() == "IX_UserRiskProfiles_TenantId_UserId");
        index.Should().NotBeNull();
        index!.IsUnique.Should().BeTrue();
    }

    [Fact]
    public void UserRiskProfileEntityTypeConfiguration_Configure_HasIndexOnTenantIdAndRiskScore()
    {
        // Arrange
        var modelBuilder = CreateModelBuilder();
        var configuration = new UserRiskProfileEntityTypeConfiguration();

        // Act
        configuration.Configure(modelBuilder.Entity<UserRiskProfileEntity>());
        var model = modelBuilder.FinalizeModel();
        var entityType = model.FindEntityType(typeof(UserRiskProfileEntity));

        // Assert
        var index = entityType!.GetIndexes()
            .FirstOrDefault(i => i.GetDatabaseName() == "IX_UserRiskProfiles_TenantId_RiskScore");
        index.Should().NotBeNull();
    }

    #endregion

    #region TenantRiskProfileEntityTypeConfiguration Tests

    [Fact]
    public void TenantRiskProfileEntityTypeConfiguration_Configure_SetsTableName()
    {
        // Arrange
        var modelBuilder = CreateModelBuilder();
        var configuration = new TenantRiskProfileEntityTypeConfiguration();

        // Act
        configuration.Configure(modelBuilder.Entity<TenantRiskProfileEntity>());
        var model = modelBuilder.FinalizeModel();
        var entityType = model.FindEntityType(typeof(TenantRiskProfileEntity));

        // Assert
        entityType.Should().NotBeNull();
        entityType!.GetTableName().Should().Be("TenantRiskProfiles");
        entityType.GetSchema().Should().Be("IdentityInsights");
    }

    [Fact]
    public void TenantRiskProfileEntityTypeConfiguration_Configure_SetsPrimaryKey()
    {
        // Arrange
        var modelBuilder = CreateModelBuilder();
        var configuration = new TenantRiskProfileEntityTypeConfiguration();

        // Act
        configuration.Configure(modelBuilder.Entity<TenantRiskProfileEntity>());
        var model = modelBuilder.FinalizeModel();
        var entityType = model.FindEntityType(typeof(TenantRiskProfileEntity));

        // Assert
        entityType.Should().NotBeNull();
        var primaryKey = entityType!.FindPrimaryKey();
        primaryKey.Should().NotBeNull();
        primaryKey!.Properties.Should().HaveCount(1);
        primaryKey.Properties[0].Name.Should().Be("Id");
    }

    [Fact]
    public void TenantRiskProfileEntityTypeConfiguration_Configure_TenantIdIsRequired()
    {
        // Arrange
        var modelBuilder = CreateModelBuilder();
        var configuration = new TenantRiskProfileEntityTypeConfiguration();

        // Act
        configuration.Configure(modelBuilder.Entity<TenantRiskProfileEntity>());
        var model = modelBuilder.FinalizeModel();
        var entityType = model.FindEntityType(typeof(TenantRiskProfileEntity));

        // Assert
        var property = entityType!.FindProperty("TenantId");
        property.Should().NotBeNull();
        property!.IsNullable.Should().BeFalse();
    }

    [Fact]
    public void TenantRiskProfileEntityTypeConfiguration_Configure_RiskScoreIsRequired()
    {
        // Arrange
        var modelBuilder = CreateModelBuilder();
        var configuration = new TenantRiskProfileEntityTypeConfiguration();

        // Act
        configuration.Configure(modelBuilder.Entity<TenantRiskProfileEntity>());
        var model = modelBuilder.FinalizeModel();
        var entityType = model.FindEntityType(typeof(TenantRiskProfileEntity));

        // Assert
        var property = entityType!.FindProperty("RiskScore");
        property.Should().NotBeNull();
        property!.IsNullable.Should().BeFalse();
    }

    [Fact]
    public void TenantRiskProfileEntityTypeConfiguration_Configure_MfaEnrollmentRateHasPrecision()
    {
        // Arrange
        var modelBuilder = CreateModelBuilder();
        var configuration = new TenantRiskProfileEntityTypeConfiguration();

        // Act
        configuration.Configure(modelBuilder.Entity<TenantRiskProfileEntity>());
        var model = modelBuilder.FinalizeModel();
        var entityType = model.FindEntityType(typeof(TenantRiskProfileEntity));

        // Assert
        var property = entityType!.FindProperty("MfaEnrollmentRate");
        property.Should().NotBeNull();
        property!.GetPrecision().Should().Be(5);
        property.GetScale().Should().Be(2);
    }

    [Fact]
    public void TenantRiskProfileEntityTypeConfiguration_Configure_FailedLoginRateHasPrecision()
    {
        // Arrange
        var modelBuilder = CreateModelBuilder();
        var configuration = new TenantRiskProfileEntityTypeConfiguration();

        // Act
        configuration.Configure(modelBuilder.Entity<TenantRiskProfileEntity>());
        var model = modelBuilder.FinalizeModel();
        var entityType = model.FindEntityType(typeof(TenantRiskProfileEntity));

        // Assert
        var property = entityType!.FindProperty("FailedLoginRate");
        property.Should().NotBeNull();
        property!.GetPrecision().Should().Be(5);
        property.GetScale().Should().Be(2);
    }

    [Fact]
    public void TenantRiskProfileEntityTypeConfiguration_Configure_HasUniqueIndexOnTenantId()
    {
        // Arrange
        var modelBuilder = CreateModelBuilder();
        var configuration = new TenantRiskProfileEntityTypeConfiguration();

        // Act
        configuration.Configure(modelBuilder.Entity<TenantRiskProfileEntity>());
        var model = modelBuilder.FinalizeModel();
        var entityType = model.FindEntityType(typeof(TenantRiskProfileEntity));

        // Assert
        var index = entityType!.GetIndexes()
            .FirstOrDefault(i => i.GetDatabaseName() == "IX_TenantRiskProfiles_TenantId");
        index.Should().NotBeNull();
        index!.IsUnique.Should().BeTrue();
    }

    [Fact]
    public void TenantRiskProfileEntityTypeConfiguration_Configure_HasIndexOnRiskScore()
    {
        // Arrange
        var modelBuilder = CreateModelBuilder();
        var configuration = new TenantRiskProfileEntityTypeConfiguration();

        // Act
        configuration.Configure(modelBuilder.Entity<TenantRiskProfileEntity>());
        var model = modelBuilder.FinalizeModel();
        var entityType = model.FindEntityType(typeof(TenantRiskProfileEntity));

        // Assert
        var index = entityType!.GetIndexes()
            .FirstOrDefault(i => i.GetDatabaseName() == "IX_TenantRiskProfiles_RiskScore");
        index.Should().NotBeNull();
    }

    #endregion

    #region Helper Methods

    private static ModelBuilder CreateModelBuilder()
    {
        var conventionSet = new ConventionSet();
        return new ModelBuilder(conventionSet);
    }

    #endregion
}
