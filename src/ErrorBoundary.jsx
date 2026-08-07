import { Component } from 'react';

/**
 * Last-resort catch-all — any uncaught render error anywhere in the tree
 * used to take the whole page down to a blank screen with no way back.
 * This shows a recoverable screen instead of a dead tab.
 */
export class ErrorBoundary extends Component {
  state = { hasError: false };

  static getDerivedStateFromError() {
    return { hasError: true };
  }

  componentDidCatch(error, info) {
    console.error('[ErrorBoundary] caught:', error, info);
  }

  render() {
    if (!this.state.hasError) return this.props.children;
    return (
      <div
        style={{
          position: 'fixed',
          inset: 0,
          zIndex: 999,
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'center',
          background: 'rgba(10, 10, 10, 0.96)',
          padding: '0 1.5rem',
        }}
        role="alert"
      >
        <div style={{ maxWidth: 380, width: '100%', textAlign: 'center' }}>
          <p style={{ color: '#fff', fontWeight: 600, fontSize: '1.125rem', marginBottom: '0.5rem' }}>
            Something went wrong
          </p>
          <p style={{ color: 'rgba(255,255,255,0.6)', fontSize: '0.875rem', lineHeight: 1.6, marginBottom: '1.5rem' }}>
            Reload to try again — your last saved changes are safe.
          </p>
          <button
            type="button"
            onClick={() => window.location.reload()}
            style={{
              borderRadius: 999,
              background: '#fff',
              padding: '0.65rem 1.25rem',
              fontSize: '0.875rem',
              fontWeight: 600,
              color: '#111',
              border: 'none',
              cursor: 'pointer',
            }}
          >
            Reload
          </button>
        </div>
      </div>
    );
  }
}
