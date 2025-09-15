import { NextRequest, NextResponse } from "next/server";
import { connectDB } from "@/lib/mongodb";
import Game from "@/models/Game";

export async function GET(
  request: NextRequest,
  { params }: { params: Promise<{ roomCode: string }> }
) {
  try {
    await connectDB();

    const { roomCode } = await params;
    // console.log(roomCode);
    const game = await Game.findOne({ roomCode });

    if (!game) {
      return NextResponse.json({ error: "Game not found" }, { status: 404 });
    }
    if (
      game.gameState.phase === "question" &&
      game.gameState.questionStartTime
    ) {
      const now = new Date();
      const timeSinceStart =
        now.getTime() - new Date(game.gameState.questionStartTime).getTime();
      const timeLeft = Math.max(0, 15 - Math.floor(timeSinceStart / 1000));
      game.gameState.timeLeft = timeLeft;
    }

    return NextResponse.json(game);
  } catch (error) {
    console.error("Error fetching game state:", error);
    return NextResponse.json(
      { error: "Failed to fetch game state" },
      { status: 500 }
    );
  }
}
