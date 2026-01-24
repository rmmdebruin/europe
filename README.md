# Population Maps - US vs Europe

A modern, interactive web application comparing population data between the United States and European countries. Built with a clean monorepo architecture featuring glassmorphism design.

> 🚀 **Quick Start:** See [QUICKSTART.md](QUICKSTART.md) to get running in 5 minutes!  
> 📚 **Documentation:** See [DOCS-INDEX.md](DOCS-INDEX.md) for complete documentation index

## Features

- **Interactive Maps**: Beautiful, clickable maps of the US and Europe
- **Real-time Updates**: Dynamic calculations across all metrics based on user selection
- **7 View Modes**: Population, GDP, Defense, R&D, High-Tech Exports, Renewable Energy, Education
- **Innovation Metrics**: R&D spending shows investment in future competitiveness
- **Industrial Strength**: High-tech exports demonstrate advanced manufacturing capability
- **Energy Independence**: Renewable energy percentage highlights climate leadership
- **Human Capital**: Education attainment shows societal investment in people
- **Defense Analysis**: Absolute spending with per capita and percentage breakdowns
- **GDP in Euros**: All monetary values displayed in EUR (€) with live exchange rates
- **Smart Calculations**: Per capita values and percentage contexts for meaningful comparisons
- **Color-Coded Display**: Red for US, blue for Europe across all metrics
- **Glassmorphism Design**: Modern UI with frosted glass effects and custom icons
- **2024 Data**: Most recent data from World Bank across all categories
- **Responsive**: Works seamlessly on desktop and mobile devices with wrapping toggle buttons

## Tech Stack

### Backend
- **Node.js**: Runtime environment
- **Express**: Web server framework
- **CSV Parser**: Data processing from World Bank CSV

### Frontend
- **React 18**: UI framework
- **Vite**: Build tool and dev server
- **React Simple Maps**: Interactive geographical maps
- **Modern CSS**: Glassmorphism styling

## Project Structure

```
europe/
├── backend/
│   ├── src/
│   │   ├── server.js              # Express server
│   │   └── services/
│   │       ├── populationService.js  # Population data processing
│   │       └── gdpService.js         # GDP data processing
│   └── package.json
├── frontend/
│   ├── src/
│   │   ├── components/
│   │   │   ├── USMap.jsx          # US map component
│   │   │   ├── USMap.css
│   │   │   ├── EuropeMap.jsx      # Europe map component
│   │   │   └── EuropeMap.css
│   │   ├── App.jsx                # Main app component
│   │   ├── App.css
│   │   ├── main.jsx               # React entry point
│   │   └── index.css              # Global styles
│   ├── index.html
│   ├── vite.config.js
│   └── package.json
├── data/
│   ├── API_SP.POP.TOTL_DS2_en_csv_v2_174326.csv    # Population data
│   └── API_NY.GDP.MKTP.CD_DS2_en_csv_v2_174428.csv # GDP data
├── package.json                   # Root workspace config
└── README.md
```

## Getting Started

### Prerequisites

- Node.js 18+ installed
- npm or yarn

### Installation

1. Clone the repository:
```bash
git clone <repository-url>
cd europe
```

2. Install dependencies:
```bash
npm install
```

This will install dependencies for both backend and frontend workspaces.

### Development

Run both backend and frontend in development mode:

```bash
npm run dev
```

This starts:
- Backend server on http://localhost:3001
- Frontend dev server on http://localhost:3000

### Individual Services

Run backend only:
```bash
npm run dev:backend
```

Run frontend only:
```bash
npm run dev:frontend
```

### Production Build

Build the frontend for production:
```bash
npm run build
```

Start the backend in production mode:
```bash
npm start
```

## API Endpoints

### GET /api/health
Health check endpoint.

**Response:**
```json
{
  "status": "ok"
}
```

### GET /api/population
Get population data for US and European countries.

**Response:**
```json
{
  "us": {
    "code": "USA",
    "name": "United States",
    "population": 340110988
  },
  "european": [
    {
      "code": "FRA",
      "name": "France",
      "population": 68372286
    },
    ...
  ]
}
```

### GET /api/gdp
Get GDP data for US and European countries.

**Response:**
```json
{
  "us": {
    "code": "USA",
    "name": "United States",
    "gdp": 28783100000000
  },
  "european": [
    {
      "code": "FRA",
      "name": "France",
      "gdp": 3130900000000
    },
    ...
  ]
}
```

### GET /api/exchange-rate
Get current USD to EUR exchange rate.

**Response:**
```json
{
  "rate": 0.92,
  "lastUpdated": "2024-01-24",
  "source": "exchangerate-api.com"
}
```

### GET /api/combined
Get combined population and GDP data for all countries (recommended endpoint).

