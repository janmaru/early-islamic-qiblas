using Newtonsoft.Json;
using System.Collections.Generic;
using System.IO;
using System.Linq;

namespace EarlyIslamicQiblas.Models.Domain
{
    public class MosqueRepository : IMosqueRepository
    {
        #region private 
 
        private string filePath = Path.Combine(Directory.GetCurrentDirectory(),
               "Data", "mosques");
        #endregion

        public IEnumerable<Mosque> Get()
        {
            return  JsonConvert.DeserializeObject<IEnumerable<Mosque>>(File.ReadAllText(filePath));
        }


        Mosque IMosqueRepository.Get(string name)
        {
            return Get().Where(x => x.MosqueName == name).FirstOrDefault();
        } 
    }

}
