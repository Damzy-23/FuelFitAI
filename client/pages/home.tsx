import { useState, useEffect, useRef } from 'react';
import { useRouter } from 'next/router';
import Link from 'next/link';
import { useAuth } from '../contexts/AuthContext';
import Navbar from '../components/Navbar';
import ImageSlider from '../components/ImageSlider';

export default function HomePage() {
  const router = useRouter();
  const { isAuthenticated } = useAuth();
  const [scrollY, setScrollY] = useState(0);
  const statsRef = useRef<HTMLDivElement>(null);
  const [statsVisible, setStatsVisible] = useState(false);

  useEffect(() => {
    const handleScroll = () => setScrollY(window.scrollY);
    window.addEventListener('scroll', handleScroll);
    return () => window.removeEventListener('scroll', handleScroll);
  }, []);

  useEffect(() => {
    const observer = new IntersectionObserver(
      ([entry]) => {
        if (entry.isIntersecting) {
          setStatsVisible(true);
          // Animate numbers
          const numberElements = document.querySelectorAll('.stat-number[data-target]');
          numberElements.forEach((el) => {
            const target = parseInt(el.getAttribute('data-target') || '0');
            const duration = 2000;
            const increment = target / (duration / 16);
            let current = 0;
            const timer = setInterval(() => {
              current += increment;
              if (current >= target) {
                el.textContent = target.toString();
                clearInterval(timer);
              } else {
                el.textContent = Math.floor(current).toString();
              }
            }, 16);
          });
        }
      },
      { threshold: 0.3 }
    );
    if (statsRef.current) observer.observe(statsRef.current);
    return () => observer.disconnect();
  }, []);

  return (
    <div className="home-page">
      <Navbar />
      
      {/* Hero Section with Slider */}
      <section className="hero-section">
        <ImageSlider />
        <div className="hero-content">
          <div className="hero-text">
            <div className="hero-badge">
              <span className="badge-icon">✨</span>
              <span>AI-Powered Nutrition Intelligence</span>
            </div>
            <h1 className="hero-title">
              Does this meal fuel your workout
              <span className="gradient-text"> — or cost you one?</span>
            </h1>
            <p className="hero-description">
              FuelFit AI translates food into effort, performance, and recovery impact.
              Make nutrition instantly understandable and actionable.
            </p>
            <div className="hero-buttons">
              {isAuthenticated ? (
                <Link href="/analyze" className="hero-button primary">
                  <span>Analyze Meal</span>
                  <span className="button-arrow">→</span>
                </Link>
              ) : (
                <>
                  <Link href="/register" className="hero-button primary">
                    <span>Get Started Free</span>
                    <span className="button-arrow">→</span>
                  </Link>
                  <Link href="/features" className="hero-button secondary">
                    <span>Learn More</span>
                    <span className="button-arrow">→</span>
                  </Link>
                </>
              )}
            </div>
            <div className="hero-trust">
              <div className="trust-item">
                <span className="trust-number">100+</span>
                <span className="trust-label">Meals</span>
              </div>
              <div className="trust-item">
                <span className="trust-number">7</span>
                <span className="trust-label">Workout Types</span>
              </div>
              <div className="trust-item">
                <span className="trust-number">AI</span>
                <span className="trust-label">Powered</span>
              </div>
            </div>
          </div>
        </div>
        <div className="hero-scroll-indicator">
          <div className="scroll-mouse">
            <div className="scroll-wheel"></div>
          </div>
          <span>Scroll to explore</span>
        </div>
      </section>

      {/* Stats Section */}
      <section className="stats-section" ref={statsRef}>
        <div className="container">
          <div className="stats-grid">
            <div className={`stat-card ${statsVisible ? 'animate-in' : ''}`} style={{ animationDelay: '0.1s' }}>
              <div className="stat-icon">⚡</div>
              <div className="stat-number" data-target="100">0</div>
              <div className="stat-label">+ Meals Analyzed</div>
            </div>
            <div className={`stat-card ${statsVisible ? 'animate-in' : ''}`} style={{ animationDelay: '0.2s' }}>
              <div className="stat-icon">🎯</div>
              <div className="stat-number" data-target="10">0</div>
              <div className="stat-label">FuelScore Rating</div>
            </div>
            <div className={`stat-card ${statsVisible ? 'animate-in' : ''}`} style={{ animationDelay: '0.3s' }}>
              <div className="stat-icon">🤖</div>
              <div className="stat-number" data-target="24">0</div>
              <div className="stat-label">/7 AI Support</div>
            </div>
            <div className={`stat-card ${statsVisible ? 'animate-in' : ''}`} style={{ animationDelay: '0.4s' }}>
              <div className="stat-icon">🌍</div>
              <div className="stat-number" data-target="2">0</div>
              <div className="stat-label">Countries Supported</div>
            </div>
          </div>
        </div>
      </section>

      {/* Features Preview */}
      <section className="features-preview">
        <div className="container">
          <div className="section-header">
            <h2 className="section-title">
              <span className="title-accent">Why</span> FuelFit AI?
            </h2>
            <p className="section-subtitle">
              Everything you need to make nutrition decisions that actually make sense
            </p>
          </div>
          <div className="features-grid">
            <div className="feature-card">
              <div className="feature-icon-wrapper">
                <div className="feature-icon">⏱️</div>
                <div className="feature-glow"></div>
              </div>
              <h3 className="feature-title">Workout Cost</h3>
              <p className="feature-description">
                See how many minutes of exercise you need to burn that meal. No more abstract calories.
              </p>
              <div className="feature-link">Learn more →</div>
            </div>
            <div className="feature-card">
              <div className="feature-icon-wrapper">
                <div className="feature-icon">📊</div>
                <div className="feature-glow"></div>
              </div>
              <h3 className="feature-title">MacroMatch</h3>
              <p className="feature-description">
                Get personalized macro analysis aligned with your workout type and fitness goals.
              </p>
              <div className="feature-link">Learn more →</div>
            </div>
            <div className="feature-card">
              <div className="feature-icon-wrapper">
                <div className="feature-icon">💯</div>
                <div className="feature-glow"></div>
              </div>
              <h3 className="feature-title">FuelScore</h3>
              <p className="feature-description">
                Simple 0-10 rating that tells you instantly if your meal supports your goals.
              </p>
              <div className="feature-link">Learn more →</div>
            </div>
            <div className="feature-card">
              <div className="feature-icon-wrapper">
                <div className="feature-icon">🤖</div>
                <div className="feature-glow"></div>
              </div>
              <h3 className="feature-title">AI Coach</h3>
              <p className="feature-description">
                Get personalized explanations and smart suggestions to improve your nutrition.
              </p>
              <div className="feature-link">Learn more →</div>
            </div>
          </div>
        </div>
      </section>

      {/* How It Works Section */}
      <section className="how-it-works">
        <div className="container">
          <div className="section-header">
            <h2 className="section-title">
              How It <span className="title-accent">Works</span>
            </h2>
            <p className="section-subtitle">
              Get instant insights in three simple steps
            </p>
          </div>
          <div className="steps-container">
            <div className="step-item">
              <div className="step-number">01</div>
              <div className="step-content">
                <h3 className="step-title">Enter Your Meal</h3>
                <p className="step-description">
                  Type in any meal or choose from 100+ preset options including UK and Nigerian foods
                </p>
              </div>
              <div className="step-visual">
                <div className="step-icon">🍽️</div>
              </div>
            </div>
            <div className="step-connector"></div>
            <div className="step-item">
              <div className="step-number">02</div>
              <div className="step-content">
                <h3 className="step-title">Select Your Workout</h3>
                <p className="step-description">
                  Choose your workout type and fitness goal - we'll calculate the perfect match
                </p>
              </div>
              <div className="step-visual">
                <div className="step-icon">🏋️</div>
              </div>
            </div>
            <div className="step-connector"></div>
            <div className="step-item">
              <div className="step-number">03</div>
              <div className="step-content">
                <h3 className="step-title">Get Instant Insights</h3>
                <p className="step-description">
                  Receive workout cost, macro analysis, FuelScore, and AI-powered recommendations
                </p>
              </div>
              <div className="step-visual">
                <div className="step-icon">✨</div>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* CTA Section */}
      <section className="cta-section">
        <div className="cta-background"></div>
        <div className="container">
          <div className="cta-content">
            <div className="cta-badge">Ready to get started?</div>
            <h2 className="cta-title">Transform your nutrition today</h2>
            <p className="cta-description">
              Join thousands of users making smarter food choices every day.
              Start analyzing your meals in seconds.
            </p>
            {!isAuthenticated ? (
              <div className="cta-buttons">
                <Link href="/register" className="cta-button primary">
                  <span>Get Started Free</span>
                  <span className="button-arrow">→</span>
                </Link>
                <Link href="/features" className="cta-button secondary">
                  View Features
                </Link>
              </div>
            ) : (
              <Link href="/analyze" className="cta-button primary">
                <span>Analyze Your First Meal</span>
                <span className="button-arrow">→</span>
              </Link>
            )}
          </div>
        </div>
      </section>
    </div>
  );
}

