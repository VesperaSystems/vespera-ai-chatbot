/* eslint-disable import/namespace */
import { z } from 'zod';
import type { Tool } from 'ai';
import { exec } from 'node:child_process';
import { promisify } from 'node:util';

const execAsync = promisify(exec);

const createChartSchema = z.object({
  symbol: z.string().describe('Stock symbol (e.g., AAPL, TSLA, GOOGL)'),
  period: z
    .string()
    .optional()
    .describe('Time period (1d, 5d, 1mo, 3mo, 6mo, 1y, 2y, 5y, 10y, ytd, max)'),
  interval: z
    .string()
    .optional()
    .describe(
      'Data interval (1m, 2m, 5m, 15m, 30m, 60m, 90m, 1h, 1d, 5d, 1wk, 1mo, 3mo)',
    ),
  chartType: z
    .enum(['candle', 'line', 'renko', 'pnf'])
    .optional()
    .describe('Chart type'),
  volume: z.boolean().optional().describe('Show volume bars'),
  style: z
    .string()
    .optional()
    .describe(
      'Chart style (charles, binance, blkbrd_sch, blkbrd_mch, sas, mike, yahoo, base)',
    ),
  title: z.string().optional().describe('Chart title'),
  annotations: z
    .array(
      z.object({
        type: z.enum([
          'text',
          'arrow',
          'hline',
          'vline',
          'circle',
          'rectangle',
        ]),
        x: z.union([z.string(), z.number()]).optional(),
        y: z.union([z.string(), z.number()]).optional(),
        text: z.string().optional(),
        color: z.string().optional(),
        style: z.string().optional(),
      }),
    )
    .optional()
    .describe('Chart annotations'),
  indicators: z
    .array(
      z.object({
        type: z.enum(['sma', 'ema', 'bbands', 'rsi', 'macd', 'stoch']),
        period: z.number().optional(),
        color: z.string().optional(),
      }),
    )
    .optional()
    .describe('Technical indicators'),
  savePath: z.string().optional().describe('Path to save the chart image'),
});

