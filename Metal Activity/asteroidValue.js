// asteroidValue.js
// Run with: node asteroidValue.js

import fs from "fs";

const API_KEY = "KOROCWV5DK8X4JRMHNFP279RMHNFP";
const BASE_URL = "https://api.metals.dev/v1/latest";
const CACHE_FILE = "./cachedMetals.json";
const CACHE_DURATION_MS = 2 * 24 * 60 * 60 * 1000; // 2 days

// Utility: convert pounds → troy ounces
function lbsToTroyOunces(lbs) {
  const ouncesPerPound = 16;
  const troyOzPerAvoirOz = 0.911458;
  return lbs * ouncesPerPound * troyOzPerAvoirOz;
}

// Fetch or load cached metal rates
async function getMetalRates() {
  try {
    // Check for valid cache file
    if (fs.existsSync(CACHE_FILE)) {
      const cache = JSON.parse(fs.readFileSync(CACHE_FILE, "utf8"));
      const ageMs = Date.now() - cache.timestamp;

      if (ageMs < CACHE_DURATION_MS) {
        const hoursLeft = ((CACHE_DURATION_MS - ageMs) / 1000 / 60 / 60).toFixed(1);
        console.log(`Using cached data (refreshes in ~${hoursLeft} hours)`);
        return cache.metals;
      } else {
        console.log("Cache expired — fetching fresh metal data...");
      }
    } else {
      console.log("No cache found — fetching metal data...");
    }

    // Fetch new data from API
    const url = `${BASE_URL}?api_key=${API_KEY}&currency=USD&unit=toz`;
    const resp = await fetch(url, { headers: { "Accept": "application/json" } });
    const data = await resp.json();

    if (data.status !== "success") {
      console.error("API Error:", data);
      throw new Error("Failed to fetch metals data");
    }

    //  Write new data to cache file
    fs.writeFileSync(
      CACHE_FILE,
      JSON.stringify({ timestamp: Date.now(), metals: data.metals }, null, 2)
    );

    console.log("Cached new metal data successfully.");
    return data.metals;
  } catch (err) {
    console.error("Fetch/cache error:", err);

    // Fallback: use cache if available
    if (fs.existsSync(CACHE_FILE)) {
      console.warn("Using stale cached data due to fetch error.");
      return JSON.parse(fs.readFileSync(CACHE_FILE, "utf8")).metals;
    } else {
      throw new Error("No cached data available and API fetch failed.");
    }
  }
}

async function computeAsteroidValue({ totalPounds, composition }) {
  try {
    const metalRates = await getMetalRates();
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
    console.error("Error computing asteroid value:", err);
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
  console.log(
    `\n Total Value (USD): $${result.totalValueUSD.toLocaleString(undefined, {
      maximumFractionDigits: 2
    })}`
  );
})();
