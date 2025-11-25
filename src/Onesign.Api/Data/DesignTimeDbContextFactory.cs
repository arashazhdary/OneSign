using Microsoft.EntityFrameworkCore;
using Microsoft.EntityFrameworkCore.Design;
using Onesign.Data.Contexts;

namespace Onesign.Api.Data;

public class DesignTimeDbContextFactory : IDesignTimeDbContextFactory<OnesignDbContext>
{
    public OnesignDbContext CreateDbContext(string[] args)
    {
        var optionsBuilder = new DbContextOptionsBuilder<OnesignDbContext>();
        optionsBuilder.UseSqlServer("Data Source=.;Initial Catalog=OnesignDbV2;Integrated Security=True;TrustServerCertificate=True ; MultipleActiveResultSets=true",
            b => b.MigrationsAssembly("Onesign.Api"));

        return new OnesignDbContext(optionsBuilder.Options);
    }
}

