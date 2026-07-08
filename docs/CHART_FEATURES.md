# Financial Chart Creation Features

## Overview

Your Vespera AI Chatbot now includes powerful financial chart creation capabilities using **mplfinance**, **yfinance**, and **matplotlib**. This feature allows users to generate professional financial charts with real-time stock data, technical indicators, and annotations.

## Features

### 📊 Chart Types

- **Candlestick Charts**: Traditional OHLC candlestick patterns
- **Line Charts**: Simple price line charts
- **Volume Analysis**: Integrated volume bars
- **Multiple Timeframes**: 1d, 5d, 1mo, 3mo, 6mo, 1y, 2y, 5y, 10y, ytd, max

### 📈 Technical Indicators

- **SMA (Simple Moving Average)**: Configurable periods
- **EMA (Exponential Moving Average)**: Configurable periods
- **Bollinger Bands**: Upper and lower bands with standard deviation
- **RSI (Relative Strength Index)**: Momentum oscillator
- **MACD (Moving Average Convergence Divergence)**: Trend-following indicator
- **Stochastic Oscillator**: Momentum indicator

### 🎨 Chart Annotations

- **Text Annotations**: Custom text labels on charts
- **Horizontal Lines**: Support/resistance levels
- **Vertical Lines**: Time-based markers
- **Arrows**: Trend direction indicators
- **Shapes**: Circles, rectangles for highlighting

### 🎯 Chart Styles

- **charles**: Traditional financial chart style
- **binance**: Modern cryptocurrency exchange style
- **yahoo**: Yahoo Finance style
- **base**: Clean, minimal style
- **blkbrd_sch**: Black background with colored candles
- **blkbrd_mch**: Black background with monochrome candles
- **sas**: SAS-style charts
- **mike**: Mike-style charts

## Usage Examples

### Basic Stock Chart

```
"Create a candlestick chart for AAPL over the last year"
```

### Chart with Technical Indicators

```
"Show me TSLA with 20-day SMA and Bollinger Bands"
```

### Annotated Chart

```
"Create an annotated chart for GOOGL with support levels at $150"
```

### Volume Analysis

```
"Generate a volume analysis chart for MSFT with 50-day EMA"
```

### Custom Timeframe

```
"Create a 6-month line chart for NVDA with RSI indicator"
```

## Technical Implementation

### Python Dependencies

- **mplfinance**: Professional financial charting library
- **yfinance**: Yahoo Finance data API
- **pandas**: Data manipulation and analysis
- **numpy**: Numerical computing
- **matplotlib**: Base plotting library

### AI Tool Integration

The chart creation is integrated as an AI tool (`createChart`) that:

1. Accepts user requests for chart creation
2. Downloads real-time stock data via yfinance
3. Generates professional charts using mplfinance
4. Returns base64-encoded chart images
5. Provides comprehensive statistics and metadata

### Chart Statistics

Each generated chart includes:

- Current price and price change
- High/low values for the period
- Average volume
- Number of data points
- Date range covered
- Chart configuration details

## Setup Requirements

### Python Environment

The application uses a Python virtual environment with the following packages:

```bash
# Create virtual environment
python3 -m venv venv

# Activate environment
source venv/bin/activate

# Install dependencies
pip install mplfinance yfinance pandas numpy matplotlib
```

### Environment Variables

No additional environment variables are required for chart functionality. The tool uses public APIs for stock data.

## Chart Display Component

The `ChartDisplay` component provides a rich interface for viewing generated charts:

- High-resolution chart images
- Price statistics and change indicators
- Technical indicator badges
- Volume analysis information
- Chart configuration details
- Responsive design for mobile and desktop

## Error Handling

The chart creation tool includes comprehensive error handling:

- Invalid stock symbols
- Network connectivity issues
- Data availability problems
- Chart generation failures
- File system errors

## Performance Considerations

- Charts are generated on-demand
- Temporary files are automatically cleaned up
- Base64 encoding for efficient image transmission
- Optimized chart sizes for web display
- Caching of frequently requested data

## Future Enhancements

Potential future features:

- **Real-time Updates**: Live chart updates
- **Interactive Charts**: Zoom, pan, and hover effects
- **Custom Indicators**: User-defined technical indicators
- **Chart Templates**: Predefined chart configurations
- **Export Options**: PDF, SVG, and other formats
- **Multi-Symbol Charts**: Comparison charts
- **Backtesting**: Historical strategy testing

## Troubleshooting

### Common Issues

1. **"No data found for symbol"**

   - Verify the stock symbol is correct
   - Check if the symbol is listed on Yahoo Finance
   - Try a different timeframe

2. **Chart generation fails**

   - Ensure Python virtual environment is activated
   - Verify all dependencies are installed
   - Check system memory availability

3. **Poor chart quality**
   - Adjust chart size parameters
   - Use different chart styles
   - Reduce data points for longer timeframes

### Support

For technical issues with chart creation:

1. Check the browser console for errors
2. Verify Python environment setup
3. Test with simple chart requests first
4. Review the generated Python script for syntax errors

## Security Considerations

- Uses public APIs only (no API keys required)
- Temporary files are automatically cleaned up
- No sensitive data is stored or transmitted
- Chart generation runs in isolated environment
- Input validation prevents code injection

---

This chart creation feature transforms your AI chatbot into a powerful financial analysis tool, enabling users to generate professional-quality charts with real-time data and advanced technical analysis capabilities.
