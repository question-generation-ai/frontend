import React from 'react';
import { Link } from 'react-router-dom';

const LandingPage: React.FC = () => {
  return (
    <div className="landing-page">
      <nav className="navbar">
        <div className="nav-container">
          <div className="nav-logo">
            <h2>QuestionGen</h2>
          </div>
          <div className="nav-links">
            <Link to="/login" className="nav-link">Login</Link>
            <Link to="/signup" className="nav-link signup-btn">Sign Up</Link>
          </div>
        </div>
      </nav>

      <main className="hero-section">
        <div className="hero-content">
          <h1 className="hero-title">
            Generate Professional Questions
            <span className="gradient-text"> Instantly</span>
          </h1>
          <p className="hero-subtitle">
            Create high-quality educational questions for any subject, grade level, or topic. 
            Powered by AI to deliver engaging, curriculum-aligned content.
          </p>
          
          <div className="hero-features">
            <div className="feature">
              <div className="feature-icon">📚</div>
              <h3>Multiple Subjects</h3>
              <p>Mathematics, Physics, Chemistry, Biology, English, History, and more</p>
            </div>
            <div className="feature">
              <div className="feature-icon">🎯</div>
              <h3>Grade-Specific</h3>
              <p>Questions tailored for Class 1-12 with appropriate difficulty levels</p>
            </div>
            <div className="feature">
              <div className="feature-icon">📄</div>
              <h3>PDF Export</h3>
              <p>Generate professional PDFs with questions and answer keys</p>
            </div>
          </div>

          <div className="cta-buttons">
            <Link to="/signup" className="cta-primary">Get Started Free</Link>
            <Link to="/login" className="cta-secondary">Already have an account?</Link>
          </div>
        </div>
      </main>

      <section className="features-section">
        <h2>Why Choose QuestionGen?</h2>
        <div className="features-grid">
          <div className="feature-card">
            <h3>🎓 Educational Excellence</h3>
            <p>AI-powered questions that align with curriculum standards and learning objectives.</p>
          </div>
          <div className="feature-card">
            <h3>⚡ Instant Generation</h3>
            <p>Create multiple questions in seconds, saving hours of manual work.</p>
          </div>
          <div className="feature-card">
            <h3>📊 Multiple Formats</h3>
            <p>Multiple choice, short answer, true/false questions with detailed explanations.</p>
          </div>
          <div className="feature-card">
            <h3>🔧 Customizable</h3>
            <p>Add extra instructions, focus on specific concepts, and control difficulty levels.</p>
          </div>
          <div className="feature-card">
            <h3>📱 Professional Output</h3>
            <p>Export to PDF with proper formatting for printing and sharing.</p>
          </div>
          <div className="feature-card">
            <h3>🔄 Always Available</h3>
            <p>24/7 access to generate questions whenever you need them.</p>
          </div>
        </div>
      </section>

      <footer className="footer">
        <p>&copy; 2024 QuestionGen. All rights reserved.</p>
      </footer>

      <style>{`
        .landing-page {
          min-height: 100vh;
          background: linear-gradient(135deg, #667eea 0%, #764ba2 100%);
          color: white;
        }

        .navbar {
          background: rgba(255, 255, 255, 0.1);
          backdrop-filter: blur(10px);
          padding: 1rem 0;
          position: fixed;
          top: 0;
          width: 100%;
          z-index: 1000;
        }

        .nav-container {
          max-width: 1200px;
          margin: 0 auto;
          padding: 0 2rem;
          display: flex;
          justify-content: space-between;
          align-items: center;
        }

        .nav-logo h2 {
          margin: 0;
          font-size: 1.5rem;
          font-weight: bold;
        }

        .nav-links {
          display: flex;
          gap: 1rem;
          align-items: center;
        }

        .nav-link {
          color: white;
          text-decoration: none;
          padding: 0.5rem 1rem;
          border-radius: 6px;
          transition: all 0.3s ease;
        }

        .nav-link:hover {
          background: rgba(255, 255, 255, 0.1);
        }

        .signup-btn {
          background: rgba(255, 255, 255, 0.2);
          border: 1px solid rgba(255, 255, 255, 0.3);
        }

        .hero-section {
          padding: 8rem 2rem 4rem;
          text-align: center;
          max-width: 1200px;
          margin: 0 auto;
        }

        .hero-title {
          font-size: 3.5rem;
          font-weight: bold;
          margin-bottom: 1.5rem;
          line-height: 1.2;
        }

        .gradient-text {
          background: linear-gradient(45deg, #ffd700, #ffed4e);
          -webkit-background-clip: text;
          -webkit-text-fill-color: transparent;
          background-clip: text;
        }

        .hero-subtitle {
          font-size: 1.25rem;
          margin-bottom: 3rem;
          opacity: 0.9;
          max-width: 600px;
          margin-left: auto;
          margin-right: auto;
        }

        .hero-features {
          display: grid;
          grid-template-columns: repeat(auto-fit, minmax(250px, 1fr));
          gap: 2rem;
          margin: 3rem 0;
        }

        .feature {
          background: rgba(255, 255, 255, 0.1);
          padding: 2rem;
          border-radius: 12px;
          backdrop-filter: blur(10px);
        }

        .feature-icon {
          font-size: 2.5rem;
          margin-bottom: 1rem;
        }

        .feature h3 {
          margin: 0 0 0.5rem 0;
          font-size: 1.25rem;
        }

        .feature p {
          margin: 0;
          opacity: 0.8;
        }

        .cta-buttons {
          display: flex;
          gap: 1rem;
          justify-content: center;
          margin-top: 3rem;
          flex-wrap: wrap;
        }

        .cta-primary, .cta-secondary {
          padding: 1rem 2rem;
          border-radius: 8px;
          text-decoration: none;
          font-weight: 600;
          transition: all 0.3s ease;
        }

        .cta-primary {
          background: linear-gradient(45deg, #ffd700, #ffed4e);
          color: #333;
        }

        .cta-primary:hover {
          transform: translateY(-2px);
          box-shadow: 0 8px 25px rgba(255, 215, 0, 0.3);
        }

        .cta-secondary {
          color: white;
          border: 2px solid rgba(255, 255, 255, 0.3);
        }

        .cta-secondary:hover {
          background: rgba(255, 255, 255, 0.1);
        }

        .features-section {
          padding: 4rem 2rem;
          background: rgba(255, 255, 255, 0.05);
        }

        .features-section h2 {
          text-align: center;
          font-size: 2.5rem;
          margin-bottom: 3rem;
        }

        .features-grid {
          display: grid;
          grid-template-columns: repeat(auto-fit, minmax(300px, 1fr));
          gap: 2rem;
          max-width: 1200px;
          margin: 0 auto;
        }

        .feature-card {
          background: rgba(255, 255, 255, 0.1);
          padding: 2rem;
          border-radius: 12px;
          backdrop-filter: blur(10px);
          text-align: center;
        }

        .feature-card h3 {
          margin: 0 0 1rem 0;
          font-size: 1.25rem;
        }

        .feature-card p {
          margin: 0;
          opacity: 0.8;
          line-height: 1.6;
        }

        .footer {
          text-align: center;
          padding: 2rem;
          background: rgba(0, 0, 0, 0.2);
        }

        @media (max-width: 768px) {
          .hero-title {
            font-size: 2.5rem;
          }
          
          .hero-features {
            grid-template-columns: 1fr;
          }
          
          .features-grid {
            grid-template-columns: 1fr;
          }
          
          .cta-buttons {
            flex-direction: column;
            align-items: center;
          }
        }
      `}</style>
    </div>
  );
};

export default LandingPage; 