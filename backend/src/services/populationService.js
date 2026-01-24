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

export async function getPopulationData() {
  if (cachedData) {
    return cachedData;
  }

  const csvPath = path.join(__dirname, '../../../data/API_SP.POP.TOTL_DS2_en_csv_v2_174326.csv');
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

  // Try years in descending order to find most recent data
  const yearsToTry = ['2024', '2023', '2022', '2021', '2020'];

  for (const record of records) {
    const countryCode = record['Country Code'];
    const countryName = record['Country Name'];
    
    // Find the most recent year with data for this country
    let populationValue = null;
    let dataYear = null;
    for (const year of yearsToTry) {
      const value = record[year];
      if (value && value.trim() !== '') {
        populationValue = value;
        dataYear = year;
        break;
      }
    }
    
    if (!populationValue) {
      continue;
    }
    
    const population = parseInt(populationValue, 10);

    if (isNaN(population)) {
      continue;
    }

    if (countryCode === US_CODE) {
      result.us = {
        code: countryCode,
        name: countryName,
        population: population,
        year: dataYear
      };
    } else if (EUROPEAN_COUNTRIES.includes(countryCode)) {
      result.european.push({
        code: countryCode,
        name: countryName,
        population: population,
        year: dataYear
      });
    }
  }

  // Sort European countries by name
  result.european.sort((a, b) => a.name.localeCompare(b.name));

  cachedData = result;
  return result;
}
