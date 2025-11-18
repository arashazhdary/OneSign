namespace Onesign.Modules.Crypto.Domain.Services;

public interface IKeyRevocationService
{
    Task RevokeAsync(
        Guid keyVersionId,
        string reason,
        CancellationToken cancellationToken = default);
}
