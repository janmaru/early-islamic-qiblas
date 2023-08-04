using System.Collections.Generic;
using System.Threading.Tasks;

namespace EarlyIslamicQiblas.Models.Domain;

public interface IMosqueRepository
{
    Task<IEnumerable<Mosque>> Get();
    Task<Mosque> Get(string name);
}