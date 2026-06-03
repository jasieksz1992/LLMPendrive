# Product Stock Reporter

Product Stock Reporter is a dependency-light C# console application that reads product CSV files, groups products by category, calculates total stock value, and writes a JSON summary report.

## Requirements

- .NET 8 SDK

## CSV input

Place one or more `.csv` files in an input directory. Each file must include these headers:

```csv
sku,name,category,unitPrice,quantity
A-100,USB Drive,Storage,12.50,40
B-200,Laptop Stand,Accessories,29.99,15
```

The importer accepts quoted CSV fields and continues processing valid rows when individual rows contain validation errors.

## Run

```bash
dotnet run --project ProductStockReporter.csproj -- --input ./input --output ./output --file stock-summary.json
```

## JSON output

The report contains one object per category with the category name, total stock value, and the products that contributed to the total.

```json
[
  {
    "categoryName": "Storage",
    "totalStockValue": 500.00,
    "products": [
      {
        "sku": "A-100",
        "name": "USB Drive",
        "unitPrice": 12.50,
        "quantity": 40,
        "stockValue": 500.00
      }
    ]
  }
]
```
