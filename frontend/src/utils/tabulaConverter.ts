/**
 * Converts Tabula-exported Bet365 CSV data to standardized format
 * Input format: "",DD/MM/YYYY HH:MM:SS,BetID,Type,Odds/Selection,Event,Result,Stake,Payout
 * Output format: YYYY-MM-DD,Home Team vs Away Team,Market - Selection,Odds,Stake,Result,Payout
 */

export interface TabulaBetRow {
  date: string;
  betId: string;
  type: string;
  oddsSelection: string;
  event: string;
  result: string;
  stake: string;
  payout: string;
}

export interface StandardBetRow {
  date: string;
  match: string;
  marketSelection: string;
  odds: string;
  stake: string;
  result: string;
  payout: string;
}

export function convertTabulaToStandardCSV(tabulaCSV: string): string {
  const lines = tabulaCSV.split('\n').filter(line => line.trim());
  const convertedRows: string[] = [];

  for (const line of lines) {
    // Skip empty lines and header rows
    if (!line.trim() || line.includes('Datum och tid') || line.includes('Spelbekräftelse')) {
      continue;
    }

    try {
      const convertedRow = convertTabulaRow(line);
      if (convertedRow) {
        convertedRows.push(convertedRow);
      }
    } catch (error) {
      console.warn('Failed to convert row:', line, error);
      continue;
    }
  }

  return convertedRows.join('\n');
}

function convertTabulaRow(csvRow: string): string | null {
  // Parse CSV row accounting for quoted fields
  const fields = parseCSVRow(csvRow);
  
  // Skip rows that don't have enough fields or are not betting rows
  if (fields.length < 8) return null;
  
  // Expected format: "",date,betId,type,oddsSelection,event,result,stake,payout
  const [, dateField, , , oddsSelection, event, result, stake, payout] = fields;
  
  // Skip if not a betting row (no valid date or betting data)
  if (!dateField || !event || !oddsSelection || !stake) return null;
  
  try {
    // Convert date from DD/MM/YYYY HH:MM:SS to YYYY-MM-DD
    const standardDate = convertDate(dateField);
    
    // Extract match from event (text before first parenthesis)
    const match = extractMatch(event);
    
    // Extract market and selection
    const marketSelection = extractMarketSelection(oddsSelection, event);
    
    // Extract odds (last number after " - " in oddsSelection)
    const odds = extractOdds(oddsSelection);
    
    // Clean stake (remove "kr", spaces, thousand separators)
    const cleanStake = cleanAmount(stake);
    
    // Clean payout or calculate if missing
    let cleanPayout = cleanAmount(payout);
    if (!cleanPayout && result) {
      cleanPayout = calculatePayout(cleanStake, odds, result);
    }
    
    // Normalize result
    const normalizedResult = normalizeResult(result);
    
    // Return formatted CSV row
    const row = [
      standardDate,
      match,
      marketSelection,
      odds,
      cleanStake,
      normalizedResult,
      cleanPayout
    ];
    
    return formatCSVRow(row);
    
  } catch (error) {
    console.warn('Error processing row:', csvRow, error);
    return null;
  }
}

function parseCSVRow(csvRow: string): string[] {
  const fields: string[] = [];
  let current = '';
  let inQuotes = false;
  
  for (const char of csvRow) {
    if (char === '"') {
      inQuotes = !inQuotes;
    } else if (char === ',' && !inQuotes) {
      fields.push(current.trim());
      current = '';
    } else {
      current += char;
    }
  }
  
  fields.push(current.trim());
  return fields;
}

