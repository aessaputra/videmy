import clsx from 'clsx';

/**
 * Card Component
 * 
 * Flexible card container with optional interactive state.
 * 
 * @param {Object} props
 * @param {boolean} interactive - Add hover effects
 * @param {React.ReactNode} children - Card content
 */
export function Card({
    interactive = false,
    className,
    children,
    ...props
}) {
    return (
        <div
            className={clsx(
                'card',
                { 'card--interactive': interactive },
                className
            )}
            {...props}
        >
            {children}
        </div>
    );
}

export default Card;
