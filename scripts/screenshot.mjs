import { chromium } from "playwright";
import fs from "node:fs";
import { fileURLToPath } from "node:url";

const BASE = "http://localhost:9010";
const OUT = fileURLToPath(new URL("../shots/", import.meta.url));
fs.mkdirSync(OUT, { recursive: true });

const browser = await chromium.launch();
const context = await browser.newContext({ viewport: { width: 390, height: 844 } });
const page = await context.newPage();

async function shot(path, name) {
  await page.goto(BASE + path, { waitUntil: "networkidle" });
  await page.screenshot({ path: OUT + name + ".png", fullPage: true });
  console.log("shot", name);
}

await shot("/login", "01-login");
await shot("/cadastro", "02-cadastro");

await page.goto(BASE + "/login", { waitUntil: "networkidle" });
await page.fill('#email', "design-preview@example.com");
await page.fill('#password', "PreviewDesign123!");
await page.click('button[type=submit]');
await page.waitForTimeout(2000);
console.log("after click url:", page.url());

await shot("/", "03-home");
await shot("/agenda", "04-agenda");
await shot("/eventos", "05-eventos");
await shot("/pessoas", "06-pessoas");
await shot("/mais", "07-mais");
await shot("/manual", "08-manual");
await shot("/perfil", "09-perfil");
await shot("/admin/usuarios", "10-usuarios");
await shot("/admin/equipes", "11-equipes");
await shot("/admin/configuracoes", "12-configuracoes");
await shot("/admin/configuracoes/permissoes", "13-permissoes");
await shot("/semeando-tempo", "14-semeando-tempo");

console.log(await page.evaluate(() => document.title));
await browser.close();
