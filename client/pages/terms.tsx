import Navbar from '../components/Navbar';

export default function Terms() {
  return (
    <div className="legal-page">
      <Navbar />
      <div className="container">
        <div className="legal-content">
          <h1 className="legal-title">Terms & Conditions</h1>
          <p className="legal-updated">Last updated: {new Date().toLocaleDateString()}</p>

          <section className="legal-section">
            <h2 className="legal-heading">1. Acceptance of Terms</h2>
            <p className="legal-text">
              By accessing and using FuelFit AI ("the Service"), you accept and agree to be bound by the terms and provision of this agreement. If you do not agree to abide by the above, please do not use this service.
            </p>
          </section>

          <section className="legal-section">
            <h2 className="legal-heading">2. Use License</h2>
            <p className="legal-text">
              Permission is granted to temporarily use FuelFit AI for personal, non-commercial transitory viewing only. This is the grant of a license, not a transfer of title, and under this license you may not:
            </p>
            <ul className="legal-list">
              <li>Modify or copy the materials</li>
              <li>Use the materials for any commercial purpose or for any public display</li>
              <li>Attempt to reverse engineer any software contained in FuelFit AI</li>
              <li>Remove any copyright or other proprietary notations from the materials</li>
            </ul>
          </section>

          <section className="legal-section">
            <h2 className="legal-heading">3. Disclaimer</h2>
            <p className="legal-text">
              The materials on FuelFit AI are provided on an 'as is' basis. FuelFit AI makes no warranties, expressed or implied, and hereby disclaims and negates all other warranties including, without limitation, implied warranties or conditions of merchantability, fitness for a particular purpose, or non-infringement of intellectual property or other violation of rights.
            </p>
            <p className="legal-text">
              <strong>Important:</strong> FuelFit AI is an informational tool and should not be used as a substitute for professional medical advice, diagnosis, or treatment. Always seek the advice of your physician or other qualified health provider with any questions you may have regarding a medical condition or nutrition plan.
            </p>
          </section>

          <section className="legal-section">
            <h2 className="legal-heading">4. Limitations</h2>
            <p className="legal-text">
              In no event shall FuelFit AI or its suppliers be liable for any damages (including, without limitation, damages for loss of data or profit, or due to business interruption) arising out of the use or inability to use the materials on FuelFit AI, even if FuelFit AI or a FuelFit AI authorized representative has been notified orally or in writing of the possibility of such damage.
            </p>
          </section>

          <section className="legal-section">
            <h2 className="legal-heading">5. Accuracy of Materials</h2>
            <p className="legal-text">
              The materials appearing on FuelFit AI could include technical, typographical, or photographic errors. FuelFit AI does not warrant that any of the materials on its website are accurate, complete, or current. FuelFit AI may make changes to the materials contained on its website at any time without notice.
            </p>
          </section>

          <section className="legal-section">
            <h2 className="legal-heading">6. User Accounts</h2>
            <p className="legal-text">
              When you create an account with us, you must provide information that is accurate, complete, and current at all times. You are responsible for safeguarding the password and for all activities that occur under your account.
            </p>
          </section>

          <section className="legal-section">
            <h2 className="legal-heading">7. Modifications</h2>
            <p className="legal-text">
              FuelFit AI may revise these terms of service for its website at any time without notice. By using this website you are agreeing to be bound by the then current version of these terms of service.
            </p>
          </section>

          <section className="legal-section">
            <h2 className="legal-heading">8. Contact Information</h2>
            <p className="legal-text">
              If you have any questions about these Terms & Conditions, please contact us through the application.
            </p>
          </section>
        </div>
      </div>
    </div>
  );
}

