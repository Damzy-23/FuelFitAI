import Navbar from '../components/Navbar';

export default function Privacy() {
  return (
    <div className="legal-page">
      <Navbar />
      <div className="container">
        <div className="legal-content">
          <h1 className="legal-title">Privacy Policy</h1>
          <p className="legal-updated">Last updated: {new Date().toLocaleDateString()}</p>

          <section className="legal-section">
            <h2 className="legal-heading">1. Introduction</h2>
            <p className="legal-text">
              FuelFit AI ("we", "our", or "us") is committed to protecting your privacy. This Privacy Policy explains how we collect, use, disclose, and safeguard your information when you use our service.
            </p>
          </section>

          <section className="legal-section">
            <h2 className="legal-heading">2. Information We Collect</h2>
            <h3 className="legal-subheading">2.1 Personal Information</h3>
            <p className="legal-text">
              We collect information that you provide directly to us, including:
            </p>
            <ul className="legal-list">
              <li>Name and email address when you create an account</li>
              <li>Fitness goals and preferences</li>
              <li>Meal analysis data (which is stored locally and not shared)</li>
            </ul>

            <h3 className="legal-subheading">2.2 Usage Data</h3>
            <p className="legal-text">
              We may collect information about how you access and use the Service, including:
            </p>
            <ul className="legal-list">
              <li>Device information (browser type, operating system)</li>
              <li>Usage patterns and interactions with the Service</li>
              <li>IP address and general location data</li>
            </ul>
          </section>

          <section className="legal-section">
            <h2 className="legal-heading">3. How We Use Your Information</h2>
            <p className="legal-text">We use the information we collect to:</p>
            <ul className="legal-list">
              <li>Provide, maintain, and improve our services</li>
              <li>Process your meal analysis requests</li>
              <li>Send you updates and notifications (with your consent)</li>
              <li>Respond to your comments and questions</li>
              <li>Monitor and analyze usage patterns</li>
            </ul>
          </section>

          <section className="legal-section">
            <h2 className="legal-heading">4. Data Storage and Security</h2>
            <p className="legal-text">
              We implement appropriate technical and organizational measures to protect your personal information. However, no method of transmission over the Internet or electronic storage is 100% secure. While we strive to use commercially acceptable means to protect your data, we cannot guarantee absolute security.
            </p>
            <p className="legal-text">
              Your data is stored securely using industry-standard encryption and security practices. We use MongoDB for data storage with proper access controls.
            </p>
          </section>

          <section className="legal-section">
            <h2 className="legal-heading">5. Data Sharing and Disclosure</h2>
            <p className="legal-text">
              We do not sell, trade, or rent your personal information to third parties. We may share your information only in the following circumstances:
            </p>
            <ul className="legal-list">
              <li>With your explicit consent</li>
              <li>To comply with legal obligations</li>
              <li>To protect our rights and safety</li>
              <li>With service providers who assist us in operating our service (under strict confidentiality agreements)</li>
            </ul>
          </section>

          <section className="legal-section">
            <h2 className="legal-heading">6. Cookies and Tracking</h2>
            <p className="legal-text">
              We use cookies and similar tracking technologies to track activity on our service and hold certain information. Cookies are files with a small amount of data which may include an anonymous unique identifier.
            </p>
            <p className="legal-text">
              You can instruct your browser to refuse all cookies or to indicate when a cookie is being sent. However, if you do not accept cookies, you may not be able to use some portions of our service.
            </p>
          </section>

          <section className="legal-section">
            <h2 className="legal-heading">7. Your Rights</h2>
            <p className="legal-text">You have the right to:</p>
            <ul className="legal-list">
              <li>Access your personal information</li>
              <li>Correct inaccurate or incomplete data</li>
              <li>Request deletion of your account and data</li>
              <li>Object to processing of your personal information</li>
              <li>Request restriction of processing your personal information</li>
              <li>Data portability (receive your data in a structured format)</li>
            </ul>
            <p className="legal-text">
              To exercise these rights, please contact us through the application or delete your account in the profile settings.
            </p>
          </section>

          <section className="legal-section">
            <h2 className="legal-heading">8. Children's Privacy</h2>
            <p className="legal-text">
              Our service is not intended for children under the age of 13. We do not knowingly collect personal information from children under 13. If you are a parent or guardian and believe your child has provided us with personal information, please contact us.
            </p>
          </section>

          <section className="legal-section">
            <h2 className="legal-heading">9. Changes to This Privacy Policy</h2>
            <p className="legal-text">
              We may update our Privacy Policy from time to time. We will notify you of any changes by posting the new Privacy Policy on this page and updating the "Last updated" date.
            </p>
          </section>

          <section className="legal-section">
            <h2 className="legal-heading">10. Contact Us</h2>
            <p className="legal-text">
              If you have any questions about this Privacy Policy, please contact us through the application.
            </p>
          </section>
        </div>
      </div>
    </div>
  );
}

