using MediatR;
using Onesign.Modules.Security.Application.DTOs;
using Onesign.Modules.Security.Domain.Services;

namespace Onesign.Modules.Security.Application.Commands;

public class BeginTotpEnrollmentCommandHandler : IRequestHandler<BeginTotpEnrollmentCommand, BeginTotpEnrollmentResponse>
{
    private readonly IMfaService _mfaService;

    public BeginTotpEnrollmentCommandHandler(IMfaService mfaService)
    {
        _mfaService = mfaService;
    }

    public async Task<BeginTotpEnrollmentResponse> Handle(BeginTotpEnrollmentCommand request, CancellationToken cancellationToken)
    {
        var secret = _mfaService.GenerateTotpSecret();
        var qrCodeUri = _mfaService.GenerateQrCodeUri(request.UserEmail, secret);

        return await Task.FromResult(new BeginTotpEnrollmentResponse
        {
            Secret = secret,
            QrCodeUri = qrCodeUri
        });
    }
}
