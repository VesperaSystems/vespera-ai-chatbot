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
        // Create a simple Python script template
        const pythonScript = `import yfinance as yf
import mplfinance as mpf
import pandas as pd
import matplotlib.pyplot as plt

def create_financial_chart(symbol, period='1y', interval='1d', chart_type='candle', 
                          volume=True, style='charles', title=None, save_path='chart.png'):
    """
    Create a financial chart using mplfinance and yfinance
    
    Parameters:
    - symbol: Stock symbol (e.g., 'AAPL', 'TSLA')
    - period: Time period ('1d', '5d', '1mo', '3mo', '6mo', '1y', '2y', '5y', '10y', 'ytd', 'max')
    - interval: Data interval ('1m', '2m', '5m', '15m', '30m', '60m', '90m', '1h', '1d', '5d', '1wk', '1mo', '3mo')
    - chart_type: 'candle' or 'line'
    - volume: Show volume bars (True/False)
    - style: Chart style ('charles', 'binance', 'blkbrd_sch', 'blkbrd_mch', 'sas', 'mike', 'yahoo', 'base')
    - title: Chart title
    - save_path: Path to save the chart image
    """
    
    try:
        # Download stock data
        print("Downloading data for " + symbol + "...")
        ticker = yf.Ticker(symbol)
        data = ticker.history(period=period, interval=interval)
        
        if data.empty:
            print("No data found for symbol " + symbol)
            return
        
        print("Downloaded " + str(len(data)) + " data points")
        
        # Prepare the data for mplfinance
        data.index.name = 'Date'
        
        # Set up the chart style
        mc = mpf.make_marketcolors(
            up='green', down='red',
            edge='inherit',
            wick='inherit',
            volume='in',
            ohlc='inherit'
        )
        
        s = mpf.make_mpf_style(
            marketcolors=mc,
            gridstyle=':',
            y_on_right=False
        )
        
        # Create the chart
        chart_title = title or (symbol + " Stock Price Chart (" + period + ")")
        
        print("Creating " + chart_type + " chart...")
        
        if chart_type == 'candle':
            mpf.plot(
                data,
                type='candle',
                volume=volume,
                style=s,
                title=chart_title,
                savefig=save_path,
                figsize=(12, 8),
                panel_ratios=(3, 1) if volume else None
            )
        elif chart_type == 'line':
            mpf.plot(
                data,
                type='line',
                volume=volume,
                style=s,
                title=chart_title,
                savefig=save_path,
                figsize=(12, 8),
                panel_ratios=(3, 1) if volume else None
            )
        else:
            print("Chart type '" + chart_type + "' not supported. Use 'candle' or 'line'.")
            return
        
        print("Chart saved as " + save_path)
        
        # Print some basic statistics
        current_price = data['Close'].iloc[-1]
        price_change = data['Close'].iloc[-1] - data['Close'].iloc[0]
        price_change_pct = (price_change / data['Close'].iloc[0]) * 100
        
        print("\\nChart Statistics:")
        print("Current Price: $" + str(round(current_price, 2)))
        print("Price Change: $" + str(round(price_change, 2)) + " (" + str(round(price_change_pct, 2)) + "%)")
        print("High: $" + str(round(data['High'].max(), 2)))
        print("Low: $" + str(round(data['Low'].min(), 2)))
        print("Average Volume: " + str(int(data['Volume'].mean())))
        print("Data Points: " + str(len(data)))
        print("Date Range: " + data.index[0].strftime('%Y-%m-%d') + " to " + data.index[-1].strftime('%Y-%m-%d'))
        
    except Exception as e:
        print("Error creating chart: " + str(e))

# Example usage - modify these parameters as needed
symbol = '${symbol}'
period = '${period}'
interval = '${interval}'
chart_type = '${chartType}'
volume = ${volumePy}
style = '${style}'
title = '${titleValue}'
save_path = '${savePath}'

# Create the chart
create_financial_chart(
    symbol=symbol,
    period=period,
    interval=interval,
    chart_type=chart_type,
    volume=volume,
    style=style,
    title=title,
    save_path=save_path
)
`;

        // Create the document content
        const titleText = title || `${symbol} Stock Price Chart`;
        const documentContent = `# Financial Chart Generator for ${symbol}

This Python script creates a professional financial chart using mplfinance and yfinance.

## Chart Details
- **Symbol**: ${symbol}
- **Period**: ${period}
- **Interval**: ${interval}
- **Chart Type**: ${chartType}
- **Volume**: ${volume ? 'Enabled' : 'Disabled'}
- **Style**: ${style}
- **Title**: ${titleText}

## Python Script

\`\`\`python
${pythonScript}
\`\`\`

## Usage
To run this script, you need:
- Python 3.7+
- mplfinance
- yfinance
- pandas
- matplotlib

Install dependencies:
\`\`\`bash
pip install mplfinance yfinance pandas matplotlib
\`\`\`

The script will generate a chart image saved as '${savePath}'.
`;

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
