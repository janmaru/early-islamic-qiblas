using System.Text;
using EarlyIslamicQiblas.Models.Domain;

namespace EarlyIslamicQiblas.Models.Extensions;

public static class CustomExtension
{
    public static string PopUp(this Mosque m)
    {
        return new StringBuilder()
             .Append($"<h3>{m.MosqueName}</h3>")
             .Append("<table style='border-collapse:collapse;'>")
             .Append($"<tr><td style='font-weight:bold;padding-right:8px;text-align:left;'>City</td><td>{m.City}</td></tr>")
             .Append($"<tr><td style='font-weight:bold;padding-right:8px;text-align:left;'>Country</td><td>{m.Country}</td></tr>")
             .Append($"<tr><td style='font-weight:bold;padding-right:8px;text-align:left;'>Age Group</td><td>{m.AgeGroup}</td></tr>")
             .Append($"<tr><td style='font-weight:bold;padding-right:8px;text-align:left;'>Year CE</td><td>{m.YearCE}</td></tr>")
             .Append($"<tr><td style='font-weight:bold;padding-right:8px;text-align:left;'>Year AH</td><td>{m.YearAH}</td></tr>")
             .Append($"<tr><td style='font-weight:bold;padding-right:8px;text-align:left;'>Rebuilt</td><td>{m.Rebuilt}</td></tr>")
             .Append("</table>")
             .Append(m.MoreInfo?.Contains("#") == true ? "" : $"<a href='{m.MoreInfo ?? ""}' title='More Info' target='_blank'>More Info</a>")
             .ToString();
    }
}
