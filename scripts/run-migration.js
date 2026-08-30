const fs = require("fs");
const path = require("path");
const { Client } = require("pg");

for (const line of fs.readFileSync(path.join(__dirname, "..", ".env.local"), "utf8").split("\n")) {
  const match = line.match(/^([A-Z0-9_]+)="(.*)"$/);
  if (match) process.env[match[1]] = match[2];
}

const file = process.argv[2];
if (!file) {
  console.error("uso: node scripts/run-migration.js <arquivo.sql>");
  process.exit(1);
}

const sql = fs.readFileSync(path.join(__dirname, "..", file), "utf8");

async function main() {
  const connectionString = process.env.POSTGRES_URL_NON_POOLING.split("?")[0];
  const client = new Client({
    connectionString,
    ssl: { rejectUnauthorized: false },
  });
  await client.connect();
  try {
    await client.query(sql);
    console.log("Migration aplicada com sucesso:", file);
  } finally {
    await client.end();
  }
}

main().catch((err) => {
  console.error("Erro ao aplicar migration:", err.message);
  process.exit(1);
});
