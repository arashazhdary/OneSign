using MediatR;
using Microsoft.EntityFrameworkCore;
using Onesign.Modules.Applications.Application.DTOs;
using Onesign.Modules.Applications.Domain.Repositories;
using Onesign.Modules.Applications.Infrastructure.EfCore.Entities;

namespace Onesign.Modules.Applications.Application.Queries;

public class GetApplicationDetailsQueryHandler : IRequestHandler<GetApplicationDetailsQuery, ApplicationClientDto?>
{
    private readonly IApplicationClientRepository _applicationClientRepository;
    private readonly DbContext _dbContext;

    public GetApplicationDetailsQueryHandler(
        IApplicationClientRepository applicationClientRepository,
        DbContext dbContext)
    {
        _applicationClientRepository = applicationClientRepository;
        _dbContext = dbContext;
    }

    public async Task<ApplicationClientDto?> Handle(GetApplicationDetailsQuery request, CancellationToken cancellationToken)
    {
        var application = await _applicationClientRepository.GetByIdAsync(request.ApplicationId, cancellationToken);
        if (application == null || application.TenantId != request.TenantId)
        {
            return null;
        }

        var redirectUris = await _dbContext.Set<ClientRedirectUriEntity>()
            .Where(x => x.ApplicationClientId == application.Id)
            .ToListAsync(cancellationToken);

        return new ApplicationClientDto
        {
            Id = application.Id,
            TenantId = application.TenantId,
            ClientId = application.ClientId,
            Name = application.Name,
            ApplicationType = application.ApplicationType,
            GrantType = application.GrantType,
            RedirectUris = redirectUris.Select(x => new RedirectUriDto
            {
                Id = x.Id,
                Uri = x.Uri
            }).ToList(),
            CreatedAt = application.CreatedAt,
            UpdatedAt = application.UpdatedAt
        };
    }
}

