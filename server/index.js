require('dotenv').config();
const express = require('express');
const cors = require('cors');
const connectDB = require('./config/db');
const { calculateWorkoutCost, calculateMacroMatch, calculateFuelScore, getAICoachExplanation } = require('./engine');
const { meals, workouts, MET_VALUES } = require('./data');
const authRoutes = require('./routes/auth');

// Connect to MongoDB
connectDB();

const app = express();
const PORT = process.env.PORT || 3030;

// CORS configuration - allow requests from localhost and Vercel
const allowedOrigins = [
  'http://localhost:3000',
  process.env.FRONTEND_URL
].filter(Boolean);

app.use(cors({
  origin: function (origin, callback) {
    // Allow requests with no origin (like mobile apps or curl requests)
    if (!origin) return callback(null, true);
    
    // Allow localhost and Vercel domains
    if (origin.includes('localhost') || origin.includes('vercel.app')) {
      return callback(null, true);
    }
    
    // Check against allowed origins
    if (allowedOrigins.includes(origin)) {
      return callback(null, true);
    }
    
    callback(new Error('Not allowed by CORS'));
  },
  credentials: true
}));
app.use(express.json());

// Request logging middleware (for debugging)
app.use((req, res, next) => {
  console.log(`📥 ${req.method} ${req.originalUrl}`);
  next();
});

// Health check
app.get('/api/health', (req, res) => {
  res.json({ status: 'ok', message: 'FuelFit AI API is running' });
});

// Auth routes
try {
  app.use('/api/auth', authRoutes);
  console.log('✅ Auth routes loaded successfully');
} catch (error) {
  console.error('❌ Error loading auth routes:', error);
}

// Get preset meals (must be before meal routes to avoid conflict)
app.get('/api/meals/presets', (req, res) => {
  console.log('✅ /api/meals/presets route hit, returning', meals.length, 'meals');
  res.json(meals);
});

// Meal history routes
try {
  const mealRoutes = require('./routes/meals');
  app.use('/api/meals', mealRoutes);
  console.log('✅ Meal routes loaded successfully');
  console.log('   Registered routes: /api/meals/recommendations, /api/meals/trends, /api/meals/reports');
} catch (error) {
  console.error('❌ Error loading meal routes:', error);
  process.exit(1);
}

// User routes
const userRoutes = require('./routes/user');
app.use('/api/user', userRoutes);

// Voice routes
try {
  const voiceRoutes = require('./routes/voice');
  app.use('/api/voice', voiceRoutes);
  console.log('✅ Voice routes loaded successfully');
} catch (error) {
  console.error('❌ Error loading voice routes:', error);
}

// Assistant routes
try {
  const assistantRoutes = require('./routes/assistant');
  app.use('/api/assistant', assistantRoutes);
  console.log('✅ Assistant routes loaded successfully');
} catch (error) {
  console.error('❌ Error loading assistant routes:', error);
}

// Get workout types
app.get('/api/workouts', (req, res) => {
  console.log('✅ /api/workouts route hit, returning', workouts.length, 'workouts');
  res.json(workouts);
});

