const express = require('express');
const auth = require('../middleware/auth');
const MealHistory = require('../models/MealHistory');
const FavoriteMeal = require('../models/FavoriteMeal');
const router = express.Router();

// Test route to verify router is working
router.get('/test', (req, res) => {
  res.json({ success: true, message: 'Meal routes are working!' });
});

// @route   POST /api/meals/save
// @desc    Save analyzed meal to history
// @access  Private
router.post('/save', auth, async (req, res) => {
  try {
    const {
      mealName,
      meal,
      workoutType,
      workoutDuration,
      fitnessGoal,
      workoutCost,
      macroMatch,
      fuelScore,
      aiExplanation
    } = req.body;

    const mongoose = require('mongoose');
    const userId = mongoose.Types.ObjectId.isValid(req.user._id) 
      ? req.user._id 
      : new mongoose.Types.ObjectId(req.user._id);

    const mealHistory = await MealHistory.create({
      user: userId,
      mealName,
      meal,
      workoutType,
      workoutDuration,
      fitnessGoal,
      workoutCost,
      macroMatch,
      fuelScore,
      aiExplanation
    });

    res.json({
      success: true,
      mealHistory
    });
  } catch (error) {
    console.error('Save meal error:', error);
    res.status(500).json({ 
      error: 'Failed to save meal',
      details: error.message 
    });
  }
});

// @route   GET /api/meals/history
// @desc    Get user's meal history
// @access  Private
router.get('/history', auth, async (req, res) => {
  try {
    console.log('History route hit, user:', req.user._id);
    const page = parseInt(req.query.page) || 1;
    const limit = parseInt(req.query.limit) || 10;
    const skip = (page - 1) * limit;

    const mongoose = require('mongoose');
    const userId = mongoose.Types.ObjectId.isValid(req.user._id) 
      ? req.user._id 
      : new mongoose.Types.ObjectId(req.user._id);

    console.log('Querying meal history for user:', userId);

    const mealHistory = await MealHistory.find({ user: userId })
      .sort({ createdAt: -1 })
      .limit(limit)
      .skip(skip);

    const total = await MealHistory.countDocuments({ user: userId });

    console.log('Found', mealHistory.length, 'meals, total:', total);

    res.json({
      success: true,
      mealHistory: mealHistory || [],
      pagination: {
        page,
        limit,
        total: total || 0,
        pages: Math.ceil((total || 0) / limit)
      }
    });
  } catch (error) {
    console.error('Get history error:', error);
    res.status(500).json({ 
      success: false,
      error: 'Failed to get meal history',
      details: error.message 
    });
  }
});

// @route   GET /api/meals/stats
// @desc    Get user's meal analysis statistics
// @access  Private
router.get('/stats', auth, async (req, res) => {
  try {
    const mongoose = require('mongoose');
    const userId = mongoose.Types.ObjectId.isValid(req.user._id) 
      ? req.user._id 
      : new mongoose.Types.ObjectId(req.user._id);

    const totalMeals = await MealHistory.countDocuments({ user: userId });

    const avgFuelScore = await MealHistory.aggregate([
      { $match: { user: userId } },
      { $group: { _id: null, avgScore: { $avg: '$fuelScore' } } }
    ]);

    const avgScore = avgFuelScore.length > 0 ? Math.round(avgFuelScore[0].avgScore * 10) / 10 : 0;

    // Get meal distribution by goal
    const mealsByGoal = await MealHistory.aggregate([
      { $match: { user: userId } },
      { $group: { _id: '$fitnessGoal', count: { $sum: 1 } } }
    ]);

    // Get workout type distribution
    const mealsByWorkout = await MealHistory.aggregate([
      { $match: { user: userId } },
      { $group: { _id: '$workoutType', count: { $sum: 1 } } }
    ]);

    res.json({
      success: true,
      stats: {
        totalMeals,
        averageFuelScore: avgScore,
        mealsByGoal: mealsByGoal.reduce((acc, item) => {
          acc[item._id] = item.count;
          return acc;
        }, {}),
        mealsByWorkout: mealsByWorkout.reduce((acc, item) => {
          acc[item._id] = item.count;
          return acc;
        }, {})
      }
    });
  } catch (error) {
    console.error('Get stats error:', error);
    res.status(500).json({ 
      error: 'Failed to get statistics',
      details: error.message 
    });
  }
});

