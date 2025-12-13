const express = require('express');
const router = express.Router();
const OpenAI = require('openai');

// Initialize OpenAI
const openai = process.env.OPENAI_API_KEY 
  ? new OpenAI({ apiKey: process.env.OPENAI_API_KEY })
  : null;

// Helper function to get fallback response
const getFallbackResponse = (msg) => {
      const lowerMessage = msg.toLowerCase();
      let defaultResponse = "I'm here to help with nutrition and fitness questions! ";
      
      if (lowerMessage.includes('protein') || lowerMessage.includes('shake')) {
        defaultResponse = "Protein shakes are excellent for muscle recovery and growth! A typical protein shake contains 20-30g of protein, 2-5g of carbs, and 1-3g of fat, totaling around 100-150 calories. They're perfect post-workout for muscle repair. For best results, consume within 30 minutes after your workout. You can analyze specific protein shake brands using the meal analyzer above!";
      } else if (lowerMessage.includes('calorie') || lowerMessage.includes('calories')) {
        defaultResponse = "Calorie needs vary based on your goals! For fat loss, aim for a 500-calorie deficit daily. For muscle gain, add 300-500 calories above maintenance. Use the meal analyzer above to see how many calories are in your meals and what workouts can burn them!";
      } else if (lowerMessage.includes('workout') || lowerMessage.includes('exercise') || lowerMessage.includes('training')) {
        defaultResponse = "Great question! Different workouts burn calories at different rates. Running burns about 10-12 calories per minute, cycling burns 8-10, and weight training burns 6-8. Use the meal analyzer to see how long you need to exercise to burn off your meals!";
      } else if (lowerMessage.includes('macro') || lowerMessage.includes('carb') || lowerMessage.includes('fat')) {
        defaultResponse = "Macros (macronutrients) are protein, carbs, and fats! Protein builds muscle (aim for 0.8-1g per lb bodyweight), carbs fuel workouts (40-60% of calories), and fats support hormones (20-30% of calories). Use the meal analyzer to see how your meals stack up!";
      } else if (lowerMessage.includes('jollof') || lowerMessage.includes('rice')) {
        defaultResponse = "Jollof Rice is a popular West African dish! A typical serving contains about 450 calories, 12g protein, 75g carbs, and 10g fat. It's a great source of energy for workouts. Use the meal analyzer to see how long you'd need to exercise to burn it off!";
      } else if (lowerMessage.includes('fish') && lowerMessage.includes('chip')) {
        defaultResponse = "Fish and Chips is a classic UK meal! A typical serving has about 900 calories, 35g protein, 95g carbs, and 45g fat. That's about 75 minutes of running to burn off! Use the meal analyzer to see the exact workout cost for your fitness goal.";
      } else if (lowerMessage.includes('muscle') || lowerMessage.includes('gain') || lowerMessage.includes('bulk')) {
        defaultResponse = "For muscle gain, focus on high-protein meals (30-40g per meal), eat 300-500 calories above maintenance, and train with weights 3-5 times per week. Great meals include chicken and rice, steak, salmon, and protein shakes. Check out the meal recommendations page for personalized suggestions!";
      } else if (lowerMessage.includes('fat loss') || lowerMessage.includes('lose weight') || lowerMessage.includes('cut')) {
        defaultResponse = "For fat loss, create a 500-calorie daily deficit through diet and exercise. Focus on lean proteins, vegetables, and whole grains. Avoid processed foods. Running, HIIT, and cycling are great for burning calories. Use the meal analyzer to see which meals fit your calorie goals!";
      } else if (lowerMessage.includes('fuelscore') || lowerMessage.includes('fuel score')) {
        defaultResponse = "FuelScore is a 0-10 rating that shows how well a meal aligns with your workout and fitness goals! It combines workout cost (how long to burn calories) and macro match (protein, carbs, fats). Higher scores (7-10) mean the meal is perfect for your goals. Analyze any meal to see its FuelScore!";
      } else if (lowerMessage.includes('pre-workout') || lowerMessage.includes('before workout')) {
        defaultResponse = "Pre-workout meals should be eaten 1-2 hours before exercise. Focus on carbs for energy (banana, oatmeal, rice) and some protein. Avoid high-fat foods that slow digestion. A good pre-workout meal is around 200-300 calories with 20-30g carbs and 10-15g protein.";
      } else if (lowerMessage.includes('post-workout') || lowerMessage.includes('after workout') || lowerMessage.includes('recovery')) {
        defaultResponse = "Post-workout nutrition is crucial for recovery! Eat within 30-60 minutes after exercise. Aim for 20-30g protein and 30-50g carbs. Protein shakes, chicken and rice, or Greek yogurt with fruit are perfect. This helps repair muscles and replenish energy stores.";
      } else if (lowerMessage.includes('breakfast') || lowerMessage.includes('morning meal')) {
        defaultResponse = "A good breakfast should include protein (eggs, Greek yogurt, protein shake), complex carbs (oatmeal, whole grain toast), and healthy fats (avocado, nuts). Aim for 300-500 calories. This fuels your day and prevents mid-morning crashes. Check out our preset meals for breakfast ideas!";
      } else if (lowerMessage.includes('meal plan') || lowerMessage.includes('diet plan')) {
        defaultResponse = "A good meal plan depends on your goals! For muscle gain: 3-4 meals with 30-40g protein each. For fat loss: 4-5 smaller meals, 20-30g protein each. Use the meal analyzer to check if meals fit your goals, and check the recommendations page for personalized suggestions!";
      } else if (lowerMessage.includes('water') || lowerMessage.includes('hydration')) {
        defaultResponse = "Stay hydrated! Aim for 8-10 glasses (2-2.5 liters) of water daily. Drink more if you're active or in hot weather. Water helps with digestion, energy, and recovery. Drink water before, during, and after workouts. Your urine should be light yellow - that's a good hydration indicator!";
      } else if (lowerMessage.includes('supplement') || lowerMessage.includes('vitamin')) {
        defaultResponse = "Supplements can help but aren't essential if you eat a balanced diet. Key supplements: protein powder (convenience), creatine (strength), vitamin D (if you don't get sun), and omega-3 (if you don't eat fish). Always prioritize whole foods first!";
      } else if (lowerMessage.includes('cardio') || lowerMessage.includes('running') || lowerMessage.includes('cycling')) {
        defaultResponse = "Cardio is great for burning calories and heart health! Running burns 10-12 cal/min, cycling 8-10 cal/min, swimming 7-9 cal/min. For fat loss, aim for 150+ minutes of moderate cardio per week. Use the meal analyzer to see how cardio helps burn off your meals!";
      } else if (lowerMessage.includes('weight') || lowerMessage.includes('strength') || lowerMessage.includes('lifting')) {
        defaultResponse = "Weight training builds muscle and burns calories! It burns 6-8 calories per minute during the workout, but also increases your metabolism for hours after. For muscle gain, train 3-5 times per week, focusing on compound movements. Make sure to eat enough protein for recovery!";
      } else if (lowerMessage.includes('hiit') || lowerMessage.includes('high intensity')) {
        defaultResponse = "HIIT (High-Intensity Interval Training) is super efficient! It burns 8-12 calories per minute and boosts metabolism for hours. A 20-minute HIIT session can burn 200-300 calories. Perfect for busy schedules. Use the meal analyzer to see how HIIT compares to other workouts!";
      } else if (lowerMessage.includes('meal') || lowerMessage.includes('food') || lowerMessage.includes('eat')) {
        defaultResponse = "Great question about meals! I can help you understand nutrition, calories, macros, and how meals relate to workouts. Try asking about specific meals like 'protein shake', 'jollof rice', or 'fish and chips'. Or use the meal analyzer above to get detailed insights on any meal with FuelScore, workout cost, and macro analysis!";
      } else {
        defaultResponse += "I can help with nutrition, fitness, workouts, and meal analysis! Try asking about protein shakes, calories, workouts, macros, or specific meals. You can also use the meal analyzer above to get detailed insights on any meal.";
      }
      
  return defaultResponse;
};

