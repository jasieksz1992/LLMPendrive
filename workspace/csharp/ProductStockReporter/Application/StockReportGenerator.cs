using ProductStockReporter.Domain;

namespace ProductStockReporter.Application;

public sealed class StockReportGenerator : IStockReportGenerator
{
    public IReadOnlyList<CategoryStockReport> Generate(IEnumerable<Product> products)
    {
        ArgumentNullException.ThrowIfNull(products);

        return products
            .GroupBy(product => product.Category.Trim(), StringComparer.OrdinalIgnoreCase)
            .OrderBy(group => group.Key, StringComparer.OrdinalIgnoreCase)
            .Select(group =>
            {
                var items = group
                    .OrderBy(product => product.Name, StringComparer.OrdinalIgnoreCase)
                    .ThenBy(product => product.Sku, StringComparer.OrdinalIgnoreCase)
                    .Select(product => new ProductStockItem(
                        product.Sku,
                        product.Name,
                        product.UnitPrice,
                        product.Quantity,
                        product.StockValue))
                    .ToArray();

                return new CategoryStockReport(
                    group.Key,
                    items.Sum(product => product.StockValue),
                    items);
            })
            .ToArray();
    }
}
