using System;
using System.Collections.Generic;
using System.Linq;

namespace EarlyIslamicQiblas.Models.Extension
{
    public static class GeoExtension
    {
        public readonly static double R = 39631906;
        public static (double, double, double) ToCartesian(this List<double> geoCoordinates)
        {
            //[longitude, latitude]
            var lon = geoCoordinates[0];
            var lat = geoCoordinates[1];
            var x = R * Math.Cos(lat) * Math.Cos(lon);
            var y = R * Math.Cos(lat) * Math.Sin(lon);
            var z = R * Math.Sin(lat);

            return (x, y, z);
        }

        public static List<double> ToWGS84(this (double, double, double) xyz)
        {
            List<double> geoCoordinates = new List<double>();
            var x = xyz.Item1;
            var y = xyz.Item2;
            var z = xyz.Item3;

            var lon = Math.Atan2(y, x);
            var lat = Math.Asin(z / R);

            geoCoordinates.Add(lon);
            geoCoordinates.Add(lat);

            return geoCoordinates;
        }


        public static List<double> Centroid(this IEnumerable<List<double>> points)
        {
            var xs = points.Select(x => x.ToCartesian().Item1).Sum() / Convert.ToDouble(points.Count());
            var ys = points.Select(x => x.ToCartesian().Item2).Sum() / Convert.ToDouble(points.Count());
            var zs = points.Select(x => x.ToCartesian().Item3).Sum() / Convert.ToDouble(points.Count());
            return (xs, ys, zs).ToWGS84();
        }
    }
}
