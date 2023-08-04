using EarlyIslamicQiblas.Models.Domain;
using System.Text;

namespace EarlyIslamicQiblas.Models.Extensions;

public static class CustomExtension
{
    public static string PopUp(this Mosque m)
    {
        return new StringBuilder()
             .Append($"<h3>{m.MosqueName}</h3>")
             .Append($"City: {m.City}</br>")
             .Append($"Country: {m.Country}</br>")
             .Append($"Age Group: {m.AgeGroup}</br>")
             .Append($"Year CE: {m.YearCE}</br>")
             .Append($"Year AH: {m.YearAH}</br>")
             .Append($"Rebuilt: {m.YearAH}</br>")
             .Append(m.MoreInfo.Contains("#") ? "": $"<a href='{m.MoreInfo}' title='More Info' target='_blank'>More Info</a>")
             .ToString();
    }
}