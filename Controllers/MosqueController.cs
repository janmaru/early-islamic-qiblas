using EarlyIslamicQiblas.Models.Domain;
using EarlyIslamicQiblas.Models.Extensions;
using Microsoft.AspNetCore.Mvc;
using System.Collections.Generic;
using System.Linq;
using System.Text.Json;
using System.Text.Json.Serialization;
using System.Threading.Tasks;

namespace EarlyIslamicQiblas.Controllers;

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
    public async Task<IEnumerable<Mosque>> List()
    {
        return await repoMosque.Get();
    }

    [HttpGet]
    [Route("[action]")]
    public async Task<IActionResult> PagedList([FromQuery] int pageSize, [FromQuery] int page, [FromQuery] string sorted, [FromQuery]  string filtered)
    {
        var rows = await repoMosque.Get();
        var count = rows.Count();
        var pages = count % pageSize == 0 ? (count / pageSize) : ((count / pageSize) + 1); 

        var jSorted = JsonSerializer.Deserialize<IEnumerable<Sorted>>(sorted);
        if (jSorted.Any())
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

        return Ok(new { rows, pages });
    }


    [HttpGet("{id}")]
    public async Task<Mosque> Get(string name)
    {
        return await repoMosque.Get(name);
    }
}