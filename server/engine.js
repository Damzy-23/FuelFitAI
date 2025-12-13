const OpenAI = require('openai');
const { MET_VALUES } = require('./data');

// Initialize OpenAI (will use API key from environment or mock if not available)
const openai = process.env.OPENAI_API_KEY 
  ? new OpenAI({ apiKey: process.env.OPENAI_API_KEY })
  : null;

// Average person weight in kg (used for MET calculations)
const AVG_WEIGHT_KG = 70;

/**
 * Calculate workout cost - how many minutes of exercise needed to burn meal calories
 */
function calculateWorkoutCost(mealCalories, workoutType, workoutDuration = null) {
  if (workoutType === 'rest') {
    return {
      minutes: null,
      message: 'Rest day - no workout cost',
      caloriesPerMinute: 1.2 // Resting metabolic rate
    };
  }

  const metValue = MET_VALUES[workoutType] || MET_VALUES.running;
  
  // MET calculation: calories per minute = (MET * weight_kg * 3.5) / 200
  // Simplified: for 70kg person, calories/min ≈ MET * 1.17
  const caloriesPerMinute = (metValue * AVG_WEIGHT_KG * 3.5) / 200;
  
  const minutesNeeded = Math.round(mealCalories / caloriesPerMinute);

  const workoutLabels = {
    running: '🏃 Running',
    cycling: '🚴 Cycling',
    weights: '💪 Weight Training',
    hiit: '⚡ HIIT',
    walking: '🚶 Walking',
    swimming: '🏊 Swimming'
  };

  return {
    minutes: minutesNeeded,
    caloriesPerMinute: Math.round(caloriesPerMinute * 10) / 10,
    workoutLabel: workoutLabels[workoutType] || workoutType,
    message: `${workoutLabels[workoutType] || workoutType} = ${minutesNeeded} minutes`
  };
}

/**
 * Calculate macro match - how well meal aligns with workout and goal
 */
function calculateMacroMatch(meal, workoutType, fitnessGoal) {
  const { protein, carbs, fat, calories } = meal;

  // Target ranges based on workout type and goal
  let proteinTarget = 0;
  let carbTarget = 0;
  let fatTarget = 0;

  // Protein targets (grams per meal)
  if (fitnessGoal === 'muscle_gain') {
    proteinTarget = workoutType === 'weights' ? 40 : 30;
  } else if (fitnessGoal === 'fat_loss') {
    proteinTarget = 25;
  } else { // endurance
    proteinTarget = 20;
  }

  // Carb targets (grams per meal)
  if (workoutType === 'running' || workoutType === 'cycling' || workoutType === 'hiit') {
    carbTarget = fitnessGoal === 'endurance' ? 60 : 45;
  } else if (workoutType === 'weights') {
    carbTarget = fitnessGoal === 'muscle_gain' ? 50 : 30;
  } else {
    carbTarget = 30;
  }

  // Fat targets (grams per meal)
  fatTarget = fitnessGoal === 'fat_loss' ? 15 : 20;

  // Calculate scores (0-10 scale)
  const proteinScore = Math.min(10, (protein / proteinTarget) * 10);
  const carbScore = Math.min(10, (carbs / carbTarget) * 10);
  const fatScore = Math.min(10, (fat / fatTarget) * 10);

  // Overall macro score (weighted)
  const overallScore = (proteinScore * 0.4 + carbScore * 0.4 + fatScore * 0.2);

  // Generate feedback
  const feedback = [];
  if (protein < proteinTarget * 0.8) {
    feedback.push(`Low protein for ${workoutType === 'weights' ? 'muscle recovery' : 'your workout'}`);
  } else if (protein >= proteinTarget) {
    feedback.push('Great protein for recovery');
  }

  if (workoutType === 'running' || workoutType === 'cycling') {
    if (carbs < carbTarget * 0.7) {
      feedback.push('Low carbs for cardio recovery');
    } else if (carbs >= carbTarget) {
      feedback.push('Excellent carb replenishment');
    }
  }

  if (fat > fatTarget * 1.5 && fitnessGoal === 'fat_loss') {
    feedback.push('High fat content for fat loss goal');
  }

  return {
    protein: {
      grams: protein,
      target: proteinTarget,
      score: Math.round(proteinScore * 10) / 10,
      status: protein >= proteinTarget ? 'good' : protein >= proteinTarget * 0.8 ? 'ok' : 'low'
    },
    carbs: {
      grams: carbs,
      target: carbTarget,
      score: Math.round(carbScore * 10) / 10,
      status: carbs >= carbTarget ? 'good' : carbs >= carbTarget * 0.7 ? 'ok' : 'low'
    },
    fat: {
      grams: fat,
      target: fatTarget,
      score: Math.round(fatScore * 10) / 10,
      status: fat <= fatTarget * 1.2 ? 'good' : 'high'
    },
    overallScore: Math.round(overallScore * 10) / 10,
    feedback
  };
}

/**
 * Calculate FuelScore (0-10 scale)
 */
