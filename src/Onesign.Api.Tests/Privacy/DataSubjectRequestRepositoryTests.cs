using FluentAssertions;
using Microsoft.EntityFrameworkCore;
using Onesign.Modules.Privacy.Domain.Entities;
using Onesign.Modules.Privacy.Domain.Enums;
using Onesign.Modules.Privacy.Infrastructure.EfCore.Entities;
using Onesign.Modules.Privacy.Infrastructure.EfCore.Repositories;
using Xunit;

namespace Onesign.Api.Tests.Privacy;

public class DataSubjectRequestRepositoryTests
{
    private DbContextOptions<TestPrivacyDbContext> CreateOptions()
    {
        return new DbContextOptionsBuilder<TestPrivacyDbContext>()
            .UseInMemoryDatabase(databaseName: Guid.NewGuid().ToString())
            .Options;
    }

    [Fact]
    public async Task GetByIdAsync_ExistingRequest_ReturnsRequest()
    {
        // Arrange
        var options = CreateOptions();
        var requestId = Guid.NewGuid();
        var tenantId = Guid.NewGuid();

        using (var context = new TestPrivacyDbContext(options))
        {
            context.DataSubjectRequests.Add(new DataSubjectRequestEntity
            {
                Id = requestId,
                TenantId = tenantId,
                SubjectId = Guid.NewGuid(),
                Type = (int)DataSubjectRequestType.Export,
                Status = (int)DataSubjectRequestStatus.Requested,
                RequestedAt = DateTime.UtcNow,
                RequestedBy = Guid.NewGuid()
            });
            await context.SaveChangesAsync();
        }

        // Act
        using (var context = new TestPrivacyDbContext(options))
        {
            var repository = new DataSubjectRequestRepository(context);
            var result = await repository.GetByIdAsync(requestId);

            // Assert
            result.Should().NotBeNull();
            result!.Id.Should().Be(requestId);
            result.TenantId.Should().Be(tenantId);
        }
    }

    [Fact]
    public async Task GetByIdAsync_NonExistentRequest_ReturnsNull()
    {
        // Arrange
        var options = CreateOptions();

        using var context = new TestPrivacyDbContext(options);
        var repository = new DataSubjectRequestRepository(context);

        // Act
        var result = await repository.GetByIdAsync(Guid.NewGuid());

        // Assert
        result.Should().BeNull();
    }

    [Fact]
    public async Task GetByTenantIdAsync_WithRequests_ReturnsOrderedByRequestedAtDesc()
    {
        // Arrange
        var options = CreateOptions();
        var tenantId = Guid.NewGuid();

        using (var context = new TestPrivacyDbContext(options))
        {
            context.DataSubjectRequests.AddRange(
                new DataSubjectRequestEntity
                {
                    Id = Guid.NewGuid(),
                    TenantId = tenantId,
                    SubjectId = Guid.NewGuid(),
                    Type = (int)DataSubjectRequestType.Export,
                    Status = (int)DataSubjectRequestStatus.Requested,
                    RequestedAt = DateTime.UtcNow.AddDays(-2),
                    RequestedBy = Guid.NewGuid()
                },
                new DataSubjectRequestEntity
                {
                    Id = Guid.NewGuid(),
                    TenantId = tenantId,
                    SubjectId = Guid.NewGuid(),
                    Type = (int)DataSubjectRequestType.Delete,
                    Status = (int)DataSubjectRequestStatus.Completed,
                    RequestedAt = DateTime.UtcNow,
                    RequestedBy = Guid.NewGuid()
                },
                new DataSubjectRequestEntity
                {
                    Id = Guid.NewGuid(),
                    TenantId = tenantId,
                    SubjectId = Guid.NewGuid(),
                    Type = (int)DataSubjectRequestType.Export,
                    Status = (int)DataSubjectRequestStatus.Processing,
                    RequestedAt = DateTime.UtcNow.AddDays(-1),
                    RequestedBy = Guid.NewGuid()
                }
            );
            await context.SaveChangesAsync();
        }

        // Act
        using (var context = new TestPrivacyDbContext(options))
        {
            var repository = new DataSubjectRequestRepository(context);
            var results = await repository.GetByTenantIdAsync(tenantId);

            // Assert
            results.Should().HaveCount(3);
            results[0].RequestedAt.Should().BeAfter(results[1].RequestedAt);
            results[1].RequestedAt.Should().BeAfter(results[2].RequestedAt);
        }
    }

