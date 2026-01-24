import express from 'express';
import cors from 'cors';
import { getPopulationData } from './services/populationService.js';
import { getGDPData } from './services/gdpService.js';
import { getExchangeRate } from './services/exchangeRateService.js';
import { getDefensePercentageData } from './services/defenseService.js';

const app = express();
const PORT = process.env.PORT || 3001;

app.use(cors());
app.use(express.json());

// Health check endpoint
app.get('/api/health', (req, res) => {
  res.json({ status: 'ok' });
});

// Get population data for all countries
app.get('/api/population', async (req, res) => {
  try {
    const data = await getPopulationData();
    res.json(data);
  } catch (error) {
    console.error('Error fetching population data:', error);
    res.status(500).json({ error: 'Failed to fetch population data' });
  }
});

// Get GDP data for all countries
app.get('/api/gdp', async (req, res) => {
  try {
    const data = await getGDPData();
    res.json(data);
  } catch (error) {
    console.error('Error fetching GDP data:', error);
    res.status(500).json({ error: 'Failed to fetch GDP data' });
  }
});

// Get exchange rate (USD to EUR)
app.get('/api/exchange-rate', async (req, res) => {
  try {
    const exchangeRate = await getExchangeRate();
    res.json(exchangeRate);
  } catch (error) {
    console.error('Error fetching exchange rate:', error);
    res.status(500).json({ error: 'Failed to fetch exchange rate' });
  }
});

// Get combined data (population + GDP + defense) for all countries
app.get('/api/combined', async (req, res) => {
  try {
    const [populationData, gdpData, defenseData, exchangeRate] = await Promise.all([
      getPopulationData(),
      getGDPData(),
      getDefensePercentageData(),
      getExchangeRate()
    ]);

    // Merge the data and calculate absolute defense spending
    const result = {
      us: {
        ...populationData.us,
        gdp: gdpData.us?.gdp || 0,
        defensePercentage: defenseData.us?.defensePercentage || 0
      },
      european: populationData.european.map(popCountry => {
        const gdpCountry = gdpData.european.find(g => g.code === popCountry.code);
        const defenseCountry = defenseData.european.find(d => d.code === popCountry.code);
        const gdp = gdpCountry?.gdp || 0;
        const defensePercentage = defenseCountry?.defensePercentage || 0;
        
        return {
          ...popCountry,
          gdp: gdp,
          defensePercentage: defensePercentage,
          defenseSpending: gdp * (defensePercentage / 100) // Calculate absolute spending
        };
      }),
      exchangeRate: exchangeRate
    };

    // Calculate absolute defense spending for US
    result.us.defenseSpending = result.us.gdp * (result.us.defensePercentage / 100);

    res.json(result);
  } catch (error) {
    console.error('Error fetching combined data:', error);
    res.status(500).json({ error: 'Failed to fetch combined data' });
  }
});

app.listen(PORT, () => {
  console.log(`Backend server running on http://localhost:${PORT}`);
});
