import fs from "fs";


const filePath = "env.js"; // шаблонът е в root


if (!process.env.SUPABASE_URL || !process.env.SUPABASE_ANON_KEY) {
console.error("❌ Missing SUPABASE_URL or SUPABASE_ANON_KEY env var in Vercel.");
process.exit(1);
}


let content = fs.readFileSync(filePath, "utf8");
content = content
.replace("__SUPABASE_URL__", process.env.SUPABASE_URL)
.replace("__SUPABASE_ANON_KEY__", process.env.SUPABASE_ANON_KEY);


fs.writeFileSync(filePath, content);
console.log("✅ env.js updated with Vercel ENV values");
