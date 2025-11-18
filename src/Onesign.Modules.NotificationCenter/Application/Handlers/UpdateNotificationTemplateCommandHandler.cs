using MediatR;
using Onesign.Modules.NotificationCenter.Application.Commands;
using Onesign.Modules.NotificationCenter.Application.DTOs;
using Onesign.Modules.NotificationCenter.Domain.Repositories;
using Onesign.Shared.Result;

namespace Onesign.Modules.NotificationCenter.Application.Handlers;

public class UpdateNotificationTemplateCommandHandler : IRequestHandler<UpdateNotificationTemplateCommand, Result<NotificationTemplateDto>>
{
    private readonly INotificationTemplateRepository _repository;

    public UpdateNotificationTemplateCommandHandler(INotificationTemplateRepository repository)
    {
        _repository = repository;
    }

    public async Task<Result<NotificationTemplateDto>> Handle(UpdateNotificationTemplateCommand request, CancellationToken cancellationToken)
    {
        var template = await _repository.GetByIdAsync(request.TemplateId, cancellationToken);
        if (template == null || template.TenantId != request.TenantId)
            return Result.Failure<NotificationTemplateDto>("NotFound", "Notification template not found");

        if (request.Name != null)
            template.Name = request.Name;
        if (request.SubjectTemplate != null)
            template.SubjectTemplate = request.SubjectTemplate;
        if (request.BodyTemplate != null)
            template.BodyTemplate = request.BodyTemplate;
        if (request.IsEnabled.HasValue)
            template.IsEnabled = request.IsEnabled.Value;

        template.UpdatedAt = DateTime.UtcNow;

        await _repository.UpdateAsync(template, cancellationToken);

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