    [Fact]
    public async Task GetByTenantIdAsync_DifferentTenant_ReturnsEmpty()
    {
        // Arrange
        var options = CreateOptions();
        var tenantId = Guid.NewGuid();

        using (var context = new TestPrivacyDbContext(options))
        {
            context.DataSubjectRequests.Add(new DataSubjectRequestEntity
            {
                Id = Guid.NewGuid(),
                TenantId = tenantId,
                SubjectId = Guid.NewGuid(),
                Type = (int)DataSubjectRequestType.Export,
                Status = (int)DataSubjectRequestStatus.Requested,
                RequestedAt = DateTime.UtcNow,
                RequestedBy = Guid.NewGuid()
            });
            await context.SaveChangesAsync();
        }

        // Act
        using (var context = new TestPrivacyDbContext(options))
        {
            var repository = new DataSubjectRequestRepository(context);
            var results = await repository.GetByTenantIdAsync(Guid.NewGuid());

            // Assert
            results.Should().BeEmpty();
        }
    }

    [Fact]
    public async Task GetBySubjectIdAsync_WithRequests_ReturnsOrderedByRequestedAtDesc()
    {
        // Arrange
        var options = CreateOptions();
        var subjectId = Guid.NewGuid();

        using (var context = new TestPrivacyDbContext(options))
        {
            context.DataSubjectRequests.AddRange(
                new DataSubjectRequestEntity
                {
                    Id = Guid.NewGuid(),
                    TenantId = Guid.NewGuid(),
                    SubjectId = subjectId,
                    Type = (int)DataSubjectRequestType.Export,
                    Status = (int)DataSubjectRequestStatus.Requested,
                    RequestedAt = DateTime.UtcNow.AddDays(-1),
                    RequestedBy = Guid.NewGuid()
                },
                new DataSubjectRequestEntity
                {
                    Id = Guid.NewGuid(),
                    TenantId = Guid.NewGuid(),
                    SubjectId = subjectId,
                    Type = (int)DataSubjectRequestType.Delete,
                    Status = (int)DataSubjectRequestStatus.Completed,
                    RequestedAt = DateTime.UtcNow,
                    RequestedBy = Guid.NewGuid()
                }
            );
            await context.SaveChangesAsync();
        }

        // Act
        using (var context = new TestPrivacyDbContext(options))
        {
            var repository = new DataSubjectRequestRepository(context);
            var results = await repository.GetBySubjectIdAsync(subjectId);

            // Assert
            results.Should().HaveCount(2);
            results[0].RequestedAt.Should().BeAfter(results[1].RequestedAt);
        }
    }

    [Fact]
    public async Task GetByStatusAsync_WithMatchingStatus_ReturnsFiltered()
    {
        // Arrange
        var options = CreateOptions();

        using (var context = new TestPrivacyDbContext(options))
        {
            context.DataSubjectRequests.AddRange(
                new DataSubjectRequestEntity
                {
                    Id = Guid.NewGuid(),
                    TenantId = Guid.NewGuid(),
                    SubjectId = Guid.NewGuid(),
                    Type = (int)DataSubjectRequestType.Export,
                    Status = (int)DataSubjectRequestStatus.Requested,
                    RequestedAt = DateTime.UtcNow,
                    RequestedBy = Guid.NewGuid()
                },
                new DataSubjectRequestEntity
                {
                    Id = Guid.NewGuid(),
                    TenantId = Guid.NewGuid(),
                    SubjectId = Guid.NewGuid(),
                    Type = (int)DataSubjectRequestType.Delete,
                    Status = (int)DataSubjectRequestStatus.Completed,
                    RequestedAt = DateTime.UtcNow,
                    RequestedBy = Guid.NewGuid()
                }
            );
            await context.SaveChangesAsync();
        }

        // Act
        using (var context = new TestPrivacyDbContext(options))
        {
            var repository = new DataSubjectRequestRepository(context);
            var results = await repository.GetByStatusAsync(DataSubjectRequestStatus.Requested);

            // Assert
            results.Should().HaveCount(1);
            results[0].Status.Should().Be(DataSubjectRequestStatus.Requested);
        }
    }

