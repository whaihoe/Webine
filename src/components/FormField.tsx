type FormFieldProps = {
  id: string;
  label: string;
  placeholder: string;
  type?: "text" | "email";
  multiline?: boolean;
};

export function FormField({
  id,
  label,
  placeholder,
  type = "text",
  multiline = false,
}: FormFieldProps) {
  return (
    <div className="form-field">
      <label htmlFor={id}>{label}</label>
      {multiline ? (
        <textarea id={id} placeholder={placeholder} rows={4} disabled />
      ) : (
        <input id={id} type={type} placeholder={placeholder} disabled />
      )}
    </div>
  );
}
