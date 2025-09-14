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

    console.log(
      `Advancing question in room ${roomCode} from ${game.currentQuestion} to ${
        game.currentQuestion + 1
      }`
    );
    if (game.currentQuestion + 1 >= game.questions.length) {
      const winner = game.players.reduce((prev: any, current: any) =>
        prev.score > current.score ? prev : current
      );

      game.isActive = false;
      game.winner = winner.name;
      console.log(`Game ${roomCode} ended. Winner: ${winner.name}`);
    } else {
      game.currentQuestion += 1;
      console.log(
        `Game ${roomCode} moved to question ${game.currentQuestion + 1}`
      );
    }

    game.updatedAt = new Date();
    await game.save();

    return NextResponse.json({
      success: true,
      currentQuestion: game.currentQuestion,
      isActive: game.isActive,
    });
  } catch (error) {
    console.error("Error advancing question:", error);
    return NextResponse.json(
      { error: "Failed to advance question" },
      { status: 500 }
    );
  }
}
