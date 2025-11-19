using Microsoft.EntityFrameworkCore;
using Microsoft.EntityFrameworkCore.Metadata.Builders;
using Onesign.Modules.Copilot.Infrastructure.EfCore.Entities;

namespace Onesign.Modules.Copilot.Infrastructure.EfCore.Configurations;

public class CopilotConversationEntityTypeConfiguration : IEntityTypeConfiguration<CopilotConversationEntity>
{
    public void Configure(EntityTypeBuilder<CopilotConversationEntity> builder)
    {
        builder.ToTable("Copilot_Conversations", "Copilot");

        builder.HasKey(x => x.Id);

        builder.HasIndex(x => x.TenantId)
            .HasDatabaseName("IX_Copilot_Conversations_TenantId");

        builder.HasIndex(x => new { x.TenantId, x.UserId })
            .HasDatabaseName("IX_Copilot_Conversations_TenantId_UserId");

        builder.HasIndex(x => new { x.TenantId, x.UserId, x.LastMessageAt })
            .HasDatabaseName("IX_Copilot_Conversations_TenantId_UserId_LastMessageAt");

        builder.HasMany(x => x.Messages)
            .WithOne(x => x.Conversation)
            .HasForeignKey(x => x.ConversationId)
            .OnDelete(DeleteBehavior.Cascade);
    }
}
