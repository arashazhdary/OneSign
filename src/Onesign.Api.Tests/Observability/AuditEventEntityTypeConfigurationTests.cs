using FluentAssertions;
using Microsoft.EntityFrameworkCore;
using Onesign.Modules.Observability.Infrastructure.EfCore.Configurations;
using Onesign.Modules.Observability.Infrastructure.EfCore.Entities;
using Xunit;

namespace Onesign.Api.Tests.Observability;

public class AuditEventEntityTypeConfigurationTests
{
    [Fact]
    public void Configure_SetsCorrectTableName()
    {
        // Arrange
        var options = new DbContextOptionsBuilder<TestConfigDbContext>()
            .UseInMemoryDatabase(Guid.NewGuid().ToString())
            .Options;

        using var context = new TestConfigDbContext(options);

        // Act
        var entityType = context.Model.FindEntityType(typeof(AuditEventEntity));

        // Assert
        entityType.Should().NotBeNull();
        entityType!.GetTableName().Should().Be("AuditEvents");
    }

    [Fact]
    public void Configure_SetsCorrectPrimaryKey()
    {
        // Arrange
        var options = new DbContextOptionsBuilder<TestConfigDbContext>()
            .UseInMemoryDatabase(Guid.NewGuid().ToString())
            .Options;

        using var context = new TestConfigDbContext(options);

        // Act
        var entityType = context.Model.FindEntityType(typeof(AuditEventEntity));
        var primaryKey = entityType!.FindPrimaryKey();

        // Assert
        primaryKey.Should().NotBeNull();
        primaryKey!.Properties.Should().HaveCount(1);
        primaryKey.Properties.First().Name.Should().Be("Id");
    }

    [Fact]
    public void Configure_CorrelationId_HasCorrectConfiguration()
    {
        // Arrange
        var options = new DbContextOptionsBuilder<TestConfigDbContext>()
            .UseInMemoryDatabase(Guid.NewGuid().ToString())
            .Options;

        using var context = new TestConfigDbContext(options);

        // Act
        var entityType = context.Model.FindEntityType(typeof(AuditEventEntity));
        var property = entityType!.FindProperty(nameof(AuditEventEntity.CorrelationId));

        // Assert
        property.Should().NotBeNull();
        property!.IsNullable.Should().BeFalse();
        property.GetMaxLength().Should().Be(100);
    }

    [Fact]
    public void Configure_ActorId_HasCorrectConfiguration()
    {
        // Arrange
        var options = new DbContextOptionsBuilder<TestConfigDbContext>()
            .UseInMemoryDatabase(Guid.NewGuid().ToString())
            .Options;

        using var context = new TestConfigDbContext(options);

        // Act
        var entityType = context.Model.FindEntityType(typeof(AuditEventEntity));
        var property = entityType!.FindProperty(nameof(AuditEventEntity.ActorId));

        // Assert
        property.Should().NotBeNull();
        property!.IsNullable.Should().BeFalse();
        property.GetMaxLength().Should().Be(100);
    }

    [Fact]
    public void Configure_ActorDisplayName_HasCorrectConfiguration()
    {
        // Arrange
        var options = new DbContextOptionsBuilder<TestConfigDbContext>()
            .UseInMemoryDatabase(Guid.NewGuid().ToString())
            .Options;

        using var context = new TestConfigDbContext(options);

        // Act
        var entityType = context.Model.FindEntityType(typeof(AuditEventEntity));
        var property = entityType!.FindProperty(nameof(AuditEventEntity.ActorDisplayName));

        // Assert
        property.Should().NotBeNull();
        property!.IsNullable.Should().BeFalse();
        property.GetMaxLength().Should().Be(200);
    }

    [Fact]
    public void Configure_ActorType_HasCorrectConfiguration()
    {
        // Arrange
        var options = new DbContextOptionsBuilder<TestConfigDbContext>()
            .UseInMemoryDatabase(Guid.NewGuid().ToString())
            .Options;

        using var context = new TestConfigDbContext(options);

        // Act
        var entityType = context.Model.FindEntityType(typeof(AuditEventEntity));
        var property = entityType!.FindProperty(nameof(AuditEventEntity.ActorType));

        // Assert
        property.Should().NotBeNull();
        property!.IsNullable.Should().BeFalse();
        property.GetMaxLength().Should().Be(50);
    }

