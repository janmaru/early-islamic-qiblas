using Microsoft.AspNetCore.Mvc;
using Newtonsoft.Json;
using System.Collections.Generic;
using System.Linq;
using EarlyIslamicQiblas.Models.Domain;
using EarlyIslamicQiblas.Models.Extension;

namespace EarlyIslamicQiblas.Controllers
{
    [Route("api/v1/[controller]")]
    public class MosqueController : ControllerBase
    {
        private readonly IMosqueRepository repoMosque;
        public MosqueController(IMosqueRepository repoMosque)
        {
            this.repoMosque = repoMosque;
        }

  
        [HttpGet]
        [Route("[action]")]
        public IEnumerable<Mosque> List()
        {
            return repoMosque.Get();
        }

        [HttpGet]
        [Route("[action]")]
        public IActionResult PagedList([FromQuery] int pageSize, [FromQuery] int page, [FromQuery] string sorted, [FromQuery]  string filtered)
        {
            var count = repoMosque.Get().Count();
            var pages = count % pageSize == 0 ? (count / pageSize) : ((count / pageSize) + 1);
            var rows = repoMosque.Get();

            var jSorted = JsonConvert.DeserializeObject<IEnumerable<Sorted>>(sorted);
            if (jSorted.Count() > 0)
            {
                var srt = jSorted.FirstOrDefault();
                switch (srt.id)
                {
                    case "mosqueName":
                        if (srt.desc)
                            rows = from q in rows orderby q.MosqueName descending select q;
                        else
                            rows = from q in rows orderby q.MosqueName select q;
                        break;
                    case "country":
                        if (srt.desc)
                            rows = from q in rows orderby q.Country descending select q;
                        else
                            rows = from q in rows orderby q.Country select q;
                        break;
                    case "city":
                        if (srt.desc)
                            rows = from q in rows orderby q.City descending select q;
                        else
                            rows = from q in rows orderby q.City select q;
                        break;
                    case "yearCE":
                        if (srt.desc)
                            rows = from q in rows orderby q.YearCE descending select q;
                        else
                            rows = from q in rows orderby q.YearCE select q;
                        break;
                    case "gibsonClassification":
                        if (srt.desc)
                            rows = from q in rows orderby q.GibsonClassification descending select q;
                        else
                            rows = from q in rows orderby q.GibsonClassification select q;
                        break;
                    default: //id
                        break;
                }
            }

            rows = rows.Skip(page * pageSize).Take(pageSize);

            return Ok(new { rows = rows, pages = pages });
        }


        [HttpGet("{id}")]
        public Mosque Get(string name)
        {
            return repoMosque.Get(name);
        }
    }
}
