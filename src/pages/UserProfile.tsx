import React, { useState } from 'react';
import { useAuth } from '../context/AuthContext';

const UserProfile: React.FC = () => {
  const { user, logout } = useAuth();
  const [isEditing, setIsEditing] = useState(false);
  const [name, setName] = useState(user?.name || '');
  const [email, setEmail] = useState(user?.email || '');
  const [message, setMessage] = useState('');

  const handleSave = async () => {
    setMessage('Profile updated successfully!');
    setIsEditing(false);
  };

  const handleCancel = () => {
    setName(user?.name || '');
    setEmail(user?.email || '');
    setIsEditing(false);
  };

  return (
    <div className="profile-page">
      <nav className="profile-nav">
        <div className="nav-container">
          <div className="nav-logo">
            <h2>QuestionGen</h2>
          </div>
          <div className="nav-user">
            <span>Welcome, {user?.name || user?.email}</span>
            <button onClick={logout} className="logout-btn">Logout</button>
          </div>
        </div>
      </nav>

      <main className="profile-main">
        <div className="profile-container">
          <div className="profile-header">
            <h1>User Profile</h1>
            <p>Manage your account settings and preferences</p>
          </div>

          <div className="profile-content">
            <div className="profile-section">
              <h3>Account Information</h3>
              <div className="profile-form">
                <div className="form-group">
                  <label>Full Name</label>
                  {isEditing ? (
                    <input
                      type="text"
                      value={name}
                      onChange={(e) => setName(e.target.value)}
                      placeholder="Enter your full name"
                    />
                  ) : (
                    <div className="profile-value">{name || 'Not provided'}</div>
                  )}
                </div>

                <div className="form-group">
                  <label>Email</label>
                  {isEditing ? (
                    <input
                      type="email"
                      value={email}
                      onChange={(e) => setEmail(e.target.value)}
                      placeholder="Enter your email"
                    />
                  ) : (
                    <div className="profile-value">{email}</div>
                  )}
                </div>

                <div className="form-group">
                  <label>Account ID</label>
                  <div className="profile-value">{user?.id}</div>
                </div>

                {isEditing ? (
                  <div className="profile-actions">
                    <button onClick={handleSave} className="btn primary">
                      Save Changes
                    </button>
                    <button onClick={handleCancel} className="btn secondary">
                      Cancel
                    </button>
                  </div>
                ) : (
                  <button onClick={() => setIsEditing(true)} className="btn primary">
                    Edit Profile
                  </button>
                )}
              </div>
            </div>

            <div className="profile-section">
              <h3>Account Statistics</h3>
              <div className="stats-grid">
                <div className="stat-card">
                  <div className="stat-number">0</div>
                  <div className="stat-label">Questions Generated</div>
                </div>
                <div className="stat-card">
                  <div className="stat-number">0</div>
                  <div className="stat-label">PDFs Created</div>
                </div>
                <div className="stat-card">
                  <div className="stat-number">0</div>
                  <div className="stat-label">Answer Keys</div>
                </div>
              </div>
            </div>

            <div className="profile-section">
              <h3>Quick Actions</h3>
              <div className="actions-grid">
                <button className="action-btn">
                  <span className="action-icon">📝</span>
                  <span>Generate Questions</span>
                </button>
                <button className="action-btn">
                  <span className="action-icon">📄</span>
                  <span>Create PDF</span>
                </button>
                <button className="action-btn">
                  <span className="action-icon">🔑</span>
                  <span>Answer Keys</span>
                </button>
                <button className="action-btn">
                  <span className="action-icon">⚙️</span>
                  <span>Settings</span>
                </button>
              </div>
            </div>

            {message && (
              <div className="message success">
                {message}
              </div>
            )}
          </div>
        </div>
      </main>

      <style>{`
        .profile-page {
          min-height: 100vh;
          background: #f8fafc;
        }

        .profile-nav {
          background: white;
          box-shadow: 0 2px 4px rgba(0,0,0,0.1);
          padding: 1rem 0;
          position: sticky;
          top: 0;
          z-index: 100;
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
          color: #667eea;
          font-size: 1.5rem;
        }

        .nav-user {
          display: flex;
          align-items: center;
          gap: 1rem;
        }

        .nav-user span {
          color: #666;
          font-size: 0.9rem;
        }

        .logout-btn {
          background: #ef4444;
          color: white;
          border: none;
          padding: 0.5rem 1rem;
          border-radius: 6px;
          cursor: pointer;
          font-size: 0.9rem;
        }

        .profile-main {
          padding: 2rem;
        }

        .profile-container {
          max-width: 800px;
          margin: 0 auto;
        }

        .profile-header {
          text-align: center;
          margin-bottom: 3rem;
        }

        .profile-header h1 {
          margin: 0 0 0.5rem 0;
          color: #333;
          font-size: 2.5rem;
        }

        .profile-header p {
          margin: 0;
          color: #666;
          font-size: 1.1rem;
        }

        .profile-content {
          display: flex;
          flex-direction: column;
          gap: 2rem;
        }

        .profile-section {
          background: white;
          border-radius: 12px;
          box-shadow: 0 4px 6px rgba(0,0,0,0.05);
          padding: 2rem;
        }

        .profile-section h3 {
          margin: 0 0 1.5rem 0;
          color: #333;
          font-size: 1.25rem;
        }

        .profile-form {
          display: flex;
          flex-direction: column;
          gap: 1.5rem;
        }

        .form-group {
          display: flex;
          flex-direction: column;
          gap: 0.5rem;
        }

        .form-group label {
          font-weight: 500;
          color: #333;
          font-size: 0.9rem;
        }

        .form-group input {
          padding: 0.75rem;
          border: 2px solid #e1e5e9;
          border-radius: 8px;
          font-size: 1rem;
          transition: border-color 0.3s ease;
        }

        .form-group input:focus {
          outline: none;
          border-color: #667eea;
        }

        .profile-value {
          padding: 0.75rem;
          background: #f8fafc;
          border: 2px solid #e1e5e9;
          border-radius: 8px;
          font-size: 1rem;
          color: #333;
        }

        .profile-actions {
          display: flex;
          gap: 1rem;
          margin-top: 1rem;
        }

        .btn {
          padding: 0.75rem 1.5rem;
          border: none;
          border-radius: 8px;
          font-size: 1rem;
          font-weight: 600;
          cursor: pointer;
          transition: all 0.3s ease;
        }

        .btn.primary {
          background: linear-gradient(45deg, #667eea, #764ba2);
          color: white;
        }

        .btn.secondary {
          background: #6b7280;
          color: white;
        }

        .btn:hover {
          transform: translateY(-2px);
          box-shadow: 0 4px 12px rgba(0,0,0,0.15);
        }

        .stats-grid {
          display: grid;
          grid-template-columns: repeat(auto-fit, minmax(150px, 1fr));
          gap: 1rem;
        }

        .stat-card {
          background: linear-gradient(135deg, #667eea, #764ba2);
          color: white;
          padding: 1.5rem;
          border-radius: 12px;
          text-align: center;
        }

        .stat-number {
          font-size: 2rem;
          font-weight: bold;
          margin-bottom: 0.5rem;
        }

        .stat-label {
          font-size: 0.9rem;
          opacity: 0.9;
        }

        .actions-grid {
          display: grid;
          grid-template-columns: repeat(auto-fit, minmax(200px, 1fr));
          gap: 1rem;
        }

        .action-btn {
          background: white;
          border: 2px solid #e1e5e9;
          border-radius: 12px;
          padding: 1.5rem;
          cursor: pointer;
          transition: all 0.3s ease;
          display: flex;
          flex-direction: column;
          align-items: center;
          gap: 0.5rem;
        }

        .action-btn:hover {
          border-color: #667eea;
          transform: translateY(-2px);
          box-shadow: 0 4px 12px rgba(0,0,0,0.1);
        }

        .action-icon {
          font-size: 2rem;
        }

        .action-btn span:last-child {
          font-weight: 500;
          color: #333;
        }

        .message {
          padding: 1rem;
          border-radius: 8px;
          text-align: center;
        }

        .message.success {
          background: #d1fae5;
          color: #065f46;
          border: 1px solid #a7f3d0;
        }

        @media (max-width: 768px) {
          .profile-main {
            padding: 1rem;
          }
          
          .stats-grid {
            grid-template-columns: 1fr;
          }
          
          .actions-grid {
            grid-template-columns: 1fr;
          }
          
          .nav-container {
            padding: 0 1rem;
          }
        }
      `}</style>
    </div>
  );
};

export default UserProfile; 