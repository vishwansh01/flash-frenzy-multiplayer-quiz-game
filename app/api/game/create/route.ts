import { NextRequest, NextResponse } from "next/server";
import { connectDB } from "@/lib/mongodb";
import Game from "@/models/Game";
import { sampleQuestions } from "@/lib/questions";

export async function POST(request: NextRequest) {
  try {
    await connectDB();

    const { playerName, userId } = await request.json();

    if (!playerName || !userId) {
      return NextResponse.json(
        { error: "Player name and user ID are required" },
        { status: 400 }
      );
    }
    const roomCode = Math.random().toString(36).substring(2, 6).toUpperCase();
    const shuffledQuestions = [...sampleQuestions].sort(
      () => Math.random() - 0.5
    );

    const newGame = new Game({
      roomCode,
      players: [
        {
          id: userId,
          name: playerName,
          score: 0,
          answeredQuestions: [],
        },
      ],
      currentQuestion: 0,
      questions: shuffledQuestions,
      isActive: true,
      createdAt: new Date(),
      updatedAt: new Date(),
    });

    await newGame.save();

    return NextResponse.json({ roomCode });
  } catch (error) {
    console.error("Error creating game:", error);
    return NextResponse.json(
      { error: "Failed to create game" },
      { status: 500 }
    );
  }
}
