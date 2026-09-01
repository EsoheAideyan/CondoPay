import { useState } from 'react';
import { inputClassName, labelClassName } from './AppLayout';

interface PasswordFieldProps {
  id: string;
  label: string;
  value: string;
  onChange: (value: string) => void;
  autoComplete?: string;
  required?: boolean;
  minLength?: number;
  disabled?: boolean;
  describedBy?: string;
}

export function PasswordField({
  id,
  label,
  value,
  onChange,
  autoComplete,
  required = true,
  minLength,
  disabled = false,
  describedBy,
}: PasswordFieldProps) {
  const [visible, setVisible] = useState(false);

  return (
    <div>
      <label htmlFor={id} className={labelClassName}>
        {label}
      </label>
      <div className="relative mt-1">
        <input
          id={id}
          type={visible ? 'text' : 'password'}
          autoComplete={autoComplete}
          required={required}
          minLength={minLength}
          disabled={disabled}
          aria-describedby={describedBy}
          className={`${inputClassName.replace('mt-1 ', '')} pr-10 disabled:cursor-not-allowed disabled:opacity-50`}
          value={value}
          onChange={(e) => onChange(e.target.value)}
        />
        <button
          type="button"
          disabled={disabled}
          onClick={() => setVisible((v) => !v)}
          aria-pressed={visible}
          aria-label={visible ? 'Hide password' : 'Show password'}
          className="absolute right-2 top-1/2 -translate-y-1/2 rounded-full px-2 py-1 text-xs font-medium text-[#2c5282] hover:bg-[#e9e7ee] focus-visible:outline focus-visible:outline-2 focus-visible:outline-offset-1 focus-visible:outline-[#2c5282] disabled:cursor-not-allowed disabled:opacity-50 dark:text-[#a9c8ed] dark:hover:bg-slate-700"
        >
          {visible ? 'Hide' : 'Show'}
        </button>
      </div>
    </div>
  );
}
