import React from 'react';

interface Props {
  children: React.ReactNode;
}

interface State {
  hasError: boolean;
}

class ErrorBoundary extends React.Component<Props, State> {
  // FIX: Replaced the constructor with a class property initializer for state. This is a more modern syntax and resolves obscure TypeScript errors where 'this.state' and 'this.props' were not being recognized on the class instance.
  state: State = { hasError: false };

  static getDerivedStateFromError(_: Error): State {
    return { hasError: true };
  }

  componentDidCatch(error: Error, errorInfo: React.ErrorInfo) {
    console.error("Uncaught error:", error, errorInfo);
  }

  render() {
    if (this.state.hasError) {
      return (
        <div className="flex flex-col items-center justify-center h-screen bg-slate-100 dark:bg-slate-900 text-slate-800 dark:text-slate-200">
          <div className="text-center p-8 bg-white dark:bg-slate-800 rounded-lg shadow-lg">
            <h1 className="text-3xl font-bold text-red-500">Oops! Something went wrong.</h1>
            <p className="mt-4">We've encountered an unexpected error. Please try refreshing the page.</p>
            <button
              onClick={() => window.location.reload()}
              className="mt-6 px-6 py-2 text-white bg-blue-600 hover:bg-blue-700 rounded-md"
            >
              Refresh Page
            </button>
          </div>
        </div>
      );
    }

    return this.props.children;
  }
}

export default ErrorBoundary;
