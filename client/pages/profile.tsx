import { useState, useEffect } from 'react';
import { useRouter } from 'next/router';
import { useAuth } from '../contexts/AuthContext';
import { useToast } from '../contexts/ToastContext';
import Navbar from '../components/Navbar';
import axios from 'axios';

const API_URL = process.env.NEXT_PUBLIC_API_URL || 'http://localhost:3030';

interface Stats {
  totalMeals: number;
  averageFuelScore: number;
  mealsByGoal: Record<string, number>;
  mealsByWorkout: Record<string, number>;
}

export default function Profile() {
  const { user, isAuthenticated, loading: authLoading } = useAuth();
  const { showToast } = useToast();
  const router = useRouter();
  const [name, setName] = useState('');
  const [email, setEmail] = useState('');
  const [fitnessGoal, setFitnessGoal] = useState('fat_loss');
  const [loading, setLoading] = useState(false);
  const [stats, setStats] = useState<Stats | null>(null);
  const [loadingStats, setLoadingStats] = useState(true);

  useEffect(() => {
    if (!authLoading && !isAuthenticated) {
      router.push('/login');
    }
  }, [isAuthenticated, authLoading, router]);

  useEffect(() => {
    if (user) {
      setName(user.name);
      setEmail(user.email);
      setFitnessGoal(user.fitnessGoal);
      fetchStats();
    }
  }, [user]);

  const fetchStats = async () => {
    if (!isAuthenticated) return;
    
    try {
      const token = localStorage.getItem('token');
      const response = await axios.get(`${API_URL}/api/meals/stats`, {
        headers: { Authorization: `Bearer ${token}` }
      });
      setStats(response.data.stats);
    } catch (error) {
      console.error('Failed to fetch stats:', error);
    } finally {
      setLoadingStats(false);
    }
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);

    try {
      const token = localStorage.getItem('token');
      const response = await axios.put(
        `${API_URL}/api/user/profile`,
        { name, fitnessGoal },
        { headers: { Authorization: `Bearer ${token}` } }
      );
      
      if (response.data.success) {
        showToast('Profile updated successfully!', 'success');
        // Refresh user data
        setTimeout(() => {
          window.location.reload();
        }, 1000);
      }
    } catch (error: any) {
      showToast(error.response?.data?.error || 'Failed to update profile', 'error');
    } finally {
      setLoading(false);
    }
  };

  if (authLoading) {
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
    <div className="profile-page">
      <Navbar />
      <div className="container">
        <div className="profile-header">
          <h1 className="page-title">Profile Settings</h1>
          <p className="page-subtitle">Manage your account and preferences</p>
        </div>

        <div className="profile-content">
          <div className="profile-card">
            <div className="profile-avatar">
              <div className="avatar-circle">
                {user?.name?.charAt(0).toUpperCase() || 'U'}
              </div>
              <h2 className="profile-name">{user?.name}</h2>
              <p className="profile-email">{user?.email}</p>
            </div>

            <form onSubmit={handleSubmit} className="profile-form">
              <div className="input-group">
                <label className="label">Full Name</label>
                <input
                  type="text"
                  className="input"
                  value={name}
                  onChange={(e) => setName(e.target.value)}
                  required
                />
              </div>

              <div className="input-group">
                <label className="label">Email</label>
                <input
                  type="email"
                  className="input"
                  value={email}
                  disabled
                />
                <small style={{ color: '#666', fontSize: '0.85rem', marginTop: '0.5rem', display: 'block' }}>
                  Email cannot be changed
                </small>
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


              <button
                type="submit"
                className="button"
                disabled={loading}
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
                      Updating...
                    </span>
                  ) : (
                    'Update Profile'
                  )}
                </span>
              </button>
            </form>
          </div>

          <div className="profile-stats">
            <div className="stat-card">
              <div className="stat-icon">📊</div>
              <div className="stat-value">
                {loadingStats ? '...' : (stats?.totalMeals || 0)}
              </div>
              <div className="stat-label">Meals Analyzed</div>
            </div>
            <div className="stat-card">
              <div className="stat-icon">🎯</div>
              <div className="stat-value">{fitnessGoal.replace('_', ' ').toUpperCase()}</div>
              <div className="stat-label">Current Goal</div>
            </div>
            <div className="stat-card">
              <div className="stat-icon">⭐</div>
              <div className="stat-value">
                {loadingStats ? '...' : (stats?.averageFuelScore || 0).toFixed(1)}
              </div>
              <div className="stat-label">Average FuelScore</div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}

