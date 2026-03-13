import type { Disruption } from '../types';

export const MOCK_DISRUPTIONS: Disruption[] = [

  // ── CRITICAL ──────────────────────────────────────────────────────────────

  {
    id: 1,
    severity: 'critical',
    title: "District Line — Wimbledon Branch Suspended",
    location: "Earl's Court to Wimbledon",
    description: "No service between Earl's Court and Wimbledon due to a broken rail near Parsons Green. London Buses routes 93 and 493 are accepting District line tickets as an alternative. Engineers are on site. Estimated restoration: 21:30.",
    operator: 'TfL',
    updated: '8 mins ago',
    lat: 51.4749, lng: -0.1995,
    mode: 'tube',
    affectedRoute: [
      { lat: 51.4914, lng: -0.1935 }, // Earl's Court
      { lat: 51.4876, lng: -0.1953 }, // West Brompton
      { lat: 51.4796, lng: -0.1813 }, // Fulham Broadway
      { lat: 51.4749, lng: -0.1995 }, // Parsons Green
      { lat: 51.4682, lng: -0.2091 }, // Putney Bridge
      { lat: 51.4574, lng: -0.2123 }, // East Putney
      { lat: 51.4449, lng: -0.2068 }, // Southfields
      { lat: 51.4337, lng: -0.2025 }, // Wimbledon Park
      { lat: 51.4214, lng: -0.2063 }, // Wimbledon
    ],
    affectedStops: [
      { name: "Earl's Court",    lat: 51.4914, lng: -0.1935 },
      { name: 'West Brompton',   lat: 51.4876, lng: -0.1953 },
      { name: 'Fulham Broadway', lat: 51.4796, lng: -0.1813 },
      { name: 'Parsons Green',   lat: 51.4749, lng: -0.1995 },
      { name: 'Putney Bridge',   lat: 51.4682, lng: -0.2091 },
      { name: 'East Putney',     lat: 51.4574, lng: -0.2123 },
      { name: 'Southfields',     lat: 51.4449, lng: -0.2068 },
      { name: 'Wimbledon Park',  lat: 51.4337, lng: -0.2025 },
      { name: 'Wimbledon',       lat: 51.4214, lng: -0.2063 },
    ],
    affectedRadius: 6500,
  },

  {
    id: 2,
    severity: 'critical',
    title: 'Great Western Railway — No Service Paddington–Reading',
    location: 'London Paddington to Reading',
    description: "All trains suspended between Paddington and Reading due to a person on the track near Slough. Emergency services are attending. Rail replacement coaches are not yet available. Station staff at Paddington can advise on the Elizabeth line to Reading as an alternative.",
    operator: 'Great Western Railway',
    updated: '3 mins ago',
    lat: 51.5114, lng: -0.5950,
    mode: 'train',
    affectedRoute: [
      { lat: 51.5154, lng: -0.1755 }, // London Paddington
      { lat: 51.5149, lng: -0.3019 }, // Ealing Broadway
      { lat: 51.5126, lng: -0.4056 }, // Southall
      { lat: 51.5114, lng: -0.5950 }, // Slough
      { lat: 51.5225, lng: -0.7192 }, // Maidenhead
      { lat: 51.5068, lng: -0.7601 }, // Taplow
      { lat: 51.4587, lng: -0.9714 }, // Reading
    ],
    affectedStops: [
      { name: 'London Paddington', lat: 51.5154, lng: -0.1755 },
      { name: 'Ealing Broadway',   lat: 51.5149, lng: -0.3019 },
      { name: 'Southall',          lat: 51.5126, lng: -0.4056 },
      { name: 'Slough',            lat: 51.5114, lng: -0.5950 },
      { name: 'Maidenhead',        lat: 51.5225, lng: -0.7192 },
      { name: 'Taplow',            lat: 51.5068, lng: -0.7601 },
      { name: 'Reading',           lat: 51.4587, lng: -0.9714 },
    ],
    affectedRadius: 22000,
  },

  // ── HIGH ──────────────────────────────────────────────────────────────────

  {
    id: 3,
    severity: 'high',
    title: 'Jubilee Line — Part Closure',
    location: 'Stratford to North Greenwich',
    description: "No service between Stratford and North Greenwich following a signal failure at Canning Town. Trains are running normally elsewhere on the line. Take the DLR from Stratford to Canary Wharf as an alternative. North Greenwich bus station serves several routes.",
    operator: 'TfL',
    updated: '22 mins ago',
    lat: 51.5147, lng: 0.0082,
    mode: 'tube',
    affectedRoute: [
      { lat: 51.5416, lng: -0.0033 }, // Stratford
      { lat: 51.5283, lng:  0.0050 }, // West Ham
      { lat: 51.5147, lng:  0.0082 }, // Canning Town
      { lat: 51.5002, lng:  0.0039 }, // North Greenwich
    ],
    affectedStops: [
      { name: 'Stratford',       lat: 51.5416, lng: -0.0033 },
      { name: 'West Ham',        lat: 51.5283, lng:  0.0050 },
      { name: 'Canning Town',    lat: 51.5147, lng:  0.0082 },
      { name: 'North Greenwich', lat: 51.5002, lng:  0.0039 },
    ],
    affectedRadius: 5200,
  },

  {
    id: 4,
    severity: 'high',
    title: 'Southern — Major Delays: London Bridge to Gatwick',
    location: 'London Bridge to Gatwick Airport',
    description: "Overhead electric line damage between Redhill and Three Bridges is causing severe delays of up to 40 minutes. Some services are being cancelled. If you have a flight to catch, allow significant extra time or consider alternative routes via the Gatwick Express from Victoria.",
    operator: 'Southern',
    updated: '41 mins ago',
    lat: 51.2403, lng: -0.1705,
    mode: 'train',
    affectedRoute: [
      { lat: 51.5052, lng: -0.0860 }, // London Bridge
      { lat: 51.3757, lng: -0.0999 }, // East Croydon
      { lat: 51.2403, lng: -0.1705 }, // Redhill
      { lat: 51.2138, lng: -0.1818 }, // Horley
      { lat: 51.1565, lng: -0.1619 }, // Gatwick Airport
    ],
    affectedStops: [
      { name: 'London Bridge',   lat: 51.5052, lng: -0.0860 },
      { name: 'East Croydon',    lat: 51.3757, lng: -0.0999 },
      { name: 'Redhill',         lat: 51.2403, lng: -0.1705 },
      { name: 'Horley',          lat: 51.2138, lng: -0.1818 },
      { name: 'Gatwick Airport', lat: 51.1565, lng: -0.1619 },
    ],
    affectedRadius: 17000,
  },

  {
    id: 5,
    severity: 'high',
    title: 'Bus Route 73 — Diversion in Central London',
    location: 'Oxford Street: Marble Arch to Oxford Circus',
    description: "Bus route 73 is diverted away from Oxford Street between Marble Arch and Oxford Circus due to an emergency water main repair. Services are running via North Row and Portman Street. Stops on Oxford Street between these points are not served. Journey times are approximately 12 minutes longer.",
    operator: 'TfL',
    updated: '1 hour ago',
    lat: 51.5154, lng: -0.1419,
    mode: 'bus',
    affectedRoute: [
      { lat: 51.5130, lng: -0.1590 }, // Marble Arch
      { lat: 51.5152, lng: -0.1542 }, // Oxford St / Selfridges
      { lat: 51.5153, lng: -0.1484 }, // Oxford St / Bond St
      { lat: 51.5154, lng: -0.1419 }, // Oxford Circus
    ],
    affectedStops: [
      { name: 'Marble Arch',            lat: 51.5130, lng: -0.1590 },
      { name: 'Oxford St / Selfridges', lat: 51.5152, lng: -0.1542 },
      { name: 'Oxford St / Bond St',    lat: 51.5153, lng: -0.1484 },
      { name: 'Oxford Circus',          lat: 51.5154, lng: -0.1419 },
    ],
    affectedRadius: 800,
  },

  // ── MEDIUM ────────────────────────────────────────────────────────────────

  {
    id: 6,
    severity: 'medium',
    title: 'Victoria Line — Delays South of Victoria',
    location: 'Victoria to Brixton',
    description: "Delays of up to 8 minutes between Victoria and Brixton following a train defect at Stockwell. The defective train has been removed from service. Service is recovering but residual delays are expected for the next 30 minutes.",
    operator: 'TfL',
    updated: '18 mins ago',
    lat: 51.4722, lng: -0.1223,
    mode: 'tube',
    affectedRoute: [
      { lat: 51.4965, lng: -0.1447 }, // Victoria
      { lat: 51.4892, lng: -0.1334 }, // Pimlico
      { lat: 51.4862, lng: -0.1236 }, // Vauxhall
      { lat: 51.4818, lng: -0.1131 }, // Oval
      { lat: 51.4722, lng: -0.1223 }, // Stockwell
      { lat: 51.4627, lng: -0.1145 }, // Brixton
    ],
    affectedStops: [
      { name: 'Victoria',  lat: 51.4965, lng: -0.1447 },
      { name: 'Pimlico',   lat: 51.4892, lng: -0.1334 },
      { name: 'Vauxhall',  lat: 51.4862, lng: -0.1236 },
      { name: 'Oval',      lat: 51.4818, lng: -0.1131 },
      { name: 'Stockwell', lat: 51.4722, lng: -0.1223 },
      { name: 'Brixton',   lat: 51.4627, lng: -0.1145 },
    ],
    affectedRadius: 4200,
  },

  {
    id: 7,
    severity: 'medium',
    title: 'Elizabeth Line — Weekend Engineering: Shenfield Branch',
    location: 'Liverpool Street to Shenfield',
    description: "No Elizabeth line service between Liverpool Street and Shenfield this weekend due to planned track renewal. National Rail services operate via Stratford and rail replacement buses run between Stratford and Shenfield. Paddington–Reading–Heathrow services are not affected.",
    operator: 'TfL / National Rail',
    updated: '2 hours ago',
    lat: 51.5576, lng: 0.0701,
    mode: 'train',
    affectedRoute: [
      { lat: 51.5178, lng: -0.0818 }, // Liverpool Street
      { lat: 51.5416, lng: -0.0033 }, // Stratford
      { lat: 51.5478, lng:  0.0086 }, // Maryland
      { lat: 51.5576, lng:  0.0701 }, // Ilford
      { lat: 51.5757, lng:  0.1836 }, // Romford
      { lat: 51.6154, lng:  0.3027 }, // Brentwood
      { lat: 51.6373, lng:  0.3285 }, // Shenfield
    ],
    affectedStops: [
      { name: 'Liverpool Street', lat: 51.5178, lng: -0.0818 },
      { name: 'Stratford',        lat: 51.5416, lng: -0.0033 },
      { name: 'Maryland',         lat: 51.5478, lng:  0.0086 },
      { name: 'Ilford',           lat: 51.5576, lng:  0.0701 },
      { name: 'Romford',          lat: 51.5757, lng:  0.1836 },
      { name: 'Brentwood',        lat: 51.6154, lng:  0.3027 },
      { name: 'Shenfield',        lat: 51.6373, lng:  0.3285 },
    ],
    affectedRadius: 20000,
  },

  {
    id: 8,
    severity: 'medium',
    title: 'Thameslink — Reduced Frequency to Luton Airport',
    location: 'St Pancras International to Luton Airport Parkway',
    description: "Services between St Pancras International and Luton Airport Parkway are running at half their normal frequency (2 trains per hour) due to a driver shortage. Journey times are unaffected. Passengers travelling to Luton Airport are advised to check departure times before travelling.",
    operator: 'Thameslink',
    updated: '45 mins ago',
    lat: 51.8708, lng: -0.3945,
    mode: 'train',
    affectedRoute: [
      { lat: 51.5308, lng: -0.1238 }, // St Pancras International
      { lat: 51.5621, lng: -0.2101 }, // Cricklewood
      { lat: 51.5879, lng: -0.2279 }, // Hendon
      { lat: 51.6583, lng: -0.2725 }, // Elstree & Borehamwood
      { lat: 51.7453, lng: -0.3378 }, // St Albans
      { lat: 51.8196, lng: -0.3498 }, // Harpenden
      { lat: 51.8708, lng: -0.3945 }, // Luton Airport Parkway
    ],
    affectedStops: [
      { name: 'St Pancras International', lat: 51.5308, lng: -0.1238 },
      { name: 'Cricklewood',              lat: 51.5621, lng: -0.2101 },
      { name: 'Elstree & Borehamwood',    lat: 51.6583, lng: -0.2725 },
      { name: 'St Albans',                lat: 51.7453, lng: -0.3378 },
      { name: 'Harpenden',                lat: 51.8196, lng: -0.3498 },
      { name: 'Luton Airport Parkway',    lat: 51.8708, lng: -0.3945 },
    ],
    affectedRadius: 21000,
  },

  {
    id: 9,
    severity: 'medium',
    title: 'Bus Route 25 — Delays via Mile End',
    location: 'Mile End to Bank',
    description: "Bus route 25 is running 10–15 minutes late between Mile End and Bank due to a road traffic incident on Commercial Road near Stepney Green. Buses on routes 15 and 115 are also experiencing delays in the same area. Allow extra time for journeys towards the City.",
    operator: 'TfL',
    updated: '33 mins ago',
    lat: 51.5148, lng: -0.0523,
    mode: 'bus',
    affectedRoute: [
      { lat: 51.5255, lng: -0.0336 }, // Mile End
      { lat: 51.5203, lng: -0.0441 }, // Stepney Green
      { lat: 51.5148, lng: -0.0523 }, // Commercial Road
      { lat: 51.5148, lng: -0.0713 }, // Aldgate
      { lat: 51.5131, lng: -0.0886 }, // Bank
    ],
    affectedStops: [
      { name: 'Mile End',       lat: 51.5255, lng: -0.0336 },
      { name: 'Stepney Green',  lat: 51.5203, lng: -0.0441 },
      { name: 'Commercial Road',lat: 51.5148, lng: -0.0523 },
      { name: 'Aldgate',        lat: 51.5148, lng: -0.0713 },
      { name: 'Bank',           lat: 51.5131, lng: -0.0886 },
    ],
    affectedRadius: 3500,
  },

  // ── LOW ───────────────────────────────────────────────────────────────────

  {
    id: 10,
    severity: 'low',
    title: 'DLR — Minor Delays on Bank Branch',
    location: 'Bank to Lewisham',
    description: "Minor delays of up to 5 minutes affecting DLR services between Bank and Lewisham following a brief signalling irregularity at Limehouse. The issue has been resolved and services are recovering. Canary Wharf and all other stations remain open.",
    operator: 'TfL DLR',
    updated: '11 mins ago',
    lat: 51.5118, lng: -0.0358,
    mode: 'tube',
    affectedRoute: [
      { lat: 51.5131, lng: -0.0886 }, // Bank
      { lat: 51.5117, lng: -0.0572 }, // Shadwell
      { lat: 51.5118, lng: -0.0358 }, // Limehouse
      { lat: 51.5093, lng: -0.0264 }, // Westferry
      { lat: 51.5034, lng: -0.0195 }, // Canary Wharf
      { lat: 51.4966, lng: -0.0163 }, // Crossharbour
      { lat: 51.4779, lng:  0.0054 }, // Greenwich
      { lat: 51.4652, lng: -0.0131 }, // Lewisham
    ],
    affectedStops: [
      { name: 'Bank',         lat: 51.5131, lng: -0.0886 },
      { name: 'Shadwell',     lat: 51.5117, lng: -0.0572 },
      { name: 'Limehouse',    lat: 51.5118, lng: -0.0358 },
      { name: 'Canary Wharf', lat: 51.5034, lng: -0.0195 },
      { name: 'Greenwich',    lat: 51.4779, lng:  0.0054 },
      { name: 'Lewisham',     lat: 51.4652, lng: -0.0131 },
    ],
    affectedRadius: 5000,
  },

  {
    id: 11,
    severity: 'low',
    title: 'London Overground — Planned Engineering Saturday Night',
    location: 'Highbury & Islington to Clapham Junction',
    description: "Planned engineering works on the East London line this Saturday between 22:30 and 07:00 Sunday. Rail replacement buses will run between Highbury & Islington and Clapham Junction calling at all stations. Normal service resumes from 07:00 Sunday morning.",
    operator: 'London Overground',
    updated: '3 hours ago',
    lat: 51.4982, lng: -0.0496,
    mode: 'train',
    affectedRoute: [
      { lat: 51.5462, lng: -0.1033 }, // Highbury & Islington
      { lat: 51.5468, lng: -0.0760 }, // Dalston Kingsland
      { lat: 51.5238, lng: -0.0746 }, // Shoreditch High Street
      { lat: 51.5199, lng: -0.0602 }, // Whitechapel
      { lat: 51.4982, lng: -0.0496 }, // Canada Water
      { lat: 51.4924, lng: -0.0476 }, // Surrey Quays
      { lat: 51.4683, lng: -0.0684 }, // Peckham Rye
      { lat: 51.4657, lng: -0.0888 }, // Denmark Hill
      { lat: 51.4641, lng: -0.1705 }, // Clapham Junction
    ],
    affectedStops: [
      { name: 'Highbury & Islington',   lat: 51.5462, lng: -0.1033 },
      { name: 'Dalston Kingsland',      lat: 51.5468, lng: -0.0760 },
      { name: 'Shoreditch High Street', lat: 51.5238, lng: -0.0746 },
      { name: 'Whitechapel',            lat: 51.5199, lng: -0.0602 },
      { name: 'Canada Water',           lat: 51.4982, lng: -0.0496 },
      { name: 'Surrey Quays',           lat: 51.4924, lng: -0.0476 },
      { name: 'Peckham Rye',            lat: 51.4683, lng: -0.0684 },
      { name: 'Denmark Hill',           lat: 51.4657, lng: -0.0888 },
      { name: 'Clapham Junction',       lat: 51.4641, lng: -0.1705 },
    ],
    affectedRadius: 11000,
  },

  {
    id: 12,
    severity: 'low',
    title: 'London Tramlink — Minor Delays Croydon to Wimbledon',
    location: 'East Croydon to Wimbledon',
    description: "Tram services between East Croydon and Wimbledon are running 3–5 minutes late due to a slow-running tram near Mitcham Junction. The delayed tram is being held at the next stop to allow the service to recover. Normal operation expected shortly.",
    operator: 'TfL Tramlink',
    updated: '7 mins ago',
    lat: 51.4033, lng: -0.1709,
    mode: 'tram',
    affectedRoute: [
      { lat: 51.3757, lng: -0.0999 }, // East Croydon
      { lat: 51.3695, lng: -0.0993 }, // Church Street
      { lat: 51.3726, lng: -0.1009 }, // Croydon Town Centre
      { lat: 51.4024, lng: -0.1699 }, // Mitcham
      { lat: 51.4033, lng: -0.1709 }, // Mitcham Junction
      { lat: 51.4103, lng: -0.1890 }, // Morden Road
      { lat: 51.4136, lng: -0.1957 }, // Phipps Bridge
      { lat: 51.4214, lng: -0.2063 }, // Wimbledon
    ],
    affectedStops: [
      { name: 'East Croydon',     lat: 51.3757, lng: -0.0999 },
      { name: 'Church Street',    lat: 51.3695, lng: -0.0993 },
      { name: 'Mitcham',          lat: 51.4024, lng: -0.1699 },
      { name: 'Mitcham Junction', lat: 51.4033, lng: -0.1709 },
      { name: 'Morden Road',      lat: 51.4103, lng: -0.1890 },
      { name: 'Wimbledon',        lat: 51.4214, lng: -0.2063 },
    ],
    affectedRadius: 5800,
  },

  {
    id: 13,
    severity: 'low',
    title: 'Thames Clippers — Service Suspended Westminster to Canary Wharf',
    location: 'Westminster Pier to Canary Wharf Pier',
    description: "MBNA Thames Clipper river bus services between Westminster Pier and Canary Wharf Pier are temporarily suspended due to strong tidal currents. Services east of Canary Wharf Pier and west of Westminster Pier continue to run. Alternative: Jubilee line between Westminster and Canary Wharf.",
    operator: 'MBNA Thames Clippers',
    updated: '26 mins ago',
    lat: 51.5042, lng: -0.0763,
    mode: 'ferry',
    affectedRoute: [
      { lat: 51.5015, lng: -0.1215 }, // Westminster Pier
      { lat: 51.5069, lng: -0.0910 }, // Blackfriars Pier
      { lat: 51.5064, lng: -0.0782 }, // Bankside Pier
      { lat: 51.5042, lng: -0.0763 }, // London Bridge City Pier
      { lat: 51.5027, lng: -0.0183 }, // Canary Wharf Pier
    ],
    affectedStops: [
      { name: 'Westminster Pier',        lat: 51.5015, lng: -0.1215 },
      { name: 'Blackfriars Pier',        lat: 51.5069, lng: -0.0910 },
      { name: 'Bankside Pier',           lat: 51.5064, lng: -0.0782 },
      { name: 'London Bridge City Pier', lat: 51.5042, lng: -0.0763 },
      { name: 'Canary Wharf Pier',       lat: 51.5027, lng: -0.0183 },
    ],
    affectedRadius: 6500,
  },

];
