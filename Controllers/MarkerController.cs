using Microsoft.AspNetCore.Mvc;
using System.Collections.Generic;
using System.Linq;
using EarlyIslamicQiblas.Models.Extension;
using EarlyIslamicQiblas.Models.Map;
using EarlyIslamicQiblas.Models.Service;

namespace EarlyIslamicQiblas.Controllers
{
    [Route("api/v1/[controller]")]
    public class MarkerController : ControllerBase
    {
        private readonly IFeatureService featureService;
        public MarkerController(IFeatureService featureService)
        {
            this.featureService = featureService;
        }


        [HttpGet]
        [Route("[action]")] 
        public Geo List()
        {
            return featureService.Get();
        }

        [HttpGet]
        [Route("[action]")]
        public IEnumerable<double> Centroid()
        {
            var g = featureService.Get().Features.Select(x => x.Geometry.Coordinates);
            return g.Centroid();
        }


        [HttpGet]
        [Route("[action]")]
        public IEnumerable<double> Random()
        {
            return featureService.Get().Features.Select(x => x.Geometry.Coordinates).Random();
        }
    }
}
