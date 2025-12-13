import { useState, useEffect } from 'react';
import { useRouter } from 'next/router';
import { useAuth } from '../contexts/AuthContext';
import { useToast } from '../contexts/ToastContext';
import Navbar from '../components/Navbar';
import SkeletonLoader from '../components/SkeletonLoader';
import Link from 'next/link';
import axios from 'axios';

const API_URL = process.env.NEXT_PUBLIC_API_URL || 'http://localhost:3030';

interface MealHistoryItem {
  _id: string;
  mealName: string;
  meal: {
    name: string;
    calories: number;
    protein: number;
    carbs: number;
    fat: number;
  };
  workoutType: string;
  fitnessGoal: string;
  fuelScore: number;
  createdAt: string;
}

export default function History() {
  const { isAuthenticated, loading: authLoading } = useAuth();
  const { showToast } = useToast();
  const router = useRouter();
  const [history, setHistory] = useState<MealHistoryItem[]>([]);
  const [loading, setLoading] = useState(true);
  const [page, setPage] = useState(1);
  const [totalPages, setTotalPages] = useState(1);

  useEffect(() => {
    if (!authLoading && !isAuthenticated) {
      router.push('/login');
    }
  }, [isAuthenticated, authLoading, router]);

  useEffect(() => {
    if (isAuthenticated) {
      fetchHistory();
    }
  }, [isAuthenticated, page]);

  const fetchHistory = async () => {
    try {
      const token = localStorage.getItem('token');
      if (!token) {
        showToast('Please login to view meal history', 'error');
        router.push('/login');
        return;
      }

      const response = await axios.get(`${API_URL}/api/meals/history?page=${page}&limit=10`, {
        headers: { Authorization: `Bearer ${token}` }
      });

      if (response.data.success) {
        setHistory(response.data.mealHistory);
        setTotalPages(response.data.pagination.pages);
      }
    } catch (error: any) {
      console.error('History fetch error:', error);
      const errorMsg = error.response?.data?.error || error.message || 'Failed to load meal history';
      showToast(errorMsg, 'error');
      
      // If unauthorized, redirect to login
      if (error.response?.status === 401) {
        router.push('/login');
      }
    } finally {
      setLoading(false);
    }
  };

  const handleDelete = async (id: string) => {
    if (!confirm('Are you sure you want to delete this meal?')) return;

    try {
      const token = localStorage.getItem('token');
      await axios.delete(`${API_URL}/api/meals/history/${id}`, {
        headers: { Authorization: `Bearer ${token}` }
      });
      showToast('Meal deleted successfully', 'success');
      fetchHistory();
    } catch (error: any) {
      showToast('Failed to delete meal', 'error');
    }
  };

  const getWorkoutIcon = (type: string) => {
    const icons: Record<string, string> = {
      running: '🏃',
      cycling: '🚴',
      weights: '💪',
      hiit: '⚡',
      walking: '🚶',
      swimming: '🏊',
      rest: '😴'
    };
    return icons[type] || '🏋️';
  };

  const formatDate = (dateString: string) => {
    const date = new Date(dateString);
    return date.toLocaleDateString('en-US', { 
      month: 'short', 
      day: 'numeric', 
      year: 'numeric',
      hour: '2-digit',
      minute: '2-digit'
    });
  };

  if (authLoading || loading) {
    return (
      <div className="page-loading">
        <div className="loading">Loading...</div>
      </div>
    );
  }

  if (!isAuthenticated) {
    return null;
  }

  return (
    <div className="history-page">
      <Navbar />
      <div className="container">
        <div className="page-header">
          <h1 className="page-title">Meal History</h1>
          <p className="page-subtitle">View and manage your analyzed meals</p>
        </div>

        {history.length === 0 ? (
          <div className="empty-state">
            <div className="empty-icon">📝</div>
            <h2 className="empty-title">No meals analyzed yet</h2>
            <p className="empty-description">
              Start analyzing meals to see them here. Your meal history helps you track your nutrition journey.
            </p>
            <Link href="/analyze" className="empty-button">
              Analyze Your First Meal
            </Link>
          </div>
        ) : (
          <>
            <div className="history-grid">
              {history.map((item) => (
                <div key={item._id} className="history-card">
                  <div className="history-header">
                    <div className="history-meal-info">
                      <h3 className="history-meal-name">{item.mealName}</h3>
                      <p className="history-date">{formatDate(item.createdAt)}</p>
                    </div>
                    <div className="history-score">
                      <div className="history-score-value">{item.fuelScore}</div>
                      <div className="history-score-label">FuelScore</div>
                    </div>
                  </div>

                  <div className="history-details">
                    <div className="history-detail-item">
                      <span className="history-detail-label">Calories:</span>
                      <span className="history-detail-value">{item.meal.calories} kcal</span>
                    </div>
                    <div className="history-detail-item">
                      <span className="history-detail-label">Workout:</span>
                      <span className="history-detail-value">
                        {getWorkoutIcon(item.workoutType)} {item.workoutType}
                      </span>
                    </div>
                    <div className="history-detail-item">
                      <span className="history-detail-label">Goal:</span>
                      <span className="history-detail-value">{item.fitnessGoal.replace('_', ' ')}</span>
                    </div>
                  </div>

                  <div className="history-actions">
                    <Link 
                      href={`/analyze?meal=${encodeURIComponent(item.mealName)}&workout=${item.workoutType}&goal=${item.fitnessGoal}`}
                      className="history-action-button"
                    >
                      Re-analyze
                    </Link>
                    <button
                      onClick={() => handleDelete(item._id)}
                      className="history-action-button delete"
                    >
                      Delete
                    </button>
                  </div>
                </div>
              ))}
            </div>

            {totalPages > 1 && (
              <div className="pagination">
                <button
                  onClick={() => setPage(p => Math.max(1, p - 1))}
                  disabled={page === 1}
                  className="pagination-button"
                >
                  Previous
                </button>
                <span className="pagination-info">
                  Page {page} of {totalPages}
                </span>
                <button
                  onClick={() => setPage(p => Math.min(totalPages, p + 1))}
                  disabled={page === totalPages}
                  className="pagination-button"
                >
                  Next
                </button>
              </div>
            )}
          </>
        )}
      </div>
    </div>
  );
}

