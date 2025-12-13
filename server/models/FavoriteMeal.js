const mongoose = require('mongoose');

const favoriteMealSchema = new mongoose.Schema({
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
  createdAt: {
    type: Date,
    default: Date.now
  }
});

// Ensure user can't favorite the same meal twice
favoriteMealSchema.index({ user: 1, mealName: 1 }, { unique: true });

module.exports = mongoose.model('FavoriteMeal', favoriteMealSchema);

