using Microsoft.EntityFrameworkCore;
using Microsoft.EntityFrameworkCore.Metadata.Builders;
using Onesign.Modules.Copilot.Infrastructure.EfCore.Entities;

namespace Onesign.Modules.Copilot.Infrastructure.EfCore.Configurations;

public class CopilotMessageEntityTypeConfiguration : IEntityTypeConfiguration<CopilotMessageEntity>
{
    public void Configure(EntityTypeBuilder<CopilotMessageEntity> builder)
    {
        builder.ToTable("Copilot_Messages", "Copilot");

        builder.HasKey(x => x.Id);

        builder.Property(x => x.Content).IsRequired();

        builder.HasIndex(x => x.ConversationId)
            .HasDatabaseName("IX_Copilot_Messages_ConversationId");

        builder.HasIndex(x => new { x.ConversationId, x.CreatedAt })
            .HasDatabaseName("IX_Copilot_Messages_ConversationId_CreatedAt");

        builder.HasIndex(x => new { x.ContextType, x.ContextId })
            .HasDatabaseName("IX_Copilot_Messages_ContextType_ContextId");
    }
}
