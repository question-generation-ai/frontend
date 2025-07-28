import React, { useState } from 'react';

const API_BASE = 'http://localhost:5000/api/v1';

function App() {
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [token, setToken] = useState('');
  const [questionResult, setQuestionResult] = useState<any>(null);
  const [subject, setSubject] = useState('Mathematics');
  const [chapter, setChapter] = useState('Algebra');
  const [difficulty, setDifficulty] = useState('medium');
  const [type, setType] = useState('multiple-choice');
  const [count, setCount] = useState(10);
  const [message, setMessage] = useState('');

  const handleRegister = async () => {
    setMessage('');
    try {
      const res = await fetch(`${API_BASE}/auth/register`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ email, password }),
      });
      const data = await res.json();
      if (res.ok) setMessage('Registered!');
      else setMessage(data.error || 'Registration failed');
    } catch (err) {
      setMessage('Error registering');
    }
  };

  const handleLogin = async () => {
    setMessage('');
    try {
      const res = await fetch(`${API_BASE}/auth/login`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ email, password }),
      });
      const data = await res.json();
      if (res.ok && data.token) {
        setToken(data.token);
        setMessage('Logged in!');
      } else setMessage(data.error || 'Login failed');
    } catch (err) {
      setMessage('Error logging in');
    }
  };

  const handleGenerate = async () => {
    setMessage('');
    setQuestionResult(null);
    try {
      const res = await fetch(`${API_BASE}/questions/generate`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json', Authorization: token ? `Bearer ${token}` : '' },
        body: JSON.stringify({ subject, chapter, difficulty, type, count }),
      });
      const data = await res.json();
      if (res.ok) setQuestionResult(data);
      else setMessage(data.error || 'Generation failed');
    } catch (err) {
      setMessage('Error generating questions');
    }
  };

  return (
    <div className="app-bg">
      <div className="card">
        <h2>Question Generator</h2>
        <div className="section">
          <input
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
          <button className="btn" onClick={handleLogin}>Login</button>
        </div>
        <div className="divider" />
        <div className="section">
          <select className="input" value={subject} onChange={e => setSubject(e.target.value)}>
            <option>Mathematics</option>
            <option>Science</option>
            <option>English</option>
            <option>Social Studies</option>
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
        {message && <div className="message">{message}</div>}
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
      `}</style>
    </div>
  );
}

export default App;
