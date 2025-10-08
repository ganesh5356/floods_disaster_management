import React from 'react';

type ErrorBoundaryState = { hasError: boolean; message?: string };

class ErrorBoundary extends React.Component<React.PropsWithChildren<{}>, ErrorBoundaryState> {
  constructor(props: React.PropsWithChildren<{}>) {
    super(props);
    this.state = { hasError: false };
  }

  static getDerivedStateFromError(error: any): ErrorBoundaryState {
    return { hasError: true, message: error?.message || 'Something went wrong' };
  }

  componentDidCatch(error: any, errorInfo: any) {
    // In real apps, report to monitoring here
    // console.error('ErrorBoundary caught:', error, errorInfo);
  }

  render() {
    if (this.state.hasError) {
      return (
        <div className="min-h-screen flex items-center justify-center bg-gray-50 p-6">
          <div className="max-w-md w-full bg-white shadow-sm rounded-lg p-6 text-center">
            <h1 className="text-xl font-semibold text-gray-900 mb-2">An error occurred</h1>
            <p className="text-sm text-gray-600 mb-4">{this.state.message}</p>
            <button className="px-4 py-2 bg-blue-600 text-white rounded" onClick={() => window.location.reload()}>Reload</button>
          </div>
        </div>
      );
    }
    return this.props.children as React.ReactNode;
  }
}

export default ErrorBoundary;




