import React, { useState } from 'react';

const API_BASE = 'http://localhost:5000/api/v1';

function App() {
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [token, setToken] = useState('');
  const [questionResult, setQuestionResult] = useState<any>(null);
  const [subject, setSubject] = useState('Mathematics');
  const [chapter, setChapter] = useState(' ');
  const [difficulty, setDifficulty] = useState('medium');
  const [type, setType] = useState('multiple-choice');
  const [count, setCount] = useState(10);
  const [classLevel, setClassLevel] = useState('class 11');
  const [message, setMessage] = useState('');
  const [includeAnswers, setIncludeAnswers] = useState(false);
  const [includeExplanations, setIncludeExplanations] = useState(false);
  const [pdfResult, setPdfResult] = useState<any>(null);

  // Predefined subjects and class levels
  const subjects = [
    'Mathematics', 'Physics', 'Chemistry', 'Biology', 
    'English', 'History', 'Geography', 'Politics', 
    'Economics', 'Computer Science', 'Environmental Science'
  ];

  const classLevels = [
    'class 1', 'class 2', 'class 3', 'class 4', 'class 5', 'class 6', 'class 7', 'class 8', 'class 9', 'class 10', 'class 11', 'class 12'
  ];


  // when authentication will be needed 

  // const handleRegister = async () => {
  //   setMessage('');
  //   try {
  //     const res = await fetch(`${API_BASE}/auth/register`, {
  //       method: 'POST',
  //       headers: { 'Content-Type': 'application/json' },
  //       body: JSON.stringify({ email, password }),
  //     });
  //     const data = await res.json();
  //     if (res.ok) setMessage('Registered!');
  //     else setMessage(data.error || 'Registration failed');
  //   } catch (err) {
  //     setMessage('Error registering');
  //   }
  // };

  // const handleLogin = async () => {
  //   setMessage('');
  //   try {
  //     const res = await fetch(`${API_BASE}/auth/login`, {
  //       method: 'POST',
  //       headers: { 'Content-Type': 'application/json' },
  //       body: JSON.stringify({ email, password }),
  //     });
  //     const data = await res.json();
  //     if (res.ok && data.token) {
  //       setToken(data.token);
  //       setMessage('Logged in!');
  //     } else setMessage(data.error || 'Login failed');
  //   } catch (err) {
  //     setMessage('Error logging in');
  //   }
  // };

  const handleGenerate = async () => {
    setMessage('');
    setQuestionResult(null);
    try {
      const res = await fetch(`${API_BASE}/questions/generate`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json', Authorization: token ? `Bearer ${token}` : '' },
        body: JSON.stringify({ subject, chapter, difficulty, type, count, classLevel }),
      });
      const data = await res.json();
      if (res.ok) setQuestionResult(data);
      else setMessage(data.error || 'Generation failed');
    } catch (err) {
      setMessage('Error generating questions');
    }
  };

  const handleGeneratePDF = async () => {
    setMessage('');
    setPdfResult(null);
    try {
      const res = await fetch(`${API_BASE}/questions/generate-pdf`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json', Authorization: token ? `Bearer ${token}` : '' },
        body: JSON.stringify({ 
          subject, 
          chapter, 
          difficulty, 
          type, 
          count,
          classLevel,
          includeAnswers,
          includeExplanations
        }),
      });
      const data = await res.json();
      if (res.ok) {
        setPdfResult(data);
        setMessage('PDF generated successfully!');
      } else setMessage(data.error || 'PDF generation failed');
    } catch (err) {
      setMessage('Error generating PDF');
    }
  };

  const handleGenerateAnswerKey = async () => {
    setMessage('');
    setPdfResult(null);
    try {
      const res = await fetch(`${API_BASE}/questions/generate-answer-key`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json', Authorization: token ? `Bearer ${token}` : '' },
        body: JSON.stringify({ subject, chapter, difficulty, type, count, classLevel }),
      });
      const data = await res.json();
      if (res.ok) {
        setPdfResult(data);
        setMessage('Answer key PDF generated successfully!');
      } else setMessage(data.error || 'Answer key generation failed');
    } catch (err) {
      setMessage('Error generating answer key');
    }
  };

  const downloadPDF = (filename: string) => {
    window.open(`${API_BASE}/questions/download-pdf/${filename}`, '_blank');
  };

  return (
    <div className="app-bg">
      <div className="card">
        <h2>Question Generator</h2>
        <div className="section">
          {/* <input
            className="input"
            placeholder="Email"
            value={email}
            onChange={e => setEmail(e.target.value)}
            autoComplete="username"
          />
          <input
            className="input"
            placeholder="Password"
            type="password"
            value={password}
            onChange={e => setPassword(e.target.value)}
            autoComplete="current-password"
          />
          <button className="btn" onClick={handleRegister}>Register</button>
          <button className="btn" onClick={handleLogin}>Login</button> */}
        </div>
        <div className="divider" />
        <div className="section">
          <select className="input" value={subject} onChange={e => setSubject(e.target.value)}>
            {subjects.map(sub => (
              <option key={sub} value={sub}>{sub}</option>
            ))}
          </select>
          <select className="input" value={classLevel} onChange={e => setClassLevel(e.target.value)}>
            {classLevels.map(level => (
              <option key={level} value={level}>{level}</option>
            ))}
          </select>
          <input className="input" placeholder="Chapter" value={chapter} onChange={e => setChapter(e.target.value)} />
          <select className="input" value={difficulty} onChange={e => setDifficulty(e.target.value)}>
            <option value="easy">Easy</option>
            <option value="medium">Medium</option>
            <option value="hard">Hard</option>
          </select>
          <select className="input" value={type} onChange={e => setType(e.target.value)}>
            <option value="multiple-choice">Multiple Choice</option>
            <option value="short-answer">Short Answer</option>
            <option value="true-false">True/False</option>
          </select>
          <input
            className="input"
            type="number"
            min={1}
            max={10}
            value={count}
            onChange={e => setCount(Number(e.target.value))}
            style={{ width: 80 }}
          />
          <button className="btn primary" onClick={handleGenerate}>Generate Questions</button>
        </div>
        
        {/* PDF Options */}
        <div className="section">
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
        
        <div className="section">
          <button className="btn secondary" onClick={handleGeneratePDF}>Generate PDF</button>
          <button className="btn secondary" onClick={handleGenerateAnswerKey}>Generate Answer Key</button>
        </div>
        
        {message && <div className="message">{message}</div>}
        
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
          <pre className="result">
            {JSON.stringify(questionResult, null, 2)}
          </pre>
        )}
        <div className="footer">
          <small>Backend API must be running at <b>http://localhost:5000</b></small>
        </div>
      </div>
      <style>{`
        .app-bg {
          min-height: 100vh;
          background: linear-gradient(135deg, #f8fafc 0%, #e0e7ff 100%);
          display: flex;
          align-items: center;
          justify-content: center;
        }
        .card {
          background: #fff;
          border-radius: 18px;
          box-shadow: 0 4px 24px rgba(0,0,0,0.08);
          padding: 2.5rem 2rem 2rem 2rem;
          max-width: 420px;
          width: 100%;
        }
        .section {
          display: flex;
          flex-wrap: wrap;
          gap: 0.5rem;
          margin-bottom: 1rem;
        }
        .input {
          flex: 1 1 160px;
          padding: 0.5rem 0.75rem;
          border: 1px solid #cbd5e1;
          border-radius: 6px;
          font-size: 1rem;
          outline: none;
          transition: border 0.2s;
        }
        .input:focus {
          border-color: #6366f1;
        }
        .btn {
          padding: 0.5rem 1.1rem;
          border: none;
          border-radius: 6px;
          background: #6366f1;
          color: #fff;
          font-weight: 500;
          cursor: pointer;
          margin-left: 0.25rem;
          transition: background 0.2s;
        }
        .btn.primary {
          background: #2563eb;
        }
        .btn:hover {
          background: #4f46e5;
        }
        .divider {
          border-top: 1px solid #e5e7eb;
          margin: 1rem 0;
        }
        .message {
          color: #dc2626;
          margin-bottom: 1rem;
          text-align: center;
        }
        .result {
          background: #f1f5f9;
          padding: 1rem;
          border-radius: 8px;
          font-size: 0.95rem;
          margin-top: 1rem;
          max-height: 320px;
          overflow: auto;
        }
        .footer {
          margin-top: 2rem;
          color: #888;
          text-align: center;
        }
        .checkbox-label {
          display: flex;
          align-items: center;
          gap: 0.5rem;
          font-size: 0.9rem;
          color: #374151;
          cursor: pointer;
        }
        .checkbox-label input[type="checkbox"] {
          margin: 0;
        }
        .btn.secondary {
          background: #10b981;
          margin-right: 0.5rem;
        }
        .btn.download {
          background: #f59e0b;
        }
        .pdf-result {
          background: #f0f9ff;
          border: 1px solid #0ea5e9;
          border-radius: 8px;
          padding: 1rem;
          margin-top: 1rem;
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
      `}</style>
    </div>
  );
}

export default App;
