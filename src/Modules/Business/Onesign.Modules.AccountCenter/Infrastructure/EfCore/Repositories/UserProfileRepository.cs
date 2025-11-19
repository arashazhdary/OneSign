using System.Text.Json;
using Microsoft.EntityFrameworkCore;
using Onesign.Data.Contexts;
using Onesign.Modules.AccountCenter.Domain.Entities;
using Onesign.Modules.AccountCenter.Domain.Repositories;
using Onesign.Modules.AccountCenter.Infrastructure.EfCore.Entities;

namespace Onesign.Modules.AccountCenter.Infrastructure.EfCore.Repositories;

public class UserProfileRepository : IUserProfileRepository
{
    private readonly OnesignDbContext _dbContext;

    public UserProfileRepository(OnesignDbContext dbContext) => _dbContext = dbContext;

    public async Task<UserProfile?> GetByUserIdAsync(Guid userId, CancellationToken cancellationToken = default)
    {
        var entity = await _dbContext.Set<UserProfileEntity>()
            .FirstOrDefaultAsync(x => x.UserId == userId, cancellationToken);
        return entity == null ? null : MapToDomain(entity);
    }

    public async Task<UserProfile> AddAsync(UserProfile profile, CancellationToken cancellationToken = default)
    {
        var entity = MapToEntity(profile);
        _dbContext.Set<UserProfileEntity>().Add(entity);
        await _dbContext.SaveChangesAsync(cancellationToken);
        return MapToDomain(entity);
    }

    public async Task UpdateAsync(UserProfile profile, CancellationToken cancellationToken = default)
    {
        var entity = await _dbContext.Set<UserProfileEntity>()
            .FirstOrDefaultAsync(x => x.Id == profile.Id, cancellationToken);
        if (entity != null)
        {
            entity.DisplayName = profile.DisplayName;
            entity.PhoneNumber = profile.PhoneNumber;
            entity.ProfilePictureUrl = profile.ProfilePictureUrl;
            entity.TimeZone = profile.TimeZone;
            entity.PreferredLanguage = profile.PreferredLanguage;
            entity.CustomAttributesJson = JsonSerializer.Serialize(profile.CustomAttributes);
            entity.UpdatedAt = profile.UpdatedAt;
            await _dbContext.SaveChangesAsync(cancellationToken);
        }
    }

    private static UserProfile MapToDomain(UserProfileEntity e) => new()
    {
        Id = e.Id,
        TenantId = e.TenantId,
        UserId = e.UserId,
        DisplayName = e.DisplayName,
        PhoneNumber = e.PhoneNumber,
        ProfilePictureUrl = e.ProfilePictureUrl,
        TimeZone = e.TimeZone,
        PreferredLanguage = e.PreferredLanguage,
        CustomAttributes = JsonSerializer.Deserialize<Dictionary<string, string>>(e.CustomAttributesJson) ?? new(),
        CreatedAt = e.CreatedAt,
        UpdatedAt = e.UpdatedAt
    };

    private static UserProfileEntity MapToEntity(UserProfile p) => new()
    {
        Id = p.Id,
        TenantId = p.TenantId,
        UserId = p.UserId,
        DisplayName = p.DisplayName,
        PhoneNumber = p.PhoneNumber,
        ProfilePictureUrl = p.ProfilePictureUrl,
        TimeZone = p.TimeZone,
        PreferredLanguage = p.PreferredLanguage,
        CustomAttributesJson = JsonSerializer.Serialize(p.CustomAttributes),
        CreatedAt = p.CreatedAt,
        UpdatedAt = p.UpdatedAt
    };
}
