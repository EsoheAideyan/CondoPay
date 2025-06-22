import { useState } from 'react';

interface PasswordInputProps {
    value: string;
    onChange: (value: string) => void;
    placeholder?: string;
    label?: string;
    required?: boolean;
    className?: string;
    error?: string;
}

export const PasswordInput = ({
    value,
    onChange,
    placeholder = "Password",
    label = "Password",
    required = false,
    className = "",
    error
}: PasswordInputProps) => {
    const [showPassword, setShowPassword] = useState(false);

    return (
        <div className={className}>
            {label && (
                <label className="block text-sm font-medium text-gray-700 mb-1">
                    {label}
                </label>
            )}
            <div className="relative">
                <input
                    type={showPassword ? "text" : "password"}
                    placeholder={placeholder}
                    value={value}
                    onChange={(e) => onChange(e.target.value)}
                    required={required}
                    className={`w-full px-4 py-2 pr-12 border rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500 ${
                        error ? 'border-red-500' : 'border-gray-300'
                    }`}
                />
                <button
                    type="button"
                    onClick={() => setShowPassword(!showPassword)}
                    className="absolute inset-y-0 right-0 pr-3 flex items-center text-gray-400 hover:text-gray-600"
                >
                    {showPassword ? "🙈" : "👁️"}
                </button>
            </div>
            {error && (
                <p className="mt-1 text-sm text-red-600">{error}</p>
            )}
        </div>
    );
}; 