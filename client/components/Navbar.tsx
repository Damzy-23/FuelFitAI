import Link from 'next/link';
import { useRouter } from 'next/router';
import { useAuth } from '../contexts/AuthContext';

export default function Navbar() {
  const router = useRouter();
  const { user, isAuthenticated, logout } = useAuth();

  const navLinks = [
    { href: '/', label: 'Home' },
    { href: '/features', label: 'Features' },
    ...(isAuthenticated ? [
      { href: '/analyze', label: 'Analyze' },
      { href: '/compare', label: 'Compare' },
      { href: '/recommendations', label: 'Recommendations' },
      { href: '/progress', label: 'Progress' },
      { href: '/reports', label: 'Reports' },
      { href: '/history', label: 'History' }
    ] : []),
  ];

  return (
    <nav className="navbar">
      <div className="navbar-container">
        <Link href="/" className="navbar-logo">
          <span className="logo-icon">🏋️</span>
          <span className="logo-text">FuelFit AI</span>
        </Link>

        <div className="navbar-links">
          {navLinks.map((link) => (
            <Link
              key={link.href}
              href={link.href}
              className={`navbar-link ${router.pathname === link.href ? 'active' : ''}`}
            >
              {link.label}
            </Link>
          ))}
        </div>

        <div className="navbar-auth">
          {isAuthenticated ? (
            <>
              <Link href="/profile" className="navbar-link">
                👤 {user?.name}
              </Link>
              <button onClick={logout} className="navbar-button">
                Logout
              </button>
            </>
          ) : (
            <>
              <Link href="/login" className="navbar-link">
                Sign In
              </Link>
              <Link href="/register" className="navbar-button">
                Get Started
              </Link>
            </>
          )}
        </div>
      </div>
    </nav>
  );
}

