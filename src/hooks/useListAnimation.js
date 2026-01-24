/**
 * AutoAnimate Hook - Best Practice wrapper
 * Based on @formkit/auto-animate documentation from Context7
 * 
 * Use this hook for zero-config animations on:
 * - Lists that add/remove items
 * - Components that show/hide
 * - Any parent element with dynamic children
 */

import { useAutoAnimate } from '@formkit/auto-animate/react';

/**
 * Pre-configured useAutoAnimate with custom options
 * 
 * @param {Object} options - Animation options
 * @param {number} options.duration - Animation duration in ms (default: 250)
 * @param {string} options.easing - CSS easing function (default: 'ease-in-out')
 * @returns {[React.RefObject, Function]} - [parentRef, enableAnimations]
 * 
 * @example
 * // Basic usage
 * function CourseList({ courses }) {
 *   const [parentRef] = useListAnimation();
 *   return (
 *     <div ref={parentRef} className="courses-grid">
 *       {courses.map(course => <CourseCard key={course.id} {...course} />)}
 *     </div>
 *   );
 * }
 * 
 * @example
 * // With toggle control
 * function AnimatedComponent() {
 *   const [parentRef, enableAnimations] = useListAnimation();
 *   return (
 *     <div ref={parentRef}>
 *       <button onClick={() => enableAnimations(false)}>Disable</button>
 *     </div>
 *   );
 * }
 */
export function useListAnimation(options = {}) {
    const defaultOptions = {
        duration: 250,
        easing: 'ease-in-out',
        ...options
    };

    return useAutoAnimate(defaultOptions);
}

// Re-export the original hook for advanced use cases
export { useAutoAnimate };
