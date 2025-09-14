import { NextRequest, NextResponse } from "next/server";
import { connectDB } from "@/lib/mongodb";
import Game from "@/models/Game";

export async function GET(request: NextRequest) {
  try {
    await connectDB();

    const { searchParams } = new URL(request.url);
    const userId = searchParams.get("userId");

    if (!userId) {
      return NextResponse.json(
        { error: "User ID is required" },
        { status: 400 }
      );
    }

    const games = await Game.find({
      "players.id": userId,
      isActive: false,
    })
      .sort({ createdAt: -1 })
      .limit(50);

    return NextResponse.json(games);
  } catch (error) {
    console.error("Error fetching game history:", error);
    return NextResponse.json(
      { error: "Failed to fetch game history" },
      { status: 500 }
    );
  }
}
