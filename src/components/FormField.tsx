import type { ChangeEventHandler } from "react";

type FormFieldProps = {
  id: string;
  name: string;
  label: string;
  placeholder: string;
  value: string;
  onChange: ChangeEventHandler<HTMLInputElement | HTMLTextAreaElement>;
  type?: "text" | "email" | "url";
  multiline?: boolean;
  required?: boolean;
  autoComplete?: string;
  minLength?: number;
  error?: string;
};

export function FormField({
  id,
  name,
  label,
  placeholder,
  value,
  onChange,
  type = "text",
  multiline = false,
  required = false,
  autoComplete,
  minLength,
  error,
}: FormFieldProps) {
  const describedBy = error ? `${id}-error` : undefined;

  return (
    <div className="form-field">
      <label htmlFor={id}>{label}{required ? <span aria-hidden="true"> *</span> : null}</label>
      {multiline ? (
        <textarea id={id} name={name} placeholder={placeholder} rows={6} value={value} onChange={onChange} required={required} minLength={minLength} aria-invalid={Boolean(error)} aria-describedby={describedBy} />
      ) : (
        <input id={id} name={name} type={type} placeholder={placeholder} value={value} onChange={onChange} required={required} autoComplete={autoComplete} aria-invalid={Boolean(error)} aria-describedby={describedBy} />
      )}
      {error ? <small id={describedBy} className="form-field__error">{error}</small> : null}
    </div>
  );
}
