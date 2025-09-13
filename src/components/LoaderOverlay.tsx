import React from 'react';

interface LoaderOverlayProps {
  show: boolean;
  message?: string;
}

const LoaderOverlay: React.FC<LoaderOverlayProps> = ({ show, message }) => {
  if (!show) return null;
  return (
    <div style={styles.backdrop} aria-busy="true" aria-live="polite" role="status">
      <div style={styles.card}>
        <div style={styles.spinner} />
        <div style={styles.text}>{message || 'Processing...'}</div>
        <style>{`
          @keyframes spin {
            0% { transform: rotate(0deg); }
            100% { transform: rotate(360deg); }
          }
        `}</style>
      </div>
    </div>
  );
};

const styles: { [k: string]: React.CSSProperties } = {
  backdrop: {
    position: 'fixed',
    inset: 0,
    background: 'rgba(0, 0, 0, 0.35)',
    display: 'flex',
    alignItems: 'center',
    justifyContent: 'center',
    zIndex: 9999,
    backdropFilter: 'blur(2px)'
  },
  card: {
    background: 'white',
    borderRadius: 16,
    padding: '1.25rem 1.5rem',
    display: 'flex',
    alignItems: 'center',
    gap: '0.75rem',
    boxShadow: '0 20px 40px rgba(0,0,0,0.15)',
    minWidth: 260,
    border: '1px solid #e5e7eb'
  },
  spinner: {
    width: 28,
    height: 28,
    border: '3px solid #e5e7eb',
    borderTop: '3px solid #667eea',
    borderRadius: '50%',
    animation: 'spin 0.9s linear infinite'
  },
  text: {
    fontSize: 14,
    color: '#374151',
    fontWeight: 600
  }
};

export default LoaderOverlay;
