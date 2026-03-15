/* ============================================================
   SEA HAWK COURIER & CARGO — Rate Calculator
   Rates sourced from original newFile.js + rateEngine.js
   ============================================================ */

/* ── RATE TABLES ── */

// Normal Service Rates (per consignment) - mapped to "DOMESTIC DOCUMENT & PACKET RATES" (Up to 250g)
const NORMAL_RATES = {
  localNCR:    { base: 22,  additional: 12 }, // Up to 250g: 22, 500g: 25, Addl 500g: 12 (Using 250g base, but scaling correctly in calculate function)
  northIndia:  { base: 28,  additional: 14 },
  metro:       { base: 35,  additional: 35 },
  restIndia:   { base: 40,  additional: 38 },
  northEast:   { base: 65,  additional: 45 },
  diplomatic:  { base: 75,  additional: 50 },
};

// Premium Service Rates (per consignment) - mapped to "PRIORITY SERVICES" (Up to 500g)
const PREMIUM_RATES = {
  localNCR:    { base: 70,  additional: 50 },
  northIndia:  { base: 100, additional: 75 },
  metro:       { base: 140, additional: 100 }, // Assuming Rest of India / Metro pricing
  restIndia:   { base: 140, additional: 100 },
  northEast:   { base: 175, additional: 125 },
  diplomatic:  { base: 200, additional: 150 }, // Approximation since not listed
};

// Heavy Weight Rates (per kg) - mapped to "HEAVY CARGO — SURFACE" and "AIR"
const HEAVY_RATES = {
  localNCRHeavy:   22, // 3-10kg surface
  northIndiaHeavy: 30, // 3-10kg surface
  majorCity:       35, // 3-10kg surface (Metro)
  restIndiaHeavy:  45, // 3-10kg surface
  restIndiaAir:    88, // <5kg air mapping
  diplomaticHeavy: 120, // Port Blair surface 3-10kg
};

// International Rates (per 500g)
const INTL_RATES = {
  zoneA: { dox: 1200, sample: 1425, addlDox: 350, addlSample: 510 },
  zoneB: { dox: 1450, sample: 1675, addlDox: 460, addlSample: 520 },
  zoneC: { dox: 1600, sample: 1800, addlDox: 510, addlSample: 595 },
  zoneD: { dox: 1700, sample: 1900, addlDox: 565, addlSample: 620 },
  zoneE: { dox: 1875, sample: 1975, addlDox: 595, addlSample: 675 },
  zoneF: { dox: 1975, sample: 2125, addlDox: 625, addlSample: 725 },
  zoneG: { dox: 2250, sample: 2450, addlDox: 630, addlSample: 745 },
  zoneH: { dox: 2550, sample: 2750, addlDox: 630, addlSample: 745 }, // Zone G + 300
};

// Country → Zone mapping
const COUNTRY_ZONE = {
  "bangladesh":"zoneA","bhutan":"zoneA","maldives":"zoneA","nepal":"zoneA","sri lanka":"zoneA","united arab emirates":"zoneA",
  "bahrain":"zoneB","hong kong":"zoneB","iran":"zoneB","jordan":"zoneB","kuwait":"zoneB","oman":"zoneB","pakistan":"zoneB","qatar":"zoneB","saudi arabia":"zoneB","singapore":"zoneB","yemen":"zoneB",
  "australia":"zoneC","china":"zoneC","indonesia":"zoneC","korea":"zoneC","malaysia":"zoneC","new zealand":"zoneC","philippines":"zoneC","thailand":"zoneC","vietnam":"zoneC",
  "belgium":"zoneD","denmark":"zoneD","france":"zoneD","germany":"zoneD","italy":"zoneD","netherlands":"zoneD","united kingdom":"zoneD","switzerland":"zoneD",
  "canada":"zoneE","mexico":"zoneE","united states":"zoneE",
  "japan":"zoneF",
  "austria":"zoneG","finland":"zoneG","greece":"zoneG","israel":"zoneG","norway":"zoneG","poland":"zoneG","portugal":"zoneG","romania":"zoneG","south africa":"zoneG","spain":"zoneG","sweden":"zoneG","turkey":"zoneG",
};