// Main analysis endpoint
app.post('/api/analyze', async (req, res) => {
  try {
    const { mealName, workoutType, workoutDuration, fitnessGoal } = req.body;

    if (!mealName || !workoutType || !fitnessGoal) {
      return res.status(400).json({ error: 'Missing required fields' });
    }

    // Find meal data - try exact match first, then partial match
    let meal = meals.find(m => 
      m.name.toLowerCase() === mealName.toLowerCase().trim()
    );
    
    if (!meal) {
      // Try partial match
      meal = meals.find(m => 
        m.name.toLowerCase().includes(mealName.toLowerCase().trim()) ||
        mealName.toLowerCase().trim().includes(m.name.toLowerCase())
      );
    }
    
    // If still not found, create a default meal based on common patterns
    if (!meal) {
      const lowerMealName = mealName.toLowerCase().trim();
      // Estimate calories and macros based on meal type
      if (lowerMealName.includes('chicken') || lowerMealName.includes('protein')) {
        meal = { name: mealName, calories: 450, protein: 35, carbs: 30, fat: 15 };
      } else if (lowerMealName.includes('burger') || lowerMealName.includes('fast food')) {
        meal = { name: mealName, calories: 550, protein: 25, carbs: 45, fat: 28 };
      } else if (lowerMealName.includes('salad')) {
        meal = { name: mealName, calories: 300, protein: 20, carbs: 25, fat: 15 };
      } else {
        // Generic default
        meal = { name: mealName, calories: 400, protein: 25, carbs: 40, fat: 15 };
      }
    }

    // Calculate workout cost
    const workoutCost = calculateWorkoutCost(meal.calories, workoutType, workoutDuration);

    // Calculate macro match
    const macroMatch = calculateMacroMatch(meal, workoutType, fitnessGoal);

    // Calculate fuel score
    const fuelScore = calculateFuelScore(workoutCost, macroMatch, fitnessGoal, meal.calories);

    // Get AI coach explanation
    const aiExplanation = await getAICoachExplanation({
      meal,
      workoutType,
      workoutDuration,
      fitnessGoal,
      workoutCost,
      macroMatch,
      fuelScore
    });

    res.json({
      meal: {
        name: meal.name,
        calories: meal.calories,
        protein: meal.protein,
        carbs: meal.carbs,
        fat: meal.fat
      },
      workoutCost,
      macroMatch,
      fuelScore,
      aiExplanation
    });
  } catch (error) {
    console.error('Analysis error:', error);
    res.status(500).json({ error: 'Failed to analyze meal', details: error.message });
  }
});

// 404 handler for unmatched routes (must be last)
app.use((req, res) => {
  if (req.originalUrl.startsWith('/api')) {
    console.log(`❌ API Route not found: ${req.method} ${req.originalUrl}`);
    res.status(404).json({ 
      error: 'Route not found', 
      method: req.method, 
      path: req.originalUrl,
      availableRoutes: [
        'GET /api/health',
        'GET /api/meals/presets',
        'GET /api/meals/test',
        'GET /api/meals/history',
        'POST /api/meals/save',
        'GET /api/meals/stats',
        'GET /api/meals/recommendations',
        'GET /api/meals/trends',
        'GET /api/meals/reports',
        'POST /api/meals/favorites',
        'GET /api/meals/favorites',
        'DELETE /api/meals/history/:id',
        'GET /api/workouts',
        'POST /api/analyze',
        'POST /api/voice/text-to-speech',
        'GET /api/voice/voices'
      ]
    });
  } else {
    res.status(404).json({ error: 'Not found' });
  }
});

app.listen(PORT, () => {
  console.log(`🚀 FuelFit AI Server running on http://localhost:${PORT}`);
  console.log(`📋 Registered API routes:`);
  console.log(`   GET  /api/health`);
  console.log(`   GET  /api/meals/presets`);
  console.log(`   GET  /api/meals/test`);
  console.log(`   GET  /api/meals/history`);
  console.log(`   POST /api/meals/save`);
  console.log(`   GET  /api/meals/stats`);
  console.log(`   GET  /api/meals/recommendations`);
  console.log(`   GET  /api/meals/trends`);
  console.log(`   GET  /api/meals/reports`);
  console.log(`   POST /api/meals/favorites`);
  console.log(`   GET  /api/meals/favorites`);
  console.log(`   DELETE /api/meals/history/:id`);
  console.log(`   GET  /api/workouts`);
  console.log(`   POST /api/analyze`);
  console.log(`   POST /api/voice/text-to-speech`);
  console.log(`   GET  /api/voice/voices`);
  console.log(`   POST /api/assistant/chat`);
  console.log(`   GET  /api/assistant/suggestions`);
});

