using EarlyIslamicQiblas.Models.Configuration;
using EarlyIslamicQiblas.Models.Domain;
using EarlyIslamicQiblas.Models.Infrastructure.Persistence;
using System.Text.Json;

namespace EarlyIslamicQiblas.Models.Infrastructure;

public class DataLoader
{
    #region private 
    private readonly JsonSerializerOptions _serializeOptions = new();
    private readonly MosqueDbContext _context;
    private readonly string filePath = Path.Combine(Directory.GetCurrentDirectory(),
           "Data", "mosques");
    #endregion

    public DataLoader(MosqueDbContext context)
    {
        this._context = context;
        _serializeOptions.Converters.Add(new StringConverter());
        var fileJson = File.ReadAllText(filePath);
        IEnumerable<Mosque> mosques = JsonSerializer.Deserialize<IEnumerable<Mosque>>(fileJson, _serializeOptions);

        _context.Mosques.AddRange(mosques);
        _context.SaveChanges();
    }
}