    [Fact]
    public async Task GetByTypeAsync_WithMatchingType_ReturnsFiltered()
    {
        // Arrange
        var options = CreateOptions();

        using (var context = new TestPrivacyDbContext(options))
        {
            context.DataSubjectRequests.AddRange(
                new DataSubjectRequestEntity
                {
                    Id = Guid.NewGuid(),
                    TenantId = Guid.NewGuid(),
                    SubjectId = Guid.NewGuid(),
                    Type = (int)DataSubjectRequestType.Export,
                    Status = (int)DataSubjectRequestStatus.Requested,
                    RequestedAt = DateTime.UtcNow,
                    RequestedBy = Guid.NewGuid()
                },
                new DataSubjectRequestEntity
                {
                    Id = Guid.NewGuid(),
                    TenantId = Guid.NewGuid(),
                    SubjectId = Guid.NewGuid(),
                    Type = (int)DataSubjectRequestType.Delete,
                    Status = (int)DataSubjectRequestStatus.Completed,
                    RequestedAt = DateTime.UtcNow,
                    RequestedBy = Guid.NewGuid()
                }
            );
            await context.SaveChangesAsync();
        }

        // Act
        using (var context = new TestPrivacyDbContext(options))
        {
            var repository = new DataSubjectRequestRepository(context);
            var results = await repository.GetByTypeAsync(DataSubjectRequestType.Delete);

            // Assert
            results.Should().HaveCount(1);
            results[0].Type.Should().Be(DataSubjectRequestType.Delete);
        }
    }

    [Fact]
    public async Task GetPendingAsync_ReturnsPendingStatuses()
    {
        // Arrange
        var options = CreateOptions();

        using (var context = new TestPrivacyDbContext(options))
        {
            context.DataSubjectRequests.AddRange(
                new DataSubjectRequestEntity
                {
                    Id = Guid.NewGuid(),
                    TenantId = Guid.NewGuid(),
                    SubjectId = Guid.NewGuid(),
                    Type = (int)DataSubjectRequestType.Export,
                    Status = (int)DataSubjectRequestStatus.Requested,
                    RequestedAt = DateTime.UtcNow.AddDays(-3),
                    RequestedBy = Guid.NewGuid()
                },
                new DataSubjectRequestEntity
                {
                    Id = Guid.NewGuid(),
                    TenantId = Guid.NewGuid(),
                    SubjectId = Guid.NewGuid(),
                    Type = (int)DataSubjectRequestType.Export,
                    Status = (int)DataSubjectRequestStatus.InReview,
                    RequestedAt = DateTime.UtcNow.AddDays(-2),
                    RequestedBy = Guid.NewGuid()
                },
                new DataSubjectRequestEntity
                {
                    Id = Guid.NewGuid(),
                    TenantId = Guid.NewGuid(),
                    SubjectId = Guid.NewGuid(),
                    Type = (int)DataSubjectRequestType.Delete,
                    Status = (int)DataSubjectRequestStatus.Approved,
                    RequestedAt = DateTime.UtcNow.AddDays(-1),
                    RequestedBy = Guid.NewGuid()
                },
                new DataSubjectRequestEntity
                {
                    Id = Guid.NewGuid(),
                    TenantId = Guid.NewGuid(),
                    SubjectId = Guid.NewGuid(),
                    Type = (int)DataSubjectRequestType.Export,
                    Status = (int)DataSubjectRequestStatus.Processing,
                    RequestedAt = DateTime.UtcNow,
                    RequestedBy = Guid.NewGuid()
                },
                new DataSubjectRequestEntity
                {
                    Id = Guid.NewGuid(),
                    TenantId = Guid.NewGuid(),
                    SubjectId = Guid.NewGuid(),
                    Type = (int)DataSubjectRequestType.Delete,
                    Status = (int)DataSubjectRequestStatus.Completed,
                    RequestedAt = DateTime.UtcNow,
                    RequestedBy = Guid.NewGuid()
                },
                new DataSubjectRequestEntity
                {
                    Id = Guid.NewGuid(),
                    TenantId = Guid.NewGuid(),
                    SubjectId = Guid.NewGuid(),
                    Type = (int)DataSubjectRequestType.Export,
                    Status = (int)DataSubjectRequestStatus.Rejected,
                    RequestedAt = DateTime.UtcNow,
                    RequestedBy = Guid.NewGuid()
                }
            );
            await context.SaveChangesAsync();
        }

        // Act
        using (var context = new TestPrivacyDbContext(options))
        {
            var repository = new DataSubjectRequestRepository(context);
            var results = await repository.GetPendingAsync();

            // Assert
            results.Should().HaveCount(4);
            results.All(r => r.Status == DataSubjectRequestStatus.Requested ||
                            r.Status == DataSubjectRequestStatus.InReview ||
                            r.Status == DataSubjectRequestStatus.Approved ||
                            r.Status == DataSubjectRequestStatus.Processing)
                .Should().BeTrue();
        }
    }

