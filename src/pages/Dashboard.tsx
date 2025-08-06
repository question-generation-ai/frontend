import React, { useState } from 'react';
import { useAuth } from '../context/AuthContext';

const API_BASE = 'http://localhost:5000/api/v1';

const Dashboard: React.FC = () => {
  const { user, logout } = useAuth();
  const [subject, setSubject] = useState('Mathematics');
  const [chapter, setChapter] = useState('Algebra');
  const [difficulty, setDifficulty] = useState('medium');
  const [type, setType] = useState('multiple-choice');
  const [count, setCount] = useState(5);
  const [classLevel, setClassLevel] = useState('class 11');
  const [extraCommands, setExtraCommands] = useState('');
  const [title, setTitle] = useState('');
  const [message, setMessage] = useState('');
  const [includeAnswers, setIncludeAnswers] = useState(false);
  const [includeExplanations, setIncludeExplanations] = useState(false);
  const [pdfResult, setPdfResult] = useState<any>(null);
  const [questionResult, setQuestionResult] = useState<any>(null);
  const [loading, setLoading] = useState(false);

  // Predefined subjects and class levels
  const subjects = [
    'Mathematics', 'Physics', 'Chemistry', 'Biology', 
    'English', 'History', 'Geography', 'Politics', 
    'Economics', 'Computer Science', 'Environmental Science'
  ];

  const classLevels = [
    'class 1', 'class 2', 'class 3', 'class 4', 'class 5', 'class 6', 
    'class 7', 'class 8', 'class 9', 'class 10', 'class 11', 'class 12'
  ];

  const handleGenerate = async () => {
    setMessage('');
    setQuestionResult(null);
    setLoading(true);
    
    try {
      const token = localStorage.getItem('token');
      const res = await fetch(`${API_BASE}/questions/generate`, {
        method: 'POST',
        headers: { 
          'Content-Type': 'application/json', 
          Authorization: token ? `Bearer ${token}` : '' 
        },
        body: JSON.stringify({ 
          subject, 
          chapter, 
          difficulty, 
          type, 
          count, 
          classLevel,
          extraCommands: extraCommands.trim() || undefined,
          title: title.trim() || undefined
        }),
      });
      const data = await res.json();
      if (res.ok) {
        setQuestionResult(data);
        setMessage('Questions generated successfully!');
      } else {
        setMessage(data.error || 'Generation failed');
      }
    } catch (err) {
      setMessage('Error generating questions');
    } finally {
      setLoading(false);
    }
  };

  const handleGeneratePDF = async () => {
    setMessage('');
    setPdfResult(null);
    setLoading(true);
    
    try {
      const token = localStorage.getItem('token');
      const res = await fetch(`${API_BASE}/questions/generate-pdf`, {
        method: 'POST',
        headers: { 
          'Content-Type': 'application/json', 
          Authorization: token ? `Bearer ${token}` : '' 
        },
        body: JSON.stringify({ 
          subject, 
          chapter, 
          difficulty, 
          type, 
          count,
          classLevel,
          extraCommands: extraCommands.trim() || undefined,
          title: title.trim() || undefined,
          includeAnswers,
          includeExplanations
        }),
      });
      const data = await res.json();
      if (res.ok) {
        setPdfResult(data);
        setMessage('PDF generated successfully!');
      } else {
        setMessage(data.error || 'PDF generation failed');
      }
    } catch (err) {
      setMessage('Error generating PDF');
    } finally {
      setLoading(false);
    }
  };

  const handleGenerateAnswerKey = async () => {
    setMessage('');
    setPdfResult(null);
    setLoading(true);
    
    try {
      const token = localStorage.getItem('token');
      const res = await fetch(`${API_BASE}/questions/generate-answer-key`, {
        method: 'POST',
        headers: { 
          'Content-Type': 'application/json', 
          Authorization: token ? `Bearer ${token}` : '' 
        },
        body: JSON.stringify({ 
          subject, 
          chapter, 
          difficulty, 
          type, 
          count, 
          classLevel,
          extraCommands: extraCommands.trim() || undefined,
          title: title.trim() || undefined
        }),
      });
      const data = await res.json();
      if (res.ok) {
        setPdfResult(data);
        setMessage('Answer key PDF generated successfully!');
      } else {
        setMessage(data.error || 'Answer key generation failed');
      }
    } catch (err) {
      setMessage('Error generating answer key');
    } finally {
      setLoading(false);
    }
  };

  const downloadPDF = (filename: string) => {
    window.open(`${API_BASE}/questions/download-pdf/${filename}`, '_blank');
  };

  return (
    <div className="dashboard">
      <nav className="dashboard-nav">
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

      <main className="dashboard-main">
        <div className="dashboard-container">
          <div className="dashboard-header">
            <h1>Question Generator</h1>
            <p>Create professional educational questions with AI assistance</p>
          </div>

          <div className="generator-form">
            <div className="form-section">
              <h3>Basic Settings</h3>
              <div className="form-grid">
                <div className="form-group">
                  <label>Subject</label>
                  <select value={subject} onChange={e => setSubject(e.target.value)}>
                    {subjects.map(sub => (
                      <option key={sub} value={sub}>{sub}</option>
                    ))}
                  </select>
                </div>

                <div className="form-group">
                  <label>Class Level</label>
                  <select value={classLevel} onChange={e => setClassLevel(e.target.value)}>
                    {classLevels.map(level => (
                      <option key={level} value={level}>{level}</option>
                    ))}
                  </select>
                </div>

                <div className="form-group">
                  <label>Chapter/Topic</label>
                  <input
                    type="text"
                    value={chapter}
                    onChange={e => setChapter(e.target.value)}
                    placeholder="e.g., Algebra, Mechanics, Photosynthesis"
                  />
                </div>

                <div className="form-group">
                  <label>Difficulty</label>
                  <select value={difficulty} onChange={e => setDifficulty(e.target.value)}>
                    <option value="easy">Easy</option>
                    <option value="medium">Medium</option>
                    <option value="hard">Hard</option>
                  </select>
                </div>

                <div className="form-group">
                  <label>Question Type</label>
                  <select value={type} onChange={e => setType(e.target.value)}>
                    <option value="multiple-choice">Multiple Choice</option>
                    <option value="short-answer">Short Answer</option>
                    <option value="true-false">True/False</option>
                  </select>
                </div>

                <div className="form-group">
                  <label>Number of Questions</label>
                  <input
                    type="number"
                    min={1}
                    max={20}
                    value={count}
                    onChange={e => setCount(Number(e.target.value))}
                  />
                </div>
              </div>
            </div>

            <div className="form-section">
              <h3>Advanced Options</h3>
              <div className="form-group">
                <label>PDF Title (Optional)</label>
                <input
                  type="text"
                  value={title}
                  onChange={e => setTitle(e.target.value)}
                  placeholder="Enter a custom title for your PDF..."
                />
                <small>This will appear as the main title at the top of your PDF</small>
              </div>
              <div className="form-group">
                <label>Extra Instructions (Optional)</label>
                <textarea
                  value={extraCommands}
                  onChange={e => setExtraCommands(e.target.value)}
                  placeholder="Add specific instructions, focus areas, or special requirements..."
                  rows={3}
                />
                <small>Examples: "Focus on real-world applications", "Include diagrams", "Use specific formulas"</small>
              </div>
            </div>

            <div className="form-section">
              <h3>PDF Options</h3>
              <div className="checkbox-group">
                <label className="checkbox-label">
                  <input 
                    type="checkbox" 
                    checked={includeAnswers} 
                    onChange={e => setIncludeAnswers(e.target.checked)}
                  />
                  Include Answers in PDF
                </label>
                <label className="checkbox-label">
                  <input 
                    type="checkbox" 
                    checked={includeExplanations} 
                    onChange={e => setIncludeExplanations(e.target.checked)}
                  />
                  Include Explanations in PDF
                </label>
              </div>
            </div>

            <div className="action-buttons">
              <button 
                className="btn primary" 
                onClick={handleGenerate}
                disabled={loading}
              >
                {loading ? 'Generating...' : 'Generate Questions'}
              </button>
              <button 
                className="btn secondary" 
                onClick={handleGeneratePDF}
                disabled={loading}
              >
                Generate PDF
              </button>
              <button 
                className="btn secondary" 
                onClick={handleGenerateAnswerKey}
                disabled={loading}
              >
                Generate Answer Key
              </button>
            </div>
          </div>

          {message && (
            <div className={`message ${message.includes('successfully') ? 'success' : 'error'}`}>
              {message}
            </div>
          )}

          {pdfResult && (
            <div className="pdf-result">
              <h3>PDF Generated Successfully!</h3>
              <p>Questions: {pdfResult.questions}</p>
              <button className="btn download" onClick={() => downloadPDF(pdfResult.pdfFilename)}>
                Download PDF
              </button>
            </div>
          )}

          {questionResult && (
            <div className="question-result">
              <h3>Generated Questions</h3>
              <pre>{JSON.stringify(questionResult, null, 2)}</pre>
            </div>
          )}
        </div>
      </main>

      <style>{`
        .dashboard {
          min-height: 100vh;
          background: #f8fafc;
        }

        .dashboard-nav {
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

        .dashboard-main {
          padding: 2rem;
        }

        .dashboard-container {
          max-width: 1200px;
          margin: 0 auto;
        }

        .dashboard-header {
          text-align: center;
          margin-bottom: 3rem;
        }

        .dashboard-header h1 {
          margin: 0 0 0.5rem 0;
          color: #333;
          font-size: 2.5rem;
        }

        .dashboard-header p {
          margin: 0;
          color: #666;
          font-size: 1.1rem;
        }

        .generator-form {
          background: white;
          border-radius: 12px;
          box-shadow: 0 4px 6px rgba(0,0,0,0.05);
          padding: 2rem;
          margin-bottom: 2rem;
        }

        .form-section {
          margin-bottom: 2rem;
        }

        .form-section h3 {
          margin: 0 0 1rem 0;
          color: #333;
          font-size: 1.25rem;
        }

        .form-grid {
          display: grid;
          grid-template-columns: repeat(auto-fit, minmax(200px, 1fr));
          gap: 1rem;
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

        .form-group input,
        .form-group select,
        .form-group textarea {
          padding: 0.75rem;
          border: 2px solid #e1e5e9;
          border-radius: 8px;
          font-size: 1rem;
          transition: border-color 0.3s ease;
        }

        .form-group input:focus,
        .form-group select:focus,
        .form-group textarea:focus {
          outline: none;
          border-color: #667eea;
        }

        .form-group small {
          color: #666;
          font-size: 0.8rem;
        }

        .checkbox-group {
          display: flex;
          flex-direction: column;
          gap: 1rem;
        }

        .checkbox-label {
          display: flex;
          align-items: center;
          gap: 0.5rem;
          font-size: 0.9rem;
          color: #333;
          cursor: pointer;
        }

        .checkbox-label input[type="checkbox"] {
          margin: 0;
        }

        .action-buttons {
          display: flex;
          gap: 1rem;
          flex-wrap: wrap;
          margin-top: 2rem;
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
          background: #10b981;
          color: white;
        }

        .btn.download {
          background: #f59e0b;
          color: white;
        }

        .btn:hover:not(:disabled) {
          transform: translateY(-2px);
          box-shadow: 0 4px 12px rgba(0,0,0,0.15);
        }

        .btn:disabled {
          opacity: 0.7;
          cursor: not-allowed;
        }

        .message {
          padding: 1rem;
          border-radius: 8px;
          margin-bottom: 1rem;
          text-align: center;
        }

        .message.success {
          background: #d1fae5;
          color: #065f46;
          border: 1px solid #a7f3d0;
        }

        .message.error {
          background: #fee;
          color: #c53030;
          border: 1px solid #fed7d7;
        }

        .pdf-result {
          background: #f0f9ff;
          border: 1px solid #0ea5e9;
          border-radius: 8px;
          padding: 1.5rem;
          margin-bottom: 1rem;
          text-align: center;
        }

        .pdf-result h3 {
          margin: 0 0 0.5rem 0;
          color: #0c4a6e;
        }

        .pdf-result p {
          margin: 0 0 1rem 0;
          color: #0369a1;
        }

        .question-result {
          background: white;
          border-radius: 8px;
          padding: 1.5rem;
          margin-top: 1rem;
        }

        .question-result h3 {
          margin: 0 0 1rem 0;
          color: #333;
        }

        .question-result pre {
          background: #f1f5f9;
          padding: 1rem;
          border-radius: 6px;
          overflow-x: auto;
          font-size: 0.9rem;
          max-height: 400px;
          overflow-y: auto;
        }

        @media (max-width: 768px) {
          .dashboard-main {
            padding: 1rem;
          }
          
          .form-grid {
            grid-template-columns: 1fr;
          }
          
          .action-buttons {
            flex-direction: column;
          }
          
          .nav-container {
            padding: 0 1rem;
          }
        }
      `}</style>
    </div>
  );
};

export default Dashboard; 