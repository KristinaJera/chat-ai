// src/main.tsx
import React, { ReactNode } from 'react';
import ReactDOM from 'react-dom/client';
import { HashRouter } from 'react-router-dom';
import App from './App';
import { SocketProvider }  from './context/SocketProvider';
import './index.css';

interface ErrorBoundaryState { error: Error | null; }

class ErrorBoundary extends React.Component<{ children: ReactNode }, ErrorBoundaryState> {
  state: ErrorBoundaryState = { error: null };
  static getDerivedStateFromError(error: Error) { return { error }; }
  render() {
    if (this.state.error) {
      return <div className="p-4 text-red-600">Error: {this.state.error.message}</div>;
    }
    return this.props.children;
  }
}

ReactDOM.createRoot(document.getElementById('root') as HTMLElement).render(
  <React.StrictMode>
    <HashRouter>
      <SocketProvider>
        <ErrorBoundary>
          <App />
        </ErrorBoundary>
      </SocketProvider>
    </HashRouter>
  </React.StrictMode>
);
