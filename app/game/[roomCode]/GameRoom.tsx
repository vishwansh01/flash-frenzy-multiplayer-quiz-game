"use client";

import { useState, useEffect } from "react";
import { createClient } from "@/lib/supabase/client";
import { IGame, IPlayer, IQuestion } from "@/models/Game";
import { useRouter } from "next/navigation";

interface GameRoomProps {
  roomCode: string;
  userId: string;
}

export default function GameRoom({ roomCode, userId }: GameRoomProps) {
  const [game, setGame] = useState<IGame | null>(null);
  const [loading, setLoading] = useState(true);
  const [selectedAnswer, setSelectedAnswer] = useState<number | null>(null);
  const [hasAnswered, setHasAnswered] = useState(false);

  const router = useRouter();
  const supabase = createClient();

  useEffect(() => {
    fetchGameState();
    const channel = supabase
      .channel(`game_${roomCode}`)
      .on("broadcast", { event: "game_update" }, () => {
        fetchGameState();
      })
      .subscribe();
    const pollInterval = setInterval(fetchGameState, 2000);

    return () => {
      supabase.removeChannel(channel);
      clearInterval(pollInterval);
    };
  }, [roomCode]);
  useEffect(() => {
    if (game) {
      const currentPlayer = game.players.find((p: IPlayer) => p.id === userId);
      const hasAnsweredCurrent =
        currentPlayer?.answeredQuestions.includes(game.currentQuestion) ||
        false;

      setHasAnswered(hasAnsweredCurrent);
      if (!hasAnsweredCurrent) {
        setSelectedAnswer(null);
      }
    }
  }, [game?.currentQuestion, userId]);

  const fetchGameState = async () => {
    try {
      const response = await fetch(`/api/game/state/${roomCode}`);
      if (response.ok) {
        const gameData = await response.json();
        setGame(gameData);
      }
    } catch (error) {
      console.error("Error fetching game state:", error);
    }
    setLoading(false);
  };

  const startGame = async () => {
    try {
      const response = await fetch("/api/game/start", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ roomCode }),
      });

      if (response.ok) {
        await supabase.channel(`game_${roomCode}`).send({
          type: "broadcast",
          event: "game_update",
          payload: { action: "game_started" },
        });
      }
    } catch (error) {
      console.error("Error starting game:", error);
    }
  };

  const submitAnswer = async (answerIndex: number) => {
    if (hasAnswered || !game || game.gameState.phase !== "question") return;

    setSelectedAnswer(answerIndex);
    setHasAnswered(true);

    try {
      const response = await fetch("/api/game/answer", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          roomCode,
          userId,
          questionId: game.currentQuestion,
          answer: answerIndex,
        }),
      });

      if (response.ok) {
        await supabase.channel(`game_${roomCode}`).send({
          type: "broadcast",
          event: "game_update",
          payload: { action: "answer_submitted" },
        });
      }
    } catch (error) {
      console.error("Error submitting answer:", error);
      setHasAnswered(false);
      setSelectedAnswer(null);
    }
  };

  if (loading) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-blue-500 to-purple-600 flex items-center justify-center">
        <div className="bg-white rounded-lg shadow-xl p-8 text-center">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-600 mx-auto mb-4"></div>
          <div className="text-xl font-semibold text-gray-800">
            Loading game...
          </div>
        </div>
      </div>
    );
  }

  if (!game) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-blue-500 to-purple-600 flex items-center justify-center">
        <div className="bg-white rounded-lg shadow-xl p-8 text-center max-w-md w-full mx-4">
          <h1 className="text-2xl font-bold text-gray-800 mb-4">
            Game Not Found
          </h1>
          <button
            onClick={() => router.push("/")}
            className="bg-blue-500 hover:bg-blue-600 text-white px-6 py-2 rounded-lg"
          >
            Back to Home
          </button>
        </div>
      </div>
    );
  }
  if (!game.isActive || game.gameState.phase === "finished") {
    const sortedPlayers = [...game.players].sort((a, b) => b.score - a.score);
    const winner = sortedPlayers[0];

    return (
      <div className="min-h-screen bg-gradient-to-br from-blue-500 to-purple-600 flex items-center justify-center p-4">
        <div className="bg-white rounded-lg shadow-xl p-8 text-center max-w-md w-full">
          <h1 className="text-3xl font-bold text-gray-800 mb-4">
            🏆 Game Over!
          </h1>

          <div className="mb-6">
            <h2 className="text-xl font-semibold text-gray-700 mb-2">
              Winner:
            </h2>
            <p className="text-2xl font-bold text-green-600">{winner.name}</p>
            <p className="text-gray-600">
              Score: {winner.score}/{game.questions.length}
            </p>
          </div>

          <div className="mb-6">
            <h3 className="text-lg font-semibold text-gray-700 mb-3">
              Final Scores:
            </h3>
            <div className="space-y-2">
              {sortedPlayers.map((player, index) => (
                <div
                  key={player.id}
                  className={`flex justify-between items-center p-2 rounded ${
                    player.id === userId
                      ? "bg-blue-100 border-2 border-blue-300"
                      : "bg-gray-50"
                  }`}
                >
                  <span className="font-medium">
                    {index + 1}. {player.name} {player.id === userId && "(You)"}
                  </span>
                  <span className="font-bold">
                    {player.score}/{game.questions.length}
                  </span>
                </div>
              ))}
            </div>
          </div>

          <button
            onClick={() => router.push("/")}
            className="w-full bg-blue-500 hover:bg-blue-600 text-white px-6 py-2 rounded-lg transition-colors"
          >
            Back to Home
          </button>
        </div>
      </div>
    );
  }
  if (game.gameState.phase === "lobby") {
    const isHost = game.players.length > 0 && game.players[0].id === userId;
    const hasEnoughPlayers = game.players.length >= 2;

    return (
      <div className="min-h-screen bg-gradient-to-br from-blue-500 to-purple-600 p-4">
        <div className="max-w-2xl mx-auto">
          <div className="bg-white rounded-lg shadow-xl p-8 text-center">
            <h1 className="text-3xl font-bold text-gray-800 mb-4">
              🃏 Flashcard Frenzy
            </h1>
            <h2 className="text-xl font-semibold text-gray-700 mb-6">
              Room: {roomCode}
            </h2>

            <div className="mb-8">
              <h3 className="text-lg font-semibold text-gray-700 mb-4">
                Players in Room ({game.players.length}):
              </h3>
              <div className="space-y-2">
                {game.players.map((player, index) => (
                  <div
                    key={player.id}
                    className={`p-3 rounded-lg ${
                      player.id === userId
                        ? "bg-blue-100 border-2 border-blue-300"
                        : "bg-gray-100"
                    }`}
                  >
                    <span className="font-medium">
                      {index + 1}. {player.name}
                      {player.id === userId && " (You)"}
                      {index === 0 && " 👑 Host"}
                    </span>
                  </div>
                ))}
              </div>
            </div>

            <div className="space-y-3">
              {!hasEnoughPlayers ? (
                <div className="text-center mb-4">
                  <p className="text-lg text-orange-600 mb-2">
                    Waiting for more players...
                  </p>
                  <p className="text-sm text-gray-500">
                    Need {2 - game.players.length} more player(s) to start
                  </p>
                </div>
              ) : isHost ? (
                <button
                  onClick={startGame}
                  className="w-full bg-green-500 hover:bg-green-600 text-white text-lg font-semibold px-8 py-3 rounded-lg transition-colors mb-4"
                >
                  🚀 Start Game!
                </button>
              ) : (
                <div className="text-center mb-4">
                  <p className="text-lg text-green-600 mb-2">Ready to play!</p>
                  <p className="text-sm text-gray-500">
                    Waiting for host to start... ({game.players[0]?.name} 👑)
                  </p>
                </div>
              )}

              <button
                onClick={() => router.push("/")}
                className="w-full bg-red-500 hover:bg-red-600 text-white px-6 py-2 rounded-lg transition-colors"
              >
                Leave Room
              </button>
            </div>
          </div>
        </div>
      </div>
    );
  }
  const currentQuestion = game.questions[game.currentQuestion];
  const playersAnswered = game.players.filter((player: IPlayer) =>
    player.answeredQuestions.includes(game.currentQuestion)
  ).length;

  return (
    <div className="min-h-screen bg-gradient-to-br from-blue-500 to-purple-600 p-4">
      <div className="max-w-4xl mx-auto">
        <div className="bg-white rounded-lg shadow-xl p-4 mb-4">
          <div className="flex justify-between items-center">
            <div>
              <h1 className="text-2xl font-bold text-gray-800">
                Room: {roomCode}
              </h1>
              <p className="text-sm text-gray-600">
                Question {game.currentQuestion + 1} of {game.questions.length}
              </p>
              <p className="text-xs text-gray-500">
                {playersAnswered}/{game.players.length} players answered
              </p>
            </div>
            <div className="text-right">
              <div
                className={`text-3xl font-bold ${
                  game.gameState.timeLeft <= 5
                    ? "text-red-500 animate-pulse"
                    : game.gameState.timeLeft <= 10
                    ? "text-yellow-500"
                    : "text-green-500"
                }`}
              >
                {game.gameState.phase === "answer_reveal"
                  ? "⏸️"
                  : `${game.gameState.timeLeft}s`}
              </div>
              <p className="text-sm text-gray-600">
                {game.gameState.phase === "answer_reveal"
                  ? "Showing Answer"
                  : "Time Left"}
              </p>
            </div>
          </div>

          <div className="mt-4">
            <div className="w-full bg-gray-200 rounded-full h-2">
              <div
                className="bg-blue-500 h-2 rounded-full transition-all duration-300"
                style={{
                  width: `${
                    ((game.currentQuestion + 1) / game.questions.length) * 100
                  }%`,
                }}
              ></div>
            </div>
          </div>
        </div>
        <div className="bg-white rounded-lg shadow-xl p-4 mb-4">
          <h2 className="text-lg font-semibold text-gray-800 mb-3">
            🏆 Scoreboard
          </h2>
          <div className="grid gap-2">
            {game.players
              .sort((a, b) => b.score - a.score)
              .map((player, index) => {
                const playerAnswered = player.answeredQuestions.includes(
                  game.currentQuestion
                );
                return (
                  <div
                    key={player.id}
                    className={`flex justify-between items-center p-3 rounded-lg ${
                      player.id === userId
                        ? "bg-blue-100 border-2 border-blue-500"
                        : "bg-gray-50"
                    }`}
                  >
                    <div className="flex items-center space-x-2">
                      <span className="font-bold text-lg text-gray-500">
                        {index === 0
                          ? "🥇"
                          : index === 1
                          ? "🥈"
                          : index === 2
                          ? "🥉"
                          : `${index + 1}.`}
                      </span>
                      <span className="font-medium">
                        {player.name} {player.id === userId && "(You)"}
                      </span>
                      <span className="text-sm">
                        {playerAnswered ? "✅" : "⏳"}
                      </span>
                    </div>
                    <span className="font-bold text-xl text-blue-600">
                      {player.score}
                    </span>
                  </div>
                );
              })}
          </div>
        </div>
        <div className="bg-white rounded-lg shadow-xl p-6 mb-4">
          <div className="mb-6">
            <span className="inline-block bg-purple-100 text-purple-800 px-3 py-1 rounded-full text-sm font-medium mb-4">
              📚 {currentQuestion.category}
            </span>
            <h2 className="text-2xl font-bold text-gray-800 leading-tight">
              {currentQuestion.question}
            </h2>
          </div>

          <div className="grid gap-3">
            {currentQuestion.options.map((option, index) => {
              let buttonClass =
                "w-full p-4 text-left border-2 rounded-lg transition-all duration-300 font-medium";

              if (game.gameState.phase === "answer_reveal") {
                if (index === currentQuestion.correctAnswer) {
                  buttonClass +=
                    " bg-green-100 border-green-500 text-green-800 ring-2 ring-green-200";
                } else if (selectedAnswer === index) {
                  buttonClass += " bg-red-100 border-red-500 text-red-800";
                } else {
                  buttonClass +=
                    " bg-gray-100 border-gray-300 text-gray-600 opacity-75";
                }
              } else if (selectedAnswer === index) {
                buttonClass +=
                  " bg-blue-100 border-blue-500 text-blue-800 ring-2 ring-blue-200";
              } else if (hasAnswered) {
                buttonClass +=
                  " bg-gray-100 border-gray-300 text-gray-600 cursor-not-allowed opacity-75";
              } else {
                buttonClass +=
                  " bg-white border-gray-300 hover:bg-blue-50 hover:border-blue-300 cursor-pointer shadow-sm hover:shadow-md";
              }

              return (
                <button
                  key={index}
                  onClick={() => submitAnswer(index)}
                  disabled={hasAnswered || game.gameState.phase !== "question"}
                  className={buttonClass}
                >
                  <span className="inline-block w-8 h-8 bg-gray-200 text-gray-700 rounded-full text-center leading-8 font-bold mr-3">
                    {String.fromCharCode(65 + index)}
                  </span>
                  {option}
                </button>
              );
            })}
          </div>
          {hasAnswered && game.gameState.phase === "question" && (
            <div className="mt-6 text-center p-4 bg-green-50 rounded-lg border border-green-200">
              <div className="flex items-center justify-center space-x-2">
                <span className="text-green-500 text-2xl">✓</span>
                <p className="text-green-700 font-medium">
                  Answer submitted!{" "}
                  {playersAnswered < game.players.length
                    ? `Waiting for ${
                        game.players.length - playersAnswered
                      } more player(s)...`
                    : "All players answered!"}
                </p>
              </div>
            </div>
          )}

          {game.gameState.phase === "answer_reveal" && (
            <div className="mt-6 text-center p-4 bg-blue-50 rounded-lg border border-blue-200">
              <p className="text-lg font-semibold text-gray-800 mb-2">
                ✨ Correct Answer:{" "}
                <span className="text-green-600">
                  {String.fromCharCode(65 + currentQuestion.correctAnswer)}.{" "}
                  {currentQuestion.options[currentQuestion.correctAnswer]}
                </span>
              </p>
              <p className="text-sm text-gray-600">
                Next question coming up...
              </p>
            </div>
          )}

          {!hasAnswered && game.gameState.phase === "question" && (
            <div className="mt-6 text-center text-gray-600">
              <p className="text-sm">Choose your answer above ⬆️</p>
            </div>
          )}
        </div>
        <div className="text-center">
          <button
            onClick={() => router.push("/")}
            className="bg-red-500 hover:bg-red-600 text-white px-6 py-2 rounded-lg transition-colors"
          >
            🚪 Leave Game
          </button>
        </div>
      </div>
    </div>
  );
}
