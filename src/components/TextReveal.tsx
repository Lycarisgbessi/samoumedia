import { motion } from 'motion/react';

interface TextRevealProps {
  text: string;
  className?: string;
  delay?: number;
}

export function TextReveal({ text, className = "", delay = 0 }: TextRevealProps) {
  const words = text.split(" ");
  
  return (
    <span className={`inline-block overflow-hidden ${className}`}>
      {words.map((word, i) => (
        <span key={i} className="inline-block overflow-hidden align-bottom">
          <motion.span
            className="inline-block"
            initial={{ y: "100%", rotateZ: 5, opacity: 0 }}
            whileInView={{ y: 0, rotateZ: 0, opacity: 1 }}
            viewport={{ once: true, margin: "-50px" }}
            transition={{
              duration: 0.8,
              ease: [0.16, 1, 0.3, 1],
              delay: delay + i * 0.05,
            }}
          >
            {word}
          </motion.span>
          <span className="inline-block">&nbsp;</span>
        </span>
      ))}
    </span>
  );
}
