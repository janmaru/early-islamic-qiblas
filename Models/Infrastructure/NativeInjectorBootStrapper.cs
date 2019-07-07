using AutoMapper;
using Microsoft.AspNetCore.Http;
using Microsoft.Extensions.Configuration;
using Microsoft.Extensions.DependencyInjection;
using Microsoft.Extensions.DependencyInjection.Extensions;
using EarlyIslamicQiblas.Models.Bridge;
using EarlyIslamicQiblas.Models.Domain;
using EarlyIslamicQiblas.Models.Service;

namespace EarlyIslamicQiblas.Models.Infrastructure
{
    public class NativeInjectorBootStrapper
    {
        public static void RegisterServices(IServiceCollection services, IConfiguration configuration)
        {

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
