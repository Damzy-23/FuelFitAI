import { useState, useEffect } from 'react';
import { useRouter } from 'next/router';
import { useAuth } from '../contexts/AuthContext';
import { useToast } from '../contexts/ToastContext';
import Navbar from '../components/Navbar';
import Link from 'next/link';
import axios from 'axios';

const API_URL = process.env.NEXT_PUBLIC_API_URL || 'http://localhost:3030';

interface Meal {
  name: string;
  calories: number;
  protein: number;
  carbs: number;
  fat: number;
}

interface Workout {
  type: string;
  label: string;
  icon: string;
}

interface ComparisonResult {
  meal: Meal;
  workoutCost: {
    minutes: number | null;
    workoutLabel: string;
    message: string;
  };
  macroMatch: {
    protein: { grams: number; target: number; score: number; status: string };
    carbs: { grams: number; target: number; score: number; status: string };
    fat: { grams: number; target: number; score: number; status: string };
    overallScore: number;
  };
  fuelScore: number;
}

export default function Compare() {
  const { user, isAuthenticated, loading: authLoading } = useAuth();
  const { showToast } = useToast();
  const router = useRouter();
  const [meal1Name, setMeal1Name] = useState('');
  const [meal2Name, setMeal2Name] = useState('');
  const [selectedMeal1, setSelectedMeal1] = useState<Meal | null>(null);
  const [selectedMeal2, setSelectedMeal2] = useState<Meal | null>(null);
  const [workoutType, setWorkoutType] = useState('rest');
  const [workoutDuration, setWorkoutDuration] = useState(30);
  const [fitnessGoal, setFitnessGoal] = useState(user?.fitnessGoal || 'fat_loss');
  const [presetMeals, setPresetMeals] = useState<Meal[]>([]);
  const [workouts, setWorkouts] = useState<Workout[]>([]);
  const [result1, setResult1] = useState<ComparisonResult | null>(null);
  const [result2, setResult2] = useState<ComparisonResult | null>(null);
  const [loading, setLoading] = useState(false);
  const [comparing, setComparing] = useState(false);

  useEffect(() => {
    const fetchData = async () => {
      try {
        const [mealsRes, workoutsRes] = await Promise.all([
          axios.get(`${API_URL}/api/meals/presets`),
          axios.get(`${API_URL}/api/workouts`)
        ]);
        setPresetMeals(mealsRes.data);
        setWorkouts(workoutsRes.data);
      } catch (error: any) {
        console.error('Error fetching data:', error);
        showToast('Failed to load data', 'error');
      }
    };
    fetchData();
  }, [showToast]);

  useEffect(() => {
    if (user?.fitnessGoal) {
      setFitnessGoal(user.fitnessGoal);
    }
  }, [user]);

  const handleMealSelect = (meal: Meal, mealNumber: 1 | 2) => {
    if (mealNumber === 1) {
      setSelectedMeal1(meal);
      setMeal1Name(meal.name);
    } else {
      setSelectedMeal2(meal);
      setMeal2Name(meal.name);
    }
  };

  const handleCompare = async () => {
    if (!meal1Name || !meal2Name || !workoutType || !fitnessGoal) {
      showToast('Please fill in all fields', 'error');
      return;
    }

    setComparing(true);
    setLoading(true);
    setResult1(null);
    setResult2(null);

    try {
      const headers: any = {};
      if (isAuthenticated && user) {
        const token = localStorage.getItem('token');
        if (token) {
          headers.Authorization = `Bearer ${token}`;
        }
      }

      const [response1, response2] = await Promise.all([
        axios.post(
          `${API_URL}/api/analyze`,
          {
            mealName: meal1Name,
            workoutType,
            workoutDuration,
            fitnessGoal
          },
          { headers }
        ),
        axios.post(
          `${API_URL}/api/analyze`,
          {
            mealName: meal2Name,
            workoutType,
            workoutDuration,
            fitnessGoal
          },
          { headers }
        )
      ]);

      setResult1(response1.data);
      setResult2(response2.data);
      showToast('Meals compared successfully!', 'success');
    } catch (err: any) {
      const errorMsg = err.response?.data?.error || 'Failed to compare meals';
      showToast(errorMsg, 'error');
    } finally {
      setLoading(false);
      setComparing(false);
    }
  };

  const getStatusClass = (status: string) => {
    switch (status) {
      case 'good': return 'status-good';
      case 'ok': return 'status-ok';
      case 'low': return 'status-low';
      case 'high': return 'status-high';
      default: return '';
    }
  };

  const getWinner = () => {
    if (!result1 || !result2) return null;
    if (result1.fuelScore > result2.fuelScore) return 1;
    if (result2.fuelScore > result1.fuelScore) return 2;
    return 0; // Tie
  };

  if (authLoading) {
    return (
      <div className="page-loading">
        <div className="loading">Loading...</div>
      </div>
    );
  }

  const winner = getWinner();

  return (
    <div className="compare-page">
      <Navbar />
      <div className="container">
        <div className="page-header">
          <h1 className="page-title">⚖️ Compare Meals</h1>
          <p className="page-subtitle">See which meal is better for your fitness goals</p>
        </div>

        <div className="card">
          <div className="compare-inputs">
            <div className="compare-input-group">
              <label className="label">Meal 1</label>
              <input
                type="text"
                className="input"
                placeholder="e.g., chicken and rice"
                value={meal1Name}
                onChange={(e) => setMeal1Name(e.target.value)}
              />
              <div className="preset-meals-small">
                {presetMeals.slice(0, Math.ceil(presetMeals.length / 2)).map((meal) => (
                  <div
                    key={meal.name}
                    className={`preset-meal-small ${selectedMeal1?.name === meal.name ? 'selected' : ''}`}
                    onClick={() => handleMealSelect(meal, 1)}
                  >
                    {meal.name}
                  </div>
                ))}
              </div>
            </div>

            <div className="vs-divider">VS</div>

            <div className="compare-input-group">
              <label className="label">Meal 2</label>
              <input
                type="text"
                className="input"
                placeholder="e.g., burger"
                value={meal2Name}
                onChange={(e) => setMeal2Name(e.target.value)}
              />
              <div className="preset-meals-small">
                {presetMeals.slice(Math.ceil(presetMeals.length / 2)).map((meal) => (
                  <div
                    key={meal.name}
                    className={`preset-meal-small ${selectedMeal2?.name === meal.name ? 'selected' : ''}`}
                    onClick={() => handleMealSelect(meal, 2)}
                  >
                    {meal.name}
                  </div>
                ))}
              </div>
            </div>
          </div>

          <div className="input-group">
            <label className="label">Select Workout Type</label>
            <div className="workout-grid">
              {workouts.map((workout) => (
                <div
                  key={workout.type}
                  className={`workout-card ${workoutType === workout.type ? 'selected' : ''}`}
                  onClick={() => setWorkoutType(workout.type)}
                >
                  <div className="workout-icon">{workout.icon}</div>
                  <div className="workout-label">{workout.label}</div>
                </div>
              ))}
            </div>
          </div>

          {workoutType && workoutType !== 'rest' && (
            <div className="input-group">
              <label className="label">Workout Duration (minutes)</label>
              <input
                type="number"
                className="input"
                min="5"
                max="180"
                value={workoutDuration}
                onChange={(e) => setWorkoutDuration(Number(e.target.value))}
              />
            </div>
          )}

          <div className="input-group">
            <label className="label">Fitness Goal</label>
            <select
              className="select"
              value={fitnessGoal}
              onChange={(e) => setFitnessGoal(e.target.value)}
            >
              <option value="fat_loss">Fat Loss</option>
              <option value="muscle_gain">Muscle Gain</option>
              <option value="endurance">Endurance</option>
            </select>
          </div>

          <button
            className="button"
            onClick={handleCompare}
            disabled={loading || !meal1Name || !meal2Name}
            style={{ width: '100%', marginTop: '1.5rem' }}
          >
            {loading ? 'Comparing...' : '⚖️ Compare Meals'}
          </button>
        </div>

        {(result1 && result2) && (
          <div className="comparison-results" style={{ animation: 'fadeInUp 0.6s ease-out', marginTop: '2rem' }}>
            <div className="comparison-header">
              <h2 style={{ textAlign: 'center', color: 'white', marginBottom: '1rem' }}>
                Comparison Results
              </h2>
              {winner !== null && (
                <div className="winner-badge" style={{
                  textAlign: 'center',
                  padding: '1rem',
                  background: winner === 0 
                    ? 'rgba(255, 255, 255, 0.2)' 
                    : winner === 1 
                    ? 'rgba(16, 185, 129, 0.3)' 
                    : 'rgba(16, 185, 129, 0.3)',
                  borderRadius: '12px',
                  marginBottom: '2rem',
                  color: 'white',
                  fontWeight: '600'
                }}>
                  {winner === 0 
                    ? '🤝 It\'s a tie! Both meals score equally.' 
                    : `🏆 Winner: Meal ${winner} - ${winner === 1 ? result1.meal.name : result2.meal.name}`}
                </div>
              )}
            </div>

            <div className="comparison-grid">
              <div className={`comparison-card ${winner === 1 ? 'winner' : ''}`}>
                <div className="comparison-meal-name">{result1.meal.name}</div>
                <div className="comparison-score">
                  <div className="score-label">FuelScore</div>
                  <div className="score-value-large">{result1.fuelScore.toFixed(1)}/10</div>
                </div>
                
                <div className="comparison-details">
                  <div className="detail-item">
                    <span className="detail-label">Calories:</span>
                    <span className="detail-value">{result1.meal.calories} kcal</span>
                  </div>
                  <div className="detail-item">
                    <span className="detail-label">Protein:</span>
                    <span className="detail-value">{result1.macroMatch.protein.grams}g</span>
                  </div>
                  <div className="detail-item">
                    <span className="detail-label">Carbs:</span>
                    <span className="detail-value">{result1.macroMatch.carbs.grams}g</span>
                  </div>
                  <div className="detail-item">
                    <span className="detail-label">Fat:</span>
                    <span className="detail-value">{result1.macroMatch.fat.grams}g</span>
                  </div>
                  {result1.workoutCost.minutes && (
                    <div className="detail-item">
                      <span className="detail-label">Workout Cost:</span>
                      <span className="detail-value">
                        {result1.workoutCost.minutes} min
                      </span>
                    </div>
                  )}
                </div>
              </div>

              <div className={`comparison-card ${winner === 2 ? 'winner' : ''}`}>
                <div className="comparison-meal-name">{result2.meal.name}</div>
                <div className="comparison-score">
                  <div className="score-label">FuelScore</div>
                  <div className="score-value-large">{result2.fuelScore.toFixed(1)}/10</div>
                </div>
                
                <div className="comparison-details">
                  <div className="detail-item">
                    <span className="detail-label">Calories:</span>
                    <span className="detail-value">{result2.meal.calories} kcal</span>
                  </div>
                  <div className="detail-item">
                    <span className="detail-label">Protein:</span>
                    <span className="detail-value">{result2.macroMatch.protein.grams}g</span>
                  </div>
                  <div className="detail-item">
                    <span className="detail-label">Carbs:</span>
                    <span className="detail-value">{result2.macroMatch.carbs.grams}g</span>
                  </div>
                  <div className="detail-item">
                    <span className="detail-label">Fat:</span>
                    <span className="detail-value">{result2.macroMatch.fat.grams}g</span>
                  </div>
                  {result2.workoutCost.minutes && (
                    <div className="detail-item">
                      <span className="detail-label">Workout Cost:</span>
                      <span className="detail-value">
                        {result2.workoutCost.minutes} min
                      </span>
                    </div>
                  )}
                </div>
              </div>
            </div>
          </div>
        )}
      </div>
    </div>
  );
}

