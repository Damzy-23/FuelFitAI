import { useState, useEffect } from 'react';
import { useRouter } from 'next/router';
import { useAuth } from '../contexts/AuthContext';
import { useToast } from '../contexts/ToastContext';
import Navbar from '../components/Navbar';
import SkeletonLoader from '../components/SkeletonLoader';
import EmptyState from '../components/EmptyState';
import axios from 'axios';

const API_URL = process.env.NEXT_PUBLIC_API_URL || 'http://localhost:3030';

interface TrendData {
  date: string;
  fuelScore: number;
  calories: number;
  protein: number;
  carbs: number;
  fat: number;
}

interface Averages {
  fuelScore: number;
  calories: number;
  protein: number;
  carbs: number;
  fat: number;
}

export default function Progress() {
  const { isAuthenticated, loading: authLoading } = useAuth();
  const { showToast } = useToast();
  const router = useRouter();
  const [trends, setTrends] = useState<TrendData[]>([]);
  const [averages, setAverages] = useState<Averages | null>(null);
  const [loading, setLoading] = useState(true);
  const [period, setPeriod] = useState<'week' | 'month' | 'all'>('week');

  useEffect(() => {
    if (!authLoading && !isAuthenticated) {
      router.push('/login');
    }
  }, [isAuthenticated, authLoading, router]);

  useEffect(() => {
    if (isAuthenticated) {
      fetchTrends();
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [isAuthenticated, period]);

  const fetchTrends = async () => {
    setLoading(true);
    try {
      const token = localStorage.getItem('token');
      const response = await axios.get(
        `${API_URL}/api/meals/trends?period=${period}`,
        {
          headers: { Authorization: `Bearer ${token}` }
        }
      );

      if (response.data.success) {
        setTrends(response.data.trends || []);
        setAverages(response.data.averages || null);
      } else {
        setTrends([]);
        setAverages(null);
      }
    } catch (error: any) {
      console.error('Error fetching trends:', error);
      showToast(error.response?.data?.error || 'Failed to load progress data', 'error');
      setTrends([]);
      setAverages(null);
    } finally {
      setLoading(false);
    }
  };

  const renderSimpleChart = (data: TrendData[], key: keyof TrendData, label: string, color: string) => {
    if (data.length === 0) return null;

    const values = data.map(d => d[key] as number);
    const max = Math.max(...values, 1);
    const min = Math.min(...values);

    return (
      <div className="chart-container">
        <h3 className="chart-title">{label}</h3>
        <div className="chart-bars">
          {data.map((item, index) => {
            const value = item[key] as number;
            const height = max > min ? ((value - min) / (max - min)) * 100 : 50;
            return (
              <div key={index} className="chart-bar-wrapper">
                <div
                  className="chart-bar"
                  style={{
                    height: `${height}%`,
                    background: color,
                    minHeight: '4px'
                  }}
                  title={`${item.date}: ${value.toFixed(1)}`}
                />
                <div className="chart-label" style={{ fontSize: '0.7rem' }}>
                  {new Date(item.date).toLocaleDateString('en-US', { month: 'short', day: 'numeric' })}
                </div>
              </div>
            );
          })}
        </div>
        <div className="chart-stats">
          <span>Min: {min.toFixed(1)}</span>
          <span>Max: {max.toFixed(1)}</span>
          <span>Avg: {averages?.[key as keyof Averages]?.toFixed(1) || '0'}</span>
        </div>
      </div>
    );
  };

  if (authLoading || loading) {
    return (
      <div className="page-loading">
        <Navbar />
        <div className="container">
          <SkeletonLoader type="card" count={2} />
        </div>
      </div>
    );
  }

  return (
    <div className="progress-page">
      <Navbar />
      <div className="container">
        <div className="page-header">
          <h1 className="page-title">📊 Progress & Trends</h1>
          <p className="page-subtitle">Track your nutrition and FuelScore over time</p>
        </div>

        <div className="card" style={{ marginBottom: '2rem' }}>
          <div className="input-group">
            <label className="label">Time Period</label>
            <div style={{ display: 'flex', gap: '0.5rem' }}>
              {(['week', 'month', 'all'] as const).map((p) => (
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
                  {p.charAt(0).toUpperCase() + p.slice(1)}
                </button>
              ))}
            </div>
          </div>
        </div>

        {trends.length === 0 ? (
          <EmptyState
            icon="📈"
            title="No Progress Data"
            description="Analyze meals to start tracking your progress and see trends here."
            actionLabel="Analyze a Meal"
            actionHref="/analyze"
          />
        ) : (
          <>
            <div className="stats-grid" style={{ marginBottom: '2rem' }}>
              <div className="stat-card-large">
                <div className="stat-icon-large">⭐</div>
                <div className="stat-value-large">{averages?.fuelScore.toFixed(1) || '0'}</div>
                <div className="stat-label-large">Avg FuelScore</div>
              </div>
              <div className="stat-card-large">
                <div className="stat-icon-large">🔥</div>
                <div className="stat-value-large">{averages?.calories || '0'}</div>
                <div className="stat-label-large">Avg Calories</div>
              </div>
              <div className="stat-card-large">
                <div className="stat-icon-large">💪</div>
                <div className="stat-value-large">{averages?.protein.toFixed(0) || '0'}g</div>
                <div className="stat-label-large">Avg Protein</div>
              </div>
            </div>

            <div className="charts-grid">
              {renderSimpleChart(trends, 'fuelScore', 'FuelScore Trend', '#667eea')}
              {renderSimpleChart(trends, 'calories', 'Calories Trend', '#f093fb')}
              {renderSimpleChart(trends, 'protein', 'Protein Trend', '#10b981')}
              {renderSimpleChart(trends, 'carbs', 'Carbs Trend', '#3b82f6')}
              {renderSimpleChart(trends, 'fat', 'Fat Trend', '#f59e0b')}
            </div>
          </>
        )}
      </div>
    </div>
  );
}

