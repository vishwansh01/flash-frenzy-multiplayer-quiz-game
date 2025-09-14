import mongoose from "mongoose";

export interface IPlayer {
  id: string;
  name: string;
  score: number;
  answeredQuestions: number[];
}

export interface IQuestion {
  id: number;
  question: string;
  options: string[];
  correctAnswer: number;
  category: string;
}
export interface IGameState {
  phase: "lobby" | "question" | "answer_reveal" | "finished";
  timeLeft: number;
  questionStartTime: Date;
  answerRevealTime?: Date;
}

export interface IGame {
  _id?: string;
  roomCode: string;
  players: IPlayer[];
  currentQuestion: number;
  questions: IQuestion[];
  isActive: boolean;
  winner?: string;
  gameState: IGameState;
  createdAt: Date;
  updatedAt: Date;
}

const PlayerSchema = new mongoose.Schema({
  id: { type: String, required: true },
  name: { type: String, required: true },
  score: { type: Number, default: 0 },
  answeredQuestions: [Number],
});

const QuestionSchema = new mongoose.Schema({
  id: { type: Number, required: true },
  question: { type: String, required: true },
  options: [String],
  correctAnswer: { type: Number, required: true },
  category: { type: String, required: true },
});
const GameStateSchema = new mongoose.Schema({
  phase: {
    type: String,
    enum: ["lobby", "question", "answer_reveal", "finished"],
    default: "lobby",
  },
  timeLeft: { type: Number, default: 15 },
  questionStartTime: { type: Date },
  answerRevealTime: { type: Date },
});

const GameSchema = new mongoose.Schema({
  roomCode: { type: String, required: true, unique: true },
  players: [PlayerSchema],
  currentQuestion: { type: Number, default: 0 },
  questions: [QuestionSchema],
  isActive: { type: Boolean, default: true },
  gameState: { type: GameStateSchema, default: () => ({}) },
  winner: { type: String },
  createdAt: { type: Date, default: Date.now },
  updatedAt: { type: Date, default: Date.now },
});
GameSchema.index({ roomCode: 1, isActive: 1 });

export default mongoose.models.Game ||
  mongoose.model<IGame>("Game", GameSchema);
