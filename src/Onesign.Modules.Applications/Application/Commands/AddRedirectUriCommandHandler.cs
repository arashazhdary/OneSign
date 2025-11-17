using MediatR;
using Microsoft.EntityFrameworkCore;
using Onesign.Modules.Applications.Application.DTOs;
using Onesign.Modules.Applications.Domain.Repositories;
using Onesign.Modules.Applications.Infrastructure.EfCore.Entities;
using Onesign.Shared.Result;

namespace Onesign.Modules.Applications.Application.Commands;

public class AddRedirectUriCommandHandler : IRequestHandler<AddRedirectUriCommand, Result<RedirectUriDto>>
{
    private readonly IApplicationClientRepository _applicationClientRepository;
    private readonly DbContext _dbContext;

    public AddRedirectUriCommandHandler(
        IApplicationClientRepository applicationClientRepository,
        DbContext dbContext)
    {
        _applicationClientRepository = applicationClientRepository;
        _dbContext = dbContext;
    }

    public async Task<Result<RedirectUriDto>> Handle(AddRedirectUriCommand request, CancellationToken cancellationToken)
    {
        var application = await _applicationClientRepository.GetByIdAsync(request.ApplicationId, cancellationToken);
        if (application == null || application.TenantId != request.TenantId)
        {
            return Result.Failure<RedirectUriDto>("APPLICATION_NOT_FOUND", "Application not found");
        }

        if (!request.Uri.StartsWith("http://") && !request.Uri.StartsWith("https://"))
        {
            return Result.Failure<RedirectUriDto>("INVALID_URI", "Redirect URI must start with http:// or https://");
        }

        var redirectUri = new ClientRedirectUriEntity
        {
            Id = Guid.NewGuid(),
            ApplicationClientId = request.ApplicationId,
            Uri = request.Uri,
            CreatedAt = DateTime.UtcNow
        };

        await _dbContext.Set<ClientRedirectUriEntity>().AddAsync(redirectUri, cancellationToken);
        await _dbContext.SaveChangesAsync(cancellationToken);

        return Result.Success(new RedirectUriDto
        {
            Id = redirectUri.Id,
            Uri = redirectUri.Uri
        });
    }
}

