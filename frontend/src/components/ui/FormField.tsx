import { useId } from "react";
import type {
  InputHTMLAttributes,
  ReactNode,
  Ref,
  SelectHTMLAttributes,
  TextareaHTMLAttributes,
} from "react";
import { cn } from "../../lib/cn";

/** Props que FormField entrega al control para enlazar etiqueta, ayuda y error. */
export interface FieldControlProps {
  id: string;
  required?: boolean;
  "aria-invalid"?: true;
  "aria-describedby"?: string;
}

export interface FormFieldProps {
  label: string;
  id?: string;
  required?: boolean;
  helperText?: string;
  error?: string;
  className?: string;
  /** Patrón: children es una función que recibe las props de accesibilidad y las esparce en el control. */
  children: (control: FieldControlProps) => ReactNode;
}

export function FormField({
  label,
  id,
  required,
  helperText,
  error,
  className,
  children,
}: FormFieldProps) {
  const autoId = useId();
  const fieldId = id ?? autoId;
  const helperId = `${fieldId}-helper`;
  const errorId = `${fieldId}-error`;
  const describedBy =
    [error && errorId, helperText && helperId].filter(Boolean).join(" ") ||
    undefined;

  return (
    <div data-ui className={cn("flex flex-col gap-1.5", className)}>
      <label htmlFor={fieldId} className="font-heading text-sm font-medium text-text">
        {label}
        {required && (
          <>
            <span aria-hidden="true" className="ml-0.5 text-danger">
              *
            </span>
            <span className="sr-only"> (obligatorio)</span>
          </>
        )}
      </label>
      {children({
        id: fieldId,
        required,
        "aria-invalid": error ? true : undefined,
        "aria-describedby": describedBy,
      })}
      {helperText && (
        <p id={helperId} className="text-sm text-text-muted dark:text-slate-400">
          {helperText}
        </p>
      )}
      {/* La región role=alert se mantiene en el DOM para que el cambio se anuncie */}
      <p id={errorId} role="alert" className={cn("text-sm font-medium text-danger dark:text-red-400", !error && "hidden")}>
        {error}
      </p>
    </div>
  );
}

const control = cn(
  "block w-full min-h-11 rounded-control border border-border bg-surface px-3 py-2",
  "text-base text-text sm:text-sm placeholder:text-text-muted dark:placeholder:text-slate-400",
  "transition-[border-color,box-shadow] duration-[var(--duration-fast)] ease-standard",
  "focus-visible:outline-none focus-visible:border-primary focus-visible:ring-2 focus-visible:ring-primary/40",
  "aria-[invalid=true]:border-danger aria-[invalid=true]:focus-visible:ring-danger/40",
  "disabled:cursor-not-allowed disabled:opacity-60 disabled:bg-canvas",
);

export function Input({
  className,
  ref,
  ...rest
}: InputHTMLAttributes<HTMLInputElement> & { ref?: Ref<HTMLInputElement> }) {
  return <input ref={ref} data-ui className={cn(control, className)} {...rest} />;
}

export function Textarea({
  className,
  ref,
  ...rest
}: TextareaHTMLAttributes<HTMLTextAreaElement> & {
  ref?: Ref<HTMLTextAreaElement>;
}) {
  return (
    <textarea
      ref={ref}
      data-ui
      className={cn(control, "min-h-24", className)}
      {...rest}
    />
  );
}

export function Select({
  className,
  ref,
  ...rest
}: SelectHTMLAttributes<HTMLSelectElement> & { ref?: Ref<HTMLSelectElement> }) {
  return <select ref={ref} data-ui className={cn(control, className)} {...rest} />;
}
