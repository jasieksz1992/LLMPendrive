using System.Globalization;
using System.Text;
using ProductStockReporter.Application;
using ProductStockReporter.Domain;

namespace ProductStockReporter.Infrastructure;

public sealed class CsvProductReader : IProductReader
{
    private static readonly string[] RequiredColumns = ["sku", "name", "category", "unitprice", "quantity"];

    public async Task<ProductImportResult> ReadAsync(string inputDirectory, CancellationToken cancellationToken)
    {
        if (string.IsNullOrWhiteSpace(inputDirectory))
        {
            throw new ArgumentException("Input directory is required.", nameof(inputDirectory));
        }

        if (!Directory.Exists(inputDirectory))
        {
            throw new DirectoryNotFoundException($"Input directory was not found: {inputDirectory}");
        }

        var products = new List<Product>();
        var issues = new List<ImportIssue>();
        var csvFiles = Directory.EnumerateFiles(inputDirectory, "*.csv", SearchOption.TopDirectoryOnly)
            .OrderBy(file => file, StringComparer.OrdinalIgnoreCase);

        foreach (var filePath in csvFiles)
        {
            await ReadFileAsync(filePath, products, issues, cancellationToken);
        }

        return new ProductImportResult(products, issues);
    }

    private static async Task ReadFileAsync(string filePath, ICollection<Product> products, ICollection<ImportIssue> issues, CancellationToken cancellationToken)
    {
        await using var fileStream = File.OpenRead(filePath);
        using var reader = new StreamReader(fileStream);

        var headerLine = await reader.ReadLineAsync(cancellationToken);
        if (headerLine is null)
        {
            issues.Add(new ImportIssue(filePath, 1, "CSV file is empty."));
            return;
        }

        var headers = ParseCsvLine(headerLine);
        var columnIndexes = BuildColumnIndex(headers);
        var missingColumns = RequiredColumns.Where(column => !columnIndexes.ContainsKey(column)).ToArray();
        if (missingColumns.Length > 0)
        {
            issues.Add(new ImportIssue(filePath, 1, $"Missing required columns: {string.Join(", ", missingColumns)}."));
            return;
        }

        var lineNumber = 1;
        while (!reader.EndOfStream)
        {
            cancellationToken.ThrowIfCancellationRequested();
            lineNumber++;

            var line = await reader.ReadLineAsync(cancellationToken);
            if (string.IsNullOrWhiteSpace(line))
            {
                continue;
            }

            var values = ParseCsvLine(line);
            if (TryCreateProduct(filePath, lineNumber, values, columnIndexes, issues, out var product))
            {
                products.Add(product);
            }
        }
    }

    private static Dictionary<string, int> BuildColumnIndex(IReadOnlyList<string> headers)
    {
        var indexes = new Dictionary<string, int>(StringComparer.OrdinalIgnoreCase);

        for (var index = 0; index < headers.Count; index++)
        {
            var normalizedHeader = NormalizeHeader(headers[index]);
            if (!string.IsNullOrWhiteSpace(normalizedHeader) && !indexes.ContainsKey(normalizedHeader))
            {
                indexes.Add(normalizedHeader, index);
            }
        }

        return indexes;
    }

    private static bool TryCreateProduct(
        string filePath,
        int lineNumber,
        IReadOnlyList<string> values,
        IReadOnlyDictionary<string, int> columnIndexes,
        ICollection<ImportIssue> issues,
        out Product product)
    {
        product = default!;

        var sku = GetValue(values, columnIndexes["sku"]);
        var name = GetValue(values, columnIndexes["name"]);
        var category = GetValue(values, columnIndexes["category"]);
        var unitPriceText = GetValue(values, columnIndexes["unitprice"]);
        var quantityText = GetValue(values, columnIndexes["quantity"]);

        if (string.IsNullOrWhiteSpace(sku) || string.IsNullOrWhiteSpace(name) || string.IsNullOrWhiteSpace(category))
        {
            issues.Add(new ImportIssue(filePath, lineNumber, "Sku, name, and category are required."));
            return false;
        }

        if (!decimal.TryParse(unitPriceText, NumberStyles.Number, CultureInfo.InvariantCulture, out var unitPrice) || unitPrice < 0)
        {
            issues.Add(new ImportIssue(filePath, lineNumber, "Unit price must be a non-negative decimal number."));
            return false;
        }

        if (!int.TryParse(quantityText, NumberStyles.Integer, CultureInfo.InvariantCulture, out var quantity) || quantity < 0)
        {
            issues.Add(new ImportIssue(filePath, lineNumber, "Quantity must be a non-negative integer."));
            return false;
        }

        product = new Product(sku.Trim(), name.Trim(), category.Trim(), unitPrice, quantity);
        return true;
    }

    private static string GetValue(IReadOnlyList<string> values, int index)
    {
        return index >= 0 && index < values.Count ? values[index] : string.Empty;
    }

    private static string NormalizeHeader(string value)
    {
        return value.Trim().Replace(" ", string.Empty, StringComparison.OrdinalIgnoreCase).ToLowerInvariant();
    }

    private static IReadOnlyList<string> ParseCsvLine(string line)
    {
        var values = new List<string>();
        var currentValue = new StringBuilder();
        var insideQuotes = false;

        for (var index = 0; index < line.Length; index++)
        {
            var character = line[index];

            if (character == '"')
            {
                if (insideQuotes && index + 1 < line.Length && line[index + 1] == '"')
                {
                    currentValue.Append('"');
                    index++;
                }
                else
                {
                    insideQuotes = !insideQuotes;
                }

                continue;
            }

            if (character == ',' && !insideQuotes)
            {
                values.Add(currentValue.ToString());
                currentValue.Clear();
                continue;
            }

            currentValue.Append(character);
        }

        values.Add(currentValue.ToString());
        return values;
    }
}