// @route   DELETE /api/meals/history/:id
// @desc    Delete a meal from history
// @access  Private
router.delete('/history/:id', auth, async (req, res) => {
  try {
    const mongoose = require('mongoose');
    const userId = mongoose.Types.ObjectId.isValid(req.user._id) 
      ? req.user._id 
      : new mongoose.Types.ObjectId(req.user._id);

    const mealHistory = await MealHistory.findOneAndDelete({
      _id: req.params.id,
      user: userId
    });

    if (!mealHistory) {
      return res.status(404).json({ error: 'Meal not found' });
    }

    res.json({
      success: true,
      message: 'Meal deleted successfully'
    });
  } catch (error) {
    console.error('Delete meal error:', error);
    res.status(500).json({ 
      error: 'Failed to delete meal',
      details: error.message 
    });
  }
});

// @route   GET /api/meals/reports
// @desc    Get weekly/monthly nutrition reports
// @access  Private
router.get('/reports', auth, async (req, res) => {
  console.log('📥 GET /api/meals/reports hit');
  try {
    const { period = 'week' } = req.query; // week, month
    const mongoose = require('mongoose');
    const userId = mongoose.Types.ObjectId.isValid(req.user._id) 
      ? req.user._id 
      : new mongoose.Types.ObjectId(req.user._id);

    const now = new Date();
    const days = period === 'week' ? 7 : 30;
    const startDate = new Date(now.getTime() - days * 24 * 60 * 60 * 1000);

    const mealHistory = await MealHistory.find({ 
      user: userId,
      createdAt: { $gte: startDate }
    })
      .sort({ createdAt: 1 })
      .select('fuelScore meal macroMatch workoutType fitnessGoal createdAt');

    // Calculate totals and averages
    const totalMeals = mealHistory.length;
    const avgFuelScore = totalMeals > 0
      ? mealHistory.reduce((sum, m) => sum + m.fuelScore, 0) / totalMeals
      : 0;

    const totalCalories = mealHistory.reduce((sum, m) => sum + m.meal.calories, 0);
    const avgCalories = totalMeals > 0 ? totalCalories / totalMeals : 0;

    // Group by day
    const dailyStats = {};
    mealHistory.forEach(meal => {
      const date = meal.createdAt.toISOString().split('T')[0];
      if (!dailyStats[date]) {
        dailyStats[date] = {
          date,
          meals: 0,
          totalFuelScore: 0,
          totalCalories: 0,
          totalProtein: 0,
          totalCarbs: 0,
          totalFat: 0
        };
      }
      dailyStats[date].meals++;
      dailyStats[date].totalFuelScore += meal.fuelScore;
      dailyStats[date].totalCalories += meal.meal.calories;
      dailyStats[date].totalProtein += meal.macroMatch.protein.grams;
      dailyStats[date].totalCarbs += meal.macroMatch.carbs.grams;
      dailyStats[date].totalFat += meal.macroMatch.fat.grams;
    });

    // Calculate daily averages
    const dailyAverages = Object.values(dailyStats).map((day) => ({
      date: day.date,
      meals: day.meals,
      avgFuelScore: day.totalFuelScore / day.meals,
      totalCalories: day.totalCalories,
      avgProtein: day.totalProtein / day.meals,
      avgCarbs: day.totalCarbs / day.meals,
      avgFat: day.totalFat / day.meals
    }));

    // Get best and worst days
    const bestDay = dailyAverages.length > 0
      ? dailyAverages.reduce((best, day) => day.avgFuelScore > best.avgFuelScore ? day : best)
      : null;

    const worstDay = dailyAverages.length > 0
      ? dailyAverages.reduce((worst, day) => day.avgFuelScore < worst.avgFuelScore ? day : worst)
      : null;

    // Workout distribution
    const workoutDistribution = {};
    mealHistory.forEach(meal => {
      workoutDistribution[meal.workoutType] = (workoutDistribution[meal.workoutType] || 0) + 1;
    });

    res.json({
      success: true,
      report: {
        period,
        totalMeals,
        avgFuelScore: Math.round(avgFuelScore * 10) / 10,
        totalCalories: Math.round(totalCalories),
        avgCalories: Math.round(avgCalories),
        dailyAverages,
        bestDay,
        worstDay,
        workoutDistribution
      }
    });
  } catch (error) {
    console.error('Get reports error:', error);
    res.status(500).json({ 
      error: 'Failed to get reports',
      details: error.message 
    });
  }
});

