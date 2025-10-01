import React, { useState, useEffect, useCallback } from 'react';
import { useNavigate } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';
import { apiFetch, API_BASE } from '../lib/api';
import LoaderOverlay from '../components/LoaderOverlay';
import MixedQuestionGenerator from '../components/MixedQuestionGenerator';

interface QuestionResult {
  questions: any[];
  [key: string]: any;
}

interface ABResult {
  gemini: QuestionResult;
  openai: QuestionResult;
}

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
  const [provider, setProvider] = useState<'gemini' | 'openai'>('gemini');
  const [includeAnswers, setIncludeAnswers] = useState(false);
  const [includeExplanations, setIncludeExplanations] = useState(false);
  const [pdfResult, setPdfResult] = useState<any>(null);
  const [questionResult, setQuestionResult] = useState<QuestionResult | null>(null);
  const [abResult, setAbResult] = useState<ABResult | null>(null);
  const [abChoice, setAbChoice] = useState<'gemini' | 'openai' | ''>('');
  const [loading, setLoading] = useState(false);
  const [loadingMessage, setLoadingMessage] = useState<string>('Processing...');
  const [activeTab, setActiveTab] = useState<'single' | 'mixed'>('single');
  const [subjects, setSubjects] = useState<string[]>([]);
  const [topics, setTopics] = useState<any[]>([]);

  const classLevels = [
    'class 9', 'class 10', 'class 11', 'class 12'
  ];

  useEffect(() => {
    const fetchSubjects = async () => {
      if (classLevel) {
        try {
          const res = await apiFetch(`/v1/syllabus/${classLevel}/subjects`);
          setSubjects(res || []);
          if (res && res.length > 0) {
            setSubject(res[0]);
          }
        } catch (error) {
          console.error('Failed to fetch subjects', error);
          setSubjects([]);
        }
      }
    };
    fetchSubjects();
  }, [classLevel]);

  useEffect(() => {
    const fetchTopics = async () => {
      if (classLevel && subject) {
        try {
          const res = await apiFetch(`/v1/syllabus/${classLevel}/${subject}/topics`);
          setTopics(res || []);
          if (res && res.length > 0) {
            setChapter(res[0].chapter);
          }
        } catch (error) {
          console.error('Failed to fetch topics', error);
          setTopics([]);
        }
      }
    };
    fetchTopics();
  }, [classLevel, subject]);

  const handleGenerate = async () => {
    setMessage('');
    setQuestionResult(null);
    setLoadingMessage('Generating questions...');
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
          title: title.trim() || undefined,
          provider,
          syllabus: topics.find(t => t.chapter === chapter)
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

  const handleABGenerate = async () => {
    setMessage('');
    setAbResult(null);
    setAbChoice('');
    setLoadingMessage('Running A/B test...');
    setLoading(true);
    try {
      const res = await apiFetch(`/v1/questions/ab-generate`, {
        method: 'POST',
        body: JSON.stringify({
          subject,
          chapter,
          difficulty,
          type,
          count,
          classLevel,
          extraCommands: extraCommands.trim() || undefined,
          title: title.trim() || undefined,
        }),
      });
      setAbResult(res);
      setMessage('A/B questions generated!');
    } catch (err: any) {
      setMessage(`Error generating A/B questions: ${err.message || 'Unknown error'}`);
    } finally {
      setLoading(false);
    }
  };

  const handleABFeedback = async () => {
    if (!abChoice) {
      setMessage('Please select a version (Model A or Model B) first.');
      return;
    }
    if (!abResult) return;

    try {
      await apiFetch(`/v1/questions/ab-feedback`, {
        method: 'POST',
        body: JSON.stringify({ selection: abChoice, reason: 'Tester preferred this set' }),
      });
      setMessage('Thanks! Your preference has been recorded.');
      
      // Set the selected questions as the main result for PDF downloads
      const selectedQuestions = abChoice === 'gemini' ? abResult.gemini : abResult.openai;
      setQuestionResult(selectedQuestions);
    } catch (err: any) {
      setMessage(`Error submitting feedback: ${err.message || 'Unknown error'}`);
    }
  };

  const handleDownloadABPDF = async (version: 'gemini' | 'openai') => {
    if (!abResult || !abResult[version] || !abResult[version].questions) {
      setMessage('No questions available for PDF generation');
      return;
    }

    setMessage('');
    setLoadingMessage(`Creating PDF from ${version === 'gemini' ? 'Model A' : 'Model B'} questions...`);
    setLoading(true);
    
    try {
      const response = await fetch(`${API_BASE}/v1/questions/create-pdf`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          Authorization: `Bearer ${localStorage.getItem('token') || ''}`,
        },
        body: JSON.stringify({ 
          questions: abResult[version].questions,
          subject, 
          chapter, 
          difficulty,
          customTitle: `${title.trim() || `${subject} - ${chapter}`} (${version === 'gemini' ? 'Model A' : 'Model B'})`,
          includeAnswers,
          includeExplanations
        }),
      });

      if (!response.ok) {
        throw new Error(`HTTP ${response.status}`);
      }

      const blob = await response.blob();
      const url = window.URL.createObjectURL(blob);
      const link = document.createElement('a');
      link.href = url;
      const contentDisposition = response.headers.get('Content-Disposition');
      const filename = contentDisposition ? (contentDisposition.split('filename=')[1] || 'ab_test.pdf').replace(/"/g, '') : `ab_test_${version}_${Date.now()}.pdf`;
      link.download = filename;
      document.body.appendChild(link);
      link.click();
      document.body.removeChild(link);
      window.URL.revokeObjectURL(url);

      setMessage(`${version === 'gemini' ? 'Model A' : 'Model B'} PDF downloaded successfully!`);
    } catch (err: any) {
      console.error('A/B PDF download error:', err);
      setMessage(`Error creating ${version === 'gemini' ? 'Model A' : 'Model B'} PDF: ${err.message || 'Unknown error'}`);
    } finally {
      setLoading(false);
    }
  };

  const handleDownloadPDF = async () => {
    if (!questionResult || !questionResult.questions || questionResult.questions.length === 0) {
      setMessage('Please generate questions first before downloading PDF');
      return;
    }

    setMessage('');
    setLoadingMessage('Creating PDF from generated questions...');
    setLoading(true);
    
    try {
      // Send the already generated questions to create PDF
      const response = await fetch(`${API_BASE}/v1/questions/create-pdf`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          Authorization: `Bearer ${localStorage.getItem('token') || ''}`,
        },
        body: JSON.stringify({ 
          questions: questionResult.questions,
          subject, 
          chapter, 
          difficulty,
          customTitle: title.trim() || undefined,
          includeAnswers,
          includeExplanations
        }),
      });

      if (!response.ok) {
        throw new Error(`HTTP ${response.status}`);
      }

      const blob = await response.blob();
      const url = window.URL.createObjectURL(blob);
      const link = document.createElement('a');
      link.href = url;
      const contentDisposition = response.headers.get('Content-Disposition');
      const filename = contentDisposition ? (contentDisposition.split('filename=')[1] || 'questions.pdf').replace(/"/g, '') : `questions_${Date.now()}.pdf`;
      link.download = filename;
      document.body.appendChild(link);
      link.click();
      document.body.removeChild(link);
      window.URL.revokeObjectURL(url);

      setMessage('PDF downloaded successfully!');
    } catch (err: any) {
      console.error('PDF download error:', err);
      setMessage(`Error creating PDF: ${err.message || 'Unknown error'}`);
    } finally {
      setLoading(false);
    }
  };

  const handleGenerateAnswerKey = async () => {
    if (!questionResult || !questionResult.questions || questionResult.questions.length === 0) {
      setMessage('Please generate questions first before creating answer key');
      return;
    }

    setMessage('');
    setLoadingMessage('Creating answer key PDF...');
    setLoading(true);
    
    try {
      const response = await fetch(`${API_BASE}/v1/questions/create-answer-key`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          Authorization: `Bearer ${localStorage.getItem('token') || ''}`,
        },
        body: JSON.stringify({ 
          questions: questionResult.questions,
          subject, 
          chapter, 
          difficulty,
          customTitle: title.trim() || undefined
        }),
      });

      if (!response.ok) {
        throw new Error(`HTTP ${response.status}`);
      }

      const blob = await response.blob();
      const url = window.URL.createObjectURL(blob);
      const link = document.createElement('a');
      link.href = url;
      const cd = response.headers.get('Content-Disposition');
      const fn = cd ? (cd.split('filename=')[1] || 'answer_key.pdf').replace(/"/g, '') : `answer_key_${Date.now()}.pdf`;
      link.download = fn;
      document.body.appendChild(link);
      link.click();
      document.body.removeChild(link);
      window.URL.revokeObjectURL(url);

      setMessage('Answer key PDF downloaded successfully!');
    } catch (err: any) {
      console.error('Answer key download error:', err);
      setMessage(`Error creating answer key: ${err.message || 'Unknown error'}`);
    } finally {
      setLoading(false);
    }
  };

  const downloadPDF = useCallback((filename: string) => {
    window.open(`${API_BASE}/v1/questions/download-pdf/${filename}`, '_blank');
  }, []);

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

  // Suppress unused variable warning with comment
  // eslint-disable-next-line @typescript-eslint/no-unused-vars
  const _unusedPdfResult = pdfResult;

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

          <div className="tab-navigation">
            <button 
              className={`tab-btn ${activeTab === 'single' ? 'active' : ''}`}
              onClick={() => setActiveTab('single')}
            >
              Single Question Type
            </button>
            <button 
              className={`tab-btn ${activeTab === 'mixed' ? 'active' : ''}`}
              onClick={() => setActiveTab('mixed')}
            >
              Mixed Question Types
            </button>
          </div>

          <div className="generator-form">
            {activeTab === 'single' && (
              <>
                <div className="form-section">
                  <h3>Basic Settings</h3>

                  <div className="form-grid">
                  <div className="form-group">
                      <label htmlFor="classLevel">Class Level</label>
                      <select id="classLevel" value={classLevel} onChange={e => setClassLevel(e.target.value)}>
                        {classLevels.map(level => (
                          <option key={level} value={level}>{level}</option>
                        ))}
                      </select>
                    </div>

                  
                    <div className="form-group">
                      <label htmlFor="subject">Subject</label>
                      <select id="subject" value={subject} onChange={e => setSubject(e.target.value)}>
                        {subjects.map(sub => (
                          <option key={sub} value={sub}>{sub}</option>
                        ))}
                      </select>
                    </div>

                    <div className="form-group">
                      <label htmlFor="chapter">Chapter/Topic</label>
                      <select id="chapter" value={chapter} onChange={e => setChapter(e.target.value)}>
                        {topics.map(topic => (
                          <option key={topic.chapter} value={topic.chapter}>{topic.chapter}</option>
                        ))}
                      </select>
                    </div>

                    <div className="form-group">
                      <label htmlFor="difficulty">Difficulty</label>
                      <select id="difficulty" value={difficulty} onChange={e => setDifficulty(e.target.value)}>
                        <option value="easy">Easy</option>
                        <option value="medium">Medium</option>
                        <option value="hard">Hard</option>
                      </select>
                    </div>

                    <div className="form-group">
                      <label htmlFor="type">Question Type</label>
                      <select id="type" value={type} onChange={e => setType(e.target.value)}>
                        <option value="multiple-choice">Multiple Choice</option>
                        <option value="short-answer">Short Answer</option>
                        <option value="true-false">True/False</option>
                        <option value="long-answer">Long Answer</option>
                        <option value="application-based">Application Based</option>
                        <option value="fill-in-the-blank">Fill in the Blank</option>
                      
                      </select>
                    </div>

                    <div className="form-group">
                      <label htmlFor="count">Number of Questions</label>
                      <input
                        id="count"
                        type="number"
                        min={1}
                        max={20}
                        value={count}
                        onChange={e => setCount(Number(e.target.value))}
                      />
                    </div>
                    <div className="form-group">
                      <label htmlFor="provider">AI Provider</label>
                      <select id="provider" value={provider} onChange={e => setProvider(e.target.value as 'gemini' | 'openai')}>
                        <option value="gemini">Model A</option>
                        <option value="openai">Model B</option>
                      </select>
                    </div>
                  </div>
                </div>

                <div className="form-section">
                  <h3>Advanced Options</h3>
                  <div className="form-group">
                    <label htmlFor="title">PDF Title (Optional)</label>
                    <input
                      id="title"
                      type="text"
                      value={title}
                      onChange={e => setTitle(e.target.value)}
                      placeholder="Enter a custom title for your PDF..."
                    />
                    <small>This will appear as the main title at the top of your PDF</small>
                  </div>
                  <div className="form-group">
                    <label htmlFor="extraCommands">Extra Instructions (Optional)</label>
                    <textarea
                      id="extraCommands"
                      value={extraCommands}
                      onChange={e => setExtraCommands(e.target.value)}
                      placeholder="Add specific instructions, focus areas, or special requirements..."
                      rows={3}
                    />
                    <small>Examples: &quot;Focus on real-world applications&quot;, &quot;Include diagrams&quot;, &quot;Use specific formulas&quot;</small>
                  </div>
                </div>

                <div className="form-section">
                  <h3>PDF Options</h3>
                  <div className="checkbox-group">
                    <label className="checkbox-label" htmlFor="includeAnswers">
                      <input 
                        id="includeAnswers"
                        type="checkbox" 
                        checked={includeAnswers} 
                        onChange={e => setIncludeAnswers(e.target.checked)}
                      />
                      Include Answers in PDF
                    </label>
                    <label className="checkbox-label" htmlFor="includeExplanations">
                      <input 
                        id="includeExplanations"
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
                    onClick={handleDownloadPDF}
                    disabled={loading || !questionResult}
                  >
                    Download PDF
                  </button>
                  <button 
                    className="btn secondary" 
                    onClick={handleGenerateAnswerKey}
                    disabled={loading || !questionResult}
                  >
                    Download Answer Key
                  </button>
                  <button 
                    className="btn secondary" 
                    onClick={handleABGenerate}
                    disabled={loading}
                  >
                    A/B Test 
                  </button>
                </div>
              </>
            )}

            {activeTab === 'mixed' && (
              <>
                <div className="form-section">
                  <h3>Basic Settings</h3>
                  <div className="form-grid">
                    <div className="form-group">
                      <label htmlFor="subject-mixed">Subject</label>
                      <select id="subject-mixed" value={subject} onChange={e => setSubject(e.target.value)}>
                        {subjects.map(sub => (
                          <option key={sub} value={sub}>{sub}</option>
                        ))}
                      </select>
                    </div>

                    <div className="form-group">
                      <label htmlFor="classLevel-mixed">Class Level</label>
                      <select id="classLevel-mixed" value={classLevel} onChange={e => setClassLevel(e.target.value)}>
                        {classLevels.map(level => (
                          <option key={level} value={level}>{level}</option>
                        ))}
                      </select>
                    </div>

                    <div className="form-group">
                      <label htmlFor="chapter-mixed">Chapter/Topic</label>
                      <input
                        id="chapter-mixed"
                        type="text"
                        value={chapter}
                        onChange={e => setChapter(e.target.value)}
                        placeholder="e.g., Algebra, Mechanics, Photosynthesis"
                      />
                    </div>

                    <div className="form-group">
                      <label htmlFor="difficulty-mixed">Difficulty</label>
                      <select id="difficulty-mixed" value={difficulty} onChange={e => setDifficulty(e.target.value)}>
                        <option value="easy">Easy</option>
                        <option value="medium">Medium</option>
                        <option value="hard">Hard</option>
                      </select>
                    </div>

                    <div className="form-group">
                      <label htmlFor="provider-mixed">AI Provider</label>
                      <select id="provider-mixed" value={provider} onChange={e => setProvider(e.target.value as 'gemini' | 'openai')}>
                        <option value="gemini">Model A</option>
                        <option value="openai">Model B</option>
                      </select>
                    </div>
                  </div>
                </div>

                <div className="form-section">
                  <h3>Advanced Options</h3>
                  <div className="form-group">
                    <label htmlFor="title-mixed">PDF Title (Optional)</label>
                    <input
                      id="title-mixed"
                      type="text"
                      value={title}
                      onChange={e => setTitle(e.target.value)}
                      placeholder="Enter a custom title for your PDF..."
                    />
                    <small>This will appear as the main title at the top of your PDF</small>
                  </div>
                  <div className="form-group">
                    <label htmlFor="extraCommands-mixed">Extra Instructions (Optional)</label>
                    <textarea
                      id="extraCommands-mixed"
                      value={extraCommands}
                      onChange={e => setExtraCommands(e.target.value)}
                      placeholder="Add specific instructions, focus areas, or special requirements..."
                      rows={3}
                    />
                    <small>Examples: &quot;Focus on real-world applications&quot;, &quot;Include diagrams&quot;, &quot;Use specific formulas&quot;</small>
                  </div>
                </div>

                <MixedQuestionGenerator
                  subject={subject}
                  chapter={chapter}
                  difficulty={difficulty}
                  classLevel={classLevel}
                  extraCommands={extraCommands}
                  title={title}
                  provider={provider}
                  onResult={setQuestionResult}
                  onMessage={setMessage}
                  onLoading={(loading, message) => {
                    setLoading(loading);
                    if (message) setLoadingMessage(message);
                  }}
                />
              </>
            )}
          </div>

          {message && (
            <div className={`message ${message.includes('successfully') ? 'success' : 'error'}`}>
              {message}
            </div>
          )}

          {questionResult && (
            <div className="question-result">
              <h3>Generated Questions</h3>
              <pre>{JSON.stringify(questionResult, null, 2)}</pre>
            </div>
          )}

          {abResult && (
            <div className="question-result">
              <h3>A/B Test Results</h3>
              <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '1rem' }}>
                <div>
                  <h4>Model A (Gemini)</h4>
                  <pre>{JSON.stringify(abResult.gemini, null, 2)}</pre>
                  <div style={{ marginTop: '1rem' }}>
                    <label htmlFor="radio-gemini">
                      <input 
                        id="radio-gemini"
                        type="radio" 
                        name="abChoice" 
                        value="gemini" 
                        checked={abChoice === 'gemini'} 
                        onChange={() => setAbChoice('gemini')} 
                      /> Prefer Model A
                    </label>
                    <button 
                      className="btn secondary" 
                      onClick={() => handleDownloadABPDF('gemini')}
                      disabled={loading}
                      style={{ marginLeft: '1rem', fontSize: '0.8rem', padding: '0.5rem 1rem' }}
                    >
                      Download Model A PDF
                    </button>
                  </div>
                </div>
                <div>
                  <h4>Model B (ChatGPT)</h4>
                  <pre>{JSON.stringify(abResult.openai, null, 2)}</pre>
                  <div style={{ marginTop: '1rem' }}>
                    <label htmlFor="radio-openai">
                      <input 
                        id="radio-openai"
                        type="radio" 
                        name="abChoice" 
                        value="openai" 
                        checked={abChoice === 'openai'} 
                        onChange={() => setAbChoice('openai')} 
                      /> Prefer Model B
                    </label>
                    <button 
                      className="btn secondary" 
                      onClick={() => handleDownloadABPDF('openai')}
                      disabled={loading}
                      style={{ marginLeft: '1rem', fontSize: '0.8rem', padding: '0.5rem 1rem' }}
                    >
                      Download Model B PDF
                    </button>
                  </div>
                </div>
              </div>
              <div style={{ marginTop: '1rem' }}>
                <button className="btn primary" onClick={handleABFeedback}>Submit Preference &amp; Use Selected</button>
              </div>
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

        .tab-navigation {
          display: flex;
          gap: 0.5rem;
          margin-bottom: 2rem;
          background: rgba(255, 255, 255, 0.1);
          backdrop-filter: blur(20px);
          border-radius: 12px;
          padding: 0.5rem;
          border: 1px solid rgba(255, 255, 255, 0.2);
        }

        .tab-btn {
          flex: 1;
          padding: 1rem 2rem;
          border: none;
          background: transparent;
          color: rgba(255, 255, 255, 0.7);
          border-radius: 8px;
          cursor: pointer;
          font-size: 1rem;
          font-weight: 600;
          transition: all 0.3s ease;
          position: relative;
          overflow: hidden;
        }

        .tab-btn:hover {
          color: rgba(255, 255, 255, 0.9);
          background: rgba(255, 255, 255, 0.1);
        }

        .tab-btn.active {
          background: linear-gradient(135deg, #667eea 0%, #764ba2 100%);
          color: white;
          box-shadow: 0 4px 15px rgba(102, 126, 234, 0.3);
        }

        .tab-btn.active::before {
          content: '';
          position: absolute;
          top: 0;
          left: -100%;
          width: 100%;
          height: 100%;
          background: linear-gradient(90deg, transparent, rgba(255, 255, 255, 0.2), transparent);
          transition: left 0.5s;
        }

        .tab-btn.active:hover::before {
          left: 100%;
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

        .checkbox-label input[type='checkbox'] {
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

        .question-result h4 {
          margin: 0 0 0.5rem 0;
          color: #555;
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
      <LoaderOverlay show={loading} message={loadingMessage} />
    </div>
  );
};

export default Dashboard;