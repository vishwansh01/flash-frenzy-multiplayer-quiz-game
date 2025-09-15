"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import { createClient } from "@/lib/supabase/client";

export default function CreateGame() {
  const [loading, setLoading] = useState(false);
  const [playerName, setPlayerName] = useState("");
  const router = useRouter();
  const supabase = createClient();

  const createGame = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!playerName.trim()) return;

    setLoading(true);

    try {
      const {
        data: { user },
      } = await supabase.auth.getUser();
      if (!user) throw new Error("Not authenticated");

      const response = await fetch("/api/game/create", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({
          playerName: playerName.trim(),
          userId: user.id,
        }),
      });

      const data = await response.json();

      if (!response.ok) {
        throw new Error(data.error || "Failed to create game");
      }

      router.push(`/game/${data.roomCode}`);
    } catch (error: any) {
      console.error("Error creating game:", error);
      alert(error.message);
    }

    setLoading(false);
  };

  return (
    <div className="min-h-screen bg-[linear-gradient(to_bottom,hsl(220,65%,5%)_0%,hsl(220,65%,3.52%)_50%,hsl(220,65%,10%)_100%)] flex items-center justify-center">
      <div className="bg-[#080c15] border-[#004be0] border text-white rounded-lg shadow-xl p-8 max-w-md w-full mx-4">
        <h1 className="text-2xl font-bold text-center  mb-8">
          Create Game Room
        </h1>

        <form onSubmit={createGame} className="space-y-4">
          <div>
            <label htmlFor="playerName" className="block text-sm font-medium">
              Your Name
            </label>
            <input
              id="playerName"
              type="text"
              value={playerName}
              onChange={(e) => setPlayerName(e.target.value)}
              className="mt-1 block w-full px-3 py-2 border border-gray-300 rounded-md shadow-sm focus:outline-none focus:ring-blue-500 focus:border-blue-500"
              placeholder="Enter your name"
              required
            />
          </div>

          <button
            type="submit"
            disabled={loading}
            className="w-full bg-green-500 hover:bg-green-600 text-white font-semibold py-2 px-4 rounded-lg disabled:opacity-50"
          >
            {loading ? "Creating..." : "Create Room"}
          </button>
        </form>

        <div className="mt-4 text-center">
          <button
            onClick={() => router.push("/")}
            className="text-gray-500 hover:text-gray-700 text-sm"
          >
            Back to Home
          </button>
        </div>
      </div>
    </div>
  );
}
