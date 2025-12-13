using MediatR;
using Onesign.Modules.Tenants.Application.DTOs;
using Onesign.Shared.Result;

namespace Onesign.Modules.Tenants.Application.Commands;

public class UpdateSliderImagesCommand : IRequest<Result<TenantBrandingDto>>
{
    public Guid TenantId { get; set; }
    public List<SliderImageDto>? SliderImages { get; set; }
}
