const mongoose = require('mongoose');

const mealHistorySchema = new mongoose.Schema({
  user: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'User',
    required: true
  },
  mealName: {
    type: String,
    required: true
  },
  meal: {
    name: String,
    calories: Number,
    protein: Number,
    carbs: Number,
    fat: Number
  },
  workoutType: {
    type: String,
    required: true
  },
  workoutDuration: {
    type: Number,
    default: 30
  },
  fitnessGoal: {
    type: String,
    required: true
  },
  workoutCost: {
    minutes: Number,
    workoutLabel: String,
    message: String
  },
  macroMatch: {
    protein: { grams: Number, target: Number, score: Number, status: String },
    carbs: { grams: Number, target: Number, score: Number, status: String },
    fat: { grams: Number, target: Number, score: Number, status: String },
    overallScore: Number
  },
  fuelScore: {
    type: Number,
    required: true
  },
  aiExplanation: {
    explanation: String,
    suggestion: String
  },
  createdAt: {
    type: Date,
    default: Date.now
  }
});

// Index for faster queries
mealHistorySchema.index({ user: 1, createdAt: -1 });

module.exports = mongoose.model('MealHistory', mealHistorySchema);

