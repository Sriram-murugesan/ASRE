import React from 'react';
import { Link } from 'react-router-dom';

export default function NotFound() {
  return (
    <div className="flex flex-col items-center justify-center min-h-screen p-8 text-center">
      <h1 className="text-6xl font-bold text-danger mb-4">404</h1>
      <p className="text-xl text-muted mb-8">Page not found</p>
      <Link to="/" className="px-6 py-2 bg-primary text-white rounded-md hover:bg-blue-600 transition-colors">
        Return to Dashboard
      </Link>
    </div>
  );
}
