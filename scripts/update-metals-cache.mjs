import fs from "fs";

const API_KEY = process.env.METALS_API_KEY;
if (!API_KEY) {
  console.error("Missing METALS_API_KEY secret.");
  process.exit(1);
}

const BASE_URL = "https://api.metals.dev/v1/latest";
const url = `${BASE_URL}?api_key=${encodeURIComponent(API_KEY)}&currency=USD&unit=toz`;

async function main() {
  const res = await fetch(url);
  if (!res.ok) {
    throw new Error(`API failed: ${res.status} ${res.statusText}`);
  }

  const data = await res.json();
  if (!data.metals) {
    throw new Error("Invalid API response (missing metals)");
  }

  const payload = {
    timestamp: Date.now(),
    metals: data.metals,
    source: "metals.dev",
    unit: "toz",
    currency: "USD"
  };

  fs.writeFileSync(
    "cachedMetals.json",
    JSON.stringify(payload, null, 2) + "\n"
  );

  console.log("cachedMetals.json updated");
}

main().catch(err => {
  console.error(err);
  process.exit(1);
});
