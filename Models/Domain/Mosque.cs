namespace EarlyIslamicQiblas.Models.Domain;

public class Mosque 
{
    public string? GibsonClassification { get; set; }
    public string? YearCE { get; set; }
    public string? YearAH { get; set; }
    public string? AgeGroup { get; set; }
    public string? City { get; set; }
    public string? Country { get; set; }
    public string? MosqueName { get; set; }
    public string? Rebuilt { get; set; }
    public double Lat { get; set; }
    public double Lon { get; set; }
    public double? Dir { get; set; }
    public string? MoreInfo { get; set; }
}