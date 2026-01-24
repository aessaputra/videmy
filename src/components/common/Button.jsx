import clsx from 'clsx';

/**
 * Button Component
 * 
 * Reusable button with multiple variants and sizes.
 * Follows single responsibility principle.
 * 
 * @param {Object} props
 * @param {'primary' | 'secondary' | 'ghost' | 'success'} variant - Button style
 * @param {'sm' | 'md' | 'lg'} size - Button size
 * @param {boolean} fullWidth - Whether button takes full width
 * @param {boolean} loading - Show loading state
 * @param {React.ReactNode} children - Button content
 */
export function Button({
    variant = 'primary',
    size = 'md',
    fullWidth = false,
    loading = false,
    disabled = false,
    className,
    children,
    ...props
}) {
    const classes = clsx(
        'btn',
        {
            'btn--primary': variant === 'primary',
            'btn--secondary': variant === 'secondary',
            'btn--ghost': variant === 'ghost',
            'btn--success': variant === 'success',
            'btn--sm': size === 'sm',
            'btn--lg': size === 'lg',
            'btn--full': fullWidth,
        },
        className
    );

    return (
        <button
            className={classes}
            disabled={disabled || loading}
            {...props}
        >
            {loading ? (
                <>
                    <span className="spinner" style={{ width: 16, height: 16 }} />
                    Loading...
                </>
            ) : (
                children
            )}
        </button>
    );
}

export default Button;
