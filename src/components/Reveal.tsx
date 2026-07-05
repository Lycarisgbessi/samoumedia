import { motion } from 'motion/react';
import { ReactNode, Key } from 'react';

interface RevealProps {
  children: ReactNode;
  delay?: number;
  className?: string;
  key?: Key;
}

export function Reveal({ children, delay = 0, className = "" }: RevealProps) {
  return (
    <motion.div
      initial={{ opacity: 0, y: 40 }}
      whileInView={{ opacity: 1, y: 0 }}
      viewport={{ once: true, margin: "-50px" }}
      transition={{ duration: 0.8, delay, ease: [0.16, 1, 0.3, 1] }}
      className={className}
    >
      {children}
    </motion.div>
  );
}
