import React from 'react';
import { motion, HTMLMotionProps } from 'framer-motion';
import { cn } from '../../utils/cn';

export interface CardProps extends Omit<HTMLMotionProps<'div'>, 'children'> {
  hoverLift?: boolean;
  glassmorphism?: boolean;
  bordered?: boolean;
  children?: React.ReactNode;
}

export const Card: React.FC<CardProps> = ({
  hoverLift = false,
  glassmorphism = false,
  bordered = true,
  children,
  className,
  ...props
}) => {
  return (
    <motion.div
      whileHover={hoverLift ? { y: -3 } : undefined}
      transition={{ type: 'spring', stiffness: 400, damping: 25 }}
      className={cn(
        'rounded-xl transition-all duration-200 p-5',
        glassmorphism ? 'glass-panel shadow-soft' : 'bg-white shadow-soft',
        bordered ? 'border border-slate-200/80' : 'border-0',
        hoverLift && 'hover:shadow-hover-lift hover:border-brand-200 cursor-pointer',
        className
      )}
      {...props}
    >
      {children}
    </motion.div>
  );
};
