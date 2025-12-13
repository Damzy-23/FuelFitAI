# FuelFit AI 🏋️‍♂️

**Tagline:** Does this meal fuel your workout — or cost you one?

An AI-powered food and fitness insight tool that translates meals into workout effort and evaluates how well they align with your fitness goals.

## 🚀 Quick Start

### Prerequisites
- Node.js 16+ installed
- npm or yarn
- MongoDB (local or Atlas cloud - see [AUTH_SETUP.md](./AUTH_SETUP.md))

### Installation

1. Install all dependencies:
```bash
npm run install-all
```

2. Set up environment variables:
```bash
# Create server/.env file
cat > server/.env << EOF
MONGODB_URI=mongodb://localhost:27017/fuelfit
JWT_SECRET=fuelfit-secret-key-change-in-production
JWT_EXPIRE=7d
OPENAI_API_KEY=your_api_key_here
PORT=3030
EOF
```

**Note:** 
- MongoDB: Use local MongoDB or MongoDB Atlas (free tier available). See [AUTH_SETUP.md](./AUTH_SETUP.md) for details.
- OpenAI API key is optional - the app works without it using smart default explanations.

### Running the Application

Start both frontend and backend:
```bash
npm run dev
```

Or run separately:
```bash
# Terminal 1 - Backend
npm run server

# Terminal 2 - Frontend
npm run client
```

- Frontend: http://localhost:3000
- Backend API: http://localhost:3030

## 🎯 Features

- **User Authentication**: Register, login, and user profiles
- **Workout Cost Engine**: Converts meal calories into exercise time needed
- **MacroMatch Engine**: Evaluates meal alignment with workout type and fitness goals
- **FuelScore**: Combined score (0-10) for meal quality
- **AI Coach**: Provides personalized explanations and suggestions
- **Smart Suggestions**: Actionable swaps to improve meals
- **User Profiles**: Save fitness goals and preferences

## 📊 How It Works

1. Enter a meal name or select from presets
2. Choose your workout type and duration
3. Select your fitness goal (fat loss, muscle gain, endurance)
4. Get instant insights:
   - How many minutes of exercise to burn the meal
   - Macro alignment analysis
   - FuelScore rating
   - AI-powered coaching feedback

## 🏗️ Architecture

- **Frontend**: Next.js (React) with TypeScript
- **Backend**: Node.js + Express
- **Database**: MongoDB with Mongoose
- **Authentication**: JWT tokens with bcrypt password hashing
- **AI**: OpenAI GPT-3.5 (with fallback to smart defaults)
- **Data**: Hardcoded meal database with calories, macros, and MET values

## 📝 Hackathon Notes

Built for a 6-hour solo hackathon. The MVP focuses on:
- Clear, understandable algorithms
- Fast response times (< 2 seconds)
- Mobile-friendly UI
- Demo-ready in under 2 minutes

## 🎨 Demo Script

"I ate this meal and did this workout. FuelFit tells me how much effort that meal costs, whether it supports my training, and how to improve it — instantly."

## 📄 License

MIT

---

Built with ❤️ by Onasanya Oluwadamilola (Dami)

