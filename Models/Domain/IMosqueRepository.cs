using System.Collections.Generic;

namespace EarlyIslamicQiblas.Models.Domain
{
    public interface IMosqueRepository
    {
        IEnumerable<Mosque> Get();
        Mosque Get(string name);
    }
}
