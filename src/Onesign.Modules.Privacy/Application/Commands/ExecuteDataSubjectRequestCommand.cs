using MediatR;
using Microsoft.Extensions.Logging;
using Onesign.Modules.Privacy.Application.DTOs;
using Onesign.Modules.Privacy.Domain.Enums;
using Onesign.Modules.Privacy.Domain.Repositories;
using Onesign.Modules.Privacy.Domain.Services;
using Onesign.Shared.Result;

namespace Onesign.Modules.Privacy.Application.Commands;

public class ExecuteDataSubjectRequestCommand : IRequest<Result<DataSubjectRequestDto>>
{
    public Guid RequestId { get; set; }
}

public class ExecuteDataSubjectRequestCommandHandler : IRequestHandler<ExecuteDataSubjectRequestCommand, Result<DataSubjectRequestDto>>
{
    private readonly IDataSubjectRequestRepository _requestRepository;
    private readonly IDataSubjectRequestProcessor _requestProcessor;
    private readonly ILogger<ExecuteDataSubjectRequestCommandHandler> _logger;

    public ExecuteDataSubjectRequestCommandHandler(
        IDataSubjectRequestRepository requestRepository,
        IDataSubjectRequestProcessor requestProcessor,
        ILogger<ExecuteDataSubjectRequestCommandHandler> logger)
    {
        _requestRepository = requestRepository;
        _requestProcessor = requestProcessor;
        _logger = logger;
    }

    public async Task<Result<DataSubjectRequestDto>> Handle(ExecuteDataSubjectRequestCommand request, CancellationToken cancellationToken)
    {
        try
        {
            var dsrRequest = await _requestRepository.GetByIdAsync(request.RequestId, cancellationToken);
            if (dsrRequest == null)
            {
                return Result.Failure<DataSubjectRequestDto>("REQUEST_NOT_FOUND", "Data subject request not found");
            }

            _logger.LogInformation("Executing DSR {RequestId} of type {Type} for subject {SubjectId}",
                request.RequestId, dsrRequest.Type, dsrRequest.SubjectId);

            var result = await _requestProcessor.ProcessRequestAsync(request.RequestId, cancellationToken);

            if (!result.Success)
            {
                return Result.Failure<DataSubjectRequestDto>("PROCESSING_FAILED", result.ErrorMessage ?? "Failed to process request");
            }

            var updatedRequest = await _requestRepository.GetByIdAsync(request.RequestId, cancellationToken);

            var dto = new DataSubjectRequestDto
            {
                Id = updatedRequest!.Id,
                TenantId = updatedRequest.TenantId,
                SubjectId = updatedRequest.SubjectId,
                Type = updatedRequest.Type.ToString(),
                Status = updatedRequest.Status.ToString(),
                RequestedAt = updatedRequest.RequestedAt,
                RequestedBy = updatedRequest.RequestedBy,
                CompletedAt = updatedRequest.CompletedAt,
                ResultUrl = updatedRequest.ResultUrl,
                Reason = updatedRequest.Reason
            };

            _logger.LogInformation("DSR {RequestId} executed successfully. Status: {Status}",
                request.RequestId, dto.Status);

            return Result.Success(dto);
        }
        catch (Exception ex)
        {
            _logger.LogError(ex, "Failed to execute DSR {RequestId}", request.RequestId);
            return Result.Failure<DataSubjectRequestDto>("EXECUTION_ERROR", ex.Message);
        }
    }
}
