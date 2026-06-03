namespace ProductStockReporter.Application;

public interface IProductReader
{
    Task<ProductImportResult> ReadAsync(string inputDirectory, CancellationToken cancellationToken);
}
