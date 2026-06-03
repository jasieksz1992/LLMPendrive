using ProductStockReporter.Domain;

namespace ProductStockReporter.Application;

public sealed record ImportIssue(string SourceFile, int LineNumber, string Message);

public sealed record ProductImportResult(IReadOnlyList<Product> Products, IReadOnlyList<ImportIssue> Issues);
