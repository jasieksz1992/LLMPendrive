namespace ProductStockReporter.Domain;

public sealed record CategoryStockReport(
    string CategoryName,
    decimal TotalStockValue,
    IReadOnlyList<ProductStockItem> Products);
