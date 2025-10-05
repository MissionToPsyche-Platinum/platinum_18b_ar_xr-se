// asteroidValue.js
// Run with: node asteroidValue.js

const API_KEY = "LMK8WWQNCCKFV6OL0HQX880OL0HQX";
const BASE_URL = "https://api.metals.dev/v1/latest";

// Utility: convert pounds → troy ounces
function lbsToTroyOunces(lbs) {
  const ouncesPerPound = 16; 
  const troyOzPerAvoirOz = 0.911458; 
  return lbs * ouncesPerPound * troyOzPerAvoirOz;
}

async function computeAsteroidValue({ totalPounds, composition }) {
  try {
    const url = `${BASE_URL}?api_key=${API_KEY}&currency=USD&unit=toz`;
    const resp = await fetch(url, { headers: { "Accept": "application/json" } });
    const data = await resp.json();

    if (data.status !== "success") {
      console.error("API Error:", data);
      return;
    }

    const metalRates = data.metals;  
    const totalTroyOunces = lbsToTroyOunces(totalPounds);

    let totalValueUSD = 0;
    const breakdown = {};

    for (const [metal, fraction] of Object.entries(composition)) {
      if (!(metal in metalRates)) {
        console.warn(`No rate for '${metal}' — skipping.`);
        continue;
      }
      const ratePerTroyOz = metalRates[metal];
      const metalOunces = totalTroyOunces * fraction;
      const metalValue = metalOunces * ratePerTroyOz;
      breakdown[metal] = {
        ounces: metalOunces,
        rate: ratePerTroyOz,
        value: metalValue
      };
      totalValueUSD += metalValue;
    }

    return { totalValueUSD, breakdown };
  } catch (err) {
    console.error("Fetch error:", err);
  }
}

// Demo
(async () => {
  const asteroid = {
    totalPounds: 1_000_000, // asteroid weight in pounds
    composition: {
      gold: 0.5,     // 50% gold
      silver: 0.3,   // 30% silver
      platinum: 0.2  // 20% platinum
    }
  };

  const result = await computeAsteroidValue(asteroid);

  console.log("Breakdown by metal:");
  console.log(result.breakdown);
  console.log(`\n Total Value (USD): $${result.totalValueUSD.toLocaleString(undefined, { maximumFractionDigits: 2 })}`);
})();