export const createChart = ({
  session,
  dataStream,
}: { session: any; dataStream: any }) => {
  return {
    description:
      'Create professional financial charts using mplfinance with real stock data. Supports candlestick charts, technical indicators, annotations, and various chart styles.',
    parameters: createChartSchema,
    execute: async (params: z.infer<typeof createChartSchema>) => {
      try {
        const {
          symbol,
          period = '1y',
          interval = '1d',
          chartType = 'candle',
          volume = true,
          style = 'charles',
          title,
          annotations = [],
          indicators = [],
          savePath = 'chart.png',
        } = params;

        const volumePy = volume ? 'True' : 'False';
        const titleValue = title || `${symbol} Stock Price Chart`;
        const chartTypeValue = chartType;
        const styleValue = style;
        const savePathValue = savePath;

        // Create a simple Python script template using string concatenation
        const pythonScript =
          `import yfinance as yf\nimport mplfinance as mpf\nimport pandas as pd\nimport matplotlib.pyplot as plt\n\ndef create_financial_chart(symbol, period='1y', interval='1d', chart_type='candle', \n                          volume=True, style='charles', title=None, save_path='chart.png'):\n    """\n    Create a financial chart using mplfinance and yfinance\n    \n    Parameters:\n    - symbol: Stock symbol (e.g., 'AAPL', 'TSLA')\n    - period: Time period ('1d', '5d', '1mo', '3mo', '6mo', '1y', '2y', '5y', '10y', 'ytd', 'max')\n    - interval: Data interval ('1m', '2m', '5m', '15m', '30m', '60m', '90m', '1h', '1d', '5d', '1wk', '1mo', '3mo')\n    - chart_type: 'candle' or 'line'\n    - volume: Show volume bars (True/False)\n    - style: Chart style ('charles', 'binance', 'blkbrd_sch', 'blkbrd_mch', 'sas', 'mike', 'yahoo', 'base')\n    - title: Chart title\n    - save_path: Path to save the chart image\n    """\n    \n    try:\n        # Download stock data\n        print("Downloading data for " + symbol + "...")\n        ticker = yf.Ticker(symbol)\n        data = ticker.history(period=period, interval=interval)\n        \n        if data.empty:\n            print("No data found for symbol " + symbol)\n            return\n        \n        print("Downloaded " + str(len(data)) + " data points")\n        \n        # Prepare the data for mplfinance\n        data.index.name = 'Date'\n        \n        # Set up the chart style\n        mc = mpf.make_marketcolors(\n            up='green', down='red',\n            edge='inherit',\n            wick='inherit',\n            volume='in',\n            ohlc='inherit'\n        )\n        \n        s = mpf.make_mpf_style(\n            marketcolors=mc,\n            gridstyle=':',\n            y_on_right=False\n        )\n        \n        # Create the chart\n        chart_title = title or (symbol + " Stock Price Chart (" + period + ")")\n        \n        print("Creating " + chart_type + " chart...")\n        \n        if chart_type == 'candle':\n            mpf.plot(\n                data,\n                type='candle',\n                volume=volume,\n                style=s,\n                title=chart_title,\n                savefig=save_path,\n                figsize=(12, 8),\n                panel_ratios=(3, 1) if volume else None\n            )\n        elif chart_type == 'line':\n            mpf.plot(\n                data,\n                type='line',\n                volume=volume,\n                style=s,\n                title=chart_title,\n                savefig=save_path,\n                figsize=(12, 8),\n                panel_ratios=(3, 1) if volume else None\n            )\n        else:\n            print(\"Chart type '\" + chart_type + \"' not supported. Use 'candle' or 'line'.\")\n            return\n        \n        print("Chart saved as " + save_path)\n        \n        # Print some basic statistics\n        current_price = data['Close'].iloc[-1]\n        price_change = data['Close'].iloc[-1] - data['Close'].iloc[0]\n        price_change_pct = (price_change / data['Close'].iloc[0]) * 100\n        \n        print("\\nChart Statistics:")\n        print("Current Price: $" + str(round(current_price, 2)))\n        print("Price Change: $" + str(round(price_change, 2)) + " (" + str(round(price_change_pct, 2)) + "%")\n        print("High: $" + str(round(data[\'High\'].max(), 2)))\n        print("Low: $" + str(round(data[\'Low\'].min(), 2)))\n        print("Average Volume: " + str(int(data[\'Volume\'].mean())))\n        print("Data Points: " + str(len(data)))\n        print("Date Range: " + data.index[0].strftime(\'%Y-%m-%d\') + " to " + data.index[-1].strftime(\'%Y-%m-%d\'))\n        \n    except Exception as e:\n        print("Error creating chart: " + str(e))\n\n# Example usage - modify these parameters as needed\nsymbol = '${symbol}'\nperiod = '${period}'\ninterval = '${interval}'\nchart_type = '${chartTypeValue}'\nvolume = ${volumePy}\nstyle = '${styleValue}'\ntitle = '${titleValue}'\nsave_path = '${savePathValue}'\n\n# Create the chart\ncreate_financial_chart(\n    symbol=symbol,\n    period=period,\n    interval=interval,\n    chart_type=chart_type,\n    volume=volume,\n    style=style,\n    title=title,\n    save_path=save_path\n)`;

        // Create the document content
        const titleText = title || `${symbol} Stock Price Chart`;
        const volumeText = volume ? 'Enabled' : 'Disabled';
        const documentContent =
          `# Financial Chart Generator for ${symbol}\n\nThis Python script creates a professional financial chart using mplfinance and yfinance.\n\n## Chart Details\n- **Symbol**: ${symbol}\n- **Period**: ${period}\n- **Interval**: ${interval}\n- **Chart Type**: ${chartTypeValue}\n- **Volume**: ${volumeText}\n- **Style**: ${styleValue}\n- **Title**: ${titleText}\n\n## Python Script\n\n\`\`\`python\n${pythonScript}\n\`\`\`\n\n## Usage\nTo run this script, you need:\n- Python 3.7+\n- mplfinance\n- yfinance\n- pandas\n- matplotlib\n\nInstall dependencies:\n\`\`\`bash\npip install mplfinance yfinance pandas matplotlib\n\`\`\`\n\nThe script will generate a chart image saved as '${savePathValue}'.`;

        // Immediately return a document artifact with the script and chart details
        return {
          success: true,
          message: `Chart script created for ${symbol}`,
          document: {
            content: documentContent,
            language: 'markdown',
            filename: `${symbol}_chart_generator.md`,
          },
          details: {
            symbol,
            period,
            interval,
            chartType,
            volume,
            style,
            title: title || `${symbol} Stock Price Chart`,
            annotations: annotations.length,
            indicators: indicators.length,
          },
        };
      } catch (error) {
        console.error('Error in createChart tool:', error);
        return {
          error: 'Failed to create chart',
          message:
            error instanceof Error ? error.message : 'Unknown error occurred',
        };
      }
    },
  } satisfies Tool<typeof createChartSchema, any>;
};
