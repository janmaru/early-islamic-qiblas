using EarlyIslamicQiblas.Models.Configuration;
using EarlyIslamicQiblas.Models.Infrastructure.Persistence;
using Microsoft.AspNetCore.SpaServices.ReactDevelopmentServer;
using Microsoft.EntityFrameworkCore;

var builder = WebApplication.CreateBuilder(args);

// Aggiungi prima i controller - SENZA Views per testare
builder.Services.AddControllers(); 

// Configura servizi
NativeInjectorBootStrapper.RegisterServices(builder.Services, builder.Configuration); 

builder.Services.AddEntityFrameworkInMemoryDatabase();
builder.Services.AddDbContext<MosqueDbContext>(options =>
    options.UseInMemoryDatabase("InMemoryDb"));  

var app = builder.Build();

// Configure pipeline
if (!app.Environment.IsDevelopment())
{
    app.UseExceptionHandler("/Error");
    app.UseHsts();
}

app.UseHttpsRedirection();
app.UseStaticFiles();
app.UseCors("qiblas");

// Usa i file statici della SPA solo in production
if (!app.Environment.IsDevelopment())
{
    app.UseSpaStaticFiles();
}

app.UseRouting();

// SOLO MapControllers per le API
app.MapControllers();

// Configura SPA
app.UseSpa(spa =>
{
    spa.Options.SourcePath = "ClientApp";

    if (app.Environment.IsDevelopment())
    {
        // In development, usa il proxy al dev server React
        spa.UseReactDevelopmentServer(npmScript: "start");
    }
});

app.Run();