using MediatR;
using Microsoft.EntityFrameworkCore;
using Moq;
using Onesign.Data.Contexts;
using Onesign.Modules.Identity.Application.Commands;
using Onesign.Modules.Identity.Domain.Entities;
using Onesign.Modules.Identity.Domain.Enums;
using Onesign.Modules.Identity.Domain.Repositories;
using Onesign.Modules.Identity.Domain.Services;
using Onesign.Modules.Identity.Infrastructure.EfCore.Repositories;
using Onesign.Modules.Identity.Infrastructure.Security;
using Microsoft.Extensions.Configuration;
using Xunit;

namespace Onesign.Api.Tests.Identity;

public class CompleteFirstLoginCommandHandlerTests
{
    [Fact]
    public async Task Handle_ValidRequest_ActivatesUserAndSetsPassword()
    {
        // Arrange
        var options = new DbContextOptionsBuilder<OnesignDbContext>()
            .UseInMemoryDatabase(databaseName: Guid.NewGuid().ToString())
            .Options;

        using var context = new OnesignDbContext(options);
        var tenantUserRepository = new TenantUserRepository(context);
        var globalUserRepository = new GlobalUserRepository(context);
        var passwordHasher = new PasswordHasher();

        // Create invited user
        var globalUser = new GlobalUser
        {
            Id = Guid.NewGuid(),
            Email = "test@example.com",
            EmailVerified = false,
            CreatedAt = DateTime.UtcNow
        };
        await globalUserRepository.AddAsync(globalUser, CancellationToken.None);

        var tenantUser = new TenantUser
        {
            Id = Guid.NewGuid(),
            GlobalUserId = globalUser.Id,
            TenantId = Guid.NewGuid(),
            Status = TenantUserStatus.Invited,
            CreatedAt = DateTime.UtcNow
        };
        await tenantUserRepository.AddAsync(tenantUser, CancellationToken.None);

        var handler = new CompleteFirstLoginCommandHandler(tenantUserRepository, globalUserRepository, passwordHasher);

        var command = new CompleteFirstLoginCommand
        {
            TenantUserId = tenantUser.Id,
            Password = "SecurePassword123!"
        };

        // Act
        var result = await handler.Handle(command, CancellationToken.None);

        // Assert
        Assert.True(result.IsSuccess);
        Assert.NotNull(result.Value);
        Assert.Equal(TenantUserStatus.Active, result.Value.Status);

        // Verify user was activated
        var updatedTenantUser = await tenantUserRepository.GetByIdAsync(tenantUser.Id, CancellationToken.None);
        Assert.NotNull(updatedTenantUser);
        Assert.Equal(TenantUserStatus.Active, updatedTenantUser.Status);
        
        // Verify password was set on GlobalUser
        var updatedGlobalUser = await globalUserRepository.GetByIdAsync(globalUser.Id, CancellationToken.None);
        Assert.NotNull(updatedGlobalUser);
        Assert.NotNull(updatedGlobalUser.PasswordHash);
    }

    [Fact]
    public async Task Handle_UserNotFound_ReturnsFailure()
    {
        // Arrange
        var options = new DbContextOptionsBuilder<OnesignDbContext>()
            .UseInMemoryDatabase(databaseName: Guid.NewGuid().ToString())
            .Options;

        using var context = new OnesignDbContext(options);
        var tenantUserRepository = new TenantUserRepository(context);
        var globalUserRepository = new GlobalUserRepository(context);
        var passwordHasher = new PasswordHasher();

        var handler = new CompleteFirstLoginCommandHandler(tenantUserRepository, globalUserRepository, passwordHasher);

        var command = new CompleteFirstLoginCommand
        {
            TenantUserId = Guid.NewGuid(), // Non-existent user
            Password = "SecurePassword123!"
        };

        // Act
        var result = await handler.Handle(command, CancellationToken.None);

        // Assert
        Assert.True(result.IsFailure);
        Assert.Equal("USER_NOT_FOUND", result.ErrorCode);
    }
}

