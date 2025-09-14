import Link from "next/link";
import { createClient } from "@/lib/supabase/server";
import { redirect } from "next/navigation";

export default async function Home() {
  const supabase = await createClient();
  const {
    data: { user },
  } = await supabase.auth.getUser();

  if (!user) {
    redirect("/auth");
  }

  return (
    <div className="min-h-screen bg-[linear-gradient(to_bottom,hsl(220,65%,5%)_0%,hsl(220,65%,3.52%)_50%,hsl(220,65%,10%)_100%)] flex items-center justify-center">
      <div className="bg-[#080c15] rounded-lg border-[#004be0] border text-white shadow-xl p-8 max-w-md w-full mx-4">
        <h1 className="text-3xl font-bold  text-center mb-8">
          🃏 Flashcard Frenzy
        </h1>

        <div className="space-y-4">
          <Link
            href="/game/create"
            className="w-full bg-green-500 hover:bg-green-600 text-white font-semibold py-3 px-6 rounded-lg text-center block transition duration-200"
          >
            Create Game Room
          </Link>

          <Link
            href="/game/join"
            className="w-full bg-blue-500 hover:bg-blue-600 text-white font-semibold py-3 px-6 rounded-lg text-center block transition duration-200"
          >
            Join Game Room
          </Link>

          <Link
            href="/history"
            className="w-full bg-purple-500 hover:bg-purple-600 text-white font-semibold py-3 px-6 rounded-lg text-center block transition duration-200"
          >
            Game History
          </Link>
        </div>

        <div className="mt-8 text-center">
          <form action="/auth/signout" method="post">
            <button type="submit" className=" hover:text-gray-300 text-sm">
              Sign Out
            </button>
          </form>
        </div>
      </div>
    </div>
  );
}
