using MediatR;
using Onesign.Modules.NotificationCenter.Application.DTOs;
using Onesign.Modules.NotificationCenter.Application.Queries;
using Onesign.Modules.NotificationCenter.Domain.Repositories;
using Onesign.Shared.Result;

namespace Onesign.Modules.NotificationCenter.Application.Handlers;

public class GetTemplatesQueryHandler : IRequestHandler<GetTemplatesQuery, Result<List<NotificationTemplateDto>>>
{
    private readonly INotificationTemplateRepository _repository;

    public GetTemplatesQueryHandler(INotificationTemplateRepository repository)
    {
        _repository = repository;
    }

    public async Task<Result<List<NotificationTemplateDto>>> Handle(GetTemplatesQuery request, CancellationToken cancellationToken)
    {
        var templates = await _repository.GetByTenantIdAsync(request.TenantId, cancellationToken);

        var dtos = templates.Select(t => new NotificationTemplateDto
        {
            Id = t.Id,
            TemplateKey = t.TemplateKey,
            Name = t.Name,
            Category = t.Category.ToString(),
            Channel = t.Channel.ToString(),
            Locale = t.Locale,
            SubjectTemplate = t.SubjectTemplate,
            BodyTemplate = t.BodyTemplate,
            IsEnabled = t.IsEnabled
        }).ToList();

        return Result.Success(dtos);
    }
}
