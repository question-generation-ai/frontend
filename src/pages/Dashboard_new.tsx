import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';
import { apiFetch, API_BASE } from '../lib/api';

const Dashboard: React.FC = () => {
  const { user, logout } = useAuth();
  const navigate = useNavigate();
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

  const subjects = ['Mathematics', 'Physics', 'Chemistry', 'Biology', 'Computer Science', 'English'];
  const classLevels = ['class 9', 'class 10', 'class 11', 'class 12'];
  const chapters = {
    Mathematics: ['Algebra', 'Geometry', 'Trigonometry', 'Calculus', 'Statistics'],
    Physics: ['Mechanics', 'Thermodynamics', 'Electromagnetism', 'Optics', 'Modern Physics'],
    Chemistry: ['Organic Chemistry', 'Inorganic Chemistry', 'Physical Chemistry'],
    Biology: ['Cell Biology', 'Genetics', 'Evolution', 'Ecology', 'Human Physiology'],
    'Computer Science': ['Programming', 'Data Structures', 'Algorithms', 'Database', 'Networks'],
    English: ['Grammar', 'Literature', 'Composition', 'Reading Comprehension']
  };

  const handleGenerateQuestions = async () => {
    setMessage('');
    setQuestionResult(null);
    setLoading(true);
    
    try {
      const res = await apiFetch(`/v1/questions/generate`, {
        method: 'POST',
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
      setQuestionResult(res);
      setMessage('Questions generated successfully!');
    } catch (err) {
      setMessage('Error generating questions');
    } finally {
      setLoading(false);
    }
  };

  const generatePDF = async () => {
    setMessage('');
    setLoading(true);
    try {
      console.log(`[Frontend] Generating PDF with direct download`);
      
      const response = await fetch(`${API_BASE}/v1/questions/generate-pdf`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${localStorage.getItem('token')}`
        },
        body: JSON.stringify({
          subject,
          chapter,
          difficulty,
          type,
          count,
          classLevel,
          extraCommands: extraCommands.trim() || undefined,
          customTitle: title.trim() || undefined,
          includeAnswers,
          includeExplanations
        }),
      });

      if (!response.ok) {
        throw new Error(`HTTP error! status: ${response.status}`);
      }

      // Get the PDF blob
      const blob = await response.blob();
      console.log(`[Frontend] PDF blob received - Size: ${blob.size} bytes`);

      // Create download link
      const url = window.URL.createObjectURL(blob);
      const link = document.createElement('a');
      link.href = url;
      
      // Get filename from Content-Disposition header or use default
      const contentDisposition = response.headers.get('Content-Disposition');
      const filename = contentDisposition 
        ? contentDisposition.split('filename=')[1]?.replace(/"/g, '') 
        : `questions_${Date.now()}.pdf`;
      
      link.download = filename;
      document.body.appendChild(link);
      link.click();
      document.body.removeChild(link);
      window.URL.revokeObjectURL(url);

      setMessage('PDF downloaded successfully!');
      console.log(`[Frontend] PDF download completed: ${filename}`);
    } catch (err: any) {
      console.error(`[Frontend] PDF generation error:`, err);
      setMessage(`Error generating PDF: ${err.message}`);
    } finally {
      setLoading(false);
    }
  };

  const generateAnswerKeyPDF = async () => {
    setMessage('');
    setLoading(true);
    
    try {
      console.log(`[Frontend] Generating Answer Key PDF with direct download`);
      
      const response = await fetch(`${API_BASE}/v1/questions/generate-answer-key`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${localStorage.getItem('token')}`
        },
        body: JSON.stringify({ 
          subject, 
          chapter, 
          difficulty, 
          type, 
          count, 
          classLevel,
          extraCommands: extraCommands.trim() || undefined,
          customTitle: title.trim() || undefined
        }),
      });

      if (!response.ok) {
        throw new Error(`HTTP error! status: ${response.status}`);
      }

      // Get the PDF blob
      const blob = await response.blob();
      console.log(`[Frontend] Answer Key PDF blob received - Size: ${blob.size} bytes`);

      // Create download link
      const url = window.URL.createObjectURL(blob);
      const link = document.createElement('a');
      link.href = url;
      
      // Get filename from Content-Disposition header or use default
      const contentDisposition = response.headers.get('Content-Disposition');
      const filename = contentDisposition 
        ? contentDisposition.split('filename=')[1]?.replace(/"/g, '') 
        : `answer_key_${Date.now()}.pdf`;
      
      link.download = filename;
      document.body.appendChild(link);
      link.click();
      document.body.removeChild(link);
      window.URL.revokeObjectURL(url);

      setMessage('Answer Key PDF downloaded successfully!');
      console.log(`[Frontend] Answer Key PDF download completed: ${filename}`);
    } catch (err: any) {
      console.error(`[Frontend] Answer Key PDF generation error:`, err);
      setMessage(`Error generating answer key: ${err.message}`);
    } finally {
      setLoading(false);
    }
  };

  const downloadPDF = async (filename: string) => {
    try {
      console.log(`[Frontend] Attempting to download: ${filename}`);
      console.log(`[Frontend] Download URL: ${API_BASE}/v1/questions/download-pdf/${filename}`);
      
      // Create a direct download link
      const downloadUrl = `${API_BASE}/v1/questions/download-pdf/${filename}`;
      const link = document.createElement('a');
      link.href = downloadUrl;
      link.download = filename;
      link.target = '_blank';
      
      // Add to DOM temporarily and click
      document.body.appendChild(link);
      link.click();
      document.body.removeChild(link);
      
      console.log(`[Frontend] Download initiated for: ${filename}`);
    } catch (error) {
      console.error(`[Frontend] Download error:`, error);
      alert('Failed to download PDF. Please try again.');
    }
  };

  const handleLogout = async () => {
    try {
      await logout();
      navigate('/');
    } catch (error) {
      console.error('Logout error:', error);
      // Navigate anyway in case of error
      navigate('/');
    }
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
            <button onClick={handleLogout} className="logout-btn">Logout</button>
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
                  <label>Chapter</label>
                  <select value={chapter} onChange={e => setChapter(e.target.value)}>
                    {(chapters[subject as keyof typeof chapters] || []).map(ch => (
                      <option key={ch} value={ch}>{ch}</option>
                    ))}
                  </select>
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
                    <option value="essay">Essay</option>
                    <option value="fill-in-the-blank">Fill in the Blank</option>
                    <option value="true-false">True/False</option>
                  </select>
                </div>

                <div className="form-group">
                  <label>Number of Questions</label>
                  <input 
                    type="number" 
                    value={count} 
                    onChange={e => setCount(parseInt(e.target.value))}
                    min="1"
                    max="50"
                  />
                </div>
              </div>
            </div>

            <div className="form-section">
              <h3>Customization</h3>
              <div className="form-group">
                <label>Title (Optional)</label>
                <input 
                  type="text" 
                  value={title} 
                  onChange={e => setTitle(e.target.value)}
                  placeholder="e.g., Midterm Exam - Algebra"
                />
              </div>
              
              <div className="form-group">
                <label>Additional Instructions (Optional)</label>
                <textarea 
                  value={extraCommands} 
                  onChange={e => setExtraCommands(e.target.value)}
                  placeholder="Any specific requirements or focus areas..."
                  rows={4}
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
                onClick={generatePDF}
                disabled={loading}
              >
                {loading ? 'Generating...' : 'Generate & Download PDF'}
              </button>
              <button 
                className="btn secondary" 
                onClick={generateAnswerKeyPDF}
                disabled={loading}
              >
                Generate & Download Answer Key
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
          background: linear-gradient(135deg, #667eea 0%, #764ba2 100%);
          position: relative;
        }

        .dashboard::before {
          content: '';
          position: absolute;
          top: 0;
          left: 0;
          right: 0;
          bottom: 0;
          background: 
            radial-gradient(circle at 20% 80%, rgba(120, 200, 255, 0.1) 0%, transparent 50%),
            radial-gradient(circle at 80% 20%, rgba(255, 120, 200, 0.1) 0%, transparent 50%),
            radial-gradient(circle at 40% 40%, rgba(120, 255, 120, 0.1) 0%, transparent 50%);
          pointer-events: none;
        }

        .dashboard-nav {
          background: rgba(255, 255, 255, 0.95);
          backdrop-filter: blur(20px);
          box-shadow: 0 8px 32px rgba(0, 0, 0, 0.1);
          padding: 1rem 0;
          position: sticky;
          top: 0;
          z-index: 100;
          border-bottom: 1px solid rgba(255, 255, 255, 0.2);
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
          background: linear-gradient(135deg, #667eea 0%, #764ba2 100%);
          -webkit-background-clip: text;
          -webkit-text-fill-color: transparent;
          background-clip: text;
          font-size: 1.5rem;
          font-weight: 700;
        }

        .nav-user {
          display: flex;
          align-items: center;
          gap: 1rem;
        }

        .nav-user span {
          color: #333;
          font-size: 0.9rem;
          font-weight: 500;
          padding: 0.5rem 1rem;
          background: rgba(102, 126, 234, 0.1);
          border-radius: 20px;
          border: 1px solid rgba(102, 126, 234, 0.2);
        }

        .logout-btn {
          background: linear-gradient(135deg, #ef4444 0%, #dc2626 100%);
          color: white;
          border: none;
          padding: 0.5rem 1.5rem;
          border-radius: 25px;
          cursor: pointer;
          font-size: 0.9rem;
          font-weight: 600;
          transition: all 0.3s ease;
          box-shadow: 0 4px 15px rgba(239, 68, 68, 0.3);
        }

        .logout-btn:hover {
          transform: translateY(-2px);
          box-shadow: 0 8px 25px rgba(239, 68, 68, 0.4);
        }

        .dashboard-main {
          padding: 2rem;
          position: relative;
          z-index: 1;
        }

        .dashboard-container {
          max-width: 1200px;
          margin: 0 auto;
        }

        .dashboard-header {
          text-align: center;
          margin-bottom: 3rem;
          padding: 2rem;
          background: rgba(255, 255, 255, 0.1);
          backdrop-filter: blur(20px);
          border-radius: 20px;
          border: 1px solid rgba(255, 255, 255, 0.2);
          box-shadow: 0 8px 32px rgba(0, 0, 0, 0.1);
        }

        .dashboard-header h1 {
          margin: 0 0 0.5rem 0;
          color: white;
          font-size: 3rem;
          font-weight: 700;
          text-shadow: 0 2px 4px rgba(0, 0, 0, 0.1);
          background: linear-gradient(135deg, #ffffff 0%, #f0f9ff 100%);
          -webkit-background-clip: text;
          -webkit-text-fill-color: transparent;
          background-clip: text;
        }

        .dashboard-header p {
          margin: 0;
          color: rgba(255, 255, 255, 0.9);
          font-size: 1.2rem;
          font-weight: 400;
        }

        .generator-form {
          background: rgba(255, 255, 255, 0.95);
          backdrop-filter: blur(20px);
          border-radius: 20px;
          box-shadow: 
            0 8px 32px rgba(0, 0, 0, 0.1),
            inset 0 1px 0 rgba(255, 255, 255, 0.5);
          padding: 2.5rem;
          margin-bottom: 2rem;
          border: 1px solid rgba(255, 255, 255, 0.2);
          position: relative;
          overflow: hidden;
        }

        .generator-form::before {
          content: '';
          position: absolute;
          top: 0;
          left: 0;
          right: 0;
          height: 3px;
          background: linear-gradient(90deg, #667eea 0%, #764ba2 100%);
        }

        .form-section {
          margin-bottom: 2rem;
        }

        .form-section h3 {
          margin: 0 0 1.5rem 0;
          color: #333;
          font-size: 1.4rem;
          font-weight: 600;
          position: relative;
          padding-bottom: 0.5rem;
        }

        .form-section h3::after {
          content: '';
          position: absolute;
          bottom: 0;
          left: 0;
          width: 50px;
          height: 2px;
          background: linear-gradient(90deg, #667eea 0%, #764ba2 100%);
          border-radius: 1px;
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
          padding: 0.875rem 1rem;
          border: 2px solid #e2e8f0;
          border-radius: 12px;
          font-size: 1rem;
          transition: all 0.3s ease;
          background: rgba(255, 255, 255, 0.8);
          backdrop-filter: blur(10px);
          box-shadow: 0 2px 8px rgba(0, 0, 0, 0.05);
        }

        .form-group input:focus,
        .form-group select:focus,
        .form-group textarea:focus {
          outline: none;
          border-color: #667eea;
          background: rgba(255, 255, 255, 0.95);
          box-shadow: 
            0 0 0 3px rgba(102, 126, 234, 0.1),
            0 4px 12px rgba(0, 0, 0, 0.1);
          transform: translateY(-1px);
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
          background: linear-gradient(135deg, #667eea 0%, #764ba2 100%);
          color: white;
          box-shadow: 0 4px 15px rgba(102, 126, 234, 0.3);
          position: relative;
          overflow: hidden;
        }

        .btn.primary::before {
          content: '';
          position: absolute;
          top: 0;
          left: -100%;
          width: 100%;
          height: 100%;
          background: linear-gradient(90deg, transparent, rgba(255, 255, 255, 0.2), transparent);
          transition: left 0.5s;
        }

        .btn.primary:hover::before {
          left: 100%;
        }

        .btn.secondary {
          background: linear-gradient(135deg, #10b981 0%, #059669 100%);
          color: white;
          box-shadow: 0 4px 15px rgba(16, 185, 129, 0.3);
        }

        .btn.download {
          background: linear-gradient(135deg, #f59e0b 0%, #d97706 100%);
          color: white;
          box-shadow: 0 4px 15px rgba(245, 158, 11, 0.3);
          cursor: pointer;
          pointer-events: auto;
          z-index: 10;
          position: relative;
        }

        .btn:hover:not(:disabled) {
          transform: translateY(-3px);
          box-shadow: 0 8px 25px rgba(0, 0, 0, 0.2);
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
          background: linear-gradient(135deg, #f0f9ff 0%, #e0f2fe 100%);
          border: 2px solid #0ea5e9;
          border-radius: 16px;
          padding: 2rem;
          margin-bottom: 1rem;
          text-align: center;
          box-shadow: 0 8px 25px rgba(14, 165, 233, 0.15);
          position: relative;
          overflow: hidden;
        }

        .pdf-result::before {
          content: '';
          position: absolute;
          top: -50%;
          left: -50%;
          width: 200%;
          height: 200%;
          background: radial-gradient(circle, rgba(14, 165, 233, 0.05) 0%, transparent 70%);
          animation: shimmer 3s infinite;
        }

        @keyframes shimmer {
          0% { transform: rotate(0deg); }
          100% { transform: rotate(360deg); }
        }

        .pdf-result h3 {
          margin: 0 0 0.5rem 0;
          color: #0c4a6e;
          position: relative;
          z-index: 1;
        }

        .pdf-result p {
          margin: 0 0 1rem 0;
          color: #0369a1;
          position: relative;
          z-index: 1;
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

          .dashboard-header h1 {
            font-size: 2rem;
          }

          .generator-form {
            padding: 1.5rem;
          }
        }
      `}</style>
    </div>
  );
};

export default Dashboard;
