import clsx from 'clsx';

/**
 * Input Component
 * 
 * Reusable form input with label and error handling.
 * 
 * @param {Object} props
 * @param {string} label - Input label
 * @param {string} error - Error message
 * @param {string} type - Input type
 */
export function Input({
    label,
    error,
    type = 'text',
    className,
    id,
    ...props
}) {
    const inputId = id || `input-${label?.toLowerCase().replace(/\s/g, '-')}`;

    return (
        <div className="form-group">
            {label && (
                <label htmlFor={inputId} className="form-label">
                    {label}
                </label>
            )}
            <input
                id={inputId}
                type={type}
                className={clsx('input', { 'input--error': error }, className)}
                {...props}
            />
            {error && (
                <span className="form-error">{error}</span>
            )}
        </div>
    );
}

export default Input;