const ZONE_COUNTRIES = {
  zoneA: "Bangladesh, Bhutan, Maldives, Nepal, Sri Lanka, UAE",
  zoneB: "Bahrain, Hong Kong, Iran, Jordan, Kuwait, Oman, Pakistan, Qatar, Saudi Arabia, Singapore, Yemen",
  zoneC: "Australia, China, Indonesia, Korea, Malaysia, New Zealand, Philippines, Thailand, Vietnam",
  zoneD: "Belgium, Denmark, France, Germany, Italy, Netherlands, Switzerland, UK",
  zoneE: "Canada, Mexico, USA",
  zoneF: "Japan",
  zoneG: "Austria, Finland, Greece, Israel, Norway, Poland, Portugal, Romania, South Africa, Spain, Sweden, Turkey",
  zoneH: "Rest of World (+₹ 300 from Zone G)",
};

const FUEL_SURCHARGE = 0.27;
const GST_RATE       = 0.18;
const INSURANCE_RATE = 0.05;

const STATE_ZONES = {
  delhiNcr:       { normal: 'localNCR',   heavySurface: 'localNCRHeavy',   heavyAir: 'restIndiaAir' },
  mumbai:         { normal: 'metro',      heavySurface: 'majorCity',       heavyAir: 'majorCity' },
  bangalore:      { normal: 'metro',      heavySurface: 'majorCity',       heavyAir: 'majorCity' },
  chennai:        { normal: 'metro',      heavySurface: 'majorCity',       heavyAir: 'majorCity' },
  kolkata:        { normal: 'metro',      heavySurface: 'majorCity',       heavyAir: 'majorCity' },
  hyderabad:      { normal: 'metro',      heavySurface: 'majorCity',       heavyAir: 'majorCity' },
  pune:           { normal: 'metro',      heavySurface: 'majorCity',       heavyAir: 'majorCity' },
  ahmedabad:      { normal: 'metro',      heavySurface: 'majorCity',       heavyAir: 'majorCity' },
  haryana:        { normal: 'northIndia', heavySurface: 'northIndiaHeavy', heavyAir: 'restIndiaAir' },
  punjab:         { normal: 'northIndia', heavySurface: 'northIndiaHeavy', heavyAir: 'restIndiaAir' },
  up:             { normal: 'northIndia', heavySurface: 'northIndiaHeavy', heavyAir: 'restIndiaAir' },
  rajasthan:      { normal: 'northIndia', heavySurface: 'northIndiaHeavy', heavyAir: 'restIndiaAir' },
  hp:             { normal: 'northIndia', heavySurface: 'northIndiaHeavy', heavyAir: 'restIndiaAir' },
  uk:             { normal: 'northIndia', heavySurface: 'northIndiaHeavy', heavyAir: 'restIndiaAir' },
  chandigarh:     { normal: 'northIndia', heavySurface: 'northIndiaHeavy', heavyAir: 'restIndiaAir' },
  gujarat:        { normal: 'restIndia',  heavySurface: 'restIndiaHeavy',  heavyAir: 'restIndiaAir' },
  mp:             { normal: 'restIndia',  heavySurface: 'restIndiaHeavy',  heavyAir: 'restIndiaAir' },
  maharashtra:    { normal: 'restIndia',  heavySurface: 'restIndiaHeavy',  heavyAir: 'restIndiaAir' },
  goa:            { normal: 'restIndia',  heavySurface: 'restIndiaHeavy',  heavyAir: 'restIndiaAir' },
  karnataka:      { normal: 'restIndia',  heavySurface: 'restIndiaHeavy',  heavyAir: 'restIndiaAir' },
  kerala:         { normal: 'restIndia',  heavySurface: 'restIndiaHeavy',  heavyAir: 'restIndiaAir' },
  tn:             { normal: 'restIndia',  heavySurface: 'restIndiaHeavy',  heavyAir: 'restIndiaAir' },
  ap:             { normal: 'restIndia',  heavySurface: 'restIndiaHeavy',  heavyAir: 'restIndiaAir' },
  telangana:      { normal: 'restIndia',  heavySurface: 'restIndiaHeavy',  heavyAir: 'restIndiaAir' },
  odisha:         { normal: 'restIndia',  heavySurface: 'restIndiaHeavy',  heavyAir: 'restIndiaAir' },
  chhattisgarh:   { normal: 'restIndia',  heavySurface: 'restIndiaHeavy',  heavyAir: 'restIndiaAir' },
  wb:             { normal: 'restIndia',  heavySurface: 'restIndiaHeavy',  heavyAir: 'restIndiaAir' },
  biharJharkhand: { normal: 'restIndia',  heavySurface: 'restIndiaHeavy',  heavyAir: 'biharJharkhand' },
  jammukashmir:   { normal: 'northEast',  heavySurface: 'kashmir',         heavyAir: 'srinagarSector' },
  northeast:      { normal: 'northEast',  heavySurface: 'northEast',       heavyAir: 'northEastAir' },
  portblair:      { normal: 'diplomatic', heavySurface: 'portBlair',       heavyAir: 'portBlairAir' },
};

