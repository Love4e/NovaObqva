// scripts/generate-env.js
const fs = require("fs");
const path = require("path");

const { SUPABASE_URL, SUPABASE_ANON_KEY } = process.env;

if (!SUPABASE_URL || !SUPABASE_ANON_KEY) {
  console.error("❌ Missing SUPABASE_URL or SUPABASE_ANON_KEY in Vercel env vars.");
  process.exit(1);
}

const outPath = path.join(__dirname, "..", "public", "env.js");
const content = `window.ENV = { SUPABASE_URL: "${SUPABASE_URL}", SUPABASE_ANON_KEY: "${SUPABASE_ANON_KEY}" };`;

fs.writeFileSync(outPath, content);
console.log("✅ Generated public/env.js");
