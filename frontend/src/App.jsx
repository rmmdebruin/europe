import { useState, useEffect } from 'react';
import USMap from './components/USMap';
import EuropeMap from './components/EuropeMap';
import './App.css';

function App() {
  const [combinedData, setCombinedData] = useState(null);
  const [selectedCountries, setSelectedCountries] = useState(new Set());
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [viewMode, setViewMode] = useState('population'); // 'population', 'gdp', 'defense', 'rnd', 'renewable'

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
    if (!combinedData) return { 
      population: 0, 
      gdp: 0, 
      defenseSpending: 0,
      rndSpending: 0,
      renewablePercentage: 0
    };
    const filtered = combinedData.european.filter(country => selectedCountries.has(country.code));
    
    const total = {
      population: filtered.reduce((sum, country) => sum + country.population, 0),
      gdp: filtered.reduce((sum, country) => sum + (country.gdp || 0), 0),
      defenseSpending: filtered.reduce((sum, country) => sum + (country.defenseSpending || 0), 0),
      rndSpending: filtered.reduce((sum, country) => sum + (country.rndSpending || 0), 0)
    };
    
    // Calculate weighted averages for percentages
    const totalPop = total.population;
    total.renewablePercentage = totalPop > 0
      ? filtered.reduce((sum, country) => sum + (country.renewablePercentage || 0) * country.population, 0) / totalPop
      : 0;
    
    return total;
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

  const formatRnD = (rnd) => {
    const amount = convertToEUR(rnd);
    const billion = amount / 1e9;
    return `€${billion.toFixed(1)}B`;
  };

  const formatRnDPerCapita = (rnd, population) => {
    if (population === 0) return '€0';
    const amount = convertToEUR(rnd);
    const perCapita = amount / population;
    return `€${Math.round(perCapita).toLocaleString('en-US')}`;
  };

  // Helper function to get the year range for selected countries
  const getYearRange = (metricField) => {
    if (!combinedData) return '';
    const filtered = combinedData.european.filter(country => selectedCountries.has(country.code));
    if (filtered.length === 0) return '';
    
    const years = filtered.map(c => c[metricField]).filter(y => y);
    if (years.length === 0) return '';
    
    const uniqueYears = [...new Set(years)].sort();
    if (uniqueYears.length === 1) return uniqueYears[0];
    return `${uniqueYears[uniqueYears.length - 1]}-${uniqueYears[0]}`;
  };

  // Helper function to render metric display based on view mode
  const renderMetricDisplay = (data, isEurope = false, hasSelection = true) => {
    // Get the appropriate year for display
    const getYearLabel = (field) => {
      if (isEurope && hasSelection) {
        const yearRange = getYearRange(field);
        return yearRange ? ` (${yearRange})` : '';
      }
      return data[field] ? ` (${data[field]})` : '';
    };

    const metricConfig = {
      population: {
        value: isEurope ? (hasSelection ? formatNumber(europeanTotal.population) : '—') : formatNumber(data.population),
        label: isEurope && !hasSelection ? 'Click countries to see population' : `Total Population${getYearLabel('year')}`,
        extra: null
      },
      gdp: {
        value: isEurope ? (hasSelection ? formatGDP(europeanTotal.gdp) : '—') : formatGDP(data.gdp),
        label: isEurope && !hasSelection ? 'Click countries to see GDP' : `Total GDP${getYearLabel('year')}`,
        extra: hasSelection && (
          <p className="gdp-per-capita">
            {formatGDPPerCapita(isEurope ? europeanTotal.gdp : data.gdp, isEurope ? europeanTotal.population : data.population)} per capita
          </p>
        )
      },
      defense: {
        value: isEurope ? (hasSelection ? formatDefense(europeanTotal.defenseSpending) : '—') : formatDefense(data.defenseSpending),
        label: isEurope && !hasSelection ? 'Click countries to see defense budget' : `Defense Budget${getYearLabel('year')}`,
        extra: hasSelection && (
          <>
            <p className="gdp-per-capita">
              {formatDefensePerCapita(isEurope ? europeanTotal.defenseSpending : data.defenseSpending, isEurope ? europeanTotal.population : data.population)} per capita
            </p>
            <p className="defense-percentage">
              {isEurope 
                ? europeanTotal.gdp > 0 ? `${((europeanTotal.defenseSpending / europeanTotal.gdp) * 100).toFixed(2)}% of GDP` : ''
                : `${data.defensePercentage.toFixed(2)}% of GDP`}
            </p>
          </>
        )
      },
      rnd: {
        value: isEurope ? (hasSelection ? formatRnD(europeanTotal.rndSpending) : '—') : formatRnD(data.rndSpending),
        label: isEurope && !hasSelection ? 'Click countries to see R&D spending' : `R&D Spending${getYearLabel('year')}`,
        extra: hasSelection && (
          <>
            <p className="gdp-per-capita">
              {formatRnDPerCapita(isEurope ? europeanTotal.rndSpending : data.rndSpending, isEurope ? europeanTotal.population : data.population)} per capita
            </p>
            <p className="defense-percentage">
              {isEurope
                ? europeanTotal.gdp > 0 ? `${((europeanTotal.rndSpending / europeanTotal.gdp) * 100).toFixed(2)}% of GDP (avg)` : ''
                : `${data.rndPercentage.toFixed(2)}% of GDP`}
            </p>
          </>
        )
      },
      renewable: {
        value: isEurope ? (hasSelection ? `${europeanTotal.renewablePercentage.toFixed(1)}%` : '—') : `${data.renewablePercentage.toFixed(1)}%`,
        label: isEurope && !hasSelection ? 'Click countries to see renewable energy' : `Renewable Energy${getYearLabel('year')}`,
        extra: hasSelection && <p className="gdp-per-capita">of electricity output</p>
      }
    };

    const config = metricConfig[viewMode];
    const countLabel = isEurope && hasSelection ? `Selected ${selectedCountries.size} ${selectedCountries.size === 1 ? 'country' : 'countries'}${getYearLabel('year')}` : config.label;

    return (
      <>
        <p className="population-number">{config.value}</p>
        <p className="population-label">{countLabel}</p>
        {config.extra}
      </>
    );
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
  const europeExceedsUS = selectedCountries.size > 0 && (
    viewMode === 'population' ? europeanTotal.population > combinedData.us.population
    : viewMode === 'gdp' ? europeanTotal.gdp > combinedData.us.gdp
    : viewMode === 'defense' ? europeanTotal.defenseSpending > combinedData.us.defenseSpending
    : viewMode === 'rnd' ? europeanTotal.rndSpending > combinedData.us.rndSpending
    : europeanTotal.renewablePercentage > combinedData.us.renewablePercentage
  );

  return (
    <div className="app">
      {/* View Mode Toggle */}
      <div className="view-toggle">
        <button
          className={`toggle-btn ${viewMode === 'population' ? 'active' : ''}`}
          onClick={() => setViewMode('population')}
          title="Population"
        >
          <span className="toggle-icon population-icon"></span>
          Population
        </button>
        <button
          className={`toggle-btn ${viewMode === 'gdp' ? 'active' : ''}`}
          onClick={() => setViewMode('gdp')}
          title="GDP"
        >
          <span className="toggle-icon gdp-icon"></span>
          GDP
        </button>
        <button
          className={`toggle-btn ${viewMode === 'defense' ? 'active' : ''}`}
          onClick={() => setViewMode('defense')}
          title="Defense Budget"
        >
          <span className="toggle-icon defense-icon"></span>
          Defense
        </button>
        <button
          className={`toggle-btn ${viewMode === 'rnd' ? 'active' : ''}`}
          onClick={() => setViewMode('rnd')}
          title="R&D Spending"
        >
          <span className="toggle-icon rnd-icon"></span>
          R&D
        </button>
        <button
          className={`toggle-btn ${viewMode === 'renewable' ? 'active' : ''}`}
          onClick={() => setViewMode('renewable')}
          title="Renewable Energy"
        >
          <span className="toggle-icon renewable-icon"></span>
          Renewable
        </button>
      </div>

      <div className="map-container">
        {/* Column 1: US Map */}
        <div className="map-section us-section">
          <div className="glass-card">
            <div className="population-display us-display">
              <h2>United States</h2>
              {renderMetricDisplay(combinedData.us, false, true)}
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
                {europeExceedsUS && (
                  <span className="checkmark">✓ </span>
                )}
                Europe
              </h2>
              {renderMetricDisplay(combinedData.european, true, selectedCountries.size > 0)}
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
                    {selectedCountryList.map(country => {
                      const renderCountryStat = () => {
                        switch(viewMode) {
                          case 'population':
                            return (
                              <div className="country-stat-group">
                                <div className="country-stat">{formatNumber(country.population)}</div>
                                {country.year && <div className="country-stat-year">({country.year})</div>}
                              </div>
                            );
                          case 'gdp':
                            return (
                              <div className="country-stat-group">
                                <div className="country-stat">{formatGDP(country.gdp)}</div>
                                <div className="country-stat-sub">
                                  {formatGDPPerCapita(country.gdp, country.population)} per capita
                                </div>
                                {country.year && <div className="country-stat-year">({country.year})</div>}
                              </div>
                            );
                          case 'defense':
                            return (
                              <div className="country-stat-group">
                                <div className="country-stat">{formatDefense(country.defenseSpending)}</div>
                                <div className="country-stat-sub">
                                  {formatDefensePerCapita(country.defenseSpending, country.population)} per capita
                                </div>
                                <div className="country-stat-sub">
                                  {country.defensePercentage.toFixed(2)}% of GDP
                                </div>
                                {country.year && <div className="country-stat-year">({country.year})</div>}
                              </div>
                            );
                          case 'rnd':
                            return (
                              <div className="country-stat-group">
                                <div className="country-stat">{formatRnD(country.rndSpending)}</div>
                                <div className="country-stat-sub">
                                  {formatRnDPerCapita(country.rndSpending, country.population)} per capita
                                </div>
                                <div className="country-stat-sub">
                                  {country.rndPercentage.toFixed(2)}% of GDP
                                </div>
                                {country.year && <div className="country-stat-year">({country.year})</div>}
                              </div>
                            );
                          case 'renewable':
                            return (
                              <div className="country-stat-group">
                                <div className="country-stat">{country.renewablePercentage.toFixed(1)}%</div>
                                <div className="country-stat-sub">of electricity output</div>
                                {country.year && <div className="country-stat-year">({country.year})</div>}
                              </div>
                            );
                          default:
                            return null;
                        }
                      };
                      
                      return (
                        <div key={country.code} className="country-item">
                          <div className="country-name">{country.name}</div>
                          {renderCountryStat()}
                        </div>
                      );
                    })}
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
