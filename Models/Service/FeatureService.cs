using EarlyIslamicQiblas.Models.Domain;
using EarlyIslamicQiblas.Models.Extensions;
using System.Collections.Generic;
using System.Linq;
using System.Threading.Tasks;

namespace EarlyIslamicQiblas.Models.Service;

public class FeatureService : IFeatureService
{
    private readonly IMosqueRepository mosqueRepository;
    public FeatureService(IMosqueRepository mosqueRepository)
    {
        this.mosqueRepository = mosqueRepository;
    }

    public async Task<Geo> Get()
    {
        var mosques = await mosqueRepository.Get();
        return new Geo()
        {
            Type = "FeatureCollection",
            Features = mosques.Select(x => new Feature()
            {
                Type = "Feature",
                Geometry = new Geometry()
                {
                    Type = "Point",
                    Coordinates = new List<double> { x.Lon, x.Lat }
                },
                Properties = new Properties()
                {
                    Description = x.PopUp(),
                    Title = x.MosqueName
                }
            }).ToList()
        };
    }
} 