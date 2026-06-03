namespace ProductStockReporter.Domain;

public sealed record ProductStockItem(
    string Sku,
    string Name,
    decimal UnitPrice,
    int Quantity,
    decimal StockValue);
