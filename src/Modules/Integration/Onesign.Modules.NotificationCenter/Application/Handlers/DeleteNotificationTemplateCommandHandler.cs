using MediatR;
using Onesign.Modules.NotificationCenter.Application.Commands;
using Onesign.Modules.NotificationCenter.Domain.Repositories;
using Onesign.Shared.Result;

namespace Onesign.Modules.NotificationCenter.Application.Handlers;

public class DeleteNotificationTemplateCommandHandler : IRequestHandler<DeleteNotificationTemplateCommand, Result>
{
    private readonly INotificationTemplateRepository _repository;

    public DeleteNotificationTemplateCommandHandler(INotificationTemplateRepository repository)
    {
        _repository = repository;
    }

    public async Task<Result> Handle(DeleteNotificationTemplateCommand request, CancellationToken cancellationToken)
    {
        var template = await _repository.GetByIdAsync(request.TemplateId, cancellationToken);
        if (template == null || template.TenantId != request.TenantId)
            return Result.Failure("NotFound", "Notification template not found");

        await _repository.DeleteAsync(request.TemplateId, cancellationToken);
        return Result.Success();
    }
}
