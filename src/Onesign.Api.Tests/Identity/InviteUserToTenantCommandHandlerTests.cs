using MediatR;
using Microsoft.EntityFrameworkCore;
using Moq;
using Onesign.Data.Contexts;
using Onesign.Modules.Audit.Application.Commands;
using Onesign.Modules.Identity.Application.Commands;
using Onesign.Modules.Identity.Domain.Entities;
using Onesign.Modules.Identity.Domain.Enums;
using Onesign.Modules.Identity.Domain.Repositories;
using Onesign.Modules.Identity.Infrastructure.EfCore.Repositories;
using Onesign.Shared.Result;
using Xunit;

namespace Onesign.Api.Tests.Identity;

public class InviteUserToTenantCommandHandlerTests
{
    [Fact]
    public async Task Handle_NewUser_CreatesUserAndTenantUser()
    {
        // Arrange
        var options = new DbContextOptionsBuilder<OnesignDbContext>()
            .UseInMemoryDatabase(databaseName: Guid.NewGuid().ToString())
            .Options;

        using var context = new OnesignDbContext(options);
        var globalUserRepository = new GlobalUserRepository(context);
        var tenantUserRepository = new TenantUserRepository(context);
        var mediator = new Moq.Mock<IMediator>();
        mediator.Setup(m => m.Send(It.IsAny<AppendAuditEventCommand>(), It.IsAny<CancellationToken>()))
            .ReturnsAsync(Result.Success(new Onesign.Modules.Audit.Application.DTOs.AuditEventDto()));

        var tenantId = Guid.NewGuid();
        var handler = new InviteUserToTenantCommandHandler(globalUserRepository, tenantUserRepository, mediator.Object);

        var command = new InviteUserToTenantCommand
        {
            TenantId = tenantId,
            Email = "test@example.com",
            IsAdmin = false
        };

        // Act
        var result = await handler.Handle(command, CancellationToken.None);

        // Assert
        Assert.True(result.IsSuccess);
        Assert.NotNull(result.Value);
        Assert.Equal("test@example.com", result.Value.Email);
        Assert.Equal(TenantUserStatus.Invited, result.Value.Status);
        Assert.False(result.Value.IsAdmin);

        // Verify GlobalUser was created
        var globalUser = await globalUserRepository.GetByEmailAsync("test@example.com", CancellationToken.None);
        Assert.NotNull(globalUser);
        Assert.Equal("test@example.com", globalUser.Email);

        // Verify TenantUser was created
        var tenantUser = await tenantUserRepository.GetByGlobalUserIdAndTenantIdAsync(globalUser.Id, tenantId, CancellationToken.None);
        Assert.NotNull(tenantUser);
        Assert.Equal(TenantUserStatus.Invited, tenantUser.Status);

        // Verify audit log was called
        mediator.Verify(m => m.Send(It.IsAny<AppendAuditEventCommand>(), It.IsAny<CancellationToken>()), Times.Once);
    }

    [Fact]
    public async Task Handle_ExistingUserInTenant_ReturnsFailure()
    {
        // Arrange
        var options = new DbContextOptionsBuilder<OnesignDbContext>()
            .UseInMemoryDatabase(databaseName: Guid.NewGuid().ToString())
            .Options;

        using var context = new OnesignDbContext(options);
        var globalUserRepository = new GlobalUserRepository(context);
        var tenantUserRepository = new TenantUserRepository(context);
        var mediator = new Moq.Mock<IMediator>();

        var tenantId = Guid.NewGuid();

        // Create existing user
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
            TenantId = tenantId,
            Status = TenantUserStatus.Active,
            CreatedAt = DateTime.UtcNow
        };
        await tenantUserRepository.AddAsync(tenantUser, CancellationToken.None);

        var handler = new InviteUserToTenantCommandHandler(globalUserRepository, tenantUserRepository, mediator.Object);

        var command = new InviteUserToTenantCommand
        {
            TenantId = tenantId,
            Email = "test@example.com",
            IsAdmin = false
        };

        // Act
        var result = await handler.Handle(command, CancellationToken.None);

        // Assert
        Assert.True(result.IsFailure);
        Assert.Equal("USER_ALREADY_IN_TENANT", result.ErrorCode);
    }
}

