import { createClient } from "@/lib/supabase/server";
import { redirect } from "next/navigation";
import GameRoom from "./GameRoom";
// import GameRoom from "./GameRoom";

export default async function GamePage({
  params,
}: {
  params: Promise<{ roomCode: string }>;
}) {
  const supabase = await createClient();
  const {
    data: { user },
  } = await supabase.auth.getUser();

  if (!user) {
    redirect("/auth");
  }

  const { roomCode } = await params;

  return <GameRoom roomCode={roomCode} userId={user.id} />;
}
