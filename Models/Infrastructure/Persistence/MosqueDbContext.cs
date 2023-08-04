using EarlyIslamicQiblas.Models.Domain;
using Microsoft.EntityFrameworkCore;
using Microsoft.Extensions.Logging;
using System.Numerics;
using System.Reflection.Emit;

namespace EarlyIslamicQiblas.Models.Infrastructure.Persistence;

public class MosqueDbContext : DbContext
{
    private ILoggerFactory LoggerFactory { get; }

    public MosqueDbContext(DbContextOptions options, ILoggerFactory loggerFactory = null) : base(options)
    {
        LoggerFactory = loggerFactory;
    }
    public DbSet<Mosque> Mosques { get; set; } 

    protected override void OnConfiguring(DbContextOptionsBuilder optionsBuilder)
    {
        base.OnConfiguring(optionsBuilder);
        optionsBuilder
            .EnableDetailedErrors()
            .EnableServiceProviderCaching()
            .EnableThreadSafetyChecks();

        if (LoggerFactory is not null)
            optionsBuilder.UseLoggerFactory(LoggerFactory); 
    }

    protected override void OnModelCreating(ModelBuilder modelBuilder)
    {
        base.OnModelCreating(modelBuilder);

        modelBuilder.Entity<Mosque>(
            eb =>
            {
                eb.HasKey(p => new { p.MosqueName }); 
                eb.HasIndex(p => new { p.AgeGroup });
            }); 
    }
} 