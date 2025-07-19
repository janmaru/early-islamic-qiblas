using EarlyIslamicQiblas.Models.Bridge;
using EarlyIslamicQiblas.Models.Domain;
using EarlyIslamicQiblas.Models.Service;
using Microsoft.AspNetCore.Builder;
using Microsoft.AspNetCore.Http;
using Microsoft.Extensions.Configuration;
using Microsoft.Extensions.DependencyInjection;
using Microsoft.Extensions.DependencyInjection.Extensions;

namespace EarlyIslamicQiblas.Models.Infrastructure
{
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

            // In production, the Angular/React files will be served from this directory
            services.AddSpaStaticFiles(configuration =>
            {
                configuration.RootPath = "ClientApp/build";
            });


            //get the HTTP context in any class that is managed by the ASP.NET Core dependency injection system
            services.TryAddSingleton<IHttpContextAccessor, HttpContextAccessor>();

            services
                .AddSingleton<IMosqueRepository, MosqueRepository>()
                .AddSingleton<IFeatureService, FeatureService>()
                .AddSingleton(configuration);

            AutoMapperConfig.RegisterMappings();
        }
    }
}
