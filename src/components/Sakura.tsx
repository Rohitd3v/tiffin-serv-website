"use client";

import { useEffect, useState } from "react";
import { motion } from "framer-motion";

interface Petal {
  id: number;
  startX: number;
  swayAmount: number;
  delay: number;
  fallDuration: number;
  swayDuration: number;
  size: number;
  rotateX: number;
  rotateY: number;
  rotateZ: number;
}

export function Sakura() {
  const [petals, setPetals] = useState<Petal[]>([]);

  useEffect(() => {
    // Generate petals only on the client side to avoid hydration mismatch
    const newPetals = Array.from({ length: 40 }).map((_, i) => {
      return {
        id: i,
        startX: Math.random() * 100, // random start X position (vw)
        swayAmount: Math.random() * 15 + 10, // how far it sways left/right
        delay: Math.random() * 10, // random start delay
        fallDuration: Math.random() * 10 + 10, // fall duration between 10s and 20s
        swayDuration: Math.random() * 4 + 4, // sway cycle duration between 4s and 8s
        size: Math.random() * 10 + 12, // size between 12px and 22px
        rotateX: Math.random() * 360,
        rotateY: Math.random() * 360,
        rotateZ: Math.random() * 360,
      };
    });
    // eslint-disable-next-line react-hooks/set-state-in-effect
    setPetals(newPetals);
  }, []);

  return (
    <div className="fixed inset-0 pointer-events-none z-0 overflow-hidden" aria-hidden="true" style={{ perspective: "1000px" }}>
      {petals.map((petal) => (
        <motion.div
          key={petal.id}
          initial={{ 
            y: "-5vh", 
            x: `${petal.startX}vw`, 
            rotateX: 0, 
            rotateY: 0, 
            rotateZ: 0, 
            opacity: 0 
          }}
          animate={{
            y: ["-5vh", "110vh"],
            x: [
              `${petal.startX}vw`, 
              `${petal.startX + petal.swayAmount}vw`, 
              `${petal.startX - petal.swayAmount}vw`, 
              `${petal.startX}vw`
            ],
            rotateX: [0, petal.rotateX + 360],
            rotateY: [0, petal.rotateY + 360],
            rotateZ: [0, petal.rotateZ + 360],
            opacity: [0, 1, 1, 0]
          }}
          transition={{
            y: {
              duration: petal.fallDuration,
              delay: petal.delay,
              repeat: Infinity,
              ease: "linear"
            },
            x: {
              duration: petal.swayDuration,
              delay: petal.delay,
              repeat: Infinity,
              ease: "easeInOut",
              repeatType: "mirror"
            },
            rotateX: {
              duration: petal.swayDuration * 1.5,
              delay: petal.delay,
              repeat: Infinity,
              ease: "linear"
            },
            rotateY: {
              duration: petal.swayDuration * 1.2,
              delay: petal.delay,
              repeat: Infinity,
              ease: "linear"
            },
            rotateZ: {
              duration: petal.swayDuration * 2,
              delay: petal.delay,
              repeat: Infinity,
              ease: "linear"
            },
            opacity: {
              duration: petal.fallDuration,
              delay: petal.delay,
              repeat: Infinity,
              ease: ["easeIn", "linear", "linear", "easeOut"],
              times: [0, 0.1, 0.9, 1]
            }
          }}
          className="absolute"
          style={{
            width: petal.size,
            height: petal.size * 1.2,
            transformStyle: "preserve-3d"
          }}
        >
          <svg 
            viewBox="0 0 16 18" 
            style={{ 
              width: '100%', 
              height: '100%', 
              filter: 'drop-shadow(2px 2px 0px rgba(45, 27, 78, 0.2))' 
            }}
          >
            <path 
              d="M 8,18 C 2,10 0,3 8,0 C 16,3 14,10 8,18 Z" 
              fill="#ffb7c5" 
              stroke="#2d1b4e" 
              strokeWidth="1" 
              strokeLinejoin="round"
            />
          </svg>
        </motion.div>
      ))}
    </div>
  );
}
