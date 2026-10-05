import { Button } from './Button';

interface ErrorMessageProps {
  message: string;
  onRetry?: () => void;
  retryLabel?: string;
  className?: string;
}

export function ErrorMessage({ message, onRetry, retryLabel = 'Retry', className = '' }: ErrorMessageProps) {
  return (
    <div
      className={`bg-red-50 border border-red-200 rounded-lg p-4 text-red-800 ${className}`}
      role="alert"
    >
      <div className="flex items-start gap-3">
        <svg
          className="w-5 h-5 flex-shrink-0 mt-0.5"
          fill="currentColor"
          viewBox="0 0 20 20"
          aria-hidden="true"
        >
          <path
            fillRule="evenodd"
            d="M18 10a8 8 0 11-16 0 8 8 0 0116 0zm-7 4a1 1 0 11-2 0 1 1 0 012 0zm-1-9a1 1 0 00-1 1v4a1 1 0 102 0V6a1 1 0 00-1-1z"
            clipRule="evenodd"
          />
        </svg>
        <div className="flex-1">
          <p className="font-medium">Error</p>
          <p className="text-sm mt-1">{message}</p>
        </div>
        {onRetry && (
          <Button variant="outline" size="sm" onClick={onRetry}>
            {retryLabel}
          </Button>
        )}
      </div>
    </div>
  );
}

export function InlineError({ message, className = '' }: { message: string; className?: string }) {
  return (
    <p className={`text-sm text-red-600 ${className}`} role="alert">
      {message}
    </p>
  );
}