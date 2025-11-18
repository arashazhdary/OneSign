using MediatR;
using Onesign.Modules.NotificationCenter.Application.Commands;
using Onesign.Modules.NotificationCenter.Application.DTOs;
using Onesign.Modules.NotificationCenter.Domain.Entities;
using Onesign.Modules.NotificationCenter.Domain.Enums;
using Onesign.Modules.NotificationCenter.Domain.Repositories;
using Onesign.Shared.Result;

namespace Onesign.Modules.NotificationCenter.Application.Handlers;

public class CreateTemplateCommandHandler : IRequestHandler<CreateTemplateCommand, Result<NotificationTemplateDto>>
{
    private readonly INotificationTemplateRepository _repository;

    public CreateTemplateCommandHandler(INotificationTemplateRepository repository)
    {
        _repository = repository;
    }

    public async Task<Result<NotificationTemplateDto>> Handle(CreateTemplateCommand request, CancellationToken cancellationToken)
    {
        if (!Enum.TryParse<TemplateCategory>(request.Category, true, out var category))
            return Result.Failure<NotificationTemplateDto>("Invalid category");

        if (!Enum.TryParse<NotificationChannel>(request.Channel, true, out var channel))
            return Result.Failure<NotificationTemplateDto>("Invalid channel");

        var template = new NotificationTemplate
        {
            Id = Guid.NewGuid(),
            TenantId = request.TenantId,
            TemplateKey = request.TemplateKey,
            Name = request.Name,
            Category = category,
            Channel = channel,
            Locale = request.Locale,
            SubjectTemplate = request.SubjectTemplate,
            BodyTemplate = request.BodyTemplate,
            IsEnabled = true,
            CreatedAt = DateTime.UtcNow
        };

        await _repository.AddAsync(template, cancellationToken);

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
