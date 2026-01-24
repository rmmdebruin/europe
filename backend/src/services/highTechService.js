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

export async function getHighTechExportsData() {
  if (cachedData) {
    return cachedData;
  }

  // Load absolute USD values
  const csvPathAbsolute = path.join(__dirname, '../../../data/API_TX.VAL.TECH.CD_DS2_en_csv_v2_4592.csv');
  let fileContentAbsolute = fs.readFileSync(csvPathAbsolute, 'utf-8');
  
  if (fileContentAbsolute.charCodeAt(0) === 0xFEFF) {
    fileContentAbsolute = fileContentAbsolute.slice(1);
  }
  
  const recordsAbsolute = parse(fileContentAbsolute, {
    columns: true,
    skip_empty_lines: true,
    from_line: 5,
    bom: true,
  });

  // Load percentage values for context
  const csvPathPercentage = path.join(__dirname, '../../../data/API_TX.VAL.TECH.MF.ZS_DS2_en_csv_v2_1574.csv');
  let fileContentPercentage = fs.readFileSync(csvPathPercentage, 'utf-8');
  
  if (fileContentPercentage.charCodeAt(0) === 0xFEFF) {
    fileContentPercentage = fileContentPercentage.slice(1);
  }
  
  const recordsPercentage = parse(fileContentPercentage, {
    columns: true,
    skip_empty_lines: true,
    from_line: 5,
    bom: true,
  });

  // Create a map of percentage values by country code
  const percentageMap = {};
  const yearsToTry = ['2023', '2022', '2021', '2020', '2019'];
  
  for (const record of recordsPercentage) {
    const countryCode = record['Country Code'];
    for (const year of yearsToTry) {
      const value = record[year];
      if (value && value.trim() !== '') {
        percentageMap[countryCode] = parseFloat(value);
        break;
      }
    }
  }

  const result = {
    us: null,
    european: []
  };

  for (const record of recordsAbsolute) {
    const countryCode = record['Country Code'];
    const countryName = record['Country Name'];
    
    // Find the most recent year with data for this country
    let absoluteValue = null;
    let dataYear = null;
    for (const year of yearsToTry) {
      const value = record[year];
      if (value && value.trim() !== '') {
        absoluteValue = value;
        dataYear = year;
        break;
      }
    }
    
    if (!absoluteValue) {
      continue;
    }
    
    const highTechExports = parseFloat(absoluteValue);

    if (isNaN(highTechExports) || highTechExports < 0) {
      continue;
    }

    const highTechPercentage = percentageMap[countryCode] || 0;

    if (countryCode === US_CODE) {
      result.us = {
        code: countryCode,
        name: countryName,
        highTechExports: highTechExports,
        highTechPercentage: highTechPercentage,
        year: dataYear
      };
    } else if (EUROPEAN_COUNTRIES.includes(countryCode)) {
      result.european.push({
        code: countryCode,
        name: countryName,
        highTechExports: highTechExports,
        highTechPercentage: highTechPercentage,
        year: dataYear
      });
    }
  }

  result.european.sort((a, b) => a.name.localeCompare(b.name));

  cachedData = result;
  return result;
}
