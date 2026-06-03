namespace ProductStockReporter.Domain;

public sealed record Product(
    string Sku,
    string Name,
    string Category,
    decimal UnitPrice,
    int Quantity)
{
    public decimal StockValue => UnitPrice * Quantity;
}
