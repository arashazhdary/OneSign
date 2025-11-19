using Microsoft.EntityFrameworkCore;
using Microsoft.EntityFrameworkCore.Design;
using Onesign.Data.Contexts;

namespace Onesign.Api.Data;

public class DesignTimeDbContextFactory : IDesignTimeDbContextFactory<OnesignDbContext>
{
    public OnesignDbContext CreateDbContext(string[] args)
    {
        var optionsBuilder = new DbContextOptionsBuilder<OnesignDbContext>();
        optionsBuilder.UseSqlServer("Server=(localdb)\\mssqllocaldb;Database=OnesignDb;Trusted_Connection=True;MultipleActiveResultSets=true");

        return new OnesignDbContext(optionsBuilder.Options);
    }
}

