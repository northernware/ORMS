import React from 'react'

interface FormFieldProps {
  label: string
  name: string
  type?: string
  placeholder?: string
  error?: string[]
  required?: boolean
  defaultValue?: string
  as?: 'input' | 'textarea' | 'select'
  children?: React.ReactNode // for select options
  className?: string
}

export function FormField({ 
  label, 
  name, 
  type = 'text', 
  placeholder, 
  error, 
  required, 
  defaultValue,
  as = 'input',
  children,
  className = ''
}: FormFieldProps) {
  const hasError = error && error.length > 0
  
  const baseClasses = `flex w-full rounded-md border bg-white/50 dark:bg-zinc-950/50 px-3 py-2 text-sm backdrop-blur-sm transition-colors focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-sky-600 dark:placeholder:text-zinc-500 ${
    hasError 
      ? 'border-red-500 focus-visible:ring-red-500' 
      : 'border-zinc-200 dark:border-zinc-800 focus-visible:ring-sky-600'
  }`

  return (
    <div className={`space-y-2 ${className}`}>
      <label htmlFor={name} className="text-sm font-medium leading-none text-zinc-700 dark:text-zinc-300">
        {label} {required && <span className="text-red-500">*</span>}
      </label>
      
      {as === 'input' && (
        <input
          type={type}
          id={name}
          name={name}
          placeholder={placeholder}
          defaultValue={defaultValue}
          required={required}
          className={`${baseClasses} h-10`}
        />
      )}

      {as === 'textarea' && (
        <textarea
          id={name}
          name={name}
          placeholder={placeholder}
          defaultValue={defaultValue}
          required={required}
          className={`${baseClasses} min-h-[100px] resize-y`}
        />
      )}

      {as === 'select' && (
        <select
          id={name}
          name={name}
          defaultValue={defaultValue}
          required={required}
          className={`${baseClasses} h-10`}
        >
          {children}
        </select>
      )}

      {hasError && (
        <div className="text-sm text-red-500 font-medium">
          {error.map((err, i) => (
            <p key={i}>{err}</p>
          ))}
        </div>
      )}
    </div>
  )
}
