using ProductStockReporter.Domain;

namespace ProductStockReporter.Application;

public interface IReportWriter
{
    Task WriteAsync(string outputDirectory, string fileName, IReadOnlyList<CategoryStockReport> report, CancellationToken cancellationToken);
}
