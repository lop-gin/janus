'use client';

import React from 'react';
import { motion } from 'framer-motion';

interface LoadingAnimationProps {
  size?: 'small' | 'medium' | 'large';
  color?: string;
}

export const LoadingAnimation: React.FC<LoadingAnimationProps> = ({ 
  size = 'medium', 
  color = '#3b82f6' // Default blue color
}) => {
  // Size mapping
  const sizeMap = {
    small: 40,
    medium: 60,
    large: 80
  };
  
  const circleSize = sizeMap[size];
  const dotSize = circleSize / 6;
  
  // Animation variants
  const containerVariants = {
    animate: {
      rotate: 360,
      transition: {
        duration: 2,
        ease: "linear",
        repeat: Infinity
      }
    }
  };
  
  const dotVariants = {
    initial: { scale: 1 },
    animate: (i: number) => ({
      scale: [1, 1.5, 1],
      transition: {
        duration: 1.5,
        repeat: Infinity,
        delay: i * 0.2,
        ease: "easeInOut"
      }
    })
  };
  
  // Create an array of 5 dots
  const dots = Array.from({ length: 5 }).map((_, i) => {
    // Calculate position around the circle
    const angle = (i * (360 / 5)) * (Math.PI / 180);
    const x = Math.cos(angle) * (circleSize / 2 - dotSize / 2);
    const y = Math.sin(angle) * (circleSize / 2 - dotSize / 2);
    
    return (
      <motion.div
        key={i}
        custom={i}
        variants={dotVariants}
        initial="initial"
        animate="animate"
        style={{
          position: 'absolute',
          width: dotSize,
          height: dotSize,
          borderRadius: '50%',
          backgroundColor: color,
          top: '50%',
          left: '50%',
          marginTop: -dotSize / 2,
          marginLeft: -dotSize / 2,
          transform: `translate(${x}px, ${y}px)`
        }}
      />
    );
  });
  
  return (
    <div className="flex items-center justify-center">
      <motion.div
        variants={containerVariants}
        animate="animate"
        style={{
          position: 'relative',
          width: circleSize,
          height: circleSize
        }}
      >
        {dots}
      </motion.div>
    </div>
  );
};

export default LoadingAnimation;
