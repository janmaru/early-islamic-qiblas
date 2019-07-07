using AutoMapper;
using System.Collections.Generic;
using System.Linq;
using EarlyIslamicQiblas.Models.Domain;
using EarlyIslamicQiblas.Models.Map;
using EarlyIslamicQiblas.Models.Extension;

namespace EarlyIslamicQiblas.Models.Service
{
    public class FeatureService : IFeatureService
    {
        private readonly IMosqueRepository stadiumRepository;
        public FeatureService(IMosqueRepository stadiumRepository)
        {
            this.stadiumRepository = stadiumRepository;
        }

        Geo IFeatureService.Get()
        {
            return new Geo()
            {
                Type = "FeatureCollection",
                Features = stadiumRepository.Get().Select(x => new Feature()
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
}