    [Fact]
    public void Configure_Action_HasCorrectConfiguration()
    {
        // Arrange
        var options = new DbContextOptionsBuilder<TestConfigDbContext>()
            .UseInMemoryDatabase(Guid.NewGuid().ToString())
            .Options;

        using var context = new TestConfigDbContext(options);

        // Act
        var entityType = context.Model.FindEntityType(typeof(AuditEventEntity));
        var property = entityType!.FindProperty(nameof(AuditEventEntity.Action));

        // Assert
        property.Should().NotBeNull();
        property!.IsNullable.Should().BeFalse();
        property.GetMaxLength().Should().Be(200);
    }

    [Fact]
    public void Configure_TargetType_HasCorrectConfiguration()
    {
        // Arrange
        var options = new DbContextOptionsBuilder<TestConfigDbContext>()
            .UseInMemoryDatabase(Guid.NewGuid().ToString())
            .Options;

        using var context = new TestConfigDbContext(options);

        // Act
        var entityType = context.Model.FindEntityType(typeof(AuditEventEntity));
        var property = entityType!.FindProperty(nameof(AuditEventEntity.TargetType));

        // Assert
        property.Should().NotBeNull();
        property!.IsNullable.Should().BeFalse();
        property.GetMaxLength().Should().Be(100);
    }

    [Fact]
    public void Configure_TargetId_HasCorrectConfiguration()
    {
        // Arrange
        var options = new DbContextOptionsBuilder<TestConfigDbContext>()
            .UseInMemoryDatabase(Guid.NewGuid().ToString())
            .Options;

        using var context = new TestConfigDbContext(options);

        // Act
        var entityType = context.Model.FindEntityType(typeof(AuditEventEntity));
        var property = entityType!.FindProperty(nameof(AuditEventEntity.TargetId));

        // Assert
        property.Should().NotBeNull();
        property!.IsNullable.Should().BeFalse();
        property.GetMaxLength().Should().Be(100);
    }

    [Fact]
    public void Configure_IpAddress_HasCorrectConfiguration()
    {
        // Arrange
        var options = new DbContextOptionsBuilder<TestConfigDbContext>()
            .UseInMemoryDatabase(Guid.NewGuid().ToString())
            .Options;

        using var context = new TestConfigDbContext(options);

        // Act
        var entityType = context.Model.FindEntityType(typeof(AuditEventEntity));
        var property = entityType!.FindProperty(nameof(AuditEventEntity.IpAddress));

        // Assert
        property.Should().NotBeNull();
        property!.IsNullable.Should().BeFalse();
        property.GetMaxLength().Should().Be(50);
    }

    [Fact]
    public void Configure_UserAgent_HasCorrectConfiguration()
    {
        // Arrange
        var options = new DbContextOptionsBuilder<TestConfigDbContext>()
            .UseInMemoryDatabase(Guid.NewGuid().ToString())
            .Options;

        using var context = new TestConfigDbContext(options);

        // Act
        var entityType = context.Model.FindEntityType(typeof(AuditEventEntity));
        var property = entityType!.FindProperty(nameof(AuditEventEntity.UserAgent));

        // Assert
        property.Should().NotBeNull();
        property!.IsNullable.Should().BeFalse();
        property.GetMaxLength().Should().Be(500);
    }

    [Fact]
    public void Configure_Country_HasCorrectConfiguration()
    {
        // Arrange
        var options = new DbContextOptionsBuilder<TestConfigDbContext>()
            .UseInMemoryDatabase(Guid.NewGuid().ToString())
            .Options;

        using var context = new TestConfigDbContext(options);

        // Act
        var entityType = context.Model.FindEntityType(typeof(AuditEventEntity));
        var property = entityType!.FindProperty(nameof(AuditEventEntity.Country));

        // Assert
        property.Should().NotBeNull();
        property!.IsNullable.Should().BeTrue();
        property.GetMaxLength().Should().Be(100);
    }

