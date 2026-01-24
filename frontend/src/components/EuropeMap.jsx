import {
  ComposableMap,
  Geographies,
  Geography,
  ZoomableGroup,
} from "react-simple-maps";
import './EuropeMap.css';

const geoUrl = "https://cdn.jsdelivr.net/npm/world-atlas@2/countries-110m.json";

// European country ISO codes mapping (Russia excluded, Turkey included)
const EUROPE_COUNTRY_CODES = {
  'ALB': '008', 'AND': '020', 'AUT': '040', 'BLR': '112', 'BEL': '056',
  'BIH': '070', 'BGR': '100', 'HRV': '191', 'CYP': '196', 'CZE': '203',
  'DNK': '208', 'EST': '233', 'FIN': '246', 'FRA': '250', 'DEU': '276',
  'GRC': '300', 'HUN': '348', 'ISL': '352', 'IRL': '372', 'ITA': '380',
  'LVA': '428', 'LIE': '438', 'LTU': '440', 'LUX': '442', 'MLT': '470',
  'MDA': '498', 'MCO': '492', 'MNE': '499', 'NLD': '528', 'MKD': '807',
  'NOR': '578', 'POL': '616', 'PRT': '620', 'ROU': '642', 'TUR': '792',
  'SMR': '674', 'SRB': '688', 'SVK': '703', 'SVN': '705', 'ESP': '724',
  'SWE': '752', 'CHE': '756', 'UKR': '804', 'GBR': '826', 'VAT': '336',
};

function EuropeMap({ countries, selectedCountries, onCountryClick }) {
  // Create a map of ISO numeric codes to our country data
  const countryDataMap = {};
  countries.forEach(country => {
    const numericCode = EUROPE_COUNTRY_CODES[country.code];
    if (numericCode) {
      countryDataMap[numericCode] = country;
    }
  });

  const isEuropeanCountry = (geoId) => {
    return geoId in countryDataMap;
  };

  const isSelected = (geoId) => {
    const country = countryDataMap[geoId];
    return country && selectedCountries.has(country.code);
  };

  // Function to filter out French overseas territories
  const filterFrenchTerritories = (geo) => {
    if (geo.id !== '250') return geo; // Not France, return as-is

    // Filter France's geometry to only include mainland Europe
    // French Guiana is around lon: -53, lat: 4
    // Mainland France is around lon: -5 to 10, lat: 42 to 51
    const filterCoordinates = (coords) => {
      // If it's a point [lon, lat]
      if (typeof coords[0] === 'number' && typeof coords[1] === 'number') {
        const [lon, lat] = coords;
        // Keep only European mainland coordinates
        return lon >= -10 && lon <= 15 && lat >= 40 && lat <= 55;
      }
      // If it's an array of coordinates, filter recursively
      if (Array.isArray(coords[0])) {
        const filtered = coords.map(c => filterCoordinates(c)).filter(c => c && (Array.isArray(c) ? c.length > 0 : true));
        return filtered.length > 0 ? filtered : null;
      }
      return coords;
    };

    // Create a new geometry with filtered coordinates
    if (geo.geometry && geo.geometry.coordinates) {
      const filteredCoords = filterCoordinates(geo.geometry.coordinates);
      if (filteredCoords) {
        return {
          ...geo,
          geometry: {
            ...geo.geometry,
            coordinates: filteredCoords
          }
        };
      }
    }

    return geo;
  };

  return (
    <div className="map-svg-container">
      <ComposableMap
        projection="geoAzimuthalEqualArea"
        projectionConfig={{
          rotate: [-20.0, -52.0, 0],
          scale: 880,
          center: [-2, 0],
        }}
        width={800}
        height={600}
      >
        <ZoomableGroup center={[0, 0]} zoom={1}>
          <Geographies geography={geoUrl}>
            {({ geographies }) =>
              geographies
                .filter(geo => isEuropeanCountry(geo.id))
                .map(geo => filterFrenchTerritories(geo))
                .map((geo) => {
                  const geoId = geo.id;
                  const selected = isSelected(geoId);
                  const country = countryDataMap[geoId];

                  return (
                    <Geography
                      key={geo.rsmKey}
                      geography={geo}
                      onClick={() => {
                        if (country) {
                          onCountryClick(country.code);
                        }
                      }}
                      style={{
                        default: {
                          fill: selected ? "#4d94ff" : "#6baafe",
                          stroke: "#fff",
                          strokeWidth: 0.5,
                          outline: "none",
                          opacity: selected ? 1 : 0.8,
                          cursor: "pointer",
                        },
                        hover: {
                          fill: selected ? "#3d7fe6" : "#5a9fee",
                          stroke: "#fff",
                          strokeWidth: 0.75,
                          outline: "none",
                          opacity: 1,
                          cursor: "pointer",
                        },
                        pressed: {
                          fill: "#2d6fd6",
                          outline: "none",
                          cursor: "pointer",
                        },
                      }}
                    />
                  );
                })
            }
          </Geographies>
        </ZoomableGroup>
      </ComposableMap>
    </div>
  );
}

export default EuropeMap;
