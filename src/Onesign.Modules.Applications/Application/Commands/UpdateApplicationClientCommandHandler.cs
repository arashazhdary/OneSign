using MediatR;
using Microsoft.EntityFrameworkCore;
using Onesign.Modules.Applications.Application.DTOs;
using Onesign.Modules.Applications.Domain.Repositories;
using Onesign.Modules.Applications.Infrastructure.EfCore.Entities;
using Onesign.Shared.Result;

namespace Onesign.Modules.Applications.Application.Commands;

public class UpdateApplicationClientCommandHandler : IRequestHandler<UpdateApplicationClientCommand, Result<ApplicationClientDto>>
{
    private readonly IApplicationClientRepository _applicationClientRepository;
    private readonly DbContext _dbContext;

    public UpdateApplicationClientCommandHandler(
        IApplicationClientRepository applicationClientRepository,
        DbContext dbContext)
    {
        _applicationClientRepository = applicationClientRepository;
        _dbContext = dbContext;
    }

    public async Task<Result<ApplicationClientDto>> Handle(UpdateApplicationClientCommand request, CancellationToken cancellationToken)
    {
        var application = await _applicationClientRepository.GetByIdAsync(request.ApplicationId, cancellationToken);
        if (application == null || application.TenantId != request.TenantId)
        {
            return Result.Failure<ApplicationClientDto>("APPLICATION_NOT_FOUND", "Application not found");
        }

        application.Name = request.Name;
        application.ApplicationType = request.ApplicationType;
        application.GrantType = request.GrantType;
        await _applicationClientRepository.UpdateAsync(application, cancellationToken);

        var redirectUris = await _dbContext.Set<ClientRedirectUriEntity>()
            .Where(x => x.ApplicationClientId == application.Id)
            .ToListAsync(cancellationToken);

        return Result.Success(new ApplicationClientDto
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
        });
    }
}

