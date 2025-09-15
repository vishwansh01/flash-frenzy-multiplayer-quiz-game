import { NextRequest, NextResponse } from "next/server";
import { connectDB } from "@/lib/mongodb";
import Game from "@/models/Game";

export async function POST(request: NextRequest) {
  try {
    await connectDB();

    const { roomCode } = await request.json();

    if (!roomCode) {
      return NextResponse.json(
        { error: "Room code is required" },
        { status: 400 }
      );
    }

    const game = await Game.findOne({ roomCode, isActive: true });
    if (!game) {
      return NextResponse.json({ error: "Game not found" }, { status: 404 });
    }
    game.gameState = {
      phase: "question",
      timeLeft: 15,
      questionStartTime: new Date(),
      answerRevealTime: undefined,
    };
    game.updatedAt = new Date();
    await game.save();
    setTimeout(() => {
      // console.log("ASENMREKRKTEj");
      // console.log("AWJRj")
      checkGameState(roomCode);
    }, 1000);

    return NextResponse.json({ success: true });
  } catch (error) {
    console.error("Error starting game:", error);
    return NextResponse.json(
      { error: "Failed to start game" },
      { status: 500 }
    );
  }
}
async function checkGameState(roomCode: string) {
  try {
    await connectDB();
    const game = await Game.findOne({ roomCode, isActive: true });

    if (!game || game.gameState.phase === "finished") return;

    const now = new Date();
    const timeSinceStart =
      now.getTime() - new Date(game.gameState.questionStartTime).getTime();
    const timeLeft = Math.max(0, 15 - Math.floor(timeSinceStart / 1000));

    if (game.gameState.phase === "question") {
      // Check if all players answered
      const playersAnswered = game.players.filter((player: any) =>
        player.answeredQuestions.includes(game.currentQuestion)
      ).length;

      const allAnswered =
        playersAnswered === game.players.length && game.players.length > 0;
      const timeUp = timeLeft <= 0;

      if (allAnswered || timeUp) {
        // Move to answer reveal phase
        game.gameState.phase = "answer_reveal";
        game.gameState.answerRevealTime = now;
        game.gameState.timeLeft = 0;
        await game.save();

        // Schedule next question or end game
        setTimeout(() => {
          if (game.currentQuestion + 1 >= game.questions.length) {
            endGame(roomCode);
          } else {
            nextQuestion(roomCode);
          }
        }, 3000); // 3 seconds to show answer
      } else {
        // Update time left
        game.gameState.timeLeft = timeLeft;
        await game.save();

        // Continue checking
        setTimeout(() => checkGameState(roomCode), 1000);
      }
    }
  } catch (error) {
    console.error("Error checking game state:", error);
  }
}

async function nextQuestion(roomCode: string) {
  try {
    await connectDB();
    const game = await Game.findOne({ roomCode, isActive: true });

    if (!game) return;
    game.currentQuestion += 1;
    game.gameState = {
      phase: "question",
      timeLeft: 15,
      questionStartTime: new Date(),
      answerRevealTime: undefined,
    };
    game.updatedAt = new Date();
    await game.save();
    setTimeout(() => checkGameState(roomCode), 1000);
  } catch (error) {
    console.error("Error advancing question:", error);
  }
}

async function endGame(roomCode: string) {
  try {
    await connectDB();
    const game = await Game.findOne({ roomCode, isActive: true });

    if (!game) return;

    const winner = game.players.reduce((prev: any, current: any) =>
      prev.score > current.score ? prev : current
    );

    game.isActive = false;
    game.winner = winner.name;
    game.gameState.phase = "finished";
    game.updatedAt = new Date();
    await game.save();
  } catch (error) {
    console.error("Error ending game:", error);
  }
}
