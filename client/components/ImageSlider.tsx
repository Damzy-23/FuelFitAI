import { useState, useEffect } from 'react';

interface Slide {
  image: string;
  title: string;
  subtitle: string;
}

const slides: Slide[] = [
  {
    image: 'https://images.unsplash.com/photo-1490645935967-10de6ba17061?w=1200&q=80',
    title: 'Track Your Meals',
    subtitle: 'Understand what you eat'
  },
  {
    image: 'https://images.unsplash.com/photo-1571019613454-1cb2f99b2d8b?w=1200&q=80',
    title: 'Fuel Your Workouts',
    subtitle: 'Optimize your nutrition'
  },
  {
    image: 'https://images.unsplash.com/photo-1512621776951-a57141f2eefd?w=1200&q=80',
    title: 'Achieve Your Goals',
    subtitle: 'Fat loss, muscle gain, endurance'
  },
  {
    image: 'https://images.unsplash.com/photo-1534438327276-14e5300c3a48?w=1200&q=80',
    title: 'Smart AI Coaching',
    subtitle: 'Personalized nutrition insights'
  }
];

export default function ImageSlider() {
  const [currentIndex, setCurrentIndex] = useState(0);

  useEffect(() => {
    const interval = setInterval(() => {
      setCurrentIndex((prev) => (prev + 1) % slides.length);
    }, 5000);

    return () => clearInterval(interval);
  }, []);

  const goToSlide = (index: number) => {
    setCurrentIndex(index);
  };

  return (
    <div className="image-slider">
      <div className="slider-container">
        {slides.map((slide, index) => (
          <div
            key={index}
            className={`slide ${index === currentIndex ? 'active' : ''}`}
            style={{
              backgroundImage: `url(${slide.image})`,
              transform: `translateX(${(index - currentIndex) * 100}%)`
            }}
          >
            <div className="slide-overlay"></div>
          </div>
        ))}
      </div>

      <div className="slider-dots">
        {slides.map((_, index) => (
          <button
            key={index}
            className={`dot ${index === currentIndex ? 'active' : ''}`}
            onClick={() => goToSlide(index)}
            aria-label={`Go to slide ${index + 1}`}
          />
        ))}
      </div>
    </div>
  );
}