// @route   GET /api/meals/trends
// @desc    Get meal analysis trends for charts
// @access  Private
router.get('/trends', auth, async (req, res) => {
  console.log('📥 GET /api/meals/trends hit');
  try {
    const { period = 'week' } = req.query; // week, month, all
    const mongoose = require('mongoose');
    const userId = mongoose.Types.ObjectId.isValid(req.user._id) 
      ? req.user._id 
      : new mongoose.Types.ObjectId(req.user._id);

    let dateFilter = {};
    const now = new Date();
    
    if (period === 'week') {
      dateFilter = { createdAt: { $gte: new Date(now.getTime() - 7 * 24 * 60 * 60 * 1000) } };
    } else if (period === 'month') {
      dateFilter = { createdAt: { $gte: new Date(now.getTime() - 30 * 24 * 60 * 60 * 1000) } };
    }

    const mealHistory = await MealHistory.find({ 
      user: userId,
      ...dateFilter
    })
      .sort({ createdAt: 1 })
      .select('fuelScore meal macroMatch createdAt');

    // Group by date for trends
    const trends = mealHistory.map(item => ({
      date: item.createdAt.toISOString().split('T')[0],
      fuelScore: item.fuelScore,
      calories: item.meal.calories,
      protein: item.macroMatch.protein.grams,
      carbs: item.macroMatch.carbs.grams,
      fat: item.macroMatch.fat.grams
    }));

    // Calculate averages
    const avgFuelScore = trends.length > 0
      ? trends.reduce((sum, t) => sum + t.fuelScore, 0) / trends.length
      : 0;

    const avgCalories = trends.length > 0
      ? trends.reduce((sum, t) => sum + t.calories, 0) / trends.length
      : 0;

    const avgProtein = trends.length > 0
      ? trends.reduce((sum, t) => sum + t.protein, 0) / trends.length
      : 0;

    const avgCarbs = trends.length > 0
      ? trends.reduce((sum, t) => sum + t.carbs, 0) / trends.length
      : 0;

    const avgFat = trends.length > 0
      ? trends.reduce((sum, t) => sum + t.fat, 0) / trends.length
      : 0;

    res.json({
      success: true,
      trends,
      averages: {
        fuelScore: Math.round(avgFuelScore * 10) / 10,
        calories: Math.round(avgCalories),
        protein: Math.round(avgProtein),
        carbs: Math.round(avgCarbs),
        fat: Math.round(avgFat)
      },
      period
    });
  } catch (error) {
    console.error('Get trends error:', error);
    res.status(500).json({ 
      error: 'Failed to get trends',
      details: error.message 
    });
  }
});

