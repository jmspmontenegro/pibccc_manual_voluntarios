import fs from "node:fs";
import { createClient } from "@supabase/supabase-js";

const envText = fs.readFileSync(new URL("../.env.local", import.meta.url), "utf8");
const env = {};
for (const line of envText.split("\n")) {
  const m = line.match(/^([A-Z0-9_]+)="(.*)"$/);
  if (m) env[m[1]] = m[2];
}

const supabase = createClient(env.NEXT_PUBLIC_SUPABASE_URL, env.SUPABASE_SERVICE_ROLE_KEY);

const email = "design-preview@example.com";
const password = "PreviewDesign123!";

const { data: existing } = await supabase.auth.admin.listUsers();
const found = existing.users.find((u) => u.email === email);
if (found) {
  await supabase.auth.admin.deleteUser(found.id);
}

const { data, error } = await supabase.auth.admin.createUser({
  email,
  password,
  email_confirm: true,
  user_metadata: { full_name: "Preview Design", phone: "11999999999" },
});

if (error) {
  console.error("erro:", error.message);
  process.exit(1);
}

// Promove a admin pra poder ver todas as telas (usuarios/configuracoes).
await supabase.from("profiles").update({ role: "admin" }).eq("id", data.user.id);

console.log("ok", email, password);