    [Fact]
    public async Task AddAsync_ValidRequest_SavesSuccessfully()
    {
        // Arrange
        var options = CreateOptions();
        var request = new DataSubjectRequest
        {
            Id = Guid.NewGuid(),
            TenantId = Guid.NewGuid(),
            SubjectId = Guid.NewGuid(),
            Type = DataSubjectRequestType.Export,
            Status = DataSubjectRequestStatus.Requested,
            RequestedAt = DateTime.UtcNow,
            RequestedBy = Guid.NewGuid(),
            Reason = "Test reason"
        };

        // Act
        using (var context = new TestPrivacyDbContext(options))
        {
            var repository = new DataSubjectRequestRepository(context);
            await repository.AddAsync(request);
        }

        // Assert
        using (var context = new TestPrivacyDbContext(options))
        {
            var saved = await context.DataSubjectRequests.FirstOrDefaultAsync(x => x.Id == request.Id);
            saved.Should().NotBeNull();
            saved!.Reason.Should().Be("Test reason");
        }
    }

    [Fact]
    public async Task UpdateAsync_ExistingRequest_UpdatesSuccessfully()
    {
        // Arrange
        var options = CreateOptions();
        var requestId = Guid.NewGuid();

        using (var context = new TestPrivacyDbContext(options))
        {
            context.DataSubjectRequests.Add(new DataSubjectRequestEntity
            {
                Id = requestId,
                TenantId = Guid.NewGuid(),
                SubjectId = Guid.NewGuid(),
                Type = (int)DataSubjectRequestType.Export,
                Status = (int)DataSubjectRequestStatus.Requested,
                RequestedAt = DateTime.UtcNow,
                RequestedBy = Guid.NewGuid()
            });
            await context.SaveChangesAsync();
        }

        var updatedRequest = new DataSubjectRequest
        {
            Id = requestId,
            Status = DataSubjectRequestStatus.Completed,
            CompletedAt = DateTime.UtcNow,
            ResultLocation = "/exports/data.zip",
            Reason = "Updated reason"
        };

        // Act
        using (var context = new TestPrivacyDbContext(options))
        {
            var repository = new DataSubjectRequestRepository(context);
            await repository.UpdateAsync(updatedRequest);
        }

        // Assert
        using (var context = new TestPrivacyDbContext(options))
        {
            var saved = await context.DataSubjectRequests.FirstOrDefaultAsync(x => x.Id == requestId);
            saved.Should().NotBeNull();
            saved!.Status.Should().Be((int)DataSubjectRequestStatus.Completed);
            saved.ResultLocation.Should().Be("/exports/data.zip");
            saved.Reason.Should().Be("Updated reason");
        }
    }

