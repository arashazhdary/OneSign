using MediatR;
using Onesign.Modules.Privacy.Application.DTOs;
using Onesign.Modules.Privacy.Domain.Entities;
using Onesign.Modules.Privacy.Domain.Enums;
using Onesign.Shared.Result;

namespace Onesign.Modules.Privacy.Application.Commands;

public class CreateDataSubjectRequestCommand : IRequest<Result<DataSubjectRequestDto>>
{
    public Guid TenantId { get; set; }
    public Guid SubjectId { get; set; }
    public DataSubjectRequestType Type { get; set; }
    public Guid RequestedBy { get; set; }
    public string? Reason { get; set; }
}

public class CreateDataSubjectRequestCommandHandler : IRequestHandler<CreateDataSubjectRequestCommand, Result<DataSubjectRequestDto>>
{
    public Task<Result<DataSubjectRequestDto>> Handle(CreateDataSubjectRequestCommand request, CancellationToken cancellationToken)
    {
        var dataSubjectRequest = new DataSubjectRequest
        {
            Id = Guid.NewGuid(),
            TenantId = request.TenantId,
            SubjectId = request.SubjectId,
            Type = request.Type,
            Status = DataSubjectRequestStatus.Requested,
            RequestedAt = DateTime.UtcNow,
            RequestedBy = request.RequestedBy,
            Reason = request.Reason
        };

        var dto = new DataSubjectRequestDto
        {
            Id = dataSubjectRequest.Id,
            TenantId = dataSubjectRequest.TenantId,
            SubjectId = dataSubjectRequest.SubjectId,
            Type = dataSubjectRequest.Type.ToString(),
            Status = dataSubjectRequest.Status.ToString(),
            RequestedAt = dataSubjectRequest.RequestedAt,
            RequestedBy = dataSubjectRequest.RequestedBy,
            Reason = dataSubjectRequest.Reason
        };

        return Task.FromResult(Result.Success(dto));
    }
}
