using EarlyIslamicQiblas.Models.Infrastructure.Persistence;
using Microsoft.EntityFrameworkCore;
using System.Collections.Generic;
using System.Linq;
using System.Threading.Tasks;

namespace EarlyIslamicQiblas.Models.Domain;

public class MosqueRepository : IMosqueRepository
{
    #region private  
    private readonly MosqueDbContext _context;
    #endregion

    public MosqueRepository(MosqueDbContext context)
    {
        this._context = context;
    }

    public async Task<IEnumerable<Mosque>> Get()
    {
        return await _context.Mosques.ToListAsync();
    }

    public async Task<Mosque> Get(string name)
    {
        return await _context.Mosques.Where(x => x.MosqueName == name).FirstOrDefaultAsync();
    }
}