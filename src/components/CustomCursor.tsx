import { useEffect, useState } from 'react';
import { motion, useMotionValue, useSpring, AnimatePresence } from 'motion/react';

export function CustomCursor() {
  const [isHovering, setIsHovering] = useState(false);
  const [hoverText, setHoverText] = useState('');
  const cursorX = useMotionValue(-100);
  const cursorY = useMotionValue(-100);
  
  const springConfig = { damping: 25, stiffness: 400, mass: 0.5 };
  const cursorXSpring = useSpring(cursorX, springConfig);
  const cursorYSpring = useSpring(cursorY, springConfig);

  useEffect(() => {
    const moveCursor = (e: MouseEvent) => {
      cursorX.set(e.clientX);
      cursorY.set(e.clientY);
    };

    const handleMouseOver = (e: MouseEvent) => {
      const target = e.target as HTMLElement;
      const isCard = target.closest('a') || target.tagName.toLowerCase() === 'a';
      const isVideo = target.closest('.group.cursor-pointer.aspect-video') || target.closest('.group.cursor-pointer.min-h-\\[300px\\]');
      
      if (isVideo) {
        setHoverText('VOIR');
        setIsHovering(true);
      } else if (isCard) {
        setHoverText('LIRE');
        setIsHovering(true);
      } else if (
        target.tagName.toLowerCase() === 'button' ||
        target.closest('button') ||
        target.classList.contains('cursor-pointer')
      ) {
        setHoverText('');
        setIsHovering(true);
      } else {
        setHoverText('');
        setIsHovering(false);
      }
    };

    window.addEventListener('mousemove', moveCursor);
    window.addEventListener('mouseover', handleMouseOver);

    return () => {
      window.removeEventListener('mousemove', moveCursor);
      window.removeEventListener('mouseover', handleMouseOver);
    };
  }, [cursorX, cursorY]);

  return (
    <>
      <motion.div
        className="fixed top-0 left-0 w-4 h-4 bg-brand-red rounded-full pointer-events-none z-[9999] mix-blend-difference flex items-center justify-center overflow-hidden"
        style={{
          x: cursorXSpring,
          y: cursorYSpring,
          translateX: '-50%',
          translateY: '-50%',
          scale: isHovering ? (hoverText ? 4 : 2.5) : 1,
          opacity: isHovering ? 0.9 : 1,
        }}
        transition={{ scale: { duration: 0.4, ease: [0.16, 1, 0.3, 1] } }}
      >
        <AnimatePresence>
          {hoverText && (
            <motion.span 
              initial={{ opacity: 0, scale: 0.5 }}
              animate={{ opacity: 1, scale: 1 }}
              exit={{ opacity: 0, scale: 0.5 }}
              className="text-[3px] font-black tracking-widest text-white text-center leading-none uppercase"
              style={{ transform: 'scale(0.25)' }}
            >
              {hoverText}
            </motion.span>
          )}
        </AnimatePresence>
      </motion.div>
      <motion.div
        className="fixed top-0 left-0 w-1 h-1 bg-white rounded-full pointer-events-none z-[10000] mix-blend-difference"
        style={{
          x: cursorX,
          y: cursorY,
          translateX: '-50%',
          translateY: '-50%',
          opacity: isHovering ? 0 : 1,
        }}
      />
    </>
  );
}
