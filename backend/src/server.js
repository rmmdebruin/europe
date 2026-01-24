import express from 'express';
import cors from 'cors';
import { getPopulationData } from './services/populationService.js';
import { getGDPData } from './services/gdpService.js';
import { getExchangeRate } from './services/exchangeRateService.js';
import { getDefensePercentageData } from './services/defenseService.js';
import { getRnDPercentageData } from './services/rndService.js';
import { getHighTechExportsData } from './services/highTechService.js';
import { getRenewableEnergyData } from './services/renewableService.js';
import { getEducationData } from './services/educationService.js';

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

// Get combined data (population + GDP + defense + R&D + hightech + renewable + education) for all countries
app.get('/api/combined', async (req, res) => {
  try {
    const [
      populationData,
      gdpData,
      defenseData,
      rndData,
      highTechData,
      renewableData,
      educationData,
      exchangeRate
    ] = await Promise.all([
      getPopulationData(),
      getGDPData(),
      getDefensePercentageData(),
      getRnDPercentageData(),
      getHighTechExportsData(),
      getRenewableEnergyData(),
      getEducationData(),
      getExchangeRate()
    ]);

    // Merge the data and calculate absolute values
    const result = {
      us: {
        ...populationData.us,
        gdp: gdpData.us?.gdp || 0,
        defensePercentage: defenseData.us?.defensePercentage || 0,
        rndPercentage: rndData.us?.rndPercentage || 0,
        highTechExports: highTechData.us?.highTechExports || 0,
        highTechPercentage: highTechData.us?.highTechPercentage || 0,
        renewablePercentage: renewableData.us?.renewablePercentage || 0,
        educationPercentage: educationData.us?.educationPercentage || 0
      },
      european: populationData.european.map(popCountry => {
        const gdpCountry = gdpData.european.find(g => g.code === popCountry.code);
        const defenseCountry = defenseData.european.find(d => d.code === popCountry.code);
        const rndCountry = rndData.european.find(r => r.code === popCountry.code);
        const highTechCountry = highTechData.european.find(h => h.code === popCountry.code);
        const renewableCountry = renewableData.european.find(r => r.code === popCountry.code);
        const educationCountry = educationData.european.find(e => e.code === popCountry.code);
        
        const gdp = gdpCountry?.gdp || 0;
        const defensePercentage = defenseCountry?.defensePercentage || 0;
        const rndPercentage = rndCountry?.rndPercentage || 0;
        
        return {
          ...popCountry,
          gdp: gdp,
          defensePercentage: defensePercentage,
          defenseSpending: gdp * (defensePercentage / 100),
          rndPercentage: rndPercentage,
          rndSpending: gdp * (rndPercentage / 100),
          highTechExports: highTechCountry?.highTechExports || 0,
          highTechPercentage: highTechCountry?.highTechPercentage || 0,
          renewablePercentage: renewableCountry?.renewablePercentage || 0,
          educationPercentage: educationCountry?.educationPercentage || 0
        };
      }),
      exchangeRate: exchangeRate
    };

    // Calculate absolute spending for US
    result.us.defenseSpending = result.us.gdp * (result.us.defensePercentage / 100);
    result.us.rndSpending = result.us.gdp * (result.us.rndPercentage / 100);

    res.json(result);
  } catch (error) {
    console.error('Error fetching combined data:', error);
    res.status(500).json({ error: 'Failed to fetch combined data' });
  }
});

app.listen(PORT, () => {
  console.log(`Backend server running on http://localhost:${PORT}`);
});
