import { redirect } from "next/navigation";
import { createClient } from "@/lib/supabase/server";
import { BottomNav } from "./bottom-nav";

export default async function AppLayout({ children }: { children: React.ReactNode }) {
  const supabase = await createClient();
  const {
    data: { user },
  } = await supabase.auth.getUser();

  if (!user) redirect("/login");

  const { data: profile } = await supabase
    .from("profiles")
    .select("role")
    .eq("id", user.id)
    .single();

  return (
    <>
      <div className="pb-24">{children}</div>
      <BottomNav isAdmin={profile?.role === "admin"} />
    </>
  );
}
