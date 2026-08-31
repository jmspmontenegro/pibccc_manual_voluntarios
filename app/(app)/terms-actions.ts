"use server";

import { redirect } from "next/navigation";
import { createClient } from "@/lib/supabase/server";
import { CURRENT_TERM_VERSION } from "@/lib/terms";

export async function acceptTerm() {
  const supabase = await createClient();
  const {
    data: { user },
  } = await supabase.auth.getUser();
  if (!user) redirect("/login");

  const { error } = await supabase
    .from("term_acceptances")
    .insert({ user_id: user.id, term_version: CURRENT_TERM_VERSION });

  if (error) {
    console.error("acceptTerm insert error:", error);
  }

  redirect("/");
}
