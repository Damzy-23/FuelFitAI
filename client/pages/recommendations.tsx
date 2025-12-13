import { useState, useEffect } from 'react';
import { useRouter } from 'next/router';
import { useAuth } from '../contexts/AuthContext';
import { useToast } from '../contexts/ToastContext';
import Navbar from '../components/Navbar';
import SkeletonLoader from '../components/SkeletonLoader';
import EmptyState from '../components/EmptyState';
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

interface Recommendation {
  meal: Meal;
  fuelScore: number;
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
  triedBefore: boolean;
  recommendation: 'excellent' | 'good' | 'fair';
}

interface Workout {
  type: string;
  label: string;
  icon: string;
}

export default function Recommendations() {
  const { user, isAuthenticated, loading: authLoading } = useAuth();
  const { showToast } = useToast();
  const router = useRouter();
  const [recommendations, setRecommendations] = useState<Recommendation[]>([]);
  const [loading, setLoading] = useState(true);
  const [workoutType, setWorkoutType] = useState('rest');
  const [fitnessGoal, setFitnessGoal] = useState(user?.fitnessGoal || 'fat_loss');
  const [workouts, setWorkouts] = useState<Workout[]>([]);

  useEffect(() => {
    if (!authLoading && !isAuthenticated) {
      router.push('/login');
    }
  }, [isAuthenticated, authLoading, router]);

  useEffect(() => {
    if (user?.fitnessGoal) {
      setFitnessGoal(user.fitnessGoal);
    }
  }, [user]);

  useEffect(() => {
    const fetchWorkouts = async () => {
      try {
        const response = await axios.get(`${API_URL}/api/workouts`);
        setWorkouts(response.data);
      } catch (error) {
        console.error('Error fetching workouts:', error);
      }
    };
    fetchWorkouts();
  }, []);

  useEffect(() => {
    if (isAuthenticated && user) {
      fetchRecommendations();
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [isAuthenticated, workoutType, fitnessGoal, user]);

  const fetchRecommendations = async () => {
    setLoading(true);
    try {
      const token = localStorage.getItem('token');
      const response = await axios.get(
        `${API_URL}/api/meals/recommendations?workoutType=${workoutType}&fitnessGoal=${fitnessGoal}`,
        {
          headers: { Authorization: `Bearer ${token}` }
        }
      );

      if (response.data.success) {
        setRecommendations(response.data.recommendations || []);
      } else {
        setRecommendations([]);
      }
    } catch (error: any) {
      console.error('Error fetching recommendations:', error);
      showToast(error.response?.data?.error || 'Failed to load recommendations', 'error');
      setRecommendations([]);
    } finally {
      setLoading(false);
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

  const getRecommendationBadge = (rec: string) => {
    switch (rec) {
      case 'excellent':
        return { text: '⭐ Excellent', color: '#10b981' };
      case 'good':
        return { text: '👍 Good', color: '#3b82f6' };
      default:
        return { text: '✓ Fair', color: '#f59e0b' };
    }
  };

  if (authLoading || loading) {
    return (
      <div className="page-loading">
        <Navbar />
        <div className="container">
          <SkeletonLoader type="card" count={3} />
        </div>
      </div>
    );
  }

  return (
    <div className="recommendations-page">
      <Navbar />
      <div className="container">
        <div className="page-header">
          <h1 className="page-title">🍽️ Meal Recommendations</h1>
          <p className="page-subtitle">AI-powered meal suggestions tailored to your goals</p>
        </div>

        <div className="card" style={{ marginBottom: '2rem' }}>
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
        </div>

        {recommendations.length > 0 ? (
          <div className="recommendations-grid">
            {recommendations.map((rec, index) => {
              const badge = getRecommendationBadge(rec.recommendation);
              return (
                <div key={index} className="recommendation-card">
                  <div className="recommendation-header">
                    <h3 className="recommendation-meal-name">{rec.meal.name}</h3>
                    <div
                      className="recommendation-badge"
                      style={{
                        background: badge.color,
                        color: 'white',
                        padding: '0.25rem 0.75rem',
                        borderRadius: '20px',
                        fontSize: '0.85rem',
                        fontWeight: '600'
                      }}
                    >
                      {badge.text}
                    </div>
                  </div>

                  <div className="recommendation-score">
                    <div className="score-label">FuelScore</div>
                    <div className="score-value-large">{rec.fuelScore.toFixed(1)}/10</div>
                  </div>

                  <div className="recommendation-details">
                    <div className="detail-row">
                      <span className="detail-label">Calories:</span>
                      <span className="detail-value">{rec.meal.calories} kcal</span>
                    </div>
                    <div className="detail-row">
                      <span className="detail-label">Protein:</span>
                      <span className="detail-value">{rec.meal.protein}g</span>
                    </div>
                    <div className="detail-row">
                      <span className="detail-label">Carbs:</span>
                      <span className="detail-value">{rec.meal.carbs}g</span>
                    </div>
                    <div className="detail-row">
                      <span className="detail-label">Fat:</span>
                      <span className="detail-value">{rec.meal.fat}g</span>
                    </div>
                    {rec.workoutCost.minutes && (
                      <div className="detail-row">
                        <span className="detail-label">Workout Cost:</span>
                        <span className="detail-value">
                          {rec.workoutCost.minutes} min {rec.workoutCost.workoutLabel}
                        </span>
                      </div>
                    )}
                  </div>

                  <div className="recommendation-actions">
                    <Link
                      href={`/analyze?meal=${encodeURIComponent(rec.meal.name)}&workout=${workoutType}&goal=${fitnessGoal}`}
                      className="button"
                    >
                      Analyze This Meal
                    </Link>
                  </div>

                  {rec.triedBefore && (
                    <div style={{
                      marginTop: '0.5rem',
                      fontSize: '0.85rem',
                      color: '#666',
                      fontStyle: 'italic'
                    }}>
                      You've tried this meal before
                    </div>
                  )}
                </div>
              );
            })}
          </div>
        ) : (
          <EmptyState
            icon="💡"
            title="No Recommendations Found"
            description="We couldn't generate recommendations based on your current settings. Try analyzing more meals!"
            actionLabel="Analyze a Meal"
            actionHref="/analyze"
          />
        )}
      </div>
    </div>
  );
}