**Response:**
```json
{
  "us": {
    "code": "USA",
    "name": "United States",
    "population": 340110988,
    "gdp": 28783100000000
  },
  "european": [
    {
      "code": "FRA",
      "name": "France",
      "population": 68372286,
      "gdp": 3130900000000
    },
    ...
  ],
  "exchangeRate": {
    "rate": 0.92,
    "lastUpdated": "2024-01-24",
    "source": "exchangerate-api.com"
  }
}
```

## How It Works

### Backend
1. Reads World Bank CSV data for population, GDP, and military expenditure
2. Fetches live exchange rates from exchangerate-api.com
3. Calculates absolute defense spending from GDP × defense percentage
4. Filters and processes data for US and European countries
5. Caches processed data in memory for performance
6. Serves data through REST API with five endpoints:
   - `/api/population` - Population data only
   - `/api/gdp` - GDP data only
   - `/api/exchange-rate` - Current USD to EUR rate
   - `/api/defense` - Defense percentage data
   - `/api/combined` - All datasets merged with calculated defense spending (used by frontend)

### Frontend
1. Fetches combined population, GDP, defense, and exchange rate data from backend
2. Renders US map with total values (static display)
3. Renders Europe map with interactive country selection
4. **View Mode Toggle**: Switch between Population, GDP, and Defense Budget views
5. **Smart Calculations**:
   - Population: Shows total count
   - GDP: Shows total in billions/trillions format (EUR €)
   - Defense: Shows absolute spending in billions (EUR €)
   - Per capita: Automatically calculated for both GDP and defense
   - Defense %: Shows military expenditure as percentage of GDP
6. **Color Coding**: Red (#ff6b6b) for US numbers, Blue (#6baafe) for Europe numbers
7. Updates in real-time as user clicks countries
8. Displays detailed breakdown in the country list sidebar

### Styling
- Glassmorphism effects using `backdrop-filter` and transparency
- US map: Red-ish tones (#ff6b6b)
- Europe map: Blue-ish tones (#6baafe)
- US numbers: Red color (#ff6b6b)
- Europe numbers: Blue color (#6baafe)
- Custom glassmorphic icons for toggle buttons (population dots, euro sign, shield)
- Toggle buttons: Clean pill design with smooth transitions
- Responsive design with CSS Grid
- Smooth transitions and hover effects

## Data Source

Economic and demographic data sourced from the World Bank's World Development Indicators:

**Population Data:**
- Dataset: Total Population (SP.POP.TOTL)
- Year: 2024 (most recent)
- Last Updated: December 19, 2025

**GDP Data:**
- Dataset: GDP (current US$) (NY.GDP.MKTP.CD)
- Year: 2024 (most recent)

**Defense Budget Data:**
- Dataset: Military expenditure (% of GDP) (MS.MIL.XPND.GD.ZS)
- Year: 2024
- Calculation: Absolute spending = GDP × (Defense % / 100)

**R&D Spending Data:**
- Dataset: Research and development expenditure (% of GDP) (GB.XPD.RSDV.GD.ZS)
- Year: 2024
- Calculation: Absolute spending = GDP × (R&D % / 100)

**High-Tech Exports Data:**
- Dataset: High-technology exports (% of manufactured exports) (TX.VAL.TECH.MF.ZS)
- Year: 2024
- Shows: Industrial sophistication and advanced manufacturing capability

**Renewable Energy Data:**
- Dataset: Renewable electricity output (% of total electricity output) (EG.ELC.RNEW.ZS)
- Year: 2024
- Shows: Progress toward energy independence and climate goals

**Education Data:**
- Dataset: Educational attainment, upper secondary, population 25+ (%) (SE.SEC.CUAT.UP.ZS)
- Year: 2024
- Shows: Human capital development and societal investment

**Exchange Rates:**
- Source: exchangerate-api.com
- Updates: Daily (cached for 24 hours)
- Fallback rate: 0.92 EUR per USD (if API unavailable)

All monetary values (GDP, Defense, R&D) are sourced in US dollars and automatically converted to euros (€) for display.

## Browser Support

- Chrome/Edge 88+
- Firefox 94+
- Safari 15.4+

Note: Glassmorphism effects require modern browsers with `backdrop-filter` support.

## Future Enhancements

- Add country tooltips with names on hover
- Include historical data and trends for both population and GDP
- Add zoom and pan controls for maps
- Export selected data to CSV/JSON
- Dark/light mode toggle
- Additional metrics (GDP growth rate, population density)
- Additional regions (Asia, Africa, etc.)
- Comparison charts and visualizations

## License

MIT

## Contributing

Contributions welcome! Please follow best practices and maintain the clean architecture.