// @route   GET /api/meals/recommendations
// @desc    Get personalized meal recommendations
// @access  Private
router.get('/recommendations', auth, async (req, res) => {
  console.log('📥 GET /api/meals/recommendations hit');
  try {
    const { workoutType, fitnessGoal } = req.query;
    const mongoose = require('mongoose');
    const userId = mongoose.Types.ObjectId.isValid(req.user._id) 
      ? req.user._id 
      : new mongoose.Types.ObjectId(req.user._id);

    const user = await require('../models/User').findById(userId);
    const goal = fitnessGoal || user?.fitnessGoal || 'fat_loss';
    const workout = workoutType || 'rest';

    // Get user's meal history to understand preferences
    const recentMeals = await MealHistory.find({ user: userId })
      .sort({ createdAt: -1 })
      .limit(10)
      .select('mealName meal fuelScore');

    // Get all available meals
    const { meals } = require('../data');
    const { calculateWorkoutCost, calculateMacroMatch, calculateFuelScore } = require('../engine');

    // Score and rank meals based on goal and workout
    const recommendations = meals.map(meal => {
      const workoutCost = calculateWorkoutCost(meal.calories, workout, 30);
      const macroMatch = calculateMacroMatch(meal, workout, goal);
      const fuelScore = calculateFuelScore(workoutCost, macroMatch, goal, meal.calories);

      // Check if user has tried this meal before
      const triedBefore = recentMeals.some(m => 
        m.mealName.toLowerCase().includes(meal.name.toLowerCase()) ||
        meal.name.toLowerCase().includes(m.mealName.toLowerCase())
      );

      return {
        meal,
        fuelScore,
        workoutCost,
        macroMatch,
        triedBefore,
        recommendation: fuelScore >= 7 ? 'excellent' : fuelScore >= 5 ? 'good' : 'fair'
      };
    });

    // Sort by FuelScore (highest first)
    recommendations.sort((a, b) => b.fuelScore - a.fuelScore);

    // Get top 5 recommendations
    const topRecommendations = recommendations.slice(0, 5);

    res.json({
      success: true,
      recommendations: topRecommendations,
      goal,
      workoutType: workout
    });
  } catch (error) {
    console.error('Get recommendations error:', error);
    res.status(500).json({ 
      error: 'Failed to get recommendations',
      details: error.message 
    });
  }
});

// @route   POST /api/meals/favorites
// @desc    Add meal to favorites
// @access  Private
router.post('/favorites', auth, async (req, res) => {
  try {
    const { mealName, meal } = req.body;
    const mongoose = require('mongoose');
    const userId = mongoose.Types.ObjectId.isValid(req.user._id) 
      ? req.user._id 
      : new mongoose.Types.ObjectId(req.user._id);

    const favorite = await FavoriteMeal.create({
      user: userId,
      mealName,
      meal
    });

    res.json({
      success: true,
      favorite
    });
  } catch (error) {
    if (error.code === 11000) {
      return res.status(400).json({ error: 'Meal already in favorites' });
    }
    console.error('Add favorite error:', error);
    res.status(500).json({ 
      error: 'Failed to add favorite',
      details: error.message 
    });
  }
});

// @route   GET /api/meals/favorites
// @desc    Get user's favorite meals
// @access  Private
router.get('/favorites', auth, async (req, res) => {
  try {
    const mongoose = require('mongoose');
    const userId = mongoose.Types.ObjectId.isValid(req.user._id) 
      ? req.user._id 
      : new mongoose.Types.ObjectId(req.user._id);

    const favorites = await FavoriteMeal.find({ user: userId })
      .sort({ createdAt: -1 });

    res.json({
      success: true,
      favorites
    });
  } catch (error) {
    console.error('Get favorites error:', error);
    res.status(500).json({ 
      error: 'Failed to get favorites',
      details: error.message 
    });
  }
});

// @route   DELETE /api/meals/favorites/:id
// @desc    Remove meal from favorites
// @access  Private
router.delete('/favorites/:id', auth, async (req, res) => {
  try {
    const mongoose = require('mongoose');
    const userId = mongoose.Types.ObjectId.isValid(req.user._id) 
      ? req.user._id 
      : new mongoose.Types.ObjectId(req.user._id);

    const favorite = await FavoriteMeal.findOneAndDelete({
      _id: req.params.id,
      user: userId
    });

    if (!favorite) {
      return res.status(404).json({ error: 'Favorite not found' });
    }

    res.json({
      success: true,
      message: 'Favorite removed successfully'
    });
  } catch (error) {
    console.error('Delete favorite error:', error);
    res.status(500).json({ 
      error: 'Failed to remove favorite',
      details: error.message 
    });
  }
});

module.exports = router;

