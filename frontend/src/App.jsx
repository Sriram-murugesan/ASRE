import React from 'react';
import { BrowserRouter } from 'react-router-dom';
import AppRoutes from './routes';
import { ToastProvider } from './context/ToastContext';
import { ChatProvider } from './context/ChatContext';
import { EvaluationProvider } from './context/EvaluationContext';
import ErrorBoundary from './components/common/ErrorBoundary';

function App() {
  return (
    <ErrorBoundary>
      <ToastProvider>
        <ChatProvider>
          <EvaluationProvider>
            <BrowserRouter>
              <AppRoutes />
            </BrowserRouter>
          </EvaluationProvider>
        </ChatProvider>
      </ToastProvider>
    </ErrorBoundary>
  );
}

export default App;

