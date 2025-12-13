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

interface DailyAverage {
  date: string;
  meals: number;
  avgFuelScore: number;
  totalCalories: number;
  avgProtein: number;
  avgCarbs: number;
  avgFat: number;
}

interface Report {
  period: string;
  totalMeals: number;
  avgFuelScore: number;
  totalCalories: number;
  avgCalories: number;
  dailyAverages: DailyAverage[];
  bestDay: DailyAverage | null;
  worstDay: DailyAverage | null;
  workoutDistribution: Record<string, number>;
}

export default function Reports() {
  const { isAuthenticated, loading: authLoading } = useAuth();
  const { showToast } = useToast();
  const router = useRouter();
  const [report, setReport] = useState<Report | null>(null);
  const [loading, setLoading] = useState(true);
  const [period, setPeriod] = useState<'week' | 'month'>('week');

  useEffect(() => {
    if (!authLoading && !isAuthenticated) {
      router.push('/login');
    }
  }, [isAuthenticated, authLoading, router]);

  useEffect(() => {
    if (isAuthenticated) {
      fetchReport();
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [isAuthenticated, period]);

  const fetchReport = async () => {
    setLoading(true);
    try {
      const token = localStorage.getItem('token');
      const response = await axios.get(
        `${API_URL}/api/meals/reports?period=${period}`,
        {
          headers: { Authorization: `Bearer ${token}` }
        }
      );

      if (response.data.success) {
        setReport(response.data.report || null);
      } else {
        setReport(null);
      }
    } catch (error: any) {
      console.error('Error fetching report:', error);
      showToast(error.response?.data?.error || 'Failed to load report', 'error');
      setReport(null);
    } finally {
      setLoading(false);
    }
  };

  const formatDate = (dateString: string) => {
    const date = new Date(dateString);
    return date.toLocaleDateString('en-US', { 
      weekday: 'short', 
      month: 'short', 
      day: 'numeric' 
    });
  };

  const getWorkoutLabel = (type: string) => {
    const labels: Record<string, string> = {
      running: '🏃 Running',
      cycling: '🚴 Cycling',
      weights: '💪 Weights',
      hiit: '⚡ HIIT',
      walking: '🚶 Walking',
      swimming: '🏊 Swimming',
      rest: '😴 Rest'
    };
    return labels[type] || type;
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

  if (!report || report.totalMeals === 0) {
    return (
      <div className="reports-page">
        <Navbar />
        <div className="container">
          <EmptyState
            icon="📊"
            title="No Report Data"
            description="Analyze meals to generate personalized reports and insights here."
            actionLabel="Analyze a Meal"
            actionHref="/analyze"
          />
        </div>
      </div>
    );
  }

  return (
    <div className="reports-page">
      <Navbar />
      <div className="container">
        <div className="page-header">
          <h1 className="page-title">📈 Nutrition Reports</h1>
          <p className="page-subtitle">Detailed insights into your nutrition patterns</p>
        </div>

        <div className="card" style={{ marginBottom: '2rem' }}>
          <div className="input-group">
            <label className="label">Report Period</label>
            <div style={{ display: 'flex', gap: '0.5rem' }}>
              {(['week', 'month'] as const).map((p) => (
                <button
                  key={p}
                  onClick={() => setPeriod(p)}
                  className={`button ${period === p ? 'primary' : ''}`}
                  style={{
                    flex: 1,
                    background: period === p 
                      ? 'linear-gradient(135deg, #667eea 0%, #764ba2 100%)' 
                      : 'rgba(255, 255, 255, 0.1)',
                    border: period === p ? 'none' : '1px solid rgba(255, 255, 255, 0.2)'
                  }}
                >
                  {p.charAt(0).toUpperCase() + p.slice(1)}ly Report
                </button>
              ))}
            </div>
          </div>
        </div>

        <div className="report-summary">
          <div className="summary-card">
            <div className="summary-icon">📊</div>
            <div className="summary-value">{report.totalMeals}</div>
            <div className="summary-label">Total Meals Analyzed</div>
          </div>
          <div className="summary-card">
            <div className="summary-icon">⭐</div>
            <div className="summary-value">{report.avgFuelScore.toFixed(1)}</div>
            <div className="summary-label">Average FuelScore</div>
          </div>
          <div className="summary-card">
            <div className="summary-icon">🔥</div>
            <div className="summary-value">{Math.round(report.totalCalories / 1000)}k</div>
            <div className="summary-label">Total Calories</div>
          </div>
          <div className="summary-card">
            <div className="summary-icon">📅</div>
            <div className="summary-value">{report.dailyAverages.length}</div>
            <div className="summary-label">Active Days</div>
          </div>
        </div>

        {report.bestDay && report.worstDay && (
          <div className="report-highlights" style={{ marginTop: '2rem' }}>
            <div className="highlight-card best">
              <div className="highlight-title">🏆 Best Day</div>
              <div className="highlight-date">{formatDate(report.bestDay.date)}</div>
              <div className="highlight-score">FuelScore: {report.bestDay.avgFuelScore.toFixed(1)}</div>
              <div className="highlight-details">
                {report.bestDay.meals} meals • {report.bestDay.totalCalories} kcal
              </div>
            </div>
            <div className="highlight-card worst">
              <div className="highlight-title">📉 Needs Improvement</div>
              <div className="highlight-date">{formatDate(report.worstDay.date)}</div>
              <div className="highlight-score">FuelScore: {report.worstDay.avgFuelScore.toFixed(1)}</div>
              <div className="highlight-details">
                {report.worstDay.meals} meals • {report.worstDay.totalCalories} kcal
              </div>
            </div>
          </div>
        )}

        <div className="card" style={{ marginTop: '2rem' }}>
          <h2 style={{ color: '#000000', marginBottom: '1.5rem' }}>Daily Breakdown</h2>
          <div className="daily-breakdown">
            {report.dailyAverages.map((day, index) => (
              <div key={index} className="daily-item">
                <div className="daily-date">{formatDate(day.date)}</div>
                <div className="daily-stats">
                  <div className="daily-stat">
                    <span className="daily-stat-label">Meals:</span>
                    <span className="daily-stat-value">{day.meals}</span>
                  </div>
                  <div className="daily-stat">
                    <span className="daily-stat-label">FuelScore:</span>
                    <span className="daily-stat-value">{day.avgFuelScore.toFixed(1)}</span>
                  </div>
                  <div className="daily-stat">
                    <span className="daily-stat-label">Calories:</span>
                    <span className="daily-stat-value">{day.totalCalories}</span>
                  </div>
                </div>
              </div>
            ))}
          </div>
        </div>

        {Object.keys(report.workoutDistribution).length > 0 && (
          <div className="card" style={{ marginTop: '2rem' }}>
            <h2 style={{ color: '#000000', marginBottom: '1.5rem' }}>Workout Distribution</h2>
            <div className="workout-distribution">
              {Object.entries(report.workoutDistribution).map(([type, count]) => (
                <div key={type} className="workout-dist-item">
                  <div className="workout-dist-icon">{getWorkoutLabel(type)}</div>
                  <div className="workout-dist-count">{count}</div>
                  <div className="workout-dist-label">meals</div>
                </div>
              ))}
            </div>
          </div>
        )}
      </div>
    </div>
  );
}

