using MediatR;
using Onesign.Modules.NotificationCenter.Application.DTOs;
using Onesign.Modules.NotificationCenter.Application.Queries;
using Onesign.Modules.NotificationCenter.Domain.Repositories;
using Onesign.Shared.Result;

namespace Onesign.Modules.NotificationCenter.Application.Handlers;

public class GetNotificationTemplateDetailsQueryHandler : IRequestHandler<GetNotificationTemplateDetailsQuery, Result<NotificationTemplateDto>>
{
    private readonly INotificationTemplateRepository _repository;

    public GetNotificationTemplateDetailsQueryHandler(INotificationTemplateRepository repository)
    {
        _repository = repository;
    }

    public async Task<Result<NotificationTemplateDto>> Handle(GetNotificationTemplateDetailsQuery request, CancellationToken cancellationToken)
    {
        var template = await _repository.GetByIdAsync(request.TemplateId, cancellationToken);
        if (template == null || template.TenantId != request.TenantId)
            return Result.Failure<NotificationTemplateDto>("NotFound", "Template not found");

        var dto = new NotificationTemplateDto
        {
            Id = template.Id,
            TemplateKey = template.TemplateKey,
            Name = template.Name,
            Category = template.Category.ToString(),
            Channel = template.Channel.ToString(),
            Locale = template.Locale,
            SubjectTemplate = template.SubjectTemplate,
            BodyTemplate = template.BodyTemplate,
            IsEnabled = template.IsEnabled
        };

        return Result.Success(dto);
    }
}