// @route   POST /api/assistant/chat
// @desc    Chat with voice assistant about nutrition and fitness
// @access  Public
router.post('/chat', async (req, res) => {
  try {
    const { message, context } = req.body;

    console.log('📥 Assistant chat request:', { message: message?.substring(0, 50), hasContext: !!context, hasOpenAI: !!openai });

    if (!message) {
      return res.status(400).json({ error: 'Message is required' });
    }

    // If OpenAI is not configured, return a helpful default response based on the question
    if (!openai) {
      console.log('⚠️ OpenAI not configured, using fallback response');
      const defaultResponse = getFallbackResponse(message);
      return res.json({
        success: true,
        response: defaultResponse
      });
    }

    // Build context about the app
    const systemContext = `You are FuelFit AI, a friendly and knowledgeable voice assistant for nutrition and fitness. 
You help users understand:
- Meal nutrition and analysis
- Workout recommendations
- Macro nutrients (protein, carbs, fats)
- FuelScore calculations
- Fitness goals (fat loss, muscle gain, endurance)
- Meal-to-workout conversions

Be conversational, helpful, and concise. Keep responses under 150 words. If asked about specific meals, you can reference the 100+ meals in the database including UK and Nigerian foods.

${context ? `User context: ${context}` : ''}`;

    console.log('🤖 Calling OpenAI API...');
    const response = await openai.chat.completions.create({
      model: 'gpt-3.5-turbo',
      messages: [
        { role: 'system', content: systemContext },
        { role: 'user', content: message }
      ],
      max_tokens: 200,
      temperature: 0.7
    });

    const assistantResponse = response.choices[0].message.content;
    console.log('✅ OpenAI response received:', assistantResponse.substring(0, 50) + '...');

    res.json({
      success: true,
      response: assistantResponse
    });

  } catch (error) {
    console.error('❌ Assistant chat error:', error.message);
    console.error('Error details:', error);
    
    // If quota exceeded or any error, fall back to default responses
    if (error.message?.includes('insufficient_quota') || error.code === 'insufficient_quota') {
      console.log('⚠️ Quota exceeded, using fallback response');
      const defaultResponse = getFallbackResponse(message);
      return res.json({
        success: true,
        response: defaultResponse
      });
    }
    
    // For other errors, also use fallback but log the error
    console.log('⚠️ OpenAI error, using fallback response');
    const defaultResponse = getFallbackResponse(message);
    return res.json({
      success: true,
      response: defaultResponse
    });
  }
});

// @route   GET /api/assistant/suggestions
// @desc    Get suggested questions for the voice assistant
// @access  Public
router.get('/suggestions', (req, res) => {
  res.json({
    success: true,
    suggestions: [
      "What's a good meal for muscle gain?",
      "How many calories should I eat for fat loss?",
      "What's the best workout to burn 500 calories?",
      "Explain what FuelScore means",
      "What's the difference between protein and carbs?",
      "Recommend a meal for my workout",
      "How do I calculate my macros?",
      "What's a good pre-workout meal?",
      "Tell me about Jollof Rice nutrition",
      "What's the workout cost of Fish and Chips?"
    ]
  });
});

module.exports = router;

