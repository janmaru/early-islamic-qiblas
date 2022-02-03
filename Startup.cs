using EarlyIslamicQiblas.Models.Infrastructure;
using Microsoft.AspNetCore.Builder;
using Microsoft.AspNetCore.Hosting;
using Microsoft.AspNetCore.SpaServices.ReactDevelopmentServer;
using Microsoft.Extensions.Configuration;
using Microsoft.Extensions.DependencyInjection;
using Microsoft.Extensions.FileProviders;
using Microsoft.Extensions.Hosting;

using System.IO;

namespace EarlyIslamicQiblas
{
    public class Startup
    {
        private readonly IConfiguration configuration;

        private static void RegisterServices(IServiceCollection services, IConfiguration configuration)
        {
            // Adding dependencies  
            NativeInjectorBootStrapper.RegisterServices(services, configuration);
        }

        public Startup(IConfiguration configuration)
        {
            this.configuration = configuration;
        }


        // This method gets called by the runtime. Use this method to add services to the container.
        public void ConfigureServices(IServiceCollection services)
        { 
            // Native DI Abstraction -- init
            RegisterServices(services, configuration);
            // Native DI Abstraction -- end 
        }

        // This method gets called by the runtime. Use this method to configure the HTTP request pipeline.
        public void Configure(IApplicationBuilder app, IWebHostEnvironment env)
        {
            app.UseRouting();
            app.UseHttpsRedirection();
            app.UseStaticFiles();
            app.UseCookiePolicy(); 

            if (env.IsDevelopment()) 
                app.UseDeveloperExceptionPage(); 
            else
            {
                app.UseExceptionHandler("/Home/Error");
                // The default HSTS value is 30 days. You may want to change this for production scenarios, see https://aka.ms/aspnetcore-hsts.
                app.UseHsts();

                app.UseStaticFiles(new StaticFileOptions()
                {
                    FileProvider = new PhysicalFileProvider(
                      Path.Combine(Directory.GetCurrentDirectory(), @"ClientApp", "build", "static", "js"))
                });
                app.UseStaticFiles(new StaticFileOptions()
                {
                    FileProvider = new PhysicalFileProvider(
                  Path.Combine(Directory.GetCurrentDirectory(), @"ClientApp", "build", "static", "css"))
                });
                app.UseStaticFiles(new StaticFileOptions()
                {
                    FileProvider = new PhysicalFileProvider(
                  Path.Combine(Directory.GetCurrentDirectory(), @"ClientApp", "build"))
                });
            }

            app.UseEndpoints(endpoints =>
            {
                endpoints.MapControllers(); 
                endpoints.MapControllerRoute(
                        name: "default",
                        pattern: "{controller=Home}/{action=Index}/{id?}");
         
            });
          
            app.UseSpa(spa =>
            {
                spa.Options.SourcePath = "ClientApp"; 
                if (env.IsDevelopment()) 
                    spa.UseReactDevelopmentServer(npmScript: "start"); 
            }); 
        }
    }
}
