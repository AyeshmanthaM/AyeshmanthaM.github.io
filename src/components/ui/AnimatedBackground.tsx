import React from 'react';
import { motion } from 'framer-motion';

interface AnimatedBackgroundProps {
    variant?: 'primary' | 'secondary' | 'minimal';
    className?: string;
}

export const AnimatedBackground: React.FC<AnimatedBackgroundProps> = ({
    variant = 'primary',
    className = ''
}) => {
    const variants = {
        primary: {
            gradients: [
                'radial-gradient(circle at 20% 50%, rgba(14, 165, 233, 0.1) 0%, transparent 50%)',
                'radial-gradient(circle at 80% 20%, rgba(14, 165, 233, 0.08) 0%, transparent 50%)',
                'radial-gradient(circle at 40% 80%, rgba(14, 165, 233, 0.06) 0%, transparent 50%)',
            ],
            darkGradients: [
                'radial-gradient(circle at 20% 50%, rgba(56, 189, 248, 0.05) 0%, transparent 50%)',
                'radial-gradient(circle at 80% 20%, rgba(56, 189, 248, 0.04) 0%, transparent 50%)',
                'radial-gradient(circle at 40% 80%, rgba(56, 189, 248, 0.03) 0%, transparent 50%)',
            ]
        },
        secondary: {
            gradients: [
                'radial-gradient(circle at 30% 70%, rgba(99, 102, 241, 0.08) 0%, transparent 50%)',
                'radial-gradient(circle at 70% 30%, rgba(168, 85, 247, 0.06) 0%, transparent 50%)',
                'radial-gradient(circle at 50% 50%, rgba(14, 165, 233, 0.04) 0%, transparent 50%)',
            ],
            darkGradients: [
                'radial-gradient(circle at 30% 70%, rgba(99, 102, 241, 0.04) 0%, transparent 50%)',
                'radial-gradient(circle at 70% 30%, rgba(168, 85, 247, 0.03) 0%, transparent 50%)',
                'radial-gradient(circle at 50% 50%, rgba(14, 165, 233, 0.02) 0%, transparent 50%)',
            ]
        },
        minimal: {
            gradients: [
                'radial-gradient(circle at 60% 40%, rgba(14, 165, 233, 0.03) 0%, transparent 70%)',
            ],
            darkGradients: [
                'radial-gradient(circle at 60% 40%, rgba(56, 189, 248, 0.02) 0%, transparent 70%)',
            ]
        }
    };

    const currentVariant = variants[variant];

    return (
        <>
            {/* Animated gradient background */}
            <motion.div
                className={`fixed inset-0 pointer-events-none z-0 ${className}`}
                initial={{ opacity: 0 }}
                animate={{ opacity: 1 }}
                transition={{ duration: 1 }}
            >
                <motion.div
                    className="absolute inset-0"
                    style={{
                        background: currentVariant.gradients.join(', '),
                    }}
                    animate={{
                        transform: [
                            'translateX(0px) translateY(0px)',
                            'translateX(-20px) translateY(-20px)',
                            'translateX(20px) translateY(-10px)',
                            'translateX(-10px) translateY(20px)',
                            'translateX(0px) translateY(0px)',
                        ],
                    }}
                    transition={{
                        duration: 20,
                        repeat: Infinity,
                        ease: 'easeInOut',
                    }}
                />

                {/* Mesh Gradient Layer */}
                        <motion.div
                          className="absolute inset-0 z-0"
                          style={{
                            background: `
                              linear-gradient(135deg, rgba(167, 139, 250, 0.1) 0%, transparent 50%),
                              linear-gradient(225deg, rgba(51, 99, 176, 0.08) 0%, transparent 50%),
                              linear-gradient(315deg, rgba(251, 87, 169, 0.01) 0%, transparent 50%)
                            `
                          }}
                          animate={{
                            opacity: [0.7, 1, 0.8, 1]
                          }}
                          transition={{
                            duration: 6,
                            repeat: Infinity,
                            ease: "easeInOut"
                          }}
                        />

                {/* Dark theme overlay */}
                <motion.div
                    className="absolute inset-0 dark:opacity-100 opacity-0 transition-opacity duration-500"
                    style={{
                        background: currentVariant.darkGradients.join(', '),
                    }}
                    animate={{
                        transform: [
                            'translateX(0px) translateY(0px)',
                            'translateX(15px) translateY(-15px)',
                            'translateX(-15px) translateY(10px)',
                            'translateX(10px) translateY(-20px)',
                            'translateX(0px) translateY(0px)',
                        ],
                    }}
                    transition={{
                        duration: 25,
                        repeat: Infinity,
                        ease: 'easeInOut',
                    }}
                />
            </motion.div>

            {/* Grid pattern overlay */}
            <div
                className="fixed inset-0 pointer-events-none z-0 opacity-30"
                style={{
                    backgroundImage: `
            linear-gradient(rgba(14, 165, 233, 0.03) 1px, transparent 1px),
            linear-gradient(90deg, rgba(14, 165, 233, 0.03) 1px, transparent 1px)
          `,
                    backgroundSize: '50px 50px',
                }}
            />

            {/* Dark theme grid */}
            <div
                className="fixed inset-0 pointer-events-none z-0 opacity-0 dark:opacity-20 transition-opacity duration-500"
                style={{
                    backgroundImage: `
            linear-gradient(rgba(56, 189, 248, 0.02) 1px, transparent 1px),
            linear-gradient(90deg, rgba(56, 189, 248, 0.02) 1px, transparent 1px)
          `,
                    backgroundSize: '50px 50px',
                }}
            />

            {/* Floating particles */}
            {variant === 'primary' && (
                <div className="fixed inset-0 pointer-events-none z-0">
                    {[...Array(6)].map((_, i) => (
                        <motion.div
                            key={i}
                            className="absolute w-1 h-1 bg-blue-400/20 rounded-full"
                            style={{
                                left: `${20 + i * 15}%`,
                                top: `${30 + i * 10}%`,
                            }}
                            animate={{
                                y: [-20, 20, -20],
                                x: [-10, 10, -10],
                                opacity: [0.2, 0.5, 0.2],
                            }}
                            transition={{
                                duration: 4 + i,
                                repeat: Infinity,
                                ease: 'easeInOut',
                                delay: i * 0.5,
                            }}
                        />
                    ))}
                </div>
            )}
        </>
    );
};

export default AnimatedBackground;
