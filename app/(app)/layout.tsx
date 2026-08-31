import { redirect } from "next/navigation";
import { createClient } from "@/lib/supabase/server";
import { BottomNav } from "./bottom-nav";
import { TermGate } from "./term-gate";
import { CURRENT_TERM_VERSION } from "@/lib/terms";

export default async function AppLayout({ children }: { children: React.ReactNode }) {
  const supabase = await createClient();
  const {
    data: { user },
  } = await supabase.auth.getUser();

  if (!user) redirect("/login");

  const { data: acceptance } = await supabase
    .from("term_acceptances")
    .select("id")
    .eq("user_id", user.id)
    .eq("term_version", CURRENT_TERM_VERSION)
    .maybeSingle();

  if (!acceptance) return <TermGate />;

  return (
    <div className="print-scope">
      <div className="pb-24">{children}</div>
      <BottomNav />
    </div>
  );
}
