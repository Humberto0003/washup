import { InputHTMLAttributes, forwardRef, useId } from "react";

export interface IInputProps extends InputHTMLAttributes<HTMLInputElement> {
  error?: string;
  label: string;
  hideLabel?: boolean;
}

export const Input = forwardRef<HTMLInputElement, IInputProps>(
  ({ error, className, id, label, hideLabel = false, required, ...rest }, ref) => {
    const generatedId = useId();
    const inputId = id ?? generatedId;
    const errorId = `${inputId}-error`;

    return (
      <div className="flex flex-col gap-1">
        <label
          htmlFor={inputId}
          className={
            hideLabel ? "sr-only" : "px-2 text-sm font-semibold text-title"
          }
        >
          {label}
          {required && <span aria-hidden="true"> *</span>}
        </label>
        <input
          id={inputId}
          ref={ref}
          required={required}
          aria-invalid={Boolean(error)}
          aria-describedby={error ? errorId : undefined}
          {...rest}
          className={`w-full h-16 px-6 py-5 bg-background text-title text-normal border border-input-border rounded-md placeholder-input outline-none focus:border-primary ${error ? "border-danger" : ""} ${className || ""} `}
        />
        {error && (
          <span id={errorId} role="alert" className="text-danger text-sm px-2">
            {error}
          </span>
        )}
      </div>
    );
  }
);

Input.displayName = "Input";
