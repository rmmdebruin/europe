import {
  ComposableMap,
  Geographies,
  Geography,
} from "react-simple-maps";
import './USMap.css';

const geoUrl = "https://cdn.jsdelivr.net/npm/us-atlas@3/states-10m.json";

function USMap() {
  return (
    <div className="map-svg-container">
      <ComposableMap
        projection="geoAlbersUsa"
        projectionConfig={{
          scale: 1000,
        }}
      >
        <Geographies geography={geoUrl}>
          {({ geographies }) =>
            geographies.map((geo) => (
              <Geography
                key={geo.rsmKey}
                geography={geo}
                fill="#ff6b6b"
                stroke="#fff"
                strokeWidth={0.5}
                style={{
                  default: {
                    fill: "#ff6b6b",
                    outline: "none",
                    opacity: 0.8,
                  },
                  hover: {
                    fill: "#ff5252",
                    outline: "none",
                    opacity: 1,
                  },
                  pressed: {
                    fill: "#ff3838",
                    outline: "none",
                  },
                }}
              />
            ))
          }
        </Geographies>
      </ComposableMap>
    </div>
  );
}

export default USMap;
