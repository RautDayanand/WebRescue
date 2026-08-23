export interface NormalizedRecord {
  [key: string]: any;
}

/**
 * Generic Field Normalization Engine
 * Converts raw string values into clean numbers, currencies, units, and dates.
 */
export function normalizeFieldValue(key: string, value: any): { value: any; extraFields?: Record<string, any> } {
  if (value === null || value === undefined) {
    return { value: null };
  }

  // If value is already number or boolean, return directly
  if (typeof value === 'number' || typeof value === 'boolean') {
    return { value };
  }

  const strVal = String(value).trim();
  const lowerKey = key.toLowerCase();
  const lowerVal = strVal.toLowerCase();
  const extraFields: Record<string, any> = {};

  // 1. Price & Currency Handling
  if (lowerKey.includes('price') || lowerKey.includes('cost') || lowerKey.includes('amount') || strVal.includes('₹') || strVal.includes('$') || strVal.includes('€')) {
    let currency = 'USD';
    if (strVal.includes('₹') || lowerVal.includes('inr') || lowerVal.includes('rs')) {
      currency = 'INR';
    } else if (strVal.includes('€') || lowerVal.includes('eur')) {
      currency = 'EUR';
    } else if (strVal.includes('£') || lowerVal.includes('gbp')) {
      currency = 'GBP';
    }

    const cleanedNumberStr = strVal.replace(/[^0-9.]/g, '');
    const num = parseFloat(cleanedNumberStr);
    
    if (!isNaN(num)) {
      extraFields[`${key}_currency`] = currency;
      return { value: num, extraFields };
    }
  }

  // 2. RAM Memory Handling (e.g. "16 GB RAM", "8GB")
  if (lowerKey.includes('ram') || lowerKey.includes('memory') || lowerVal.includes('ram')) {
    const ramMatch = strVal.match(/(\d+)\s*(?:gb|mb)/i);
    if (ramMatch) {
      const num = parseInt(ramMatch[1], 10);
      return { value: num };
    }
  }

  // 3. Storage Handling (e.g. "512GB SSD", "1TB Storage")
  if (lowerKey.includes('storage') || lowerKey.includes('drive') || lowerVal.includes('ssd') || lowerVal.includes('hdd')) {
    const storageMatch = strVal.match(/(\d+)\s*(gb|tb)/i);
    if (storageMatch) {
      const unit = storageMatch[2].toLowerCase();
      let size = parseInt(storageMatch[1], 10);
      if (unit === 'tb') size *= 1024;
      
      if (lowerVal.includes('ssd')) extraFields[`${key}_type`] = 'SSD';
      else if (lowerVal.includes('hdd')) extraFields[`${key}_type`] = 'HDD';

      return { value: size, extraFields };
    }
  }

  // 4. Rating & Reviews Handling (e.g. "4.5 out of 5 stars", "4.8/5")
  if (lowerKey.includes('rating') || lowerKey.includes('stars') || lowerKey.includes('score')) {
    const ratingMatch = strVal.match(/([\d.]+)\s*(?:\/|\s*out of\s*)?([\d.]+)?/i);
    if (ratingMatch) {
      const num = parseFloat(ratingMatch[1]);
      if (!isNaN(num)) return { value: num };
    }
  }

  // 5. Percentage / Discount Handling (e.g. "20% off", "15%")
  if (lowerKey.includes('discount') || lowerKey.includes('percentage') || strVal.includes('%')) {
    const pctMatch = strVal.match(/([\d.]+)\s*%/);
    if (pctMatch) {
      const num = parseFloat(pctMatch[1]);
      if (!isNaN(num)) return { value: num };
    }
  }

  // 6. Generic Numeric Extraction Fallback
  if (/^\d+(\.\d+)?$/.test(strVal)) {
    return { value: parseFloat(strVal) };
  }

  return { value: strVal };
}

/**
 * Normalizes an array or single record of raw scraper output JSON.
 */
export function normalizeScrapedData(rawData: any): NormalizedRecord[] {
  if (!rawData) return [];
  const records = Array.isArray(rawData) ? rawData : [rawData];

  return records.map((record) => {
    if (typeof record !== 'object' || record === null) return { raw: record };

    const normalized: Record<string, any> = {};

    for (const [key, val] of Object.entries(record)) {
      const { value, extraFields } = normalizeFieldValue(key, val);
      normalized[key] = value;

      if (extraFields) {
        Object.assign(normalized, extraFields);
      }
    }

    return normalized;
  });
}
