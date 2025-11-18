using MediatR;
using Onesign.Modules.Privacy.Application.DTOs;
using Onesign.Modules.Privacy.Domain.Enums;
using Onesign.Shared.Result;

namespace Onesign.Modules.Privacy.Application.Queries;

public class GetDataSubjectRequestsQuery : IRequest<Result<List<DataSubjectRequestDto>>>
{
    public Guid TenantId { get; set; }
    public Guid? SubjectId { get; set; }
    public DataSubjectRequestStatus? Status { get; set; }
    public DataSubjectRequestType? Type { get; set; }
}

public class GetDataSubjectRequestsQueryHandler : IRequestHandler<GetDataSubjectRequestsQuery, Result<List<DataSubjectRequestDto>>>
{
    public Task<Result<List<DataSubjectRequestDto>>> Handle(GetDataSubjectRequestsQuery request, CancellationToken cancellationToken)
    {
        // In a real implementation, this would query the database
        // and filter by the provided criteria
        var dtos = new List<DataSubjectRequestDto>();

        return Task.FromResult(Result.Success(dtos));
    }
}
