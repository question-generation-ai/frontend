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
  const [count, setCount] = useState(1);
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
    <div style={{ maxWidth: 600, margin: '2rem auto', fontFamily: 'sans-serif' }}>
      <h2>Question Generator API Tester</h2>
      <div style={{ marginBottom: 16 }}>
        <input placeholder="Email" value={email} onChange={e => setEmail(e.target.value)} />
        <input placeholder="Password" type="password" value={password} onChange={e => setPassword(e.target.value)} />
        <button onClick={handleRegister}>Register</button>
        <button onClick={handleLogin}>Login</button>
      </div>
      <div style={{ marginBottom: 16 }}>
        <select value={subject} onChange={e => setSubject(e.target.value)}>
          <option>Mathematics</option>
          <option>Science</option>
          <option>English</option>
          <option>Social Studies</option>
        </select>
        <input placeholder="Chapter" value={chapter} onChange={e => setChapter(e.target.value)} />
        <input placeholder="Difficulty" value={difficulty} onChange={e => setDifficulty(e.target.value)} />
        <input placeholder="Type" value={type} onChange={e => setType(e.target.value)} />
        <input type="number" min={1} max={10} value={count} onChange={e => setCount(Number(e.target.value))} />
        <button onClick={handleGenerate}>Generate Questions</button>
      </div>
      {message && <div style={{ color: 'red', marginBottom: 16 }}>{message}</div>}
      {questionResult && (
        <pre style={{ background: '#f4f4f4', padding: 16, borderRadius: 8 }}>
          {JSON.stringify(questionResult, null, 2)}
        </pre>
      )}
      <div style={{ marginTop: 32, color: '#888' }}>
        <small>Backend API must be running at <b>http://localhost:5000</b></small>
      </div>
    </div>
  );
}

export default App;
