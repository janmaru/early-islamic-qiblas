﻿using Microsoft.AspNetCore.Mvc;
using System.Collections.Generic;
using System.Linq;
using EarlyIslamicQiblas.Models.Extensions;
using EarlyIslamicQiblas.Models.Service;
using EarlyIslamicQiblas.Models.Domain;
using System.Threading.Tasks;

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
        public async Task<Geo> List()
        {
            return await featureService.Get();
        }

        [HttpGet]
        [Route("[action]")]
        public async Task<IEnumerable<double>> Centroid()
        {
            var service = await featureService.Get();
            var geo = service.Features.Select(x => x.Geometry.Coordinates);
            return geo.Centroid();
        } 

        [HttpGet]
        [Route("[action]")]
        public async Task<IEnumerable<double>> Random()
        {
            var service = await featureService.Get();
            return service.Features.Select(x => x.Geometry.Coordinates).Random();
        }
    }
}