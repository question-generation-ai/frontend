import React, { useState } from 'react';
import { apiFetch, API_BASE } from '../lib/api';

interface QuestionType {
  type: string;
  count: number;
}

interface MixedQuestionGeneratorProps {
  subject: string;
  chapter: string;
  difficulty: string;
  classLevel: string;
  extraCommands: string;
  title: string;
  provider: 'gemini' | 'openai';
  onResult: (result: any) => void;
  onMessage: (message: string) => void;
  onLoading: (loading: boolean, message?: string) => void;
}

const MixedQuestionGenerator: React.FC<MixedQuestionGeneratorProps> = ({
  subject,
  chapter,
  difficulty,
  classLevel,
  extraCommands,
  title,
  provider,
  onResult,
  onMessage,
  onLoading
}) => {
  const [questionTypes, setQuestionTypes] = useState<QuestionType[]>([
    { type: 'multiple-choice', count: 3 },
    { type: 'short-answer', count: 2 }
  ]);
  const [includeAnswers, setIncludeAnswers] = useState(false);
  const [includeExplanations, setIncludeExplanations] = useState(false);

  const questionTypeOptions = [
    { value: 'multiple-choice', label: 'Multiple Choice' },
    { value: 'short-answer', label: 'Short Answer' },
    { value: 'true-false', label: 'True/False' },
    { value: 'long-answer', label: 'Long Answer' },
    { value: 'reasoning-based', label: 'Reasoning Based' },
    { value: 'application-based', label: 'Application Based' },
    { value: 'analytical', label: 'Analytical' },
    { value: 'fill-in-the-blank', label: 'Fill in the Blank' },
    { value: 'case-study', label: 'Case Study' },
    { value: 'problem-solving', label: 'Problem Solving' }
  ];

  const addQuestionType = () => {
    const availableTypes = questionTypeOptions.filter(
      option => !questionTypes.some(qt => qt.type === option.value)
    );
    
    if (availableTypes.length > 0) {
      setQuestionTypes([...questionTypes, { type: availableTypes[0].value, count: 1 }]);
    }
  };

  const removeQuestionType = (index: number) => {
    setQuestionTypes(questionTypes.filter((_, i) => i !== index));
  };

  const updateQuestionType = (index: number, field: 'type' | 'count', value: string | number) => {
    const updated = [...questionTypes];
    if (field === 'type') {
      updated[index].type = value as string;
    } else {
      updated[index].count = Math.max(1, Math.min(10, Number(value)));
    }
    setQuestionTypes(updated);
  };

  const handleGenerateMixed = async () => {
    if (questionTypes.length === 0) {
      onMessage('Please add at least one question type');
      return;
    }

    onMessage('');
    onResult(null);
    onLoading(true, 'Generating mixed questions...');
    
    try {
      const res = await apiFetch(`/v1/questions/generate-mixed`, {
        method: 'POST',
        body: JSON.stringify({
          subject,
          chapter,
          difficulty,
          classLevel,
          extraCommands: extraCommands.trim() || undefined,
          title: title.trim() || undefined,
          provider,
          questionTypes
        }),
      });
      onResult(res);
      onMessage('Mixed questions generated successfully!');
    } catch (err: any) {
      onMessage(`Error generating mixed questions: ${err.message || 'Unknown error'}`);
    } finally {
      onLoading(false);
    }
  };

  const handleGenerateMixedPDF = async () => {
    if (questionTypes.length === 0) {
      onMessage('Please add at least one question type');
      return;
    }

    onMessage('');
    onLoading(true, 'Generating mixed questions PDF...');
    
    try {
      const response = await fetch(`${API_BASE}/v1/questions/generate-mixed-pdf`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          Authorization: `Bearer ${localStorage.getItem('token') || ''}`,
        },
        body: JSON.stringify({
          subject,
          chapter,
          difficulty,
          classLevel,
          extraCommands: extraCommands.trim() || undefined,
          customTitle: title.trim() || undefined,
          provider,
          questionTypes,
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
      const filename = contentDisposition 
        ? (contentDisposition.split('filename=')[1] || 'mixed_questions.pdf').replace(/"/g, '') 
        : `mixed_questions_${Date.now()}.pdf`;
      link.download = filename;
      document.body.appendChild(link);
      link.click();
      document.body.removeChild(link);
      window.URL.revokeObjectURL(url);

      onMessage('Mixed questions PDF downloaded successfully!');
    } catch (err: any) {
      console.error('Mixed PDF download error:', err);
      onMessage(`Error generating mixed PDF: ${err.message || 'Unknown error'}`);
    } finally {
      onLoading(false);
    }
  };

  const handleGenerateMixedAnswerKey = async () => {
    if (questionTypes.length === 0) {
      onMessage('Please add at least one question type');
      return;
    }

    onMessage('');
    onLoading(true, 'Generating mixed answer key PDF...');
    
    try {
      const response = await fetch(`${API_BASE}/v1/questions/generate-mixed-answer-key`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          Authorization: `Bearer ${localStorage.getItem('token') || ''}`,
        },
        body: JSON.stringify({
          subject,
          chapter,
          difficulty,
          classLevel,
          extraCommands: extraCommands.trim() || undefined,
          customTitle: title.trim() || undefined,
          provider,
          questionTypes
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
      const fn = cd 
        ? (cd.split('filename=')[1] || 'mixed_answer_key.pdf').replace(/"/g, '') 
        : `mixed_answer_key_${Date.now()}.pdf`;
      link.download = fn;
      document.body.appendChild(link);
      link.click();
      document.body.removeChild(link);
      window.URL.revokeObjectURL(url);

      onMessage('Mixed answer key PDF downloaded successfully!');
    } catch (err: any) {
      console.error('Mixed answer key download error:', err);
      onMessage(`Error generating mixed answer key: ${err.message || 'Unknown error'}`);
    } finally {
      onLoading(false);
    }
  };

  const totalQuestions = questionTypes.reduce((sum, qt) => sum + qt.count, 0);

  return (
    <div className="mixed-question-generator">
      <div className="form-section">
        <h3>Mixed Question Types</h3>
        <p className="section-description">
          Create a question paper with multiple question types. Each type can have a different number of questions.
        </p>
        
        <div className="question-types-list">
          {questionTypes.map((qt, index) => (
            <div key={index} className="question-type-row">
              <div className="question-type-select">
                <select
                  value={qt.type}
                  onChange={(e) => updateQuestionType(index, 'type', e.target.value)}
                >
                  {questionTypeOptions.map(option => (
                    <option key={option.value} value={option.value}>
                      {option.label}
                    </option>
                  ))}
                </select>
              </div>
              
              <div className="question-count-input">
                <input
                  type="number"
                  min={1}
                  max={10}
                  value={qt.count}
                  onChange={(e) => updateQuestionType(index, 'count', e.target.value)}
                />
                <span className="count-label">questions</span>
              </div>
              
              <button
                type="button"
                className="remove-btn"
                onClick={() => removeQuestionType(index)}
                disabled={questionTypes.length === 1}
              >
                ×
              </button>
            </div>
          ))}
        </div>
        
        <div className="question-types-actions">
          <button
            type="button"
            className="add-type-btn"
            onClick={addQuestionType}
            disabled={questionTypes.length >= questionTypeOptions.length}
          >
            + Add Question Type
          </button>
          
          <div className="total-count">
            Total: {totalQuestions} questions
          </div>
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

      <div className="mixed-action-buttons">
        <button 
          className="btn primary" 
          onClick={handleGenerateMixed}
        >
          Generate Mixed Questions
        </button>
        <button 
          className="btn secondary" 
          onClick={handleGenerateMixedPDF}
        >
          Generate Mixed PDF
        </button>
        <button 
          className="btn secondary" 
          onClick={handleGenerateMixedAnswerKey}
        >
          Generate Mixed Answer Key
        </button>
      </div>

      <style>{`
        .mixed-question-generator {
          margin-top: 2rem;
        }

        .section-description {
          color: #666;
          font-size: 0.9rem;
          margin-bottom: 1.5rem;
          line-height: 1.5;
        }

        .question-types-list {
          display: flex;
          flex-direction: column;
          gap: 0.75rem;
          margin-bottom: 1rem;
        }

        .question-type-row {
          display: grid;
          grid-template-columns: 2fr 1fr auto;
          gap: 1rem;
          align-items: center;
          padding: 1rem;
          background: rgba(102, 126, 234, 0.05);
          border: 1px solid rgba(102, 126, 234, 0.1);
          border-radius: 12px;
          transition: all 0.3s ease;
        }

        .question-type-row:hover {
          background: rgba(102, 126, 234, 0.08);
          border-color: rgba(102, 126, 234, 0.2);
        }

        .question-type-select select {
          width: 100%;
          padding: 0.75rem;
          border: 2px solid #e2e8f0;
          border-radius: 8px;
          font-size: 0.9rem;
          background: white;
          transition: all 0.3s ease;
        }

        .question-type-select select:focus {
          outline: none;
          border-color: #667eea;
          box-shadow: 0 0 0 3px rgba(102, 126, 234, 0.1);
        }

        .question-count-input {
          display: flex;
          align-items: center;
          gap: 0.5rem;
        }

        .question-count-input input {
          width: 60px;
          padding: 0.75rem 0.5rem;
          border: 2px solid #e2e8f0;
          border-radius: 8px;
          font-size: 0.9rem;
          text-align: center;
          transition: all 0.3s ease;
        }

        .question-count-input input:focus {
          outline: none;
          border-color: #667eea;
          box-shadow: 0 0 0 3px rgba(102, 126, 234, 0.1);
        }

        .count-label {
          font-size: 0.85rem;
          color: #666;
          white-space: nowrap;
        }

        .remove-btn {
          width: 32px;
          height: 32px;
          border: none;
          background: #ef4444;
          color: white;
          border-radius: 50%;
          cursor: pointer;
          font-size: 1.2rem;
          font-weight: bold;
          display: flex;
          align-items: center;
          justify-content: center;
          transition: all 0.3s ease;
        }

        .remove-btn:hover:not(:disabled) {
          background: #dc2626;
          transform: scale(1.1);
        }

        .remove-btn:disabled {
          background: #d1d5db;
          cursor: not-allowed;
          transform: none;
        }

        .question-types-actions {
          display: flex;
          justify-content: space-between;
          align-items: center;
          padding: 1rem;
          background: rgba(16, 185, 129, 0.05);
          border: 1px solid rgba(16, 185, 129, 0.1);
          border-radius: 12px;
        }

        .add-type-btn {
          padding: 0.75rem 1.5rem;
          background: linear-gradient(135deg, #10b981 0%, #059669 100%);
          color: white;
          border: none;
          border-radius: 8px;
          cursor: pointer;
          font-size: 0.9rem;
          font-weight: 600;
          transition: all 0.3s ease;
          box-shadow: 0 4px 15px rgba(16, 185, 129, 0.3);
        }

        .add-type-btn:hover:not(:disabled) {
          transform: translateY(-2px);
          box-shadow: 0 8px 25px rgba(16, 185, 129, 0.4);
        }

        .add-type-btn:disabled {
          background: #d1d5db;
          cursor: not-allowed;
          transform: none;
          box-shadow: none;
        }

        .total-count {
          font-weight: 600;
          color: #059669;
          font-size: 1rem;
          padding: 0.5rem 1rem;
          background: rgba(16, 185, 129, 0.1);
          border-radius: 20px;
          border: 1px solid rgba(16, 185, 129, 0.2);
        }

        .mixed-action-buttons {
          display: flex;
          gap: 1rem;
          flex-wrap: wrap;
          margin-top: 2rem;
        }

        @media (max-width: 768px) {
          .question-type-row {
            grid-template-columns: 1fr;
            gap: 0.75rem;
          }
          
          .question-types-actions {
            flex-direction: column;
            gap: 1rem;
          }
          
          .mixed-action-buttons {
            flex-direction: column;
          }
        }
      `}</style>
    </div>
  );
};

export default MixedQuestionGenerator;
