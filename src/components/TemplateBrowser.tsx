import React, { useEffect, useMemo, useState } from 'react';
import { apiFetch } from '../lib/api';

interface TemplateItem {
  id: string;
  name: string;
  description?: string;
  category?: { id: string; name: string } | null;
  keywords?: string[] | null;
}

interface TemplateBrowserProps {
  subject: string;
  onPreview?: (imageUrl: string) => void;
}

const TemplateBrowser: React.FC<TemplateBrowserProps> = ({ subject, onPreview }) => {
  const [keywords, setKeywords] = useState<string>('');
  const [loading, setLoading] = useState(false);
  const [templates, setTemplates] = useState<TemplateItem[]>([]);
  const [error, setError] = useState<string>('');
  const [previewLoadingId, setPreviewLoadingId] = useState<string | null>(null);

  const keywordQuery = useMemo(() => keywords.split(',').map(k => k.trim()).filter(Boolean).join(','), [keywords]);

  const fetchTemplates = async () => {
    setLoading(true);
    setError('');
    try {
      const data = await apiFetch(`/images/templates?subject=${encodeURIComponent(subject)}${keywordQuery ? `&keywords=${encodeURIComponent(keywordQuery)}` : ''}`);
      setTemplates(data?.data || data || []);
    } catch (e: any) {
      setError(e.message || 'Failed to fetch templates');
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchTemplates();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [subject]);

  const handlePreview = async (templateId: string) => {
    setPreviewLoadingId(templateId);
    try {
      const data = await apiFetch(`/images/templates/${encodeURIComponent(templateId)}/preview`, {
        method: 'POST',
        body: JSON.stringify({ parameters: {} }),
      });
      const imageUrl = data?.data?.imageUrl || data?.imageUrl;
      if (imageUrl && onPreview) onPreview(imageUrl);
      if (!imageUrl) throw new Error('No image URL returned');
    } catch (e: any) {
      setError(e.message || 'Failed to preview template');
    } finally {
      setPreviewLoadingId(null);
    }
  };

  return (
    <div style={{ background: '#fff', borderRadius: 12, padding: 16, boxShadow: '0 4px 6px rgba(0,0,0,0.05)' }}>
      <div style={{ display: 'flex', gap: 8, alignItems: 'center', marginBottom: 12 }}>
        <input
          type="text"
          value={keywords}
          onChange={(e) => setKeywords(e.target.value)}
          placeholder="Comma-separated keywords (e.g., graph,line,axis)"
          style={{ flex: 1, padding: '8px 12px', borderRadius: 8, border: '2px solid #e1e5e9' }}
        />
        <button onClick={fetchTemplates} disabled={loading} className="btn secondary">
          {loading ? 'Searching...' : 'Search'}
        </button>
      </div>

      {error && <div className="message error" style={{ marginBottom: 12 }}>{error}</div>}

      {templates.length === 0 && !loading && (
        <div style={{ color: '#666', fontSize: 14 }}>No templates found for subject "{subject}"</div>
      )}

      <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(220px, 1fr))', gap: 12 }}>
        {templates.map(t => (
          <div key={t.id} style={{ border: '1px solid #e5e7eb', borderRadius: 10, padding: 12 }}>
            <div style={{ fontWeight: 600, color: '#333' }}>{t.name}</div>
            {t.category?.name && <div style={{ fontSize: 12, color: '#6b7280', marginTop: 4 }}>{t.category.name}</div>}
            {t.description && <div style={{ fontSize: 12, color: '#374151', marginTop: 6 }}>{t.description}</div>}
            <div style={{ marginTop: 10, display: 'flex', justifyContent: 'flex-end' }}>
              <button className="btn" onClick={() => handlePreview(t.id)} disabled={previewLoadingId === t.id}>
                {previewLoadingId === t.id ? 'Generating...' : 'Preview'}
              </button>
            </div>
          </div>
        ))}
      </div>
    </div>
  );
};

export default TemplateBrowser;
