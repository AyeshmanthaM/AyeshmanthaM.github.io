import React from 'react';
import { motion } from 'framer-motion';

interface HeroSectionProps {
    title: string;
    subtitle?: string;
    description: string;
    primaryAction?: {
        label: string;
        onClick: () => void;
    };
    secondaryAction?: {
        label: string;
        onClick: () => void;
    };
    backgroundVariant?: 'gradient' | 'pattern' | 'minimal';
    children?: React.ReactNode;
}

export const HeroSection: React.FC<HeroSectionProps> = ({
    title,
    subtitle,
    description,
    primaryAction,
    secondaryAction,
    backgroundVariant = 'gradient',
    children
}) => {
    const containerVariants = {
        hidden: { opacity: 0 },
        visible: {
            opacity: 1,
            transition: {
                duration: 0.8,
                staggerChildren: 0.2,
            },
        },
    };

    const itemVariants = {
        hidden: { opacity: 0, y: 30 },
        visible: {
            opacity: 1,
            y: 0,
            transition: {
                duration: 0.6,
                ease: 'easeOut',
            },
        },
    };

    const getBackgroundClasses = () => {
        switch (backgroundVariant) {
            case 'gradient':
                return 'bg-gradient-to-br from-blue-50 via-white to-blue-50 dark:from-gray-900 dark:via-gray-950 dark:to-gray-900';
            case 'pattern':
                return 'bg-white dark:bg-gray-950 bg-grid-pattern';
            case 'minimal':
            default:
                return 'bg-white dark:bg-gray-950';
        }
    };

    return (
        <section className={`relative min-h-screen flex items-center justify-center py-20 px-4 overflow-hidden ${getBackgroundClasses()}`}>
            {/* Background decorative elements */}
            <div className="absolute inset-0 overflow-hidden pointer-events-none">
                <motion.div
                    className="absolute top-1/4 left-1/4 w-72 h-72 bg-blue-200/20 dark:bg-blue-800/20 rounded-full blur-3xl"
                    animate={{
                        scale: [1, 1.2, 1],
                        opacity: [0.3, 0.5, 0.3],
                    }}
                    transition={{
                        duration: 8,
                        repeat: Infinity,
                        ease: 'easeInOut',
                    }}
                />
                <motion.div
                    className="absolute bottom-1/4 right-1/4 w-96 h-96 bg-purple-200/20 dark:bg-purple-800/20 rounded-full blur-3xl"
                    animate={{
                        scale: [1.2, 1, 1.2],
                        opacity: [0.2, 0.4, 0.2],
                    }}
                    transition={{
                        duration: 10,
                        repeat: Infinity,
                        ease: 'easeInOut',
                        delay: 1,
                    }}
                />
            </div>

            <div className="container mx-auto max-w-6xl relative z-10">
                <motion.div
                    variants={containerVariants}
                    initial="hidden"
                    animate="visible"
                    className="text-center space-y-8"
                >
                    {subtitle && (
                        <motion.div variants={itemVariants}>
                            <span className="inline-block px-4 py-2 rounded-full text-sm font-medium bg-blue-100 dark:bg-blue-900/30 text-blue-800 dark:text-blue-200 border border-blue-200 dark:border-blue-800">
                                {subtitle}
                            </span>
                        </motion.div>
                    )}

                    <motion.h1
                        variants={itemVariants}
                        className="text-4xl md:text-6xl lg:text-7xl font-bold tracking-tight gradient-text leading-tight"
                    >
                        {title}
                    </motion.h1>

                    <motion.p
                        variants={itemVariants}
                        className="text-lg md:text-xl text-gray-600 dark:text-gray-400 max-w-3xl mx-auto leading-relaxed"
                    >
                        {description}
                    </motion.p>

                    {(primaryAction || secondaryAction) && (
                        <motion.div
                            variants={itemVariants}
                            className="flex flex-col sm:flex-row gap-4 justify-center items-center pt-4"
                        >
                            {primaryAction && (
                                <motion.button
                                    whileHover={{ scale: 1.05 }}
                                    whileTap={{ scale: 0.95 }}
                                    onClick={primaryAction.onClick}
                                    className="px-8 py-4 bg-blue-600 hover:bg-blue-700 text-white font-semibold rounded-xl shadow-lg hover:shadow-xl transition-all duration-300 border border-blue-600"
                                >
                                    {primaryAction.label}
                                </motion.button>
                            )}

                            {secondaryAction && (
                                <motion.button
                                    whileHover={{ scale: 1.05 }}
                                    whileTap={{ scale: 0.95 }}
                                    onClick={secondaryAction.onClick}
                                    className="px-8 py-4 bg-transparent hover:bg-gray-50 dark:hover:bg-gray-800 text-gray-700 dark:text-gray-300 font-semibold rounded-xl border border-gray-300 dark:border-gray-600 hover:border-gray-400 dark:hover:border-gray-500 transition-all duration-300"
                                >
                                    {secondaryAction.label}
                                </motion.button>
                            )}
                        </motion.div>
                    )}

                    {children && (
                        <motion.div variants={itemVariants} className="pt-8">
                            {children}
                        </motion.div>
                    )}
                </motion.div>
            </div>

            {/* Scroll indicator */}
            <motion.div
                className="absolute bottom-8 left-1/2 transform -translate-x-1/2"
                animate={{ y: [0, 10, 0] }}
                transition={{ duration: 2, repeat: Infinity }}
            >
                <div className="w-6 h-10 border-2 border-gray-400 dark:border-gray-600 rounded-full flex justify-center">
                    <motion.div
                        className="w-1 h-3 bg-gray-400 dark:bg-gray-600 rounded-full mt-2"
                        animate={{ y: [0, 12, 0] }}
                        transition={{ duration: 2, repeat: Infinity }}
                    />
                </div>
            </motion.div>
        </section>
    );
};

export default HeroSection;
