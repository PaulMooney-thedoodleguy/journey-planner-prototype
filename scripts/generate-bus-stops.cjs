#!/usr/bin/env node
/**
 * Generates src/data/bus-stops.json from a GTFS stops.txt file.
 *
 * Filters to:
 *  - location_type=0 (individual stops, not stations)
 *  - UK geographic bounds: lat 49-61, lng -8 to 2
 *  - Non-empty stop_name
 *
 * Output format is a compact array-of-arrays to minimise file size:
 *   [[stop_id, stop_name, lat, lng], ...]
 * Type 'bus' is inferred at load time — not stored in the file.
 *
 * Usage:
 *   node scripts/generate-bus-stops.js
 */

const fs = require('fs');
const path = require('path');

const STOPS_TXT = path.join(__dirname, 'gtfs-tmp', 'stops.txt');
const OUT_FILE  = path.join(__dirname, '..', 'src', 'data', 'bus-stops.json');

// Greater London + M25 corridor (~25K stops, 1.3 MB)
const LAT_MIN = 51.28, LAT_MAX = 51.72;
const LNG_MIN = -0.56, LNG_MAX = 0.36;

console.log('Reading', STOPS_TXT, '...');
const raw = fs.readFileSync(STOPS_TXT, 'utf8');
const lines = raw.split('\n');
const header = lines[0].trim().split(',');

const idIdx     = header.indexOf('stop_id');
const nameIdx   = header.indexOf('stop_name');
const latIdx    = header.indexOf('stop_lat');
const lonIdx    = header.indexOf('stop_lon');
const typeIdx   = header.indexOf('location_type');

console.log(`Header columns: id=${idIdx} name=${nameIdx} lat=${latIdx} lon=${lonIdx} type=${typeIdx}`);

/**
 * Minimal CSV field parser — handles double-quoted fields with internal commas.
 */
function parseCSVLine(line) {
  const fields = [];
  let i = 0;
  while (i < line.length) {
    if (line[i] === '"') {
      // Quoted field
      let j = i + 1;
      while (j < line.length && !(line[j] === '"' && line[j + 1] !== '"')) {
        if (line[j] === '"') j++; // skip escaped quote
        j++;
      }
      fields.push(line.slice(i + 1, j).replace(/""/g, '"'));
      i = j + 1;
      if (line[i] === ',') i++;
    } else {
      const end = line.indexOf(',', i);
      if (end === -1) {
        fields.push(line.slice(i));
        break;
      }
      fields.push(line.slice(i, end));
      i = end + 1;
    }
  }
  return fields;
}

const stops = [];
let skipped = 0;

for (let i = 1; i < lines.length; i++) {
  const line = lines[i].trim();
  if (!line) continue;

  const parts = parseCSVLine(line);
  const locType = parts[typeIdx] ?? '';
  if (locType !== '0' && locType !== '') { skipped++; continue; }

  const lat = parseFloat(parts[latIdx]);
  const lng = parseFloat(parts[lonIdx]);
  if (isNaN(lat) || isNaN(lng)) { skipped++; continue; }
  if (lat < LAT_MIN || lat > LAT_MAX || lng < LNG_MIN || lng > LNG_MAX) { skipped++; continue; }

  const name = (parts[nameIdx] ?? '').trim();
  if (!name) { skipped++; continue; }

  const id = (parts[idIdx] ?? '').trim();
  if (!id) { skipped++; continue; }

  // Round to 4 decimal places (~11m accuracy — sufficient for bus stops)
  stops.push([id, name, Math.round(lat * 1e4) / 1e4, Math.round(lng * 1e4) / 1e4]);
}

console.log(`Kept: ${stops.length} | Skipped: ${skipped}`);

const json = JSON.stringify(stops);
fs.writeFileSync(OUT_FILE, json, 'utf8');

const kb = (json.length / 1024).toFixed(0);
console.log(`Written to ${OUT_FILE} (${kb} KB)`);