/* ── TOGGLE FIELDS BASED ON SERVICE ── */
function calcToggleFields() {
  const svc = document.getElementById('c-svc')?.value;
  if (!svc) return;

  const isIntl  = svc === 'international';
  const isHeavy = svc.startsWith('heavy');

  // Wrap visibility logic
  const stateWrap     = document.getElementById('c-dest-state-wrap');
  const countryWrap   = document.getElementById('c-country-wrap');
  const typeWrap      = document.getElementById('c-type-wrap');

  if (stateWrap)   stateWrap.style.display   = isIntl ? 'none' : '';
  if (countryWrap) countryWrap.style.display = isIntl ? '' : 'none';
  if (typeWrap)    typeWrap.style.display    = isIntl ? '' : 'none';

  // Min weight logic
  const wInput = document.getElementById('c-weight');
  if (wInput) wInput.min = isHeavy ? '5000' : '1';

  updateZoneFromCountry();
  computeRate();
}

/* ── AUTO-SELECT ZONE FROM COUNTRY ── */
function updateZoneFromCountry() {
  const country  = document.getElementById('c-country')?.value?.toLowerCase().trim();
  const destSel  = document.getElementById('c-destination');
  const svc      = document.getElementById('c-svc')?.value;
  if (svc !== 'international' || !country || !destSel) return;

  const zone = COUNTRY_ZONE[country] || 'zoneH';
  destSel.value = zone;
  showZoneCountries(zone);
}

function showZoneCountries(zone) {
  const el = document.getElementById('zone-info');
  if (!el) return;
  if (zone && zone.startsWith('zone')) {
    el.textContent = `🌍 ${zone.toUpperCase()}: ${ZONE_COUNTRIES[zone]}`;
    el.classList.add('show');
  } else {
    el.classList.remove('show');
  }
}

