import fs from 'fs';
import path from 'path';
import { fileURLToPath } from 'url';
import { parse } from 'csv-parse/sync';

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

// European countries with their ISO codes (Russia excluded, Turkey included)
const EUROPEAN_COUNTRIES = [
  'ALB', 'AND', 'AUT', 'BLR', 'BEL', 'BIH', 'BGR', 'HRV', 'CYP', 'CZE',
  'DNK', 'EST', 'FIN', 'FRA', 'DEU', 'GRC', 'HUN', 'ISL', 'IRL', 'ITA',
  'XKX', 'LVA', 'LIE', 'LTU', 'LUX', 'MLT', 'MDA', 'MCO', 'MNE', 'NLD',
  'MKD', 'NOR', 'POL', 'PRT', 'ROU', 'SMR', 'SRB', 'SVK', 'SVN',
  'ESP', 'SWE', 'CHE', 'TUR', 'UKR', 'GBR', 'VAT'
];

const US_CODE = 'USA';

let cachedData = null;

export async function getGDPData() {
  if (cachedData) {
    return cachedData;
  }

  const csvPath = path.join(__dirname, '../../../data/API_NY.GDP.MKTP.CD_DS2_en_csv_v2_174428.csv');
  let fileContent = fs.readFileSync(csvPath, 'utf-8');
  
  // Remove UTF-8 BOM if present
  if (fileContent.charCodeAt(0) === 0xFEFF) {
    fileContent = fileContent.slice(1);
  }
  
  // Parse CSV
  const records = parse(fileContent, {
    columns: true,
    skip_empty_lines: true,
    from_line: 5, // Skip metadata lines
    bom: true, // Handle BOM
  });

  const result = {
    us: null,
    european: []
  };

  // Find the most recent year with data (2024 based on the data structure)
  const latestYear = '2024';

  for (const record of records) {
    const countryCode = record['Country Code'];
    const countryName = record['Country Name'];
    const gdpValue = record[latestYear];
    
    // Parse GDP value - handle empty strings and invalid numbers
    if (!gdpValue || gdpValue.trim() === '') {
      continue;
    }
    
    const gdp = parseFloat(gdpValue);

    if (isNaN(gdp) || gdp <= 0) {
      continue;
    }

    if (countryCode === US_CODE) {
      result.us = {
        code: countryCode,
        name: countryName,
        gdp: gdp
      };
    } else if (EUROPEAN_COUNTRIES.includes(countryCode)) {
      result.european.push({
        code: countryCode,
        name: countryName,
        gdp: gdp
      });
    }
  }

  // Sort European countries by name
  result.european.sort((a, b) => a.name.localeCompare(b.name));

  cachedData = result;
  return result;
}
