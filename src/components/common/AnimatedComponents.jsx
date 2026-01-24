import { motion } from 'motion/react';

/**
 * Animation Variants - Best Practice: Define reusable animation variants
 * Based on Motion (Framer Motion) documentation
 */

// Fade in animation
export const fadeIn = {
    hidden: { opacity: 0 },
    visible: {
        opacity: 1,
        transition: { duration: 0.4 }
    }
};

// Fade in from bottom (slide up)
export const fadeInUp = {
    hidden: {
        opacity: 0,
        y: 20
    },
    visible: {
        opacity: 1,
        y: 0,
        transition: { duration: 0.5, ease: 'easeOut' }
    }
};

// Fade in from left
export const fadeInLeft = {
    hidden: {
        opacity: 0,
        x: -20
    },
    visible: {
        opacity: 1,
        x: 0,
        transition: { duration: 0.5, ease: 'easeOut' }
    }
};

// Fade in from right
export const fadeInRight = {
    hidden: {
        opacity: 0,
        x: 20
    },
    visible: {
        opacity: 1,
        x: 0,
        transition: { duration: 0.5, ease: 'easeOut' }
    }
};

// Scale in animation
export const scaleIn = {
    hidden: {
        opacity: 0,
        scale: 0.9
    },
    visible: {
        opacity: 1,
        scale: 1,
        transition: { duration: 0.3, ease: 'easeOut' }
    }
};

// Stagger container - for animating children sequentially
export const staggerContainer = {
    hidden: { opacity: 0 },
    visible: {
        opacity: 1,
        transition: {
            staggerChildren: 0.1,
            delayChildren: 0.1
        }
    }
};

// Stagger item - used with staggerContainer
export const staggerItem = {
    hidden: {
        opacity: 0,
        y: 20
    },
    visible: {
        opacity: 1,
        y: 0,
        transition: { duration: 0.4 }
    }
};

/**
 * Motion Components - Pre-configured motion elements
 */

// Animated section that fades in when in viewport
export function AnimatedSection({ children, className = '', delay = 0 }) {
    return (
        <motion.section
            className={className}
            initial="hidden"
            whileInView="visible"
            viewport={{ once: true, margin: '-100px' }}
            variants={{
                hidden: { opacity: 0, y: 30 },
                visible: {
                    opacity: 1,
                    y: 0,
                    transition: { duration: 0.6, delay }
                }
            }}
        >
            {children}
        </motion.section>
    );
}

// Animated div that fades in when in viewport
export function AnimatedDiv({ children, className = '', delay = 0, variants = fadeInUp }) {
    return (
        <motion.div
            className={className}
            initial="hidden"
            whileInView="visible"
            viewport={{ once: true, margin: '-50px' }}
            variants={variants}
            transition={{ delay }}
        >
            {children}
        </motion.div>
    );
}

// Stagger container for lists/grids
export function StaggerContainer({ children, className = '' }) {
    return (
        <motion.div
            className={className}
            initial="hidden"
            whileInView="visible"
            viewport={{ once: true, margin: '-50px' }}
            variants={staggerContainer}
        >
            {children}
        </motion.div>
    );
}

// Stagger item - use inside StaggerContainer
export function StaggerItem({ children, className = '' }) {
    return (
        <motion.div
            className={className}
            variants={staggerItem}
        >
            {children}
        </motion.div>
    );
}

// Hover scale effect
export function HoverScale({ children, className = '', scale = 1.02 }) {
    return (
        <motion.div
            className={className}
            whileHover={{ scale }}
            whileTap={{ scale: 0.98 }}
            transition={{ duration: 0.2 }}
        >
            {children}
        </motion.div>
    );
}

// Page transition wrapper
export function PageTransition({ children, className = '' }) {
    return (
        <motion.main
            className={className}
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, y: -20 }}
            transition={{ duration: 0.3 }}
        >
            {children}
        </motion.main>
    );
}

export { motion };