function convertDate(dateStr: string): string {
  // Remove quotes and clean up
  const cleaned = dateStr.replace(/"/g, '').trim();
  
  // Parse DD/MM/YYYY HH:MM:SS format
  const dateMatch = cleaned.match(/(\d{2})\/(\d{2})\/(\d{4})/);
  if (!dateMatch) throw new Error(`Invalid date format: ${dateStr}`);
  
  const [, day, month, year] = dateMatch;
  return `${year}-${month.padStart(2, '0')}-${day.padStart(2, '0')}`;
}

function extractMatch(event: string): string {
  // Clean up the event string and remove line breaks
  const cleaned = event.replace(/[\r\n]+/g, ' ').replace(/\s+/g, ' ').trim();
  
  // Extract text before first parenthesis
  const beforeParens = cleaned.split('(')[0].trim();
  
  // Replace " v " with " vs "
  return beforeParens.replace(/ v /g, ' vs ');
}

function extractMarketSelection(oddsSelection: string, event: string): string {
  // Clean up strings
  const cleanOdds = oddsSelection.replace(/[\r\n]+/g, ' ').replace(/\s+/g, ' ').trim();
  const cleanEvent = event.replace(/[\r\n]+/g, ' ').replace(/\s+/g, ' ').trim();
  
  // Extract market from event (text within parentheses)
  const marketMatch = cleanEvent.match(/\(([^)]+)\)/);
  const market = marketMatch ? marketMatch[1] : '';
  
  // Extract selection from oddsSelection (remove the " - <odds>" part at the end)
  const selection = cleanOdds.replace(/ - [\d,]+\.?\d*$/, '');
  
  // Combine market and selection
  if (market && selection) {
    return `${market} - ${selection}`;
  } else if (selection) {
    return selection;
  } else if (market) {
    return market;
  }
  
  return cleanOdds;
}

function extractOdds(oddsSelection: string): string {
  // Clean up and find the last " - <number>" pattern
  const cleaned = oddsSelection.replace(/[\r\n]+/g, ' ').replace(/\s+/g, ' ').trim();
  const oddsMatch = cleaned.match(/ - ([\d,]+\.?\d*)$/);
  
  if (!oddsMatch) throw new Error(`No odds found in: ${oddsSelection}`);
  
  // Convert comma to dot and ensure two decimal places
  const odds = oddsMatch[1].replace(',', '.');
  return parseFloat(odds).toFixed(2);
}

function cleanAmount(amount: string): string {
  if (!amount) return '';
  
  // Remove "kr", quotes, spaces, and thousand separators
  const cleaned = amount
    .replace(/"/g, '')
    .replace(/\s*kr\s*/g, '')
    .replace(/\s+/g, '')
    .replace(/\s/g, '')
    .trim();
  
  // Replace comma with dot
  const withDot = cleaned.replace(',', '.');
  
  // Extract number
  const numberMatch = withDot.match(/[\d.]+/);
  if (!numberMatch) return '';
  
  const number = parseFloat(numberMatch[0]);
  return isNaN(number) ? '' : number.toString();
}

function calculatePayout(stake: string, odds: string, result: string): string {
  const stakeNum = parseFloat(stake);
  const oddsNum = parseFloat(odds);
  
  if (isNaN(stakeNum) || isNaN(oddsNum)) return '';
  
  const normalizedResult = normalizeResult(result);
  
  switch (normalizedResult) {
    case 'won':
      return (stakeNum * oddsNum).toString();
    case 'lost':
      return '0';
    case 'void':
      return stakeNum.toString();
    case 'pending':
      return '';
    default:
      return '';
  }
}

function normalizeResult(result: string): string {
  if (!result) return '';
  
  const cleaned = result.toLowerCase().trim();
  
  if (cleaned.includes('vinnande') || cleaned.includes('vinst') || cleaned.includes('won')) {
    return 'won';
  } else if (cleaned.includes('förlorad') || cleaned.includes('förlust') || cleaned.includes('lost') || cleaned.includes('förlorande')) {
    return 'lost';
  } else if (cleaned.includes('återbetald') || cleaned.includes('void') || cleaned.includes('makulerad') || cleaned.includes('push') || cleaned.includes('annullerat')) {
    return 'void';
  } else if (cleaned.includes('öppen') || cleaned.includes('ej avgjord') || cleaned.includes('pågår') || cleaned.includes('pending')) {
    return 'pending';
  }
  
  return cleaned;
}

function formatCSVRow(fields: string[]): string {
  return fields.map(field => {
    // Add quotes if field contains comma
    if (field.includes(',')) {
      return `"${field}"`;
    }
    return field;
  }).join(',');
}

// Example usage function
export function convertTabulaFile(fileContent: string): string {
  const converted = convertTabulaToStandardCSV(fileContent);
  return converted;
}
