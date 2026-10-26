"use client";

import { motion } from "framer-motion";

const leaves = [
  { cx: 330, cy: 35, delay: 1.2, size: 1.0, rotate: 20 },
  { cx: 280, cy: 55, delay: 1.4, size: 1.2, rotate: -15 },
  { cx: 220, cy: 85, delay: 1.7, size: 1.1, rotate: 35 },
  { cx: 160, cy: 110, delay: 2.0, size: 0.95, rotate: -25 },
  { cx: 100, cy: 135, delay: 2.3, size: 1.15, rotate: 15 },
  { cx: 290, cy: 18, delay: 1.5, size: 0.85, rotate: -40 },
  { cx: 215, cy: 32, delay: 1.8, size: 0.9, rotate: 45 },
  { cx: 165, cy: 55, delay: 2.1, size: 1.1, rotate: -10 },
  { cx: 125, cy: 125, delay: 2.4, size: 0.9, rotate: 30 },
  { cx: 65, cy: 155, delay: 2.7, size: 1.05, rotate: -20 },
];

/** Renders a soft decorative herb vine and steam wisps on md+ screens. */
export function AnimatedBranch() {
  return (
    <div className="hidden md:block absolute top-0 right-0 md:-right-16 w-[420px] h-[320px] md:w-[560px] md:h-[360px] pointer-events-none opacity-80 z-0">
      <svg
        viewBox="0 0 400 300"
        className="w-full h-full overflow-visible blur-[0.3px]"
      >
        <motion.g
          animate={{ rotate: [0, 0.8, -0.8, 0] }}
          transition={{ duration: 9, repeat: Infinity, ease: "easeInOut" }}
          style={{ transformOrigin: "400px 0px" }}
        >
          {/* Main Herb Vine */}
          <motion.path
            d="M 400 0 Q 300 50 200 100 T 50 150"
            fill="transparent"
            stroke="#9DB8B4"
            strokeWidth="4"
            strokeLinecap="round"
            initial={{ pathLength: 0 }}
            animate={{ pathLength: 1 }}
            transition={{ duration: 2, ease: "easeInOut" }}
          />
          {/* Sub Branch 1 */}
          <motion.path
            d="M 280 65 Q 250 30 200 20"
            fill="transparent"
            stroke="#B6CCC8"
            strokeWidth="2.5"
            strokeLinecap="round"
            initial={{ pathLength: 0 }}
            animate={{ pathLength: 1 }}
            transition={{ duration: 1.5, delay: 0.5, ease: "easeInOut" }}
          />
          {/* Sub Branch 2 */}
          <motion.path
            d="M 180 110 Q 150 140 100 130"
            fill="transparent"
            stroke="#C4D6D3"
            strokeWidth="2"
            strokeLinecap="round"
            initial={{ pathLength: 0 }}
            animate={{ pathLength: 1 }}
            transition={{ duration: 1.5, delay: 1, ease: "easeInOut" }}
          />

          {/* Fresh Herb Leaves (Coriander / Curry leaves) */}
          {leaves.map((leaf, i) => (
            <motion.g
              key={i}
              initial={{ scale: 0, opacity: 0, x: leaf.cx, y: leaf.cy }}
              animate={{ scale: leaf.size, opacity: 1, x: leaf.cx, y: leaf.cy }}
              transition={{
                duration: 0.7,
                delay: leaf.delay,
                type: "spring",
                bounce: 0.4,
              }}
            >
              <g transform={`rotate(${leaf.rotate})`}>
                <path
                  d="M 0,0 C -8,-6 -10,-16 0,-20 C 10,-16 8,-6 0,0 Z"
                  fill={i % 3 === 0 ? "rgba(37, 211, 102, 0.55)" : "rgba(47, 125, 78, 0.5)"}
                  stroke="none"
                />
                <path
                  d="M 0,-2 L 0,-16"
                  stroke="rgba(12, 74, 72, 0.25)"
                  strokeWidth="1"
                  strokeLinecap="round"
                />
                <circle cx="5" cy="-8" r="2" fill="rgba(245, 166, 35, 0.6)" stroke="none" />
              </g>
            </motion.g>
          ))}

          {/* Steam wisps from the Imagined Pot */}
          <g transform="translate(45, 140)">
            <motion.path
              d="M 12,-6 C 14,-14 10,-20 13,-26"
              fill="none"
              stroke="rgba(232, 90, 52, 0.4)"
              strokeWidth="2"
              strokeLinecap="round"
              animate={{ y: [-2, -8, -2], opacity: [0.2, 0.55, 0.2] }}
              transition={{ duration: 2.5, repeat: Infinity, ease: "easeInOut" }}
            />
            <motion.path
              d="M 22,-6 C 25,-16 20,-22 24,-28"
              fill="none"
              stroke="rgba(245, 166, 35, 0.45)"
              strokeWidth="2"
              strokeLinecap="round"
              animate={{ y: [-3, -9, -3], opacity: [0.25, 0.6, 0.25] }}
              transition={{ duration: 3, delay: 0.3, repeat: Infinity, ease: "easeInOut" }}
            />
          </g>
        </motion.g>
      </svg>
    </div>
  );
}
