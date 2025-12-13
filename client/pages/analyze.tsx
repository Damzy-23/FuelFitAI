import { useState, useEffect, useRef, useMemo } from 'react';
import { useRouter } from 'next/router';
import Link from 'next/link';
import axios from 'axios';
import { useAuth } from '../contexts/AuthContext';
import { useToast } from '../contexts/ToastContext';
import Navbar from '../components/Navbar';
import SkeletonLoader from '../components/SkeletonLoader';
import VoiceButton from '../components/VoiceButton';
import VoiceAssistant from '../components/VoiceAssistant';

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

interface AnalysisResult {
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
    feedback: string[];
  };
  fuelScore: number;
  aiExplanation: {
    explanation: string;
    suggestion: string;
  };
}

export default function Analyze() {
  const { user, isAuthenticated, loading: authLoading } = useAuth();
  const { showToast } = useToast();
  const router = useRouter();
  const [mealName, setMealName] = useState('');
  const [selectedMeal, setSelectedMeal] = useState<Meal | null>(null);
  const [workoutType, setWorkoutType] = useState('');
  const [workoutDuration, setWorkoutDuration] = useState(30);
  const [fitnessGoal, setFitnessGoal] = useState(user?.fitnessGoal || 'fat_loss');
  const [presetMeals, setPresetMeals] = useState<Meal[]>([]);
  const [filteredMeals, setFilteredMeals] = useState<Meal[]>([]);
  const [workouts, setWorkouts] = useState<Workout[]>([]);
  const [result, setResult] = useState<AnalysisResult | null>(null);
  const [loading, setLoading] = useState(false);
  const [saving, setSaving] = useState(false);
  const [error, setError] = useState('');
  const [searchQuery, setSearchQuery] = useState('');
  const [filterCalories, setFilterCalories] = useState<{ min: number; max: number }>({ min: 0, max: 1000 });
  const [sortBy, setSortBy] = useState<'name' | 'calories' | 'protein'>('name');
  const [favorites, setFavorites] = useState<string[]>([]);
  const resultRef = useRef<HTMLDivElement>(null);

  // Memoize user context for VoiceAssistant to prevent unnecessary re-renders
  const userContext = useMemo(() => ({
    fitnessGoal: fitnessGoal,
    recentMeals: presetMeals.slice(0, 5).map(m => m.name)
  }), [fitnessGoal, presetMeals]);

  useEffect(() => {
    const fetchData = async () => {
      try {
        const [mealsRes, workoutsRes] = await Promise.all([
          axios.get(`${API_URL}/api/meals/presets`),
          axios.get(`${API_URL}/api/workouts`)
        ]);
        setPresetMeals(mealsRes.data);
        setFilteredMeals(mealsRes.data);
        setWorkouts(workoutsRes.data);
      } catch (error: any) {
        console.error('Error fetching data:', error);
        const errorMsg = error.response?.data?.error || error.message || 'Failed to load data';
        showToast(errorMsg, 'error');
        // Set empty arrays to prevent further errors
        setPresetMeals([]);
        setWorkouts([]);
      }
    };
    fetchData();
  }, [showToast]);

  useEffect(() => {
    if (user?.fitnessGoal) {
      setFitnessGoal(user.fitnessGoal);
    }
  }, [user]);

  useEffect(() => {
    let filtered = [...presetMeals];

    // Search filter
    if (searchQuery) {
      filtered = filtered.filter(meal =>
        meal.name.toLowerCase().includes(searchQuery.toLowerCase())
      );
    }

    // Calories filter
    filtered = filtered.filter(meal =>
      meal.calories >= filterCalories.min && meal.calories <= filterCalories.max
    );

    // Sort
    filtered.sort((a, b) => {
      switch (sortBy) {
        case 'calories':
          return a.calories - b.calories;
        case 'protein':
          return b.protein - a.protein;
        default:
          return a.name.localeCompare(b.name);
      }
    });

    setFilteredMeals(filtered);
  }, [presetMeals, searchQuery, filterCalories, sortBy]);

  useEffect(() => {
    if (isAuthenticated) {
      fetchFavorites();
    }
  }, [isAuthenticated]);

  const fetchFavorites = async () => {
    try {
      const token = localStorage.getItem('token');
      const response = await axios.get(`${API_URL}/api/meals/favorites`, {
        headers: { Authorization: `Bearer ${token}` }
      });
      if (response.data.success) {
        setFavorites(response.data.favorites.map((f: any) => f.mealName));
      }
    } catch (error) {
      console.error('Error fetching favorites:', error);
    }
  };

  const handleMealSelect = (meal: Meal) => {
    setSelectedMeal(meal);
    setMealName(meal.name);
  };

  const toggleFavorite = async (meal: Meal) => {
    if (!isAuthenticated) {
      showToast('Please login to favorite meals', 'info');
      return;
    }

    try {
      const token = localStorage.getItem('token');
      const isFavorite = favorites.includes(meal.name);

      if (isFavorite) {
        // Find and remove favorite
        const favResponse = await axios.get(`${API_URL}/api/meals/favorites`, {
          headers: { Authorization: `Bearer ${token}` }
        });
        const favorite = favResponse.data.favorites.find((f: any) => f.mealName === meal.name);
        if (favorite) {
          await axios.delete(`${API_URL}/api/meals/favorites/${favorite._id}`, {
            headers: { Authorization: `Bearer ${token}` }
          });
          setFavorites(favorites.filter(f => f !== meal.name));
          showToast('Removed from favorites', 'success');
        }
      } else {
        await axios.post(
          `${API_URL}/api/meals/favorites`,
          { mealName: meal.name, meal },
          { headers: { Authorization: `Bearer ${token}` } }
        );
        setFavorites([...favorites, meal.name]);
        showToast('Added to favorites', 'success');
      }
    } catch (error: any) {
      showToast(error.response?.data?.error || 'Failed to update favorites', 'error');
    }
  };

  const handleAnalyze = async () => {
    if (!mealName || !workoutType || !fitnessGoal) {
      setError('Please fill in all fields');
      return;
    }

    setLoading(true);
    setError('');
    setResult(null);

    try {
      const headers: any = {};
      if (isAuthenticated && user) {
        const token = localStorage.getItem('token');
        if (token) {
          headers.Authorization = `Bearer ${token}`;
        }
      }

      const response = await axios.post(
        `${API_URL}/api/analyze`,
        {
          mealName,
          workoutType,
          workoutDuration,
          fitnessGoal
        },
        { headers }
      );
      const analysisResult = response.data;
      setResult(analysisResult);
      showToast('Meal analyzed successfully!', 'success');
    } catch (err: any) {
      const errorMsg = err.response?.data?.error || 'Failed to analyze meal';
      setError(errorMsg);
      showToast(errorMsg, 'error');
    } finally {
      setLoading(false);
    }
  };

  const handleSaveMeal = async () => {
    if (!result || !isAuthenticated) {
      showToast('Please login to save meals', 'info');
      return;
    }

    setSaving(true);
    try {
      const token = localStorage.getItem('token');
      await axios.post(
        `${API_URL}/api/meals/save`,
        {
          mealName: result.meal.name,
          meal: result.meal,
          workoutType,
          workoutDuration,
          fitnessGoal,
          workoutCost: result.workoutCost,
          macroMatch: result.macroMatch,
          fuelScore: result.fuelScore,
          aiExplanation: result.aiExplanation
        },
        {
          headers: { Authorization: `Bearer ${token}` }
        }
      );
      showToast('Meal saved to history!', 'success');
    } catch (err: any) {
      showToast(err.response?.data?.error || 'Failed to save meal', 'error');
    } finally {
      setSaving(false);
    }
  };

  const exportAsImage = () => {
    if (!result) return;

    // Create a formatted text file with all results
    const exportText = `╔═══════════════════════════════════════╗
║      FuelFit AI - Meal Analysis      ║
╚═══════════════════════════════════════╝

🍽️  MEAL: ${result.meal.name}
⭐  FuelScore: ${result.fuelScore}/10

📊 NUTRITION:
   Calories: ${result.meal.calories} kcal
   Protein: ${result.macroMatch.protein.grams}g (Target: ${result.macroMatch.protein.target}g)
   Carbs: ${result.macroMatch.carbs.grams}g (Target: ${result.macroMatch.carbs.target}g)
   Fat: ${result.macroMatch.fat.grams}g (Target: ${result.macroMatch.fat.target}g)

${result.workoutCost.minutes 
  ? `⏱️  WORKOUT COST: ${result.workoutCost.minutes} minutes of ${result.workoutCost.workoutLabel}\n` 
  : '😴 REST DAY - No workout cost\n'}

🤖 AI COACH EXPLANATION:
${result.aiExplanation.explanation}

${result.aiExplanation.suggestion ? `💡 SUGGESTION:\n${result.aiExplanation.suggestion}\n` : ''}

Generated by FuelFit AI 🚀
${new Date().toLocaleString()}`;

    const blob = new Blob([exportText], { type: 'text/plain' });
    const url = URL.createObjectURL(blob);
    const link = document.createElement('a');
    link.download = `fuelfit-${result.meal.name.replace(/\s+/g, '-')}-${result.fuelScore}.txt`;
    link.href = url;
    link.click();
    URL.revokeObjectURL(url);
    
    showToast('Results exported successfully!', 'success');
  };

  const handleShareResults = async () => {
    if (!result) return;

    const shareText = `🍽️ ${result.meal.name} - FuelScore: ${result.fuelScore}/10\n\n` +
      `📊 Calories: ${result.meal.calories} kcal\n` +
      `💪 Protein: ${result.macroMatch.protein.grams}g | Carbs: ${result.macroMatch.carbs.grams}g | Fat: ${result.macroMatch.fat.grams}g\n` +
      (result.workoutCost.minutes 
        ? `⏱️ Workout Cost: ${result.workoutCost.minutes} min of ${result.workoutCost.workoutLabel}\n` 
        : '') +
      `\nAnalyzed with FuelFit AI 🚀\n` +
      `#FuelFitAI #Nutrition #Fitness`;

    const shareData = {
      title: `${result.meal.name} - FuelScore ${result.fuelScore}/10`,
      text: shareText,
      url: window.location.href
    };

    try {
      if (navigator.share && navigator.canShare && navigator.canShare(shareData)) {
        await navigator.share(shareData);
        showToast('Results shared successfully!', 'success');
      } else {
        // Fallback: Copy to clipboard
        await navigator.clipboard.writeText(shareText);
        showToast('Results copied to clipboard!', 'success');
      }
    } catch (error: any) {
      if (error.name !== 'AbortError') {
        // Fallback: Copy to clipboard
        try {
          await navigator.clipboard.writeText(shareText);
          showToast('Results copied to clipboard!', 'success');
        } catch (clipboardError) {
          showToast('Failed to share results', 'error');
        }
      }
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

  const getGoalLabel = (goal: string) => {
    switch (goal) {
      case 'fat_loss': return 'Fat Loss';
      case 'muscle_gain': return 'Muscle Gain';
      case 'endurance': return 'Endurance';
      default: return goal;
    }
  };

  if (authLoading) {
    return (
      <div className="page-loading">
        <div className="loading">Loading...</div>
      </div>
    );
  }

  return (
    <div className="analyze-page">
      <Navbar />
      <div className="container">
        <div className="page-header">
          <h1 className="page-title">Analyze Your Meal</h1>
          <p className="page-subtitle">Get instant insights on how your meal impacts your workout</p>
        </div>

        <div className="card">
          <div className="input-group">
            <label className="label">Enter Meal Name</label>
            <input
              type="text"
              className="input"
              placeholder="e.g., chicken and rice"
              value={mealName}
              onChange={(e) => setMealName(e.target.value)}
            />
          </div>

          <div className="input-group">
            <label className="label">Or Select a Preset Meal</label>
            {presetMeals.length === 0 ? (
              <SkeletonLoader type="text" count={5} height="40px" />
            ) : (
              <>
                <div style={{ display: 'flex', gap: '0.5rem', marginBottom: '1rem', flexWrap: 'wrap' }}>
                  <input
                    type="text"
                    className="input"
                    placeholder="🔍 Search meals..."
                    value={searchQuery}
                    onChange={(e) => setSearchQuery(e.target.value)}
                    style={{ flex: 1, minWidth: '200px' }}
                  />
                  <select
                    className="select"
                    value={sortBy}
                    onChange={(e) => setSortBy(e.target.value as 'name' | 'calories' | 'protein')}
                    style={{ minWidth: '150px' }}
                  >
                    <option value="name">Sort by Name</option>
                    <option value="calories">Sort by Calories</option>
                    <option value="protein">Sort by Protein</option>
                  </select>
                </div>
                <div style={{ marginBottom: '1rem' }}>
                  <label style={{ color: 'rgba(255,255,255,0.8)', fontSize: '0.9rem', marginBottom: '0.5rem', display: 'block' }}>
                    Calories: {filterCalories.min} - {filterCalories.max} kcal
                  </label>
                  <div style={{ display: 'flex', gap: '1rem', alignItems: 'center' }}>
                    <input
                      type="range"
                      min="0"
                      max="1000"
                      value={filterCalories.min}
                      onChange={(e) => setFilterCalories({ ...filterCalories, min: Number(e.target.value) })}
                      style={{ flex: 1 }}
                    />
                    <input
                      type="range"
                      min="0"
                      max="1000"
                      value={filterCalories.max}
                      onChange={(e) => setFilterCalories({ ...filterCalories, max: Number(e.target.value) })}
                      style={{ flex: 1 }}
                    />
                  </div>
                </div>
                <div className="preset-meals">
                  {filteredMeals.length === 0 ? (
                    <div style={{ textAlign: 'center', padding: '2rem', color: 'rgba(255,255,255,0.7)' }}>
                      No meals found matching your filters
                    </div>
                  ) : (
                    filteredMeals.map((meal) => (
                      <div
                        key={meal.name}
                        className={`preset-meal ${selectedMeal?.name === meal.name ? 'selected' : ''}`}
                        onClick={() => handleMealSelect(meal)}
                        style={{ position: 'relative' }}
                      >
                        {meal.name}
                        {isAuthenticated && (
                          <button
                            onClick={(e) => {
                              e.stopPropagation();
                              toggleFavorite(meal);
                            }}
                            style={{
                              position: 'absolute',
                              top: '0.5rem',
                              right: '0.5rem',
                              background: 'transparent',
                              border: 'none',
                              fontSize: '1.2rem',
                              cursor: 'pointer',
                              padding: '0.25rem'
                            }}
                            title={favorites.includes(meal.name) ? 'Remove from favorites' : 'Add to favorites'}
                          >
                            {favorites.includes(meal.name) ? '⭐' : '☆'}
                          </button>
                        )}
                      </div>
                    ))
                  )}
                </div>
              </>
            )}
          </div>

          <div className="input-group">
            <label className="label">Select Workout Type</label>
            {workouts.length === 0 ? (
              <SkeletonLoader type="card" count={7} height="100px" />
            ) : (
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
            )}
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
            onClick={handleAnalyze}
            disabled={loading || !mealName || !workoutType}
            style={{ position: 'relative' }}
          >
            <span style={{ position: 'relative', zIndex: 1 }}>
              {loading ? (
                <span style={{ display: 'flex', alignItems: 'center', justifyContent: 'center', gap: '0.5rem' }}>
                  <span style={{ 
                    width: '16px', 
                    height: '16px', 
                    border: '2px solid rgba(255,255,255,0.3)', 
                    borderTop: '2px solid white',
                    borderRadius: '50%',
                    animation: 'spin 0.8s linear infinite',
                    display: 'inline-block'
                  }}></span>
                  Analyzing...
                </span>
              ) : (
                'Analyze Meal'
              )}
            </span>
          </button>

          {error && <div className="error">{error}</div>}
        </div>

        {result && (
          <div ref={resultRef} className="result-section" style={{ animation: 'fadeInUp 0.6s ease-out' }}>
            <div className="fuel-score">
              <div className="score-label">{getGoalLabel(fitnessGoal)} FuelScore</div>
              <div className="score-value">{result.fuelScore}/10</div>
              <div style={{ display: 'flex', gap: '0.5rem', marginTop: '1rem', flexWrap: 'wrap', justifyContent: 'center' }}>
                {isAuthenticated && (
                  <button
                    onClick={handleSaveMeal}
                    disabled={saving}
                    className="save-meal-button"
                  >
                    {saving ? 'Saving...' : '💾 Save to History'}
                  </button>
                )}
                <button
                  onClick={() => handleShareResults()}
                  className="share-button"
                  style={{
                    background: 'linear-gradient(135deg, #667eea 0%, #764ba2 100%)',
                    border: 'none',
                    color: 'white',
                    padding: '0.75rem 1.5rem',
                    borderRadius: '12px',
                    cursor: 'pointer',
                    fontWeight: '600',
                    fontSize: '0.9rem',
                    transition: 'transform 0.2s, box-shadow 0.2s'
                  }}
                >
                  📤 Share Results
                </button>
                <button
                  onClick={exportAsImage}
                  className="export-button"
                  style={{
                    background: 'linear-gradient(135deg, #10b981 0%, #059669 100%)',
                    border: 'none',
                    color: 'white',
                    padding: '0.75rem 1.5rem',
                    borderRadius: '12px',
                    cursor: 'pointer',
                    fontWeight: '600',
                    fontSize: '0.9rem',
                    transition: 'transform 0.2s, box-shadow 0.2s',
                    boxShadow: 'var(--shadow-md)'
                  }}
                >
                  💾 Export Results
                </button>
              </div>
            </div>

            <div className="card" style={{ animation: 'scaleIn 0.5s ease-out' }}>
              <div className="workout-cost">
                <div className="cost-title">Workout Cost</div>
                {result.workoutCost.minutes ? (
                  <>
                    <div className="cost-value">
                      {result.workoutCost.workoutLabel} = {result.workoutCost.minutes} minutes
                    </div>
                    <p>You need {result.workoutCost.minutes} minutes of {result.workoutCost.workoutLabel.toLowerCase()} to burn this meal.</p>
                  </>
                ) : (
                  <p>Rest day - no workout cost</p>
                )}
              </div>

              <div className="macro-section">
                <div className="macro-card">
                  <div className="macro-name">Protein</div>
                  <div className="macro-value">{result.macroMatch.protein.grams}g</div>
                  <div className={`macro-status ${getStatusClass(result.macroMatch.protein.status)}`}>
                    {result.macroMatch.protein.status}
                  </div>
                  <div style={{ fontSize: '0.85rem', color: '#666', marginTop: '0.5rem' }}>
                    Target: {result.macroMatch.protein.target}g
                  </div>
                </div>

                <div className="macro-card">
                  <div className="macro-name">Carbs</div>
                  <div className="macro-value">{result.macroMatch.carbs.grams}g</div>
                  <div className={`macro-status ${getStatusClass(result.macroMatch.carbs.status)}`}>
                    {result.macroMatch.carbs.status}
                  </div>
                  <div style={{ fontSize: '0.85rem', color: '#666', marginTop: '0.5rem' }}>
                    Target: {result.macroMatch.carbs.target}g
                  </div>
                </div>

                <div className="macro-card">
                  <div className="macro-name">Fat</div>
                  <div className="macro-value">{result.macroMatch.fat.grams}g</div>
                  <div className={`macro-status ${getStatusClass(result.macroMatch.fat.status)}`}>
                    {result.macroMatch.fat.status}
                  </div>
                  <div style={{ fontSize: '0.85rem', color: '#666', marginTop: '0.5rem' }}>
                    Target: {result.macroMatch.fat.target}g
                  </div>
                </div>
              </div>

              <div className="ai-explanation">
                <div className="ai-title">
                  🤖 AI Coach Explanation
                  <VoiceButton 
                    text={`${result.aiExplanation.explanation}${result.aiExplanation.suggestion ? ` ${result.aiExplanation.suggestion}` : ''}`}
                    size="small"
                    className="voice-button-inline"
                  />
                </div>
                <div className="ai-text">{result.aiExplanation.explanation}</div>
                {result.aiExplanation.suggestion && (
                  <div className="suggestion">
                    <div className="suggestion-title">
                      💡 Smart Suggestion
                      <VoiceButton 
                        text={result.aiExplanation.suggestion}
                        size="small"
                        className="voice-button-inline"
                      />
                    </div>
                    <div>{result.aiExplanation.suggestion}</div>
                  </div>
                )}
              </div>
            </div>
          </div>
        )}

        {/* Voice Assistant Section */}
        <VoiceAssistant 
          userContext={userContext}
        />
      </div>
    </div>
  );
}

