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

export function AnimatedBranch() {
  return (
    <div className="hidden md:block absolute top-0 right-0 md:-right-20 w-[420px] h-[320px] md:w-[580px] md:h-[380px] pointer-events-none opacity-90 z-0">
      <svg
        viewBox="0 0 400 300"
        className="w-full h-full overflow-visible drop-shadow-[2px_2px_0px_rgba(12,74,72,0.25)]"
      >
        <motion.g
          animate={{ rotate: [0, 1.2, -1.2, 0] }}
          transition={{ duration: 7, repeat: Infinity, ease: "easeInOut" }}
          style={{ transformOrigin: "400px 0px" }}
        >
          {/* Main Herb Vine */}
          <motion.path
            d="M 400 0 Q 300 50 200 100 T 50 150"
            fill="transparent"
            stroke="#0C4A48"
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
            stroke="#0C4A48"
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
            stroke="#0C4A48"
            strokeWidth="2.5"
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
                {/* Coriander leaf shape */}
                <path
                  d="M 0,0 C -8,-6 -10,-16 0,-20 C 10,-16 8,-6 0,0 Z"
                  fill={i % 3 === 0 ? "#25D366" : "#2F7D4E"}
                  stroke="#0C4A48"
                  strokeWidth="1.5"
                />
                <path
                  d="M 0,-2 L 0,-16"
                  stroke="#0C4A48"
                  strokeWidth="1"
                  strokeLinecap="round"
                />
                {/* Turmeric spice dot accent */}
                <circle cx="5" cy="-8" r="2" fill="#F5A623" stroke="#0C4A48" strokeWidth="0.8" />
              </g>
            </motion.g>
          ))}

          {/* Illustrated Terracotta Handi / Cooking Pot (from card logo) */}
          <motion.g
            initial={{ scale: 0, opacity: 0 }}
            animate={{ scale: 1, opacity: 1 }}
            transition={{ duration: 0.8, delay: 1.6, type: "spring" }}
            transform="translate(45, 140)"
          >
            {/* Steam wisps */}
            <motion.path
              d="M 12,-6 C 14,-14 10,-20 13,-26"
              fill="none"
              stroke="#E85A34"
              strokeWidth="1.8"
              strokeLinecap="round"
              animate={{ y: [-2, -8, -2], opacity: [0.4, 0.9, 0.4] }}
              transition={{ duration: 2.5, repeat: Infinity, ease: "easeInOut" }}
            />
            <motion.path
              d="M 22,-6 C 25,-16 20,-22 24,-28"
              fill="none"
              stroke="#F5A623"
              strokeWidth="1.8"
              strokeLinecap="round"
              animate={{ y: [-3, -9, -3], opacity: [0.5, 1, 0.5] }}
              transition={{ duration: 3, delay: 0.3, repeat: Infinity, ease: "easeInOut" }}
            />
            {/* Pot Lid Handle */}
            <ellipse cx="18" cy="2" rx="4" ry="2" fill="#0C4A48" />
            {/* Pot Lid */}
            <path
              d="M 6,5 Q 18,0 30,5 Z"
              fill="#E85A34"
              stroke="#0C4A48"
              strokeWidth="2"
            />
            {/* Pot Body */}
            <path
              d="M 6,6 Q 2,18 9,24 Q 18,27 27,24 Q 34,18 30,6 Z"
              fill="#E85A34"
              stroke="#0C4A48"
              strokeWidth="2"
            />
            {/* Pot Rim Highlight */}
            <line x1="6" y1="6" x2="30" y2="6" stroke="#0C4A48" strokeWidth="2" />
          </motion.g>
        </motion.g>
      </svg>
    </div>
  );
}
