import { NextRequest, NextResponse } from "next/server";
import { connectDB } from "@/lib/mongodb";
import Game from "@/models/Game";

export async function POST(request: NextRequest) {
  try {
    await connectDB();

    const { roomCode, playerName, userId } = await request.json();

    if (!roomCode || !playerName || !userId) {
      return NextResponse.json(
        { error: "Room code, player name, and user ID are required" },
        { status: 400 }
      );
    }

    const game = await Game.findOne({ roomCode, isActive: true });

    if (!game) {
      return NextResponse.json(
        { error: "Game not found or already ended" },
        { status: 404 }
      );
    }
    const existingPlayer = game.players.find((p: any) => p.id === userId);

    if (!existingPlayer) {
      game.players.push({
        id: userId,
        name: playerName,
        score: 0,
        answeredQuestions: [],
      });

      game.updatedAt = new Date();
      await game.save();
    }

    return NextResponse.json({ success: true });
  } catch (error) {
    console.error("Error joining game:", error);
    return NextResponse.json({ error: "Failed to join game" }, { status: 500 });
  }
}