    [Fact]
    public async Task UpdateAsync_NonExistentRequest_DoesNothing()
    {
        // Arrange
        var options = CreateOptions();
        var request = new DataSubjectRequest
        {
            Id = Guid.NewGuid(),
            Status = DataSubjectRequestStatus.Completed
        };

        // Act & Assert - Should not throw
        using var context = new TestPrivacyDbContext(options);
        var repository = new DataSubjectRequestRepository(context);
        await repository.UpdateAsync(request);
    }

    [Fact]
    public async Task DeleteAsync_ExistingRequest_RemovesSuccessfully()
    {
        // Arrange
        var options = CreateOptions();
        var requestId = Guid.NewGuid();

        using (var context = new TestPrivacyDbContext(options))
        {
            context.DataSubjectRequests.Add(new DataSubjectRequestEntity
            {
                Id = requestId,
                TenantId = Guid.NewGuid(),
                SubjectId = Guid.NewGuid(),
                Type = (int)DataSubjectRequestType.Export,
                Status = (int)DataSubjectRequestStatus.Requested,
                RequestedAt = DateTime.UtcNow,
                RequestedBy = Guid.NewGuid()
            });
            await context.SaveChangesAsync();
        }

        // Act
        using (var context = new TestPrivacyDbContext(options))
        {
            var repository = new DataSubjectRequestRepository(context);
            await repository.DeleteAsync(requestId);
        }

        // Assert
        using (var context = new TestPrivacyDbContext(options))
        {
            var deleted = await context.DataSubjectRequests.FirstOrDefaultAsync(x => x.Id == requestId);
            deleted.Should().BeNull();
        }
    }

    [Fact]
    public async Task DeleteAsync_NonExistentRequest_DoesNothing()
    {
        // Arrange
        var options = CreateOptions();

        // Act & Assert - Should not throw
        using var context = new TestPrivacyDbContext(options);
        var repository = new DataSubjectRequestRepository(context);
        await repository.DeleteAsync(Guid.NewGuid());
    }

    [Fact]
    public async Task GetPendingAsync_OrderedByRequestedAtAsc()
    {
        // Arrange
        var options = CreateOptions();

        using (var context = new TestPrivacyDbContext(options))
        {
            context.DataSubjectRequests.AddRange(
                new DataSubjectRequestEntity
                {
                    Id = Guid.NewGuid(),
                    TenantId = Guid.NewGuid(),
                    SubjectId = Guid.NewGuid(),
                    Type = (int)DataSubjectRequestType.Export,
                    Status = (int)DataSubjectRequestStatus.Requested,
                    RequestedAt = DateTime.UtcNow,
                    RequestedBy = Guid.NewGuid()
                },
                new DataSubjectRequestEntity
                {
                    Id = Guid.NewGuid(),
                    TenantId = Guid.NewGuid(),
                    SubjectId = Guid.NewGuid(),
                    Type = (int)DataSubjectRequestType.Export,
                    Status = (int)DataSubjectRequestStatus.Requested,
                    RequestedAt = DateTime.UtcNow.AddDays(-1),
                    RequestedBy = Guid.NewGuid()
                }
            );
            await context.SaveChangesAsync();
        }

        // Act
        using (var context = new TestPrivacyDbContext(options))
        {
            var repository = new DataSubjectRequestRepository(context);
            var results = await repository.GetPendingAsync();

            // Assert
            results[0].RequestedAt.Should().BeBefore(results[1].RequestedAt);
        }
    }
}

// Test DbContext for Privacy
public class TestPrivacyDbContext : DbContext
{
    public TestPrivacyDbContext(DbContextOptions<TestPrivacyDbContext> options) : base(options)
    {
    }

    public DbSet<DataSubjectRequestEntity> DataSubjectRequests { get; set; } = null!;
    public DbSet<DataRetentionPolicyEntity> DataRetentionPolicies { get; set; } = null!;
}
