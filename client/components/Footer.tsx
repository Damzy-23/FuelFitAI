import Link from 'next/link';

export default function Footer() {
  const currentYear = new Date().getFullYear();

  return (
    <footer className="footer">
      <div className="footer-container">
        <div className="footer-content">
          <div className="footer-section">
            <h3 className="footer-title">FuelFit AI</h3>
            <p className="footer-description">
              Making nutrition instantly understandable and actionable.
            </p>
          </div>

          <div className="footer-section">
            <h4 className="footer-heading">Quick Links</h4>
            <ul className="footer-links">
              <li><Link href="/">Home</Link></li>
              <li><Link href="/features">Features</Link></li>
              <li><Link href="/analyze">Analyze Meal</Link></li>
              <li><Link href="/compare">Compare Meals</Link></li>
              <li><Link href="/recommendations">Recommendations</Link></li>
              <li><Link href="/progress">Progress</Link></li>
              <li><Link href="/reports">Reports</Link></li>
              <li><Link href="/history">History</Link></li>
            </ul>
          </div>

          <div className="footer-section">
            <h4 className="footer-heading">Legal</h4>
            <ul className="footer-links">
              <li><Link href="/terms">Terms & Conditions</Link></li>
              <li><Link href="/privacy">Privacy Policy</Link></li>
            </ul>
          </div>

          <div className="footer-section">
            <h4 className="footer-heading">Connect</h4>
            <p className="footer-description">
              Built with ❤️ for better nutrition
            </p>
          </div>
        </div>

        <div className="footer-bottom">
          <p className="footer-copyright">
            © {currentYear} FuelFit AI. All rights reserved. | Built by Onasanya Oluwadamilola (Dami)
          </p>
        </div>
      </div>
    </footer>
  );
}

