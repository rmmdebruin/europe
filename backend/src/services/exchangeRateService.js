// Exchange rate service for USD to EUR conversion
// Uses exchangerate-api.io (free, no API key required)

let cachedRate = null;
let lastFetchTime = null;
const CACHE_DURATION = 24 * 60 * 60 * 1000; // 24 hours in milliseconds

export async function getExchangeRate() {
  // Return cached rate if still valid
  if (cachedRate && lastFetchTime && (Date.now() - lastFetchTime < CACHE_DURATION)) {
    return cachedRate;
  }

  try {
    // Fetch latest USD to EUR rate
    const response = await fetch('https://api.exchangerate-api.com/v4/latest/USD');
    
    if (!response.ok) {
      throw new Error('Failed to fetch exchange rate');
    }

    const data = await response.json();
    const usdToEur = data.rates.EUR;

    if (!usdToEur || isNaN(usdToEur)) {
      throw new Error('Invalid exchange rate data');
    }

    // Cache the rate
    cachedRate = {
      rate: usdToEur,
      lastUpdated: data.date || new Date().toISOString().split('T')[0],
      source: 'exchangerate-api.com'
    };
    lastFetchTime = Date.now();

    return cachedRate;
  } catch (error) {
    console.error('Error fetching exchange rate:', error);
    
    // Fallback to a recent rate if API fails
    // (ECB rate as of January 2024: ~0.92)
    if (!cachedRate) {
      cachedRate = {
        rate: 0.92,
        lastUpdated: 'fallback',
        source: 'fallback-rate'
      };
    }
    
    return cachedRate;
  }
}