function calculateFuelScore(workoutCost, macroMatch, fitnessGoal, mealCalories) {
  // Base score from macro alignment (0-7 points)
  let score = (macroMatch.overallScore / 10) * 7;

  // Adjust based on workout cost efficiency
  // Lower calories = better for fat loss, adequate calories = better for muscle gain
  if (fitnessGoal === 'fat_loss') {
    if (mealCalories < 400) score += 1.5;
    else if (mealCalories < 500) score += 1;
    else if (mealCalories > 600) score -= 1;
  } else if (fitnessGoal === 'muscle_gain') {
    if (mealCalories >= 450 && mealCalories <= 600) score += 1.5;
    else if (mealCalories < 350) score -= 1;
  } else { // endurance
    if (mealCalories >= 400 && mealCalories <= 550) score += 1.5;
  }

  // Bonus for excellent macro match
  if (macroMatch.overallScore >= 8) score += 0.5;

  // Cap at 10
  score = Math.min(10, Math.max(0, score));

  return Math.round(score * 10) / 10;
}

/**
 * Get AI coach explanation and suggestions
 */
async function getAICoachExplanation(data) {
  const { meal, workoutType, workoutDuration, fitnessGoal, workoutCost, macroMatch, fuelScore } = data;

  // If OpenAI is not configured, return a smart default explanation
  if (!openai) {
    return generateDefaultExplanation(data);
  }

  try {
    const prompt = `You are FuelFit AI, a friendly fitness nutrition coach. Analyze this meal and provide:

Meal: ${meal.name} (${meal.calories} kcal, ${meal.protein}g protein, ${meal.carbs}g carbs, ${meal.fat}g fat)
Workout: ${workoutType} ${workoutDuration ? `for ${workoutDuration} minutes` : ''}
Goal: ${fitnessGoal}
Workout Cost: ${workoutCost.minutes ? `${workoutCost.minutes} minutes of ${workoutType}` : 'Rest day'}
FuelScore: ${fuelScore}/10
Macro Analysis: Protein ${macroMatch.protein.status}, Carbs ${macroMatch.carbs.status}, Fat ${macroMatch.fat.status}

Provide:
1. A brief explanation (2-3 sentences) of what this meal does well
2. What it lacks or could improve
3. One specific swap suggestion (e.g., "Add Greek yogurt → improves recovery")

Keep it friendly, actionable, and under 100 words.`;

    const response = await openai.chat.completions.create({
      model: 'gpt-3.5-turbo',
      messages: [
        { role: 'system', content: 'You are FuelFit AI, a concise and friendly fitness nutrition coach. Keep responses under 100 words.' },
        { role: 'user', content: prompt }
      ],
      max_tokens: 150,
      temperature: 0.7
    });

    const explanation = response.choices[0].message.content;
    
    // Extract swap suggestion
    const swapMatch = explanation.match(/(?:swap|add|replace|try).*?→.*?/i);
    const suggestion = swapMatch ? swapMatch[0] : null;

    return {
      explanation,
      suggestion: suggestion || generateSwapSuggestion(meal, macroMatch, fitnessGoal)
    };
  } catch (error) {
    console.error('OpenAI error:', error);
    return generateDefaultExplanation(data);
  }
}

/**
 * Generate default explanation when AI is not available
 */
function generateDefaultExplanation(data) {
  const { meal, workoutType, fitnessGoal, macroMatch, fuelScore } = data;

  let explanation = '';
  let suggestion = '';

  // Build explanation based on analysis
  if (fuelScore >= 8) {
    explanation = `This ${meal.name} is well-aligned with your ${fitnessGoal} goal and ${workoutType} workout. `;
  } else if (fuelScore >= 6) {
    explanation = `This meal works okay for your ${fitnessGoal} goal, but there's room for improvement. `;
  } else {
    explanation = `This meal doesn't align well with your ${fitnessGoal} goal and ${workoutType} workout. `;
  }

  if (macroMatch.protein.status === 'low') {
    explanation += `It's low in protein, which is important for ${workoutType === 'weights' ? 'muscle recovery' : 'recovery'}. `;
    suggestion = 'Add Greek yogurt or a protein shake → improves recovery';
  } else if (macroMatch.carbs.status === 'low' && (workoutType === 'running' || workoutType === 'cycling')) {
    explanation += `It lacks sufficient carbs for cardio recovery. `;
    suggestion = 'Add a banana or sweet potato → replenishes energy';
  } else if (macroMatch.fat.status === 'high' && fitnessGoal === 'fat_loss') {
    explanation += `The fat content is high for your fat loss goal. `;
    suggestion = 'Swap for a leaner option → saves workout time';
  } else {
    explanation += `Consider balancing macros better for optimal results. `;
    suggestion = 'Add vegetables and lean protein → improves nutrition balance';
  }

  return {
    explanation: explanation.trim(),
    suggestion: suggestion || generateSwapSuggestion(meal, macroMatch, fitnessGoal)
  };
}

/**
 * Generate swap suggestion
 */
function generateSwapSuggestion(meal, macroMatch, fitnessGoal) {
  if (macroMatch.protein.status === 'low') {
    return 'Add Greek yogurt → improves recovery';
  } else if (macroMatch.carbs.status === 'low') {
    return 'Add a banana → replenishes energy';
  } else if (macroMatch.fat.status === 'high' && fitnessGoal === 'fat_loss') {
    return 'Swap fries for sweet potato → saves 12 mins of running';
  } else {
    return 'Add vegetables → improves nutrition balance';
  }
}

module.exports = {
  calculateWorkoutCost,
  calculateMacroMatch,
  calculateFuelScore,
  getAICoachExplanation
};

