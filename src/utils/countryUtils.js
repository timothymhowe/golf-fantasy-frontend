import countries from 'i18n-iso-countries';

export const getCountryCode = (code) => {
console.log("Converting country code:", code);
  if (!code) return null;
  
  if (countries.isValid(code)) {
    return countries.alpha3ToAlpha2(code)?.toLowerCase();
  }

  
  // Special cases for UK countries
  const specialCases = {
    'ENG': 'gb-eng',
    'SCO': 'gb-sct',
    'NIR': 'gb-nir',
    'WAL': 'gb-wls',
    'TPE': 'tw',
  };

  // IOC to ISO mappings
  const iocToIso = {
    'ALG': 'DZA',
    'ASA': 'ASM',
    'ANG': 'AGO',
    'ANT': 'ATG',
    'ARU': 'ABW',
    'BAH': 'BHS',
    'BRN': 'BHR',
    'BAN': 'BGD',
    'BAR': 'BRB',
    'BIZ': 'BLZ',
    'BER': 'BMU',
    'BHU': 'BTN',
    'BOT': 'BWA',
    'IVB': 'VGB',
    'BRU': 'BRN',
    'BUL': 'BGR',
    'BUR': 'BFA',
    'CAM': 'KHM',
    'CAY': 'CYM',
    'CHA': 'TCD',
    'CHI': 'CHL',
    'CGO': 'COG',
    'CRC': 'CRI',
    'CRO': 'HRV',
    'DEN': 'DNK',
    'ESA': 'SLV',
    'GEQ': 'GNQ',
    'FIJ': 'FJI',
    'GAM': 'GMB',
    'GER': 'DEU',
    'GRE': 'GRC',
    'GRN': 'GRD',
    'GUA': 'GTM',
    'GUI': 'GIN',
    'GBS': 'GNB',
    'HAI': 'HTI',
    'HON': 'HND',
    'INA': 'IDN',
    'IRI': 'IRN',
    'KUW': 'KWT',
    'LAT': 'LVA',
    'LIB': 'LBN',
    'LES': 'LSO',
    'LBA': 'LBY',
    'MAD': 'MDG',
    'MAW': 'MWI',
    'MAS': 'MYS',
    'MTN': 'MRT',
    'MRI': 'MUS',
    'MON': 'MCO',
    'MGL': 'MNG',
    'MYA': 'MMR',
    'NEP': 'NPL',
    'NED': 'NLD',
    'NCA': 'NIC',
    'NIG': 'NER',
    'NGR': 'NGA',
    'OMA': 'OMN',
    'PLE': 'PSE',
    'PAR': 'PRY',
    'PHI': 'PHL',
    'POR': 'PRT',
    'PUR': 'PRI',
    'SKN': 'KNA',
    'VIN': 'VCT',
    'SAM': 'WSM',
    'KSA': 'SAU',
    'SEY': 'SYC',
    'SIN': 'SGP',
    'SLO': 'SVN',
    'SOL': 'SLB',
    'RSA': 'ZAF',
    'SRI': 'LKA',
    'SUD': 'SDN',
    'SUI': 'CHE',
    'TPE': 'TWN',
    'TAN': 'TZA',
    'TOG': 'TGO',
    'TGA': 'TON',
    'TRI': 'TTO',
    'UAE': 'ARE',
    'ISV': 'VIR',
    'URU': 'URY',
    'VAN': 'VUT',
    'VIE': 'VNM',
    'ZAM': 'ZMB',
    'ZIM': 'ZWE',
  };

  // First check special cases
  if (specialCases[code]) {
    return specialCases[code];
  }

  // Then check IOC->ISO mapping
  else if (iocToIso[code]) {
    return countries.alpha3ToAlpha2(iocToIso[code])?.toLowerCase();
  } else {
    console.log("No mapping found for:", code);
    return null;
  }
};

export const createFlagUrlMap = (countryCodes) => {
  const flagMap = {};
  const uniqueCodes = new Set(countryCodes);
  const unmappedCodes = new Set();

  console.log('Unique country codes:', uniqueCodes);

  for (const code of uniqueCodes) {
    const countryCode = getCountryCode(code.toUpperCase());
    if (countryCode) {
      flagMap[code] = `https://flagcdn.com/108x81/${countryCode}.png`;
    } else {
      unmappedCodes.add(code);
    }
  }

  if (unmappedCodes.size > 0) {
    console.log("Unmapped country codes:", Array.from(unmappedCodes));
  }

  return flagMap;
}; 