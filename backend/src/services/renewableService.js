import fs from 'fs';
import path from 'path';
import { fileURLToPath } from 'url';
import { parse } from 'csv-parse/sync';

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

const EUROPEAN_COUNTRIES = [
  'ALB', 'AND', 'AUT', 'BLR', 'BEL', 'BIH', 'BGR', 'HRV', 'CYP', 'CZE',
  'DNK', 'EST', 'FIN', 'FRA', 'DEU', 'GRC', 'HUN', 'ISL', 'IRL', 'ITA',
  'XKX', 'LVA', 'LIE', 'LTU', 'LUX', 'MLT', 'MDA', 'MCO', 'MNE', 'NLD',
  'MKD', 'NOR', 'POL', 'PRT', 'ROU', 'SMR', 'SRB', 'SVK', 'SVN',
  'ESP', 'SWE', 'CHE', 'TUR', 'UKR', 'GBR', 'VAT'
];

const US_CODE = 'USA';

let cachedData = null;

export async function getRenewableEnergyData() {
  if (cachedData) {
    return cachedData;
  }

  const csvPath = path.join(__dirname, '../../../data/API_EG.ELC.RNEW.ZS_DS2_en_csv_v2_1559.csv');
  let fileContent = fs.readFileSync(csvPath, 'utf-8');
  
  if (fileContent.charCodeAt(0) === 0xFEFF) {
    fileContent = fileContent.slice(1);
  }
  
  const records = parse(fileContent, {
    columns: true,
    skip_empty_lines: true,
    from_line: 5,
    bom: true,
  });

  const result = {
    us: null,
    european: []
  };

  // Try years in descending order to find most recent data
  const yearsToTry = ['2022', '2021', '2020', '2019', '2018'];

  for (const record of records) {
    const countryCode = record['Country Code'];
    const countryName = record['Country Name'];
    
    // Find the most recent year with data for this country
    let percentageValue = null;
    let dataYear = null;
    for (const year of yearsToTry) {
      const value = record[year];
      if (value && value.trim() !== '') {
        percentageValue = value;
        dataYear = year;
        break;
      }
    }
    
    if (!percentageValue) {
      continue;
    }
    
    const renewablePercentage = parseFloat(percentageValue);

    if (isNaN(renewablePercentage) || renewablePercentage < 0) {
      continue;
    }

    if (countryCode === US_CODE) {
      result.us = {
        code: countryCode,
        name: countryName,
        renewablePercentage: renewablePercentage,
        year: dataYear
      };
    } else if (EUROPEAN_COUNTRIES.includes(countryCode)) {
      result.european.push({
        code: countryCode,
        name: countryName,
        renewablePercentage: renewablePercentage,
        year: dataYear
      });
    }
  }

  result.european.sort((a, b) => a.name.localeCompare(b.name));

  cachedData = result;
  return result;
}
