using EarlyIslamicQiblas.Models.Domain;
using System.Threading.Tasks;

namespace EarlyIslamicQiblas.Models.Service;

public interface IFeatureService
{
    Task<Geo> Get();
}