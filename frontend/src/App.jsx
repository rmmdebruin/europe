import { useState, useEffect } from 'react';
import USMap from './components/USMap';
import EuropeMap from './components/EuropeMap';
import './App.css';

function App() {
  const [combinedData, setCombinedData] = useState(null);
  const [selectedCountries, setSelectedCountries] = useState(new Set());
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [viewMode, setViewMode] = useState('population'); // 'population', 'gdp', or 'defense'

  useEffect(() => {
    fetchCombinedData();
  }, []);

  const fetchCombinedData = async () => {
    try {
      const response = await fetch('/api/combined');
      if (!response.ok) {
        throw new Error('Failed to fetch data');
      }
      const data = await response.json();
      setCombinedData(data);
      setLoading(false);
    } catch (err) {
      setError(err.message);
      setLoading(false);
    }
  };

  const toggleCountry = (countryCode) => {
    setSelectedCountries(prev => {
      const newSet = new Set(prev);
      if (newSet.has(countryCode)) {
        newSet.delete(countryCode);
      } else {
        newSet.add(countryCode);
      }
      return newSet;
    });
  };

  const calculateEuropeanTotal = () => {
    if (!combinedData) return { population: 0, gdp: 0, defenseSpending: 0 };
    const filtered = combinedData.european.filter(country => selectedCountries.has(country.code));
    return {
      population: filtered.reduce((sum, country) => sum + country.population, 0),
      gdp: filtered.reduce((sum, country) => sum + (country.gdp || 0), 0),
      defenseSpending: filtered.reduce((sum, country) => sum + (country.defenseSpending || 0), 0)
    };
  };

  const getSelectedCountries = () => {
    if (!combinedData) return [];
    return combinedData.european
      .filter(country => selectedCountries.has(country.code))
      .sort((a, b) => a.name.localeCompare(b.name));
  };

  const formatNumber = (num) => {
    return new Intl.NumberFormat('en-US').format(Math.round(num));
  };

  const convertToEUR = (usdAmount) => {
    if (!combinedData?.exchangeRate?.rate) return usdAmount;
    return usdAmount * combinedData.exchangeRate.rate;
  };

  const formatGDP = (gdp) => {
    const amount = convertToEUR(gdp);
    const trillion = amount / 1e12;
    if (trillion >= 1) {
      return `€${trillion.toFixed(2)}T`;
    }
    const billion = amount / 1e9;
    return `€${billion.toFixed(0)}B`;
  };

  const formatGDPPerCapita = (gdp, population) => {
    if (population === 0) return '€0';
    const amount = convertToEUR(gdp);
    const perCapita = amount / population;
    return `€${Math.round(perCapita).toLocaleString('en-US')}`;
  };

  const formatDefense = (defense) => {
    const amount = convertToEUR(defense);
    const billion = amount / 1e9;
    return `€${billion.toFixed(1)}B`;
  };

  const formatDefensePerCapita = (defense, population) => {
    if (population === 0) return '€0';
    const amount = convertToEUR(defense);
    const perCapita = amount / population;
    return `€${Math.round(perCapita).toLocaleString('en-US')}`;
  };

  if (loading) {
    return (
      <div className="app loading">
        <div className="loading-spinner">Loading...</div>
      </div>
    );
  }

  if (error) {
    return (
      <div className="app error">
        <div className="error-message">Error: {error}</div>
      </div>
    );
  }

  const europeanTotal = calculateEuropeanTotal();
  const selectedCountryList = getSelectedCountries();
  
  // Determine if Europe exceeds US based on current view mode
  const europeExceedsUS = viewMode === 'population' 
    ? europeanTotal.population > combinedData.us.population
    : viewMode === 'gdp'
    ? europeanTotal.gdp > combinedData.us.gdp
    : europeanTotal.defenseSpending > combinedData.us.defenseSpending;

  return (
    <div className="app">
      {/* View Mode Toggle */}
      <div className="view-toggle">
        <button
          className={`toggle-btn ${viewMode === 'population' ? 'active' : ''}`}
          onClick={() => setViewMode('population')}
        >
          <span className="toggle-icon population-icon"></span>
          Population
        </button>
        <button
          className={`toggle-btn ${viewMode === 'gdp' ? 'active' : ''}`}
          onClick={() => setViewMode('gdp')}
        >
          <span className="toggle-icon gdp-icon"></span>
          GDP
        </button>
        <button
          className={`toggle-btn ${viewMode === 'defense' ? 'active' : ''}`}
          onClick={() => setViewMode('defense')}
        >
          <span className="toggle-icon defense-icon"></span>
          Defense
        </button>
      </div>

      <div className="map-container">
        {/* Column 1: US Map */}
        <div className="map-section us-section">
          <div className="glass-card">
            <div className="population-display us-display">
              <h2>United States</h2>
              {viewMode === 'population' ? (
                <>
                  <p className="population-number">
                    {formatNumber(combinedData.us.population)}
                  </p>
                  <p className="population-label">Total Population (2024)</p>
                </>
              ) : viewMode === 'gdp' ? (
                <>
                  <p className="population-number">
                    {formatGDP(combinedData.us.gdp)}
                  </p>
                  <p className="population-label">Total GDP (2024)</p>
                  <p className="gdp-per-capita">
                    {formatGDPPerCapita(combinedData.us.gdp, combinedData.us.population)} per capita
                  </p>
                </>
              ) : (
                <>
                  <p className="population-number">
                    {formatDefense(combinedData.us.defenseSpending)}
                  </p>
                  <p className="population-label">Defense Budget (2024)</p>
                  <p className="gdp-per-capita">
                    {formatDefensePerCapita(combinedData.us.defenseSpending, combinedData.us.population)} per capita
                  </p>
                  <p className="defense-percentage">
                    {combinedData.us.defensePercentage.toFixed(2)}% of GDP
                  </p>
                </>
              )}
            </div>
            <div className="map-wrapper">
              <USMap />
            </div>
          </div>
        </div>

        {/* Column 2: Europe Map */}
        <div className="map-section europe-section">
          <div className="glass-card">
            <div className="population-display europe-display">
              <h2>
                {europeExceedsUS && selectedCountries.size > 0 && (
                  <span className="checkmark">✓ </span>
                )}
                Europe
              </h2>
              {viewMode === 'population' ? (
                <>
                  <p className="population-number">
                    {selectedCountries.size > 0 
                      ? formatNumber(europeanTotal.population)
                      : '—'}
                  </p>
                  <p className="population-label">
                    {selectedCountries.size > 0
                      ? `Selected ${selectedCountries.size} ${selectedCountries.size === 1 ? 'country' : 'countries'} (2024)`
                      : 'Click countries to see population'}
                  </p>
                </>
              ) : viewMode === 'gdp' ? (
                <>
                  <p className="population-number">
                    {selectedCountries.size > 0 
                      ? formatGDP(europeanTotal.gdp)
                      : '—'}
                  </p>
                  <p className="population-label">
                    {selectedCountries.size > 0
                      ? `Selected ${selectedCountries.size} ${selectedCountries.size === 1 ? 'country' : 'countries'} (2024)`
                      : 'Click countries to see GDP'}
                  </p>
                  {selectedCountries.size > 0 && europeanTotal.population > 0 && (
                    <p className="gdp-per-capita">
                      {formatGDPPerCapita(europeanTotal.gdp, europeanTotal.population)} per capita
                    </p>
                  )}
                </>
              ) : (
                <>
                  <p className="population-number">
                    {selectedCountries.size > 0 
                      ? formatDefense(europeanTotal.defenseSpending)
                      : '—'}
                  </p>
                  <p className="population-label">
                    {selectedCountries.size > 0
                      ? `Selected ${selectedCountries.size} ${selectedCountries.size === 1 ? 'country' : 'countries'} (2024)`
                      : 'Click countries to see defense budget'}
                  </p>
                  {selectedCountries.size > 0 && europeanTotal.population > 0 && (
                    <p className="gdp-per-capita">
                      {formatDefensePerCapita(europeanTotal.defenseSpending, europeanTotal.population)} per capita
                    </p>
                  )}
                  {selectedCountries.size > 0 && europeanTotal.gdp > 0 && (
                    <p className="defense-percentage">
                      {((europeanTotal.defenseSpending / europeanTotal.gdp) * 100).toFixed(2)}% of GDP
                    </p>
                  )}
                </>
              )}
            </div>
            <div className="map-wrapper">
              <EuropeMap
                countries={combinedData.european}
                selectedCountries={selectedCountries}
                onCountryClick={toggleCountry}
              />
            </div>
          </div>
        </div>

        {/* Column 3: Country List */}
        <div className="map-section list-section">
          <div className="glass-card">
            <div className="country-list-container">
              {selectedCountries.size > 0 ? (
                <>
                  <h3 className="list-title">Selected Countries</h3>
                  <div className="country-list">
                    {selectedCountryList.map(country => (
                      <div key={country.code} className="country-item">
                        <div className="country-name">{country.name}</div>
                        {viewMode === 'population' ? (
                          <div className="country-stat">{formatNumber(country.population)}</div>
                        ) : viewMode === 'gdp' ? (
                          <div className="country-stat-group">
                            <div className="country-stat">{formatGDP(country.gdp)}</div>
                            <div className="country-stat-sub">
                              {formatGDPPerCapita(country.gdp, country.population)} per capita
                            </div>
                          </div>
                        ) : (
                          <div className="country-stat-group">
                            <div className="country-stat">{formatDefense(country.defenseSpending)}</div>
                            <div className="country-stat-sub">
                              {formatDefensePerCapita(country.defenseSpending, country.population)} per capita
                            </div>
                            <div className="country-stat-sub">
                              {country.defensePercentage.toFixed(2)}% of GDP
                            </div>
                          </div>
                        )}
                      </div>
                    ))}
                  </div>
                </>
              ) : (
                <div className="empty-list-message">
                  <p>Click on European countries to see them listed here</p>
                </div>
              )}
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}

export default App;
