using ProductStockReporter.Domain;

namespace ProductStockReporter.Application;

public interface IStockReportGenerator
{
    IReadOnlyList<CategoryStockReport> Generate(IEnumerable<Product> products);
}
