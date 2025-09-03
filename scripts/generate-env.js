// scripts/generate-env.js
// Генерира env.js в root по време на билд (Vercel)
// Използва публичните Vercel env vars: SUPABASE_URL и SUPABASE_ANON_KEY

const fs = require("fs");

const { SUPABASE_URL, SUPABASE_ANON_KEY } = process.env;

if (!SUPABASE_URL || !SUPABASE_ANON_KEY) {
  console.error("❌ Missing SUPABASE_URL or SUPABASE_ANON_KEY in Vercel env vars.");
  process.exit(1);
}

const content =
  `window.ENV = { SUPABASE_URL: "${SUPABASE_URL}", SUPABASE_ANON_KEY: "${SUPABASE_ANON_KEY}" };`;

fs.writeFileSync("env.js", content);
console.log("✅ Generated env.js");
