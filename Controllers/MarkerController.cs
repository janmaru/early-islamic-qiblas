using EarlyIslamicQiblas.Models.Domain;
using EarlyIslamicQiblas.Models.Extensions;
using EarlyIslamicQiblas.Models.Service;
using Microsoft.AspNetCore.Cors;
using Microsoft.AspNetCore.Mvc;

namespace EarlyIslamicQiblas.Controllers
{
    [Route("api/v1/[controller]")]
    [EnableCors("qiblas")]
    public class MarkerController(IFeatureService featureService) : ControllerBase
    {
        private readonly IFeatureService featureService = featureService;

        [HttpGet]
        [EnableCors("qiblas")]
        [Route("[action]")] 
        public async Task<Geo> List()
        {
            return await featureService.Get();
        }

        [HttpGet]
        [EnableCors("qiblas")]
        [Route("[action]")]
        public async Task<IEnumerable<double>> Centroid()
        {
            var service = await featureService.Get();
            var geo = service.Features.Select(x => x.Geometry!.Coordinates);
            return geo.Centroid();
        } 

        [HttpGet]
        [EnableCors("qiblas")]
        [Route("[action]")]
        public async Task<IEnumerable<double>> Random()
        {
            var service = await featureService.Get();
            return service.Features.Select(x => x.Geometry.Coordinates).Random();
        }
    }
}