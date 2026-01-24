/**
 * Loading Component
 * 
 * Displays a loading spinner. Can be used inline or as full page.
 * 
 * @param {Object} props
 * @param {boolean} fullPage - Show as full page loader
 * @param {string} message - Optional loading message
 */
export function Loading({ fullPage = false, message }) {
    if (fullPage) {
        return (
            <div className="loading-screen">
                <div className="flex flex-col items-center gap-md">
                    <div className="spinner" />
                    {message && (
                        <p className="text-secondary text-sm">{message}</p>
                    )}
                </div>
            </div>
        );
    }

    return (
        <div className="flex items-center justify-center p-lg">
            <div className="spinner" />
            {message && (
                <p className="text-secondary text-sm mt-sm">{message}</p>
            )}
        </div>
    );
}

export default Loading;
