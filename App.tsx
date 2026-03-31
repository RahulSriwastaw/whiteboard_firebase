import React from 'react';
import PdfConverter from './components/PdfConverter';
import ErrorBoundary from './components/ErrorBoundary';

function App() {
  return (
    <ErrorBoundary>
      <PdfConverter />
    </ErrorBoundary>
  );
}

export default App;
