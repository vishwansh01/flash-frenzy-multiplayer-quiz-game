"use client";

import { useState, useEffect } from "react";
import { useRouter } from "next/navigation";
import { IGame } from "@/models/Game";

interface GameHistoryProps {
  userId: string;
}

export default function GameHistory({ userId }: GameHistoryProps) {
  const [games, setGames] = useState<IGame[]>([]);
  const [loading, setLoading] = useState(true);
  const router = useRouter();

  useEffect(() => {
    fetchGameHistory();
  }, []);

  const fetchGameHistory = async () => {
    try {
      const response = await fetch(`/api/game/history?userId=${userId}`);
      if (response.ok) {
        const data = await response.json();
        setGames(data);
      }
    } catch (error) {
      console.error("Error fetching game history:", error);
    }
    setLoading(false);
  };

  if (loading) {
    return (
      <div className="min-h-screen bg-gradient-to-br bg-[linear-gradient(to_bottom,hsl(220,65%,5%)_0%,hsl(220,65%,3.52%)_50%,hsl(220,65%,10%)_100%)] flex items-center justify-center">
        <div className="text-white text-xl">Loading history...</div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gradient-to-br bg-[linear-gradient(to_bottom,hsl(220,65%,5%)_0%,hsl(220,65%,3.52%)_50%,hsl(220,65%,10%)_100%)] p-4">
      <div className="max-w-4xl mx-auto">
        <div className="bg-white rounded-lg shadow-xl p-6 mb-4">
          <div className="flex justify-between items-center mb-6">
            <h1 className="text-2xl font-bold text-gray-800">Game History</h1>
            <button
              onClick={() => router.push("/")}
              className="bg-blue-500 hover:bg-blue-600 text-white px-4 py-2 rounded-lg"
            >
              Back to Home
            </button>
          </div>

          {games.length === 0 ? (
            <div className="text-center py-8">
              <p className="text-gray-600 text-lg">No games played yet!</p>
              <p className="text-gray-500 text-sm mt-2">
                Start playing to see your game history here.
              </p>
            </div>
          ) : (
            <div className="space-y-4">
              {games.map((game) => {
                const userPlayer = game.players.find((p) => p.id === userId);
                const winner = game.players.reduce((prev, current) =>
                  prev.score > current.score ? prev : current
                );
                const isWinner = winner.id === userId;

                return (
                  <div
                    key={game._id}
                    className="border rounded-lg p-4 bg-gray-50"
                  >
                    <div className="flex justify-between items-start mb-3">
                      <div>
                        <h3 className="font-semibold text-lg">
                          Room: {game.roomCode}
                        </h3>
                        <p className="text-sm text-gray-600">
                          {new Date(game.createdAt).toLocaleDateString()} at{" "}
                          {new Date(game.createdAt).toLocaleTimeString()}
                        </p>
                      </div>
                      <div className="text-right">
                        {isWinner && (
                          <span className="inline-block bg-yellow-100 text-yellow-800 px-2 py-1 rounded-full text-xs font-medium mb-1">
                            🏆 Winner
                          </span>
                        )}
                        <p className="text-sm font-medium">
                          Your Score: {userPlayer?.score || 0}
                        </p>
                      </div>
                    </div>

                    <div className="mb-3">
                      <h4 className="font-medium text-gray-700 mb-2">
                        Players:
                      </h4>
                      <div className="flex flex-wrap gap-2">
                        {game.players
                          .sort((a, b) => b.score - a.score)
                          .map((player, index) => (
                            <span
                              key={player.id}
                              className={`px-3 py-1 rounded-full text-sm ${
                                player.id === userId
                                  ? "bg-blue-100 text-blue-800 border-2 border-blue-300"
                                  : "bg-gray-100 text-gray-700"
                              }`}
                            >
                              {index + 1}. {player.name}: {player.score}
                            </span>
                          ))}
                      </div>
                    </div>

                    <div className="flex justify-between items-center text-sm text-gray-600">
                      <span>{game.questions.length} questions</span>
                      <span>
                        Accuracy:{" "}
                        {userPlayer
                          ? Math.round(
                              (userPlayer.score / game.questions.length) * 100
                            )
                          : 0}
                        %
                      </span>
                    </div>
                  </div>
                );
              })}
            </div>
          )}
        </div>
      </div>
    </div>
  );
}
