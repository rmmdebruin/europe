import { useState, useEffect } from 'react';
import USMap from './components/USMap';
import EuropeMap from './components/EuropeMap';
import './App.css';

function App() {
  const [populationData, setPopulationData] = useState(null);
  const [selectedCountries, setSelectedCountries] = useState(new Set());
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  useEffect(() => {
    fetchPopulationData();
  }, []);

  const fetchPopulationData = async () => {
    try {
      const response = await fetch('/api/population');
      if (!response.ok) {
        throw new Error('Failed to fetch population data');
      }
      const data = await response.json();
      setPopulationData(data);
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
    if (!populationData) return 0;
    return populationData.european
      .filter(country => selectedCountries.has(country.code))
      .reduce((sum, country) => sum + country.population, 0);
  };

  const getSelectedCountries = () => {
    if (!populationData) return [];
    return populationData.european
      .filter(country => selectedCountries.has(country.code))
      .sort((a, b) => a.name.localeCompare(b.name));
  };

  const formatNumber = (num) => {
    return new Intl.NumberFormat('en-US').format(num);
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
  const europeExceedsUS = europeanTotal > populationData.us.population;

  return (
    <div className="app">
      <div className="map-container">
        {/* Column 1: US Map */}
        <div className="map-section us-section">
          <div className="glass-card">
            <div className="population-display us-display">
              <h2>United States</h2>
              <p className="population-number">
                {formatNumber(populationData.us.population)}
              </p>
              <p className="population-label">Total Population (2024)</p>
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
              <p className="population-number">
                {selectedCountries.size > 0 
                  ? formatNumber(europeanTotal)
                  : '—'}
              </p>
              <p className="population-label">
                {selectedCountries.size > 0
                  ? `Selected ${selectedCountries.size} ${selectedCountries.size === 1 ? 'country' : 'countries'} (2024)`
                  : 'Click countries to see population'}
              </p>
            </div>
            <div className="map-wrapper">
              <EuropeMap
                countries={populationData.european}
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
                        {country.name}
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