    [Fact]
    public void Configure_OccurredAt_IsRequired()
    {
        // Arrange
        var options = new DbContextOptionsBuilder<TestConfigDbContext>()
            .UseInMemoryDatabase(Guid.NewGuid().ToString())
            .Options;

        using var context = new TestConfigDbContext(options);

        // Act
        var entityType = context.Model.FindEntityType(typeof(AuditEventEntity));
        var property = entityType!.FindProperty(nameof(AuditEventEntity.OccurredAt));

        // Assert
        property.Should().NotBeNull();
        property!.IsNullable.Should().BeFalse();
    }

    [Fact]
    public void Configure_DataJson_IsRequired()
    {
        // Arrange
        var options = new DbContextOptionsBuilder<TestConfigDbContext>()
            .UseInMemoryDatabase(Guid.NewGuid().ToString())
            .Options;

        using var context = new TestConfigDbContext(options);

        // Act
        var entityType = context.Model.FindEntityType(typeof(AuditEventEntity));
        var property = entityType!.FindProperty(nameof(AuditEventEntity.DataJson));

        // Assert
        property.Should().NotBeNull();
        property!.IsNullable.Should().BeFalse();
    }

    [Fact]
    public void Configure_Category_IsRequired()
    {
        // Arrange
        var options = new DbContextOptionsBuilder<TestConfigDbContext>()
            .UseInMemoryDatabase(Guid.NewGuid().ToString())
            .Options;

        using var context = new TestConfigDbContext(options);

        // Act
        var entityType = context.Model.FindEntityType(typeof(AuditEventEntity));
        var property = entityType!.FindProperty(nameof(AuditEventEntity.Category));

        // Assert
        property.Should().NotBeNull();
        property!.IsNullable.Should().BeFalse();
    }

    [Fact]
    public void Configure_Severity_IsRequired()
    {
        // Arrange
        var options = new DbContextOptionsBuilder<TestConfigDbContext>()
            .UseInMemoryDatabase(Guid.NewGuid().ToString())
            .Options;

        using var context = new TestConfigDbContext(options);

        // Act
        var entityType = context.Model.FindEntityType(typeof(AuditEventEntity));
        var property = entityType!.FindProperty(nameof(AuditEventEntity.Severity));

        // Assert
        property.Should().NotBeNull();
        property!.IsNullable.Should().BeFalse();
    }

    [Fact]
    public void Configure_TenantId_IsOptional()
    {
        // Arrange
        var options = new DbContextOptionsBuilder<TestConfigDbContext>()
            .UseInMemoryDatabase(Guid.NewGuid().ToString())
            .Options;

        using var context = new TestConfigDbContext(options);

        // Act
        var entityType = context.Model.FindEntityType(typeof(AuditEventEntity));
        var property = entityType!.FindProperty(nameof(AuditEventEntity.TenantId));

        // Assert
        property.Should().NotBeNull();
        property!.IsNullable.Should().BeTrue();
    }

    [Fact]
    public void Configure_HasRequiredIndexes()
    {
        // Arrange
        var options = new DbContextOptionsBuilder<TestConfigDbContext>()
            .UseInMemoryDatabase(Guid.NewGuid().ToString())
            .Options;

        using var context = new TestConfigDbContext(options);

        // Act
        var entityType = context.Model.FindEntityType(typeof(AuditEventEntity));
        var indexes = entityType!.GetIndexes().ToList();

        // Assert
        indexes.Should().NotBeEmpty();

        // Check for key indexes
        var correlationIdIndex = indexes.FirstOrDefault(i =>
            i.Properties.Any(p => p.Name == nameof(AuditEventEntity.CorrelationId)));
        correlationIdIndex.Should().NotBeNull();

        var occurredAtIndex = indexes.FirstOrDefault(i =>
            i.Properties.Count == 1 && i.Properties.First().Name == nameof(AuditEventEntity.OccurredAt));
        occurredAtIndex.Should().NotBeNull();
    }

    private class TestConfigDbContext : DbContext
    {
        public TestConfigDbContext(DbContextOptions<TestConfigDbContext> options) : base(options)
        {
        }

        public DbSet<AuditEventEntity> AuditEvents { get; set; } = null!;

        protected override void OnModelCreating(ModelBuilder modelBuilder)
        {
            base.OnModelCreating(modelBuilder);
            modelBuilder.ApplyConfiguration(new AuditEventEntityTypeConfiguration());
        }
    }
}
