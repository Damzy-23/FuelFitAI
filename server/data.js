// MET (Metabolic Equivalent of Task) values - calories burned per kg per hour
// For a 70kg person, multiply by 70/60 to get calories per minute
const MET_VALUES = {
  running: 8.0,      // Running 8 km/h
  cycling: 6.0,      // Cycling moderate effort
  weights: 5.0,      // Weight training
  hiit: 8.5,         // High-intensity interval training
  walking: 3.5,      // Walking moderate pace
  swimming: 7.0,     // Swimming moderate effort
  rest: 1.0          // Resting metabolic rate
};

// Preset meals with calories and macros (per serving)
// Includes original meals, UK foods, and Nigerian foods
const meals = [
  // Original meals
  {
    name: 'Chicken and Rice',
    calories: 450,
    protein: 35,
    carbs: 45,
    fat: 10
  },
  {
    name: 'Burger',
    calories: 550,
    protein: 25,
    carbs: 45,
    fat: 28
  },
  {
    name: 'Salmon Salad',
    calories: 380,
    protein: 30,
    carbs: 20,
    fat: 20
  },
  {
    name: 'Pasta with Meatballs',
    calories: 520,
    protein: 28,
    carbs: 65,
    fat: 15
  },
  {
    name: 'Greek Yogurt with Berries',
    calories: 200,
    protein: 15,
    carbs: 25,
    fat: 5
  },
  {
    name: 'Pizza Slice',
    calories: 300,
    protein: 12,
    carbs: 36,
    fat: 12
  },
  {
    name: 'Protein Smoothie',
    calories: 250,
    protein: 30,
    carbs: 20,
    fat: 5
  },
  {
    name: 'Steak and Potatoes',
    calories: 600,
    protein: 40,
    carbs: 50,
    fat: 25
  },
  {
    name: 'Sushi Roll (8 pieces)',
    calories: 300,
    protein: 12,
    carbs: 55,
    fat: 4
  },
  {
    name: 'Avocado Toast',
    calories: 320,
    protein: 10,
    carbs: 35,
    fat: 16
  },
  
  // ========== UK FOODS ==========
  // Traditional UK Breakfast
  { name: 'Full English Breakfast', calories: 850, protein: 45, carbs: 50, fat: 50 },
  { name: 'Bacon Sandwich', calories: 450, protein: 20, carbs: 40, fat: 22 },
  { name: 'Sausage and Mash', calories: 650, protein: 28, carbs: 70, fat: 28 },
  { name: 'Fish and Chips', calories: 900, protein: 35, carbs: 95, fat: 45 },
  { name: 'Shepherd\'s Pie', calories: 550, protein: 30, carbs: 60, fat: 20 },
  { name: 'Beef Wellington', calories: 750, protein: 45, carbs: 40, fat: 45 },
  { name: 'Bangers and Mash', calories: 600, protein: 25, carbs: 65, fat: 25 },
  { name: 'Cornish Pasty', calories: 500, protein: 18, carbs: 55, fat: 22 },
  { name: 'Scotch Egg', calories: 350, protein: 20, carbs: 15, fat: 22 },
  { name: 'Ploughman\'s Lunch', calories: 600, protein: 25, carbs: 45, fat: 35 },
  { name: 'Sunday Roast (Beef)', calories: 800, protein: 50, carbs: 60, fat: 40 },
  { name: 'Yorkshire Pudding', calories: 150, protein: 5, carbs: 20, fat: 6 },
  { name: 'Bubble and Squeak', calories: 250, protein: 8, carbs: 30, fat: 12 },
  { name: 'Toad in the Hole', calories: 550, protein: 22, carbs: 50, fat: 28 },
  { name: 'Steak and Kidney Pie', calories: 650, protein: 35, carbs: 45, fat: 35 },
  { name: 'Cottage Pie', calories: 580, protein: 28, carbs: 55, fat: 25 },
  { name: 'Chicken Tikka Masala', calories: 600, protein: 40, carbs: 45, fat: 28 },
  { name: 'Beef Curry', calories: 550, protein: 35, carbs: 40, fat: 25 },
  { name: 'Lancashire Hotpot', calories: 520, protein: 30, carbs: 50, fat: 20 },
  { name: 'Welsh Rarebit', calories: 400, protein: 20, carbs: 25, fat: 25 },
  { name: 'Haggis', calories: 350, protein: 22, carbs: 20, fat: 22 },
  { name: 'Black Pudding', calories: 300, protein: 15, carbs: 15, fat: 20 },
  { name: 'Cockles and Mussels', calories: 200, protein: 25, carbs: 10, fat: 5 },
  { name: 'Jellied Eels', calories: 180, protein: 20, carbs: 8, fat: 8 },
  { name: 'Sticky Toffee Pudding', calories: 450, protein: 5, carbs: 75, fat: 15 },
  { name: 'Spotted Dick', calories: 350, protein: 6, carbs: 60, fat: 10 },
  { name: 'Eton Mess', calories: 400, protein: 5, carbs: 55, fat: 18 },
  { name: 'Trifle', calories: 350, protein: 8, carbs: 50, fat: 12 },
  { name: 'Victoria Sponge', calories: 300, protein: 5, carbs: 45, fat: 12 },
  { name: 'Scones with Clotted Cream', calories: 400, protein: 8, carbs: 50, fat: 20 },
  { name: 'Afternoon Tea (Full)', calories: 600, protein: 15, carbs: 80, fat: 25 },
  { name: 'Beans on Toast', calories: 350, protein: 15, carbs: 55, fat: 8 },
  { name: 'Cheese on Toast', calories: 400, protein: 20, carbs: 35, fat: 20 },
  { name: 'Welsh Cakes', calories: 200, protein: 4, carbs: 30, fat: 8 },
  { name: 'Eccles Cake', calories: 250, protein: 4, carbs: 35, fat: 10 },
  { name: 'Bakewell Tart', calories: 350, protein: 6, carbs: 45, fat: 16 },
  { name: 'Jam Roly-Poly', calories: 400, protein: 6, carbs: 60, fat: 15 },
  { name: 'Bread and Butter Pudding', calories: 450, protein: 10, carbs: 55, fat: 20 },
  { name: 'Rice Pudding', calories: 300, protein: 8, carbs: 50, fat: 8 },
  { name: 'Custard Tart', calories: 350, protein: 8, carbs: 45, fat: 15 },
  
  // ========== NIGERIAN FOODS ==========
  // Rice Dishes
  { name: 'Jollof Rice', calories: 450, protein: 12, carbs: 75, fat: 10 },
  { name: 'Coconut Rice', calories: 420, protein: 10, carbs: 70, fat: 12 },
  { name: 'Fried Rice', calories: 480, protein: 15, carbs: 72, fat: 14 },
  { name: 'Ofada Rice with Stew', calories: 550, protein: 18, carbs: 80, fat: 15 },
  { name: 'Bisi Bele Bath', calories: 500, protein: 15, carbs: 75, fat: 12 },
  
  // Soups and Stews
  { name: 'Egusi Soup', calories: 380, protein: 20, carbs: 15, fat: 28 },
  { name: 'Pepper Soup', calories: 250, protein: 25, carbs: 8, fat: 12 },
  { name: 'Bitterleaf Soup', calories: 320, protein: 18, carbs: 20, fat: 20 },
  { name: 'Okro Soup', calories: 280, protein: 15, carbs: 18, fat: 16 },
  { name: 'Ogbono Soup', calories: 350, protein: 22, carbs: 12, fat: 24 },
  { name: 'Efo Riro', calories: 300, protein: 18, carbs: 20, fat: 18 },
  { name: 'Edikaikong Soup', calories: 400, protein: 25, carbs: 25, fat: 22 },
  { name: 'Afang Soup', calories: 380, protein: 22, carbs: 22, fat: 20 },
  { name: 'Banga Soup', calories: 350, protein: 20, carbs: 18, fat: 20 },
  { name: 'Vegetable Soup', calories: 250, protein: 12, carbs: 25, fat: 12 },
  
  // Protein Dishes
  { name: 'Suya (Beef)', calories: 350, protein: 35, carbs: 8, fat: 18 },
  { name: 'Peppered Snail', calories: 200, protein: 25, carbs: 5, fat: 8 },
  { name: 'Peppered Fish', calories: 280, protein: 30, carbs: 5, fat: 15 },
  { name: 'Grilled Fish', calories: 250, protein: 28, carbs: 3, fat: 12 },
  { name: 'Fried Chicken (Nigerian Style)', calories: 450, protein: 35, carbs: 15, fat: 28 },
  { name: 'Asun (Spicy Goat Meat)', calories: 400, protein: 40, carbs: 5, fat: 22 },
  { name: 'Nkwobi (Spicy Cow Foot)', calories: 350, protein: 30, carbs: 8, fat: 20 },
  { name: 'Isi Ewu (Goat Head)', calories: 380, protein: 32, carbs: 5, fat: 24 },
  { name: 'Boli (Roasted Plantain)', calories: 300, protein: 3, carbs: 65, fat: 8 },
  { name: 'Plantain and Egg', calories: 350, protein: 15, carbs: 50, fat: 12 },
  
  // Swallows (Starchy Sides)
  { name: 'Fufu', calories: 200, protein: 2, carbs: 48, fat: 0 },
  { name: 'Pounded Yam', calories: 250, protein: 3, carbs: 58, fat: 1 },
  { name: 'Garri (Eba)', calories: 180, protein: 2, carbs: 42, fat: 1 },
  { name: 'Amala', calories: 220, protein: 4, carbs: 50, fat: 1 },
  { name: 'Tuwo Shinkafa', calories: 200, protein: 4, carbs: 45, fat: 1 },
  { name: 'Semo', calories: 190, protein: 3, carbs: 44, fat: 1 },
  
  // Snacks and Street Food
  { name: 'Akara (Bean Fritters)', calories: 250, protein: 12, carbs: 30, fat: 10 },
  { name: 'Moi Moi', calories: 200, protein: 15, carbs: 20, fat: 8 },
  { name: 'Puff Puff', calories: 180, protein: 4, carbs: 28, fat: 6 },
  { name: 'Chin Chin', calories: 200, protein: 3, carbs: 30, fat: 8 },
  { name: 'Buns', calories: 250, protein: 5, carbs: 40, fat: 8 },
  { name: 'Meat Pie', calories: 350, protein: 12, carbs: 35, fat: 18 },
  { name: 'Sausage Roll', calories: 300, protein: 10, carbs: 28, fat: 16 },
  { name: 'Egg Roll', calories: 280, protein: 12, carbs: 30, fat: 12 },
  { name: 'Doughnut', calories: 250, protein: 4, carbs: 35, fat: 10 },
  { name: 'Bread and Akara', calories: 400, protein: 18, carbs: 55, fat: 12 },
  
  // Breakfast
  { name: 'Pap (Ogi) with Akara', calories: 300, protein: 10, carbs: 50, fat: 8 },
  { name: 'Yam and Egg Sauce', calories: 400, protein: 15, carbs: 60, fat: 12 },
  { name: 'Yam Porridge', calories: 350, protein: 8, carbs: 65, fat: 8 },
  { name: 'Plantain Porridge', calories: 320, protein: 6, carbs: 58, fat: 10 },
  { name: 'Beans Porridge', calories: 380, protein: 20, carbs: 55, fat: 10 },
  
  // Drinks
  { name: 'Zobo (Hibiscus Drink)', calories: 80, protein: 1, carbs: 20, fat: 0 },
  { name: 'Tiger Nut Drink', calories: 150, protein: 3, carbs: 25, fat: 5 },
  { name: 'Kunu', calories: 120, protein: 2, carbs: 28, fat: 1 },
  { name: 'Palm Wine', calories: 200, protein: 1, carbs: 15, fat: 0 }
];

const workouts = [
  { type: 'running', label: 'Running', icon: '🏃' },
  { type: 'cycling', label: 'Cycling', icon: '🚴' },
  { type: 'weights', label: 'Weight Training', icon: '💪' },
  { type: 'hiit', label: 'HIIT', icon: '⚡' },
  { type: 'walking', label: 'Walking', icon: '🚶' },
  { type: 'swimming', label: 'Swimming', icon: '🏊' },
  { type: 'rest', label: 'Rest Day', icon: '😴' }
];

const fitnessGoals = [
  { value: 'fat_loss', label: 'Fat Loss' },
  { value: 'muscle_gain', label: 'Muscle Gain' },
  { value: 'endurance', label: 'Endurance' }
];

module.exports = {
  MET_VALUES,
  meals,
  workouts,
  fitnessGoals
};

