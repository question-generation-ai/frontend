import React, { useState } from 'react';
import TemplateBrowser from '../components/TemplateBrowser';
import { apiFetch } from '../lib/api';

const subjects = ['mathematics', 'physics', 'chemistry', 'biology'];

const ImageGeneration: React.FC = () => {
  const [subject, setSubject] = useState<string>('mathematics');
  const [questionContent, setQuestionContent] = useState<string>('Draw a line graph showing y = 2x + 1');
  const [complexity, setComplexity] = useState<'simple'|'medium'|'complex'>('medium');
  const [preferredType, setPreferredType] = useState<'template'|'ai'|'auto'>('auto');
  const [result, setResult] = useState<any>(null);
  const [previewUrl, setPreviewUrl] = useState<string>('');
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string>('');

  const generate = async () => {
    setLoading(true);
    setError('');
    setResult(null);
    try {
      const data = await apiFetch('/images/generate', {
        method: 'POST',
        body: JSON.stringify({ questionContent, subject, complexity, preferredType })
      });
      setResult(data?.data || data);
    } catch (e: any) {
      setError(e.message || 'Generation failed');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div style={{ padding: 24 }}>
      <h2 style={{ marginBottom: 12 }}>Image Generation</h2>
      <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 16 }}>
        <div>
          <div style={{ background: '#fff', padding: 16, borderRadius: 12, boxShadow: '0 4px 6px rgba(0,0,0,0.05)' }}>
            <div style={{ marginBottom: 12 }}>
              <label style={{ display: 'block', fontWeight: 600, marginBottom: 6 }}>Subject</label>
              <select value={subject} onChange={e => setSubject(e.target.value)} style={{ width: '100%', padding: 8 }}>
                {subjects.map(s => (
                  <option key={s} value={s}>{s}</option>
                ))}
              </select>
            </div>
            <div style={{ marginBottom: 12 }}>
              <label style={{ display: 'block', fontWeight: 600, marginBottom: 6 }}>Question Content</label>
              <textarea value={questionContent} onChange={e => setQuestionContent(e.target.value)} rows={4} style={{ width: '100%', padding: 8 }} />
            </div>
            <div style={{ display: 'flex', gap: 12, marginBottom: 12 }}>
              <div style={{ flex: 1 }}>
                <label style={{ display: 'block', fontWeight: 600, marginBottom: 6 }}>Complexity</label>
                <select value={complexity} onChange={e => setComplexity(e.target.value as any)} style={{ width: '100%', padding: 8 }}>
                  <option value="simple">simple</option>
                  <option value="medium">medium</option>
                  <option value="complex">complex</option>
                </select>
              </div>
              <div style={{ flex: 1 }}>
                <label style={{ display: 'block', fontWeight: 600, marginBottom: 6 }}>Preferred Type</label>
                <select value={preferredType} onChange={e => setPreferredType(e.target.value as any)} style={{ width: '100%', padding: 8 }}>
                  <option value="auto">auto</option>
                  <option value="template">template</option>
                  <option value="ai">ai</option>
                </select>
              </div>
            </div>
            <button className="btn primary" onClick={generate} disabled={loading}>
              {loading ? 'Generating...' : 'Generate Image'}
            </button>
            {error && <div className="message error" style={{ marginTop: 12 }}>{error}</div>}
          </div>

          <div style={{ marginTop: 16 }}>
            <h3>Browse Templates</h3>
            <TemplateBrowser subject={subject} onPreview={setPreviewUrl} />
          </div>
        </div>

        <div>
          <div style={{ background: '#fff', padding: 16, borderRadius: 12, boxShadow: '0 4px 6px rgba(0,0,0,0.05)', minHeight: 200 }}>
            <h3>Preview</h3>
            {!previewUrl && <div style={{ color: '#6b7280' }}>Select a template to preview, or generate to see results.</div>}
            {previewUrl && (
              <div style={{ marginTop: 10 }}>
                <img src={previewUrl} alt="Template preview" style={{ maxWidth: '100%', borderRadius: 8 }} />
              </div>
            )}
          </div>

          <div style={{ background: '#fff', padding: 16, borderRadius: 12, boxShadow: '0 4px 6px rgba(0,0,0,0.05)', marginTop: 16 }}>
            <h3>Result</h3>
            {result ? (
              <pre style={{ whiteSpace: 'pre-wrap' }}>{JSON.stringify(result, null, 2)}</pre>
            ) : (
              <div style={{ color: '#6b7280' }}>No result yet.</div>
            )}
          </div>
        </div>
      </div>
    </div>
  );
};

export default ImageGeneration;
