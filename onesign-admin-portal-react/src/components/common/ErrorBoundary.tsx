import React, { Component, ErrorInfo, ReactNode } from 'react';
import { withTranslation, WithTranslation } from 'react-i18next';

interface Props extends WithTranslation {
  children: ReactNode;
  fallback?: ReactNode;
}

interface State {
  hasError: boolean;
  error: Error | null;
  errorInfo: ErrorInfo | null;
}

class ErrorBoundary extends Component<Props, State> {
  constructor(props: Props) {
    super(props);
    this.state = {
      hasError: false,
      error: null,
      errorInfo: null,
    };
  }

  static getDerivedStateFromError(error: Error): State {
    return {
      hasError: true,
      error,
      errorInfo: null,
    };
  }

  componentDidCatch(error: Error, errorInfo: ErrorInfo) {
    console.error('ErrorBoundary caught an error:', error, errorInfo);
    this.setState({
      error,
      errorInfo,
    });
  }

  render() {
    if (this.state.hasError) {
      if (this.props.fallback) {
        return this.props.fallback;
      }

      return (
        <div className="flex items-center justify-center min-h-screen bg-slate-50 dark:bg-slate-900">
          <div className="max-w-md w-full mx-4 p-6 bg-white dark:bg-slate-800 rounded-lg shadow-lg">
            <div className="flex items-center gap-3 mb-4">
              <div className="w-12 h-12 rounded-full bg-red-100 dark:bg-red-900/20 flex items-center justify-center">
                <svg
                  className="w-6 h-6 text-red-600 dark:text-red-400"
                  fill="none"
                  stroke="currentColor"
                  viewBox="0 0 24 24"
                >
                  <path
                    strokeLinecap="round"
                    strokeLinejoin="round"
                    strokeWidth={2}
                    d="M12 9v2m0 4h.01m-6.938 4h13.856c1.54 0 2.502-1.667 1.732-3L13.732 4c-.77-1.333-2.694-1.333-3.464 0L3.34 16c-.77 1.333.192 3 1.732 3z"
                  />
                </svg>
              </div>
              <h1 className="text-2xl font-bold text-slate-900 dark:text-white">
                {this.props.t('common.somethingWentWrong')}
              </h1>
            </div>
            <p className="text-slate-600 dark:text-slate-400 mb-4">
              {this.props.t('common.errorOccurred')}
            </p>
            {import.meta.env.DEV && this.state.error && (
              <details className="mt-4 p-4 bg-slate-100 dark:bg-slate-700 rounded text-sm">
                <summary className="cursor-pointer font-semibold mb-2 text-slate-900 dark:text-white">
                  {this.props.t('common.errorDetails')}
                </summary>
                <pre className="whitespace-pre-wrap text-xs text-red-600 dark:text-red-400">
                  {this.state.error.toString()}
                  {this.state.errorInfo?.componentStack}
                </pre>
              </details>
            )}
            <button
              onClick={() => {
                this.setState({ hasError: false, error: null, errorInfo: null });
                window.location.href = '/';
              }}
              className="mt-4 w-full px-4 py-2 bg-primary-600 text-white rounded-lg hover:bg-primary-700 transition-colors"
            >
              {this.props.t('common.reloadPage')}
            </button>
          </div>
        </div>
      );
    }

    return this.props.children;
  }
}

export default withTranslation()(ErrorBoundary);

