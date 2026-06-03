using ProductStockReporter.Application;
using ProductStockReporter.Infrastructure;

var optionsResult = CliOptions.Parse(args);
if (!optionsResult.Success)
{
    Console.Error.WriteLine(optionsResult.Message);
    CliOptions.PrintUsage();
    return 1;
}

if (optionsResult.Options.ShowHelp)
{
    CliOptions.PrintUsage();
    return 0;
}

try
{
    IProductReader productReader = new CsvProductReader();
    IStockReportGenerator reportGenerator = new StockReportGenerator();
    IReportWriter reportWriter = new JsonReportWriter();

    using var cancellationTokenSource = new CancellationTokenSource();
    Console.CancelKeyPress += (_, eventArgs) =>
    {
        eventArgs.Cancel = true;
        cancellationTokenSource.Cancel();
    };

    var importResult = await productReader.ReadAsync(optionsResult.Options.InputDirectory, cancellationTokenSource.Token);
    var report = reportGenerator.Generate(importResult.Products);
    await reportWriter.WriteAsync(optionsResult.Options.OutputDirectory, optionsResult.Options.OutputFileName, report, cancellationTokenSource.Token);

    foreach (var issue in importResult.Issues)
    {
        Console.Error.WriteLine($"Warning: {issue.SourceFile}:{issue.LineNumber} - {issue.Message}");
    }

    Console.WriteLine($"Processed {importResult.Products.Count} products in {report.Count} categories.");
    Console.WriteLine($"Report saved to {Path.Combine(optionsResult.Options.OutputDirectory, optionsResult.Options.OutputFileName)}");
    return 0;
}
catch (OperationCanceledException)
{
    Console.Error.WriteLine("Operation cancelled.");
    return 2;
}
catch (Exception exception) when (exception is IOException or UnauthorizedAccessException or ArgumentException or DirectoryNotFoundException)
{
    Console.Error.WriteLine($"Error: {exception.Message}");
    return 1;
}

internal sealed record CliOptions(string InputDirectory, string OutputDirectory, string OutputFileName, bool ShowHelp)
{
    private const string DefaultOutputFileName = "stock-summary.json";

    public static CliOptionsResult Parse(string[] args)
    {
        if (args.Length == 0)
        {
            return CliOptionsResult.Failure("Missing required arguments.");
        }

        var values = new Dictionary<string, string>(StringComparer.OrdinalIgnoreCase);
        var showHelp = false;

        for (var index = 0; index < args.Length; index++)
        {
            var argument = args[index];

            if (argument is "--help" or "-h")
            {
                showHelp = true;
                continue;
            }

            if (!argument.StartsWith("--", StringComparison.Ordinal))
            {
                return CliOptionsResult.Failure($"Unexpected argument: {argument}");
            }

            if (index + 1 >= args.Length || args[index + 1].StartsWith("--", StringComparison.Ordinal))
            {
                return CliOptionsResult.Failure($"Missing value for argument: {argument}");
            }

            values[argument] = args[++index];
        }

        if (showHelp)
        {
            return CliOptionsResult.SuccessResult(new CliOptions(string.Empty, string.Empty, DefaultOutputFileName, true));
        }

        if (!values.TryGetValue("--input", out var inputDirectory) || string.IsNullOrWhiteSpace(inputDirectory))
        {
            return CliOptionsResult.Failure("The --input directory is required.");
        }

        if (!values.TryGetValue("--output", out var outputDirectory) || string.IsNullOrWhiteSpace(outputDirectory))
        {
            return CliOptionsResult.Failure("The --output directory is required.");
        }

        values.TryGetValue("--file", out var outputFileName);
        outputFileName = string.IsNullOrWhiteSpace(outputFileName) ? DefaultOutputFileName : outputFileName;

        if (!outputFileName.EndsWith(".json", StringComparison.OrdinalIgnoreCase))
        {
            return CliOptionsResult.Failure("The --file value must end with .json.");
        }

        return CliOptionsResult.SuccessResult(new CliOptions(inputDirectory, outputDirectory, outputFileName, false));
    }

    public static void PrintUsage()
    {
        Console.WriteLine("Usage: dotnet run -- --input <csv-directory> --output <json-directory> [--file stock-summary.json]");
        Console.WriteLine("CSV columns: sku,name,category,unitPrice,quantity");
    }
}

internal sealed record CliOptionsResult(bool Success, CliOptions Options, string Message)
{
    public static CliOptionsResult SuccessResult(CliOptions options)
    {
        return new CliOptionsResult(true, options, string.Empty);
    }

    public static CliOptionsResult Failure(string message)
    {
        return new CliOptionsResult(false, new CliOptions(string.Empty, string.Empty, string.Empty, false), message);
    }
}
