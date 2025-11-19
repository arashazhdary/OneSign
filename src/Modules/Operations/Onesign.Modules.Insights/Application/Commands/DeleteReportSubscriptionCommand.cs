using MediatR;

namespace Onesign.Modules.Insights.Application.Commands;

public class DeleteReportSubscriptionCommand : IRequest<bool>
{
    public Guid Id { get; set; }
}
