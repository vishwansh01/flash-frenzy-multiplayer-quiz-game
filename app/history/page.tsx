import { createClient } from "@/lib/supabase/server";
import { redirect } from "next/navigation";
import GameHistory from "./GameHistory";

export default async function HistoryPage() {
  const supabase = await createClient();
  const {
    data: { user },
  } = await supabase.auth.getUser();

  if (!user) {
    redirect("/auth");
  }

  return <GameHistory userId={user.id} />;
}
