"use client";

import { motion } from "framer-motion";

const flowers = [
  { cx: 320, cy: 40, delay: 1.5, size: 0.8 },
  { cx: 270, cy: 65, delay: 1.8, size: 1.2 },
  { cx: 220, cy: 95, delay: 2.1, size: 1.0 },
  { cx: 160, cy: 115, delay: 2.4, size: 0.9 },
  { cx: 90, cy: 140, delay: 2.7, size: 1.1 },
  { cx: 280, cy: 20, delay: 2.0, size: 0.7 },
  { cx: 210, cy: 30, delay: 2.3, size: 0.85 },
  { cx: 170, cy: 60, delay: 2.6, size: 1.15 },
  { cx: 120, cy: 130, delay: 2.9, size: 0.95 },
  { cx: 60, cy: 160, delay: 3.2, size: 1.05 },
];

export function AnimatedBranch() {
  return (
    <div className="hidden md:block absolute top-0 right-0 md:-right-30 w-[400px] h-[300px] md:w-[600px] md:h-[400px] pointer-events-none opacity-90 z-0">
      <svg
        viewBox="0 0 400 300"
        className="w-full h-full overflow-visible drop-shadow-[2px_2px_0px_rgba(45,27,78,0.2)]"
      >
        <motion.g
          animate={{ rotate: [0, 1, -1, 0] }}
          transition={{ duration: 8, repeat: Infinity, ease: "easeInOut" }}
          style={{ transformOrigin: "400px 0px" }}
        >
          {/* Main Branch */}
          <motion.path
            d="M 400 0 Q 300 50 200 100 T 50 150"
            fill="transparent"
            stroke="#2d1b4e"
            strokeWidth="5"
            strokeLinecap="round"
            initial={{ pathLength: 0 }}
            animate={{ pathLength: 1 }}
            transition={{ duration: 2, ease: "easeInOut" }}
          />
          {/* Sub Branch 1 */}
          <motion.path
            d="M 280 65 Q 250 30 200 20"
            fill="transparent"
            stroke="#2d1b4e"
            strokeWidth="3.5"
            strokeLinecap="round"
            initial={{ pathLength: 0 }}
            animate={{ pathLength: 1 }}
            transition={{ duration: 1.5, delay: 0.5, ease: "easeInOut" }}
          />
          {/* Sub Branch 2 */}
          <motion.path
            d="M 180 110 Q 150 140 100 130"
            fill="transparent"
            stroke="#2d1b4e"
            strokeWidth="2.5"
            strokeLinecap="round"
            initial={{ pathLength: 0 }}
            animate={{ pathLength: 1 }}
            transition={{ duration: 1.5, delay: 1, ease: "easeInOut" }}
          />

          {/* Flowers */}
          {flowers.map((f, i) => (
            <motion.g
              key={i}
              initial={{ scale: 0, opacity: 0, x: f.cx, y: f.cy }}
              animate={{ scale: f.size, opacity: 1, x: f.cx, y: f.cy }}
              transition={{
                duration: 0.8,
                delay: f.delay,
                type: "spring",
                bounce: 0.5,
              }}
            >
              {[0, 72, 144, 216, 288].map((angle, j) => (
                <path
                  key={j}
                  transform={`rotate(${angle}) translate(0, -8)`}
                  d="M 0,0 C -6,-8 -8,-15 0,-18 C 8,-15 6,-8 0,0 Z"
                  fill="#ffb7c5"
                  stroke="#2d1b4e"
                  strokeWidth="1.5"
                />
              ))}
              <circle cx="0" cy="0" r="2.5" fill="#2d1b4e" />
            </motion.g>
          ))}
        </motion.g>
      </svg>
    </div>
  );
}
