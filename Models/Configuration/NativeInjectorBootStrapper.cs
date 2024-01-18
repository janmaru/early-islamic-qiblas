using EarlyIslamicQiblas.Models.Domain;
using EarlyIslamicQiblas.Models.Infrastructure;
using EarlyIslamicQiblas.Models.Infrastructure.Persistence;
using EarlyIslamicQiblas.Models.Service;
using Microsoft.AspNetCore.Builder;
using Microsoft.AspNetCore.Http;
using Microsoft.EntityFrameworkCore;
using Microsoft.Extensions.Configuration;
using Microsoft.Extensions.DependencyInjection;
using Microsoft.Extensions.DependencyInjection.Extensions;
using System;

namespace EarlyIslamicQiblas.Models.Configuration;

public class NativeInjectorBootStrapper
{
    public static void RegisterServices(IServiceCollection services, IConfiguration configuration)
    {
        services.Configure<CookiePolicyOptions>(options =>
        {
            // This lambda determines whether user consent for non-essential cookies is needed for a given request.
            options.CheckConsentNeeded = context => true;
            options.MinimumSameSitePolicy = SameSiteMode.None;
        });

        services.AddMvc();

        // In production, the Angular files will be served from this directory
        services.AddSpaStaticFiles(configuration =>
        {
            configuration.RootPath = "ClientApp/build";
        }); 

        //get the HTTP context in any class that is managed by the ASP.NET Core dependency injection system
        services.TryAddSingleton<IHttpContextAccessor, HttpContextAccessor>();


        services.AddCors(options =>
        {
            options.AddPolicy("qiblas", o =>
                o.AllowAnyOrigin()
                .AllowAnyHeader()
                .AllowAnyMethod());
        });

        services
            .AddScoped<IMosqueRepository, MosqueRepository>()
            .AddScoped<IFeatureService, FeatureService>()
            .AddSingleton(configuration);

        var dbName = $"Mosque_{DateTime.Now.ToFileTimeUtc()}";
        var dbConnectionOptions = new DbContextOptionsBuilder<MosqueDbContext>()
            .UseInMemoryDatabase(dbName)
            .Options;
        services.AddScoped(ctx => new MosqueDbContext(dbConnectionOptions));

        var sp = services.BuildServiceProvider();
        var dbContext = sp.GetService<MosqueDbContext>(); 
        DataLoader seeding = new(dbContext); 

        services.AddLogging(); 
        AutoMapperConfig.RegisterMappings();
    }
}