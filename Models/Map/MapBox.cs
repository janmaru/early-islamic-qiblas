using Newtonsoft.Json;
using System.Collections.Generic;

namespace EarlyIslamicQiblas.Models.Map
{
    public class Geometry
    {
        public string Type { get; set; }
        public List<double> Coordinates { get; set; } = new List<double>();
    }

    public class Properties
    {
        public string Title { get; set; }
        public string Description { get; set; }
    }

    public class Feature
    {
        public string Type { get; set; }
        public Geometry Geometry { get; set; }
        public Properties Properties { get; set; }
    }

    public class Geo
    {
        public string Type { get; set; }
        public List<Feature> Features { get; set; } = new List<Feature>();
    }
}
