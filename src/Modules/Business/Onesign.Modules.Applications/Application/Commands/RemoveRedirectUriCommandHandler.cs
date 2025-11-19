using MediatR;
using Microsoft.EntityFrameworkCore;
using Onesign.Modules.Applications.Infrastructure.EfCore.Entities;
using Onesign.Shared.Result;

namespace Onesign.Modules.Applications.Application.Commands;

public class RemoveRedirectUriCommandHandler : IRequestHandler<RemoveRedirectUriCommand, Result<bool>>
{
    private readonly DbContext _dbContext;

    public RemoveRedirectUriCommandHandler(DbContext dbContext)
    {
        _dbContext = dbContext;
    }

    public async Task<Result<bool>> Handle(RemoveRedirectUriCommand request, CancellationToken cancellationToken)
    {
        var redirectUri = await _dbContext.Set<ClientRedirectUriEntity>()
            .FirstOrDefaultAsync(x => x.Id == request.RedirectUriId, cancellationToken);

        if (redirectUri == null)
        {
            return Result.Failure<bool>("REDIRECT_URI_NOT_FOUND", "Redirect URI not found");
        }

        // Verify tenant ownership through application
        var application = await _dbContext.Set<ApplicationClientEntity>()
            .FirstOrDefaultAsync(x => x.Id == redirectUri.ApplicationClientId, cancellationToken);

        if (application == null || application.TenantId != request.TenantId)
        {
            return Result.Failure<bool>("REDIRECT_URI_NOT_FOUND", "Redirect URI not found");
        }

        _dbContext.Set<ClientRedirectUriEntity>().Remove(redirectUri);
        await _dbContext.SaveChangesAsync(cancellationToken);

        return Result.Success(true);
    }
}

