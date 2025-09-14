import { NextRequest, NextResponse } from "next/server";
import { connectDB } from "@/lib/mongodb";
import Game from "@/models/Game";

export async function POST(request: NextRequest) {
  try {
    await connectDB();

    const { roomCode, userId, questionId, answer } = await request.json();

    if (
      !roomCode ||
      !userId ||
      questionId === undefined ||
      answer === undefined
    ) {
      return NextResponse.json(
        { error: "Missing required fields" },
        { status: 400 }
      );
    }

    const game = await Game.findOne({ roomCode, isActive: true });

    if (!game) {
      return NextResponse.json({ error: "Game not found" }, { status: 404 });
    }

    const playerIndex = game.players.findIndex((p: any) => p.id === userId);

    if (playerIndex === -1) {
      return NextResponse.json(
        { error: "Player not found in game" },
        { status: 404 }
      );
    }
    if (game.players[playerIndex].answeredQuestions.includes(questionId)) {
      return NextResponse.json(
        { error: "Already answered this question" },
        { status: 400 }
      );
    }
    game.players[playerIndex].answeredQuestions.push(questionId);
    const currentQuestion = game.questions[questionId];
    if (answer === currentQuestion.correctAnswer) {
      game.players[playerIndex].score += 1;
    }

    game.updatedAt = new Date();
    await game.save();

    return NextResponse.json({ success: true });
  } catch (error) {
    console.error("Error submitting answer:", error);
    return NextResponse.json(
      { error: "Failed to submit answer" },
      { status: 500 }
    );
  }
}
