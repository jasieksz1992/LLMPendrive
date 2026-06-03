using System.Text.Json;
using ProductStockReporter.Application;
using ProductStockReporter.Domain;

namespace ProductStockReporter.Infrastructure;

public sealed class JsonReportWriter : IReportWriter
{
    private static readonly JsonSerializerOptions SerializerOptions = new()
    {
        PropertyNamingPolicy = JsonNamingPolicy.CamelCase,
        WriteIndented = true
    };

    public async Task WriteAsync(string outputDirectory, string fileName, IReadOnlyList<CategoryStockReport> report, CancellationToken cancellationToken)
    {
        if (string.IsNullOrWhiteSpace(outputDirectory))
        {
            throw new ArgumentException("Output directory is required.", nameof(outputDirectory));
        }

        if (string.IsNullOrWhiteSpace(fileName))
        {
            throw new ArgumentException("Output file name is required.", nameof(fileName));
        }

        ArgumentNullException.ThrowIfNull(report);

        Directory.CreateDirectory(outputDirectory);
        var outputPath = Path.Combine(outputDirectory, Path.GetFileName(fileName));

        await using var fileStream = File.Create(outputPath);
        await JsonSerializer.SerializeAsync(fileStream, report, SerializerOptions, cancellationToken);
    }
}
