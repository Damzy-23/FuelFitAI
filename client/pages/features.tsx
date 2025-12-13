import Navbar from '../components/Navbar';
import Link from 'next/link';
import { useAuth } from '../contexts/AuthContext';

export default function Features() {
  const { isAuthenticated } = useAuth();

  const features = [
    {
      icon: '⏱️',
      title: 'Workout Cost Calculator',
      description: 'See exactly how many minutes of exercise you need to burn that meal. No more guessing with abstract calorie numbers.',
      details: [
        'Converts calories to exercise time',
        'Supports 7+ workout types',
        'Uses MET (Metabolic Equivalent) values',
        'Personalized for your body weight'
      ]
    },
    {
      icon: '📊',
      title: 'MacroMatch Engine',
      description: 'Get intelligent macro analysis that aligns with your workout type and fitness goals. Know if your meal supports or hinders your progress.',
      details: [
        'Protein, carbs, and fat analysis',
        'Workout-specific recommendations',
        'Goal-based target calculations',
        'Real-time status indicators'
      ]
    },
    {
      icon: '💯',
      title: 'FuelScore Rating',
      description: 'A simple 0-10 score that instantly tells you if your meal is worth it. Higher scores mean better alignment with your goals.',
      details: [
        'Combines workout cost and macro match',
        'Goal-specific scoring',
        'Easy to understand at a glance',
        'Helps make quick decisions'
      ]
    },
    {
      icon: '🤖',
      title: 'AI Coach',
      description: 'Get personalized explanations and actionable suggestions powered by AI. Understand what your meal does well and how to improve it.',
      details: [
        'Personalized meal analysis',
        'Actionable improvement suggestions',
        'Context-aware recommendations',
        'Smart swap suggestions'
      ]
    },
    {
      icon: '🎯',
      title: 'Goal-Based Analysis',
      description: 'Whether you want to lose fat, gain muscle, or improve endurance, FuelFit adjusts its analysis to match your specific goals.',
      details: [
        'Fat Loss mode',
        'Muscle Gain mode',
        'Endurance mode',
        'Customized recommendations'
      ]
    },
    {
      icon: '📱',
      title: 'Fast & Easy',
      description: 'Get instant insights in under 10 seconds. No complex tracking, no overwhelming data - just clear, actionable information.',
      details: [
        'Instant analysis',
        'Simple meal input',
        'Mobile-friendly design',
        'No learning curve'
      ]
    }
  ];

  return (
    <div className="features-page">
      <Navbar />
      
      <section className="features-hero">
        <div className="container">
          <h1 className="features-hero-title">
            Everything You Need to
            <span className="gradient-text"> Fuel Your Fitness</span>
          </h1>
          <p className="features-hero-description">
            FuelFit AI makes nutrition simple, understandable, and actionable.
            See how every meal impacts your workout and goals.
          </p>
        </div>
      </section>

      <section className="features-list">
        <div className="container">
          {features.map((feature, index) => (
            <div key={index} className="feature-detail-card">
              <div className="feature-detail-icon">{feature.icon}</div>
              <div className="feature-detail-content">
                <h2 className="feature-detail-title">{feature.title}</h2>
                <p className="feature-detail-description">{feature.description}</p>
                <ul className="feature-detail-list">
                  {feature.details.map((detail, i) => (
                    <li key={i}>{detail}</li>
                  ))}
                </ul>
              </div>
            </div>
          ))}
        </div>
      </section>

      <section className="features-cta">
        <div className="container">
          <div className="cta-content">
            <h2 className="cta-title">Ready to Get Started?</h2>
            <p className="cta-description">
              Join FuelFit AI and start making smarter food choices today.
            </p>
            {!isAuthenticated ? (
              <div className="cta-buttons">
                <Link href="/register" className="cta-button primary">
                  Get Started Free
                </Link>
                <Link href="/login" className="cta-button secondary">
                  Sign In
                </Link>
              </div>
            ) : (
              <Link href="/analyze" className="cta-button primary">
                Analyze Your First Meal
              </Link>
            )}
          </div>
        </div>
      </section>
    </div>
  );
}

