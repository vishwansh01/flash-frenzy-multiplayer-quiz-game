# Flashcard Frenzy Multiplayer

A real-time multiplayer flashcard quiz game built with Next.js 15, Supabase, and MongoDB. Players compete in live quiz sessions where speed and accuracy matter - first correct answer wins points!

## Features

- **Real-time Multiplayer**: Multiple players can join and play simultaneously
- **Live Synchronization**: All players see the same questions at the same time
- **Instant Scoring**: Points awarded immediately for correct answers
- **Server-Controlled Timing**: Consistent 15-second countdown for all players
- **Game History**: Track past games and performance statistics
- **Responsive Design**: Works on desktop and mobile devices
- **User Authentication**: Secure login system with Supabase Auth

## Tech Stack

### Frontend

- **Next.js 15** - React framework with App Router
- **TypeScript** - Type-safe development
- **Tailwind CSS** - Utility-first styling
- **Supabase Client** - Real-time subscriptions and authentication

### Backend

- **Next.js API Routes** - Server-side logic
- **MongoDB** - Game data and user history storage
- **Mongoose** - MongoDB object modeling
- **Supabase** - Real-time communication and user management

### Real-time Features

- **Supabase Realtime** - Live game updates and player synchronization
- **Server-side Game Engine** - Centralized timing and state management

## Quick Start

### Prerequisites

- Node.js 18+
- MongoDB database (MongoDB Atlas recommended)
- Supabase project

### Installation

1. **Clone the repository**

   ```bash
   git clone https://github.com/yourusername/flashcard-frenzy.git
   cd flashcard-frenzy
   ```

2. **Install dependencies**

   ```bash
   npm install
   ```

3. **Set up environment variables**

   Create a `.env.local` file in the root directory:

   ```env
   NEXT_PUBLIC_SUPABASE_URL=your_supabase_url
   NEXT_PUBLIC_SUPABASE_ANON_KEY=your_supabase_anon_key
   SUPABASE_SERVICE_ROLE_KEY=your_supabase_service_role_key
   MONGODB_URI=your_mongodb_connection_string
   ```

4. **Configure Supabase**

   - Create a new Supabase project
   - Enable Email authentication
   - Set Site URL to `http://localhost:3000` for development
   - Copy your project URL and API keys to `.env.local`

5. **Set up MongoDB**

   - Create a MongoDB Atlas cluster (or use local MongoDB)
   - Get your connection string
   - Add it to `.env.local`

6. **Run the development server**

   ```bash
   npm run dev
   ```

7. **Open your browser**
   Navigate to `http://localhost:3000`

## How to Play

### Creating a Game

1. Sign up or log in to your account
2. Click "Create Game Room"
3. Share the generated room code with friends
4. Wait for at least 2 players to join
5. As host, click "Start Game" to begin

### Joining a Game

1. Sign up or log in to your account
2. Click "Join Game Room"
3. Enter the room code shared by the host
4. Wait for the host to start the game

### Gameplay

- Answer questions within 15 seconds
- First correct answer earns a point
- Game progresses automatically when all players answer or time runs out
- 10 questions per game
- Winner determined by highest score

## Game Mechanics

### Server-Controlled Timing

- All timing managed server-side for perfect synchronization
- No client-side timers to prevent desync issues
- Real-time countdown visible to all players

### Question Progression

- Questions advance only when:
  - All players have answered, OR
  - 15-second timer expires
- 3-second delay to show correct answer
- Automatic progression to next question

### Scoring System

- 1 point per correct answer
- No penalties for wrong answers
- Final scores based on total correct answers

## Project Structure

```
flashcard-frenzy/
├── app/                        # Next.js 15 App Router
│   ├── auth/                   # Authentication pages
│   ├── game/                   # Game-related pages
│   │   ├── create/            # Create game room
│   │   ├── join/              # Join game room
│   │   └── [roomCode]/        # Game room interface
│   ├── history/               # Game history page
│   ├── api/                   # API routes
│   │   └── game/              # Game management APIs
│   ├── globals.css            # Global styles
│   ├── layout.tsx             # Root layout
│   └── page.tsx               # Home page
├── lib/                       # Utility libraries
│   ├── supabase/             # Supabase client configuration
│   ├── mongodb.ts            # MongoDB connection
│   └── questions.ts          # Sample questions data
├── models/                    # Database models
│   └── Game.ts               # Game schema
├── .env.local                # Environment variables
├── package.json              # Dependencies
├── tailwind.config.js        # Tailwind configuration
└── tsconfig.json            # TypeScript configuration
```

## API Endpoints

### Game Management

- `POST /api/game/create` - Create new game room
- `POST /api/game/join` - Join existing game room
- `GET /api/game/[roomCode]` - Get game state
- `POST /api/game/start` - Start game (host only)
- `POST /api/game/answer` - Submit answer
- `GET /api/game/history` - Get user's game history

### Authentication

- `POST /auth/signout` - Sign out user

## Environment Variables

| Variable                        | Description                   | Required |
| ------------------------------- | ----------------------------- | -------- |
| `NEXT_PUBLIC_SUPABASE_URL`      | Your Supabase project URL     | Yes      |
| `NEXT_PUBLIC_SUPABASE_ANON_KEY` | Supabase anonymous public key | Yes      |
| `SUPABASE_SERVICE_ROLE_KEY`     | Supabase service role key     | Yes      |
| `MONGODB_URI`                   | MongoDB connection string     | Yes      |

## Development

### Adding New Questions

Edit `lib/questions.ts` to add more questions:

```typescript
export const sampleQuestions: IQuestion[] = [
  {
    id: 1,
    question: "Your question here?",
    options: ["Option A", "Option B", "Option C", "Option D"],
    correctAnswer: 0, // Index of correct answer
    category: "Your Category",
  },
  // Add more questions...
];
```

### Customizing Game Settings

Modify game parameters in the server-side game engine:

- Question timer duration (default: 15 seconds)
- Answer reveal duration (default: 3 seconds)
- Number of questions per game (default: 10)

## Troubleshooting

### Common Issues

**Game not starting**

- Ensure at least 2 players have joined
- Check that host has clicked "Start Game"
- Verify Supabase real-time is working

**Players out of sync**

- Server-controlled timing should prevent this
- Check network connectivity
- Refresh the page if issues persist

**Database connection errors**

- Verify MongoDB URI is correct
- Check network access settings in MongoDB Atlas
- Ensure IP whitelist includes your deployment platform

**Authentication issues**

- Confirm Supabase configuration
- Check Site URL settings in Supabase dashboard
- Verify environment variables are set correctly

## Acknowledgments

- Built with [Next.js](https://nextjs.org/)
- Real-time features powered by [Supabase](https://supabase.com/)
- Database hosted on [MongoDB Atlas](https://www.mongodb.com/cloud/atlas)
- Styled with [Tailwind CSS](https://tailwindcss.com/)
