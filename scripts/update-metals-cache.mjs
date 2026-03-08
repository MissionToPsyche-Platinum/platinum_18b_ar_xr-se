import fs from "fs";

const API_KEY = process.env.METALS_API_KEY;
if (!API_KEY) {
  console.error("Missing METALS_API_KEY secret.");
  process.exit(1);
}

const CACHE_FILE = "cachedMetals.json";
const BASE_URL = "https://api.metals.dev/v1/latest";

function monthKey(d) {
  return `${d.getUTCFullYear()}-${String(d.getUTCMonth() + 1).padStart(2, "0")}`;
}

async function main() {
  const now = new Date();
  const thisMonth = monthKey(now);

  // 1) If cache exists AND was updated this month, skip API call
  if (fs.existsSync(CACHE_FILE)) {
    try {
      const cache = JSON.parse(fs.readFileSync(CACHE_FILE, "utf8"));
      if (cache.timestamp) {
        const cachedMonth = monthKey(new Date(cache.timestamp));
        if (cachedMonth === thisMonth) {
          console.log(`Cache already updated for ${thisMonth}. Skipping API call.`);
          return;
        }
      }
    } catch (e) {
      console.log("Cache file unreadable, will refresh.");
    }
  }

  // 2) Otherwise fetch fresh data
  const url = `${BASE_URL}?api_key=${encodeURIComponent(API_KEY)}&currency=USD&unit=toz`;
  const res = await fetch(url);
  if (!res.ok) throw new Error(`API failed: ${res.status} ${res.statusText}`);

  const data = await res.json();
  if (!data.metals) throw new Error("Invalid API response (missing metals)");

  const payload = {
    timestamp: Date.now(),
    metals: data.metals,
    source: "metals.dev",
    unit: "toz",
    currency: "USD"
  };

  fs.writeFileSync(CACHE_FILE, JSON.stringify(payload, null, 2) + "\n");
  console.log(`cachedMetals.json updated for ${thisMonth}`);
}

main().catch(err => {
  console.error(err);
  process.exit(1);
});
