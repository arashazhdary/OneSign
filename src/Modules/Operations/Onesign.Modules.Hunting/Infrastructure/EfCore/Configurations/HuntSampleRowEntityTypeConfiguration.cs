using Microsoft.EntityFrameworkCore;
using Microsoft.EntityFrameworkCore.Metadata.Builders;
using Onesign.Modules.Hunting.Infrastructure.EfCore.Entities;

namespace Onesign.Modules.Hunting.Infrastructure.EfCore.Configurations;

public class HuntSampleRowEntityTypeConfiguration : IEntityTypeConfiguration<HuntSampleRowEntity>
{
    public void Configure(EntityTypeBuilder<HuntSampleRowEntity> builder)
    {
        builder.ToTable("Hunting_HuntSampleRows", "Hunting");

        builder.HasKey(x => x.Id);

        builder.Property(x => x.DocumentJson).IsRequired();

        builder.HasIndex(x => x.HuntRunId)
            .HasDatabaseName("IX_Hunting_HuntSampleRows_HuntRunId");

        builder.HasIndex(x => x.Dataset)
            .HasDatabaseName("IX_Hunting_HuntSampleRows_Dataset");

        builder.HasIndex(x => x.RowIndex)
            .HasDatabaseName("IX_Hunting_HuntSampleRows_RowIndex");
    }
}
