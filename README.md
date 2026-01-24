# Population Maps - US vs Europe

A modern, interactive web application comparing population data between the United States and European countries. Built with a clean monorepo architecture featuring glassmorphism design.

> 🚀 **Quick Start:** See [QUICKSTART.md](QUICKSTART.md) to get running in 5 minutes!  
> 📚 **Documentation:** See [DOCS-INDEX.md](DOCS-INDEX.md) for complete documentation index

## Features

- **Interactive Maps**: Beautiful, clickable maps of the US and Europe
- **Real-time Updates**: Dynamic population calculations based on user selection
- **Glassmorphism Design**: Modern UI with frosted glass effects
- **2024 Data**: Most recent population data from World Bank
- **Responsive**: Works seamlessly on desktop and mobile devices

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
│   │       └── populationService.js  # Data processing
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
│   └── API_SP.POP.TOTL_DS2_en_csv_v2_174326.csv
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

## How It Works

### Backend
1. Reads World Bank population CSV data
2. Filters and processes data for US and European countries
3. Caches processed data in memory
4. Serves data through REST API

### Frontend
1. Fetches population data from backend
2. Renders US map with total population (static display)
3. Renders Europe map with interactive country selection
4. Calculates and displays sum of selected European countries
5. Updates in real-time as user clicks countries

### Styling
- Glassmorphism effects using `backdrop-filter` and transparency
- US map: Red-ish tones (#ff6b6b)
- Europe map: Blue-ish tones (#6baafe)
- Responsive design with CSS Grid
- Smooth transitions and hover effects

## Data Source

Population data sourced from the World Bank's World Development Indicators:
- Dataset: Total Population (SP.POP.TOTL)
- Year: 2024 (most recent)
- Last Updated: December 19, 2025

## Browser Support

- Chrome/Edge 88+
- Firefox 94+
- Safari 15.4+

Note: Glassmorphism effects require modern browsers with `backdrop-filter` support.

## Future Enhancements

- Add country tooltips with names
- Include historical data and trends
- Add zoom and pan controls
- Export selected data
- Dark/light mode toggle
- Additional regions (Asia, Africa, etc.)

## License

MIT

## Contributing

Contributions welcome! Please follow best practices and maintain the clean architecture.
