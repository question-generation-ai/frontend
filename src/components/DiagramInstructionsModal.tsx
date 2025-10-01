import React from 'react';

interface DiagramInstructionsModalProps {
  isOpen: boolean;
  onClose: () => void;
  instructions: string;
  toolUsed: string;
  diagramType: string;
  keyElements: string[];
}

const DiagramInstructionsModal: React.FC<DiagramInstructionsModalProps> = ({
  isOpen,
  onClose,
  instructions,
  toolUsed,
  diagramType,
  keyElements
}) => {
  if (!isOpen) return null;

  const toolUrls = {
    'draw.io': 'https://app.diagrams.net/',
    'geogebra': 'https://www.geogebra.org/calculator'
  };

  const handleOpenTool = () => {
    const url = toolUrls[toolUsed as keyof typeof toolUrls];
    if (url) {
      window.open(url, '_blank');
    }
  };

  return (
    <div className="modal-overlay" onClick={onClose}>
      <div className="modal-content" onClick={e => e.stopPropagation()}>
        <div className="modal-header">
          <h2>Diagram Creation Instructions</h2>
          <button className="close-button" onClick={onClose}>×</button>
        </div>
        
        <div className="modal-body">
          <div className="diagram-info">
            <div className="info-item">
              <strong>Tool:</strong> {toolUsed === 'geogebra' ? 'GeoGebra' : 'Draw.io'}
            </div>
            <div className="info-item">
              <strong>Diagram Type:</strong> {diagramType}
            </div>
            <div className="info-item">
              <strong>Key Elements:</strong>
              <ul>
                {keyElements.map((element, index) => (
                  <li key={index}>{element}</li>
                ))}
              </ul>
            </div>
          </div>

          <div className="instructions-section">
            <h3>Step-by-Step Instructions:</h3>
            <pre className="instructions-text">{instructions}</pre>
          </div>
        </div>

        <div className="modal-footer">
          <button className="btn primary" onClick={handleOpenTool}>
            Open {toolUsed === 'geogebra' ? 'GeoGebra' : 'Draw.io'}
          </button>
          <button className="btn secondary" onClick={onClose}>
            Close
          </button>
        </div>

        <style>{`
          .modal-overlay {
            position: fixed;
            top: 0;
            left: 0;
            right: 0;
            bottom: 0;
            background: rgba(0, 0, 0, 0.7);
            display: flex;
            align-items: center;
            justify-content: center;
            z-index: 1000;
          }

          .modal-content {
            background: white;
            border-radius: 12px;
            width: 90%;
            max-width: 700px;
            max-height: 80vh;
            overflow-y: auto;
            box-shadow: 0 20px 60px rgba(0, 0, 0, 0.3);
          }

          .modal-header {
            display: flex;
            justify-content: space-between;
            align-items: center;
            padding: 1.5rem;
            border-bottom: 1px solid #e2e8f0;
            background: linear-gradient(135deg, #667eea 0%, #764ba2 100%);
            color: white;
            border-radius: 12px 12px 0 0;
          }

          .modal-header h2 {
            margin: 0;
            font-size: 1.5rem;
          }

          .close-button {
            background: none;
            border: none;
            color: white;
            font-size: 2rem;
            cursor: pointer;
            padding: 0;
            width: 32px;
            height: 32px;
            display: flex;
            align-items: center;
            justify-content: center;
            border-radius: 50%;
            transition: background 0.3s ease;
          }

          .close-button:hover {
            background: rgba(255, 255, 255, 0.2);
          }

          .modal-body {
            padding: 1.5rem;
          }

          .diagram-info {
            background: #f8fafc;
            padding: 1rem;
            border-radius: 8px;
            margin-bottom: 1.5rem;
            border: 1px solid #e2e8f0;
          }

          .info-item {
            margin-bottom: 0.75rem;
          }

          .info-item:last-child {
            margin-bottom: 0;
          }

          .info-item strong {
            color: #374151;
            display: inline-block;
            min-width: 120px;
          }

          .info-item ul {
            margin: 0.5rem 0 0 120px;
            padding-left: 1rem;
          }

          .info-item li {
            margin-bottom: 0.25rem;
            color: #4b5563;
          }

          .instructions-section h3 {
            color: #374151;
            margin-bottom: 1rem;
            font-size: 1.2rem;
          }

          .instructions-text {
            background: #1f2937;
            color: #e5e7eb;
            padding: 1.5rem;
            border-radius: 8px;
            font-family: 'Courier New', monospace;
            font-size: 0.9rem;
            line-height: 1.6;
            white-space: pre-wrap;
            overflow-x: auto;
            border: 1px solid #374151;
          }

          .modal-footer {
            padding: 1.5rem;
            border-top: 1px solid #e2e8f0;
            display: flex;
            gap: 1rem;
            justify-content: flex-end;
            background: #f8fafc;
            border-radius: 0 0 12px 12px;
          }

          .btn {
            padding: 0.75rem 1.5rem;
            border: none;
            border-radius: 8px;
            cursor: pointer;
            font-weight: 600;
            transition: all 0.3s ease;
            text-decoration: none;
            display: inline-flex;
            align-items: center;
            gap: 0.5rem;
          }

          .btn.primary {
            background: linear-gradient(135deg, #667eea 0%, #764ba2 100%);
            color: white;
            box-shadow: 0 4px 15px rgba(102, 126, 234, 0.3);
          }

          .btn.primary:hover {
            transform: translateY(-2px);
            box-shadow: 0 8px 25px rgba(102, 126, 234, 0.4);
          }

          .btn.secondary {
            background: #e2e8f0;
            color: #374151;
            border: 1px solid #d1d5db;
          }

          .btn.secondary:hover {
            background: #d1d5db;
            transform: translateY(-1px);
          }

          @media (max-width: 768px) {
            .modal-content {
              width: 95%;
              margin: 1rem;
            }

            .modal-header {
              padding: 1rem;
            }

            .modal-body {
              padding: 1rem;
            }

            .modal-footer {
              padding: 1rem;
              flex-direction: column;
            }

            .instructions-text {
              font-size: 0.8rem;
            }
          }
        `}</style>
      </div>
    </div>
  );
};

export default DiagramInstructionsModal;
