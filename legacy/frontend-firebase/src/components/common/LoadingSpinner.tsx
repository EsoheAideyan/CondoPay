interface LoadingSpinnerProps {
    size?: 'small' | 'medium' | 'large';
    message?: string;
}

export const LoadingSpinner = ({ size = 'medium', message = 'Loading...' }: LoadingSpinnerProps) => {
    const sizeClasses = {
        small: 'w-4 h-4',
        medium: 'w-8 h-8',
        large: 'w-12 h-12'
    };

    return (
        <div className="flex flex-col items-center justify-center min-h-screen">
            <div className={`${sizeClasses[size]} animate-spin rounded-full border-4 border-gray-300 border-t-blue-600`}></div>
            {message && <p className="mt-4 text-gray-600">{message}</p>}
        </div>
    );
}; 