/* ── COMPUTE RATE ── */
function computeRate() {
  const svc    = document.getElementById('c-svc')?.value;
  const weight = parseFloat(document.getElementById('c-weight')?.value) || 0;

  if (!svc || weight <= 0) {
    const box = document.getElementById('calcResult');
    if (box) box.classList.remove('show');
    return;
  }

  let baseCost = 0;

  if (svc === 'normal' || svc === 'premium') {
    const state = document.getElementById('c-dest-state')?.value;
    if (!state) return; // Wait for selection
    const destZone = STATE_ZONES[state]?.normal || 'localNCR';
    
    const rates = svc === 'normal' ? NORMAL_RATES : PREMIUM_RATES;
    const r     = rates[destZone] || rates.localNCR;
    const threshold = svc === 'normal' ? 250 : 500;
    
    if (weight <= threshold) {
      baseCost = r.base;
    } else {
      const extra = Math.ceil((weight - threshold) / 500); // the additional is per 500g slab
      baseCost = r.base + extra * r.additional;
    }

  } else if (svc.startsWith('heavy')) {
    if (weight < 5000) { alert('Heavy weight service requires minimum 5 kg (5000g).'); return; }
    const state = document.getElementById('c-dest-state')?.value;
    if (!state) return; // Wait for selection
    
    const isAir = svc === 'heavyAir';
    const destZone = isAir ? STATE_ZONES[state]?.heavyAir : STATE_ZONES[state]?.heavySurface;
    
    baseCost = (HEAVY_RATES[destZone] || 35) * (weight / 1000);

  } else if (svc === 'international') {
    const zone = document.getElementById('c-destination')?.value || 'zoneA';
    const type = document.getElementById('c-type')?.value || 'dox';
    const r    = INTL_RATES[zone] || INTL_RATES.zoneH;

    const baseRate  = type === 'dox' ? r.dox  : r.sample;
    const addlRate  = type === 'dox' ? r.addlDox : r.addlSample;

    if (weight <= 500) {
      baseCost = baseRate;
    } else {
      const extraSlabs = Math.ceil((weight - 500) / 500);
      baseCost = baseRate + extraSlabs * addlRate;
    }
    // Dox above 2.5kg charged as sample
    if (weight > 2500 && type === 'dox') baseCost = r.sample + Math.ceil((weight - 500) / 500) * r.addlSample;
    // Zone H extra
    if (zone === 'zoneH') baseCost += 300; // Rate card states +300
    // DHL/FedEx extra
    if (document.getElementById('c-dhl')?.checked) baseCost += 350;

    showZoneCountries(zone);
  }

  const fuelSurcharge = baseCost * FUEL_SURCHARGE;
  const hasInsurance  = document.getElementById('c-ins')?.checked;
  const insuranceCost = hasInsurance ? baseCost * INSURANCE_RATE : 0;
  const gst           = (baseCost + fuelSurcharge + insuranceCost) * GST_RATE;
  const total         = baseCost + fuelSurcharge + insuranceCost + gst;

  const fmt = n => '₹' + n.toFixed(2);
  document.getElementById('r-base').textContent  = fmt(baseCost);
  document.getElementById('r-fuel').textContent  = fmt(fuelSurcharge);
  document.getElementById('r-ins').textContent   = fmt(insuranceCost);
  document.getElementById('r-gst').textContent   = fmt(gst);
  document.getElementById('r-total').textContent = fmt(total);

  const insRow = document.getElementById('r-ins-row');
  if (insRow) insRow.style.display = hasInsurance ? '' : 'none';

  const box = document.getElementById('calcResult');
  if (box) box.classList.add('show');
}

function resetCalc() {
  const fields = ['c-dest-state', 'c-weight', 'c-ins', 'c-dhl'];
  fields.forEach(id => {
    const el = document.getElementById(id);
    if (!el) return;
    if (el.type === 'checkbox') el.checked = false;
    else el.value = '';
  });
  const box = document.getElementById('calcResult');
  if (box) box.classList.remove('show');
  const zi = document.getElementById('zone-info');
  if (zi) zi.classList.remove('show');
}

/* ── ATTACH LISTENERS ON DOM READY ── */
document.addEventListener('DOMContentLoaded', () => {
  const ids = ['c-svc','c-dest-state','c-destination','c-country','c-type','c-weight','c-ins','c-dhl'];
  ids.forEach(id => {
    const el = document.getElementById(id);
    if (!el) return;
    const evt = (el.tagName === 'SELECT' || el.type === 'checkbox') ? 'change' : 'input';
    el.addEventListener(evt, () => {
      if (id === 'c-svc') calcToggleFields();
      else if (id === 'c-country') updateZoneFromCountry();
      else computeRate();
    });
  });
  calcToggleFields(); // init state
});
