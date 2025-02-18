"use client";

import { useEffect, useRef, useState } from "react";
import { motion, useAnimation, useMotionValue } from "framer-motion";

interface SparkleProps {
  size: number;
  color: string;
  style: any;
}

const Sparkle = ({ size, color, style }: SparkleProps) => {
  const path = useRef<SVGPathElement>(null);
  const controls = useAnimation();

  useEffect(() => {
    controls.start({
      scale: [1, 0],
      opacity: [1, 0],
      transition: { duration: 0.8, ease: "easeOut" }
    });
  }, [controls]);

  return (
    <motion.svg
      style={style}
      width={size}
      height={size}
      viewBox="0 0 68 68"
      fill="none"
      animate={controls}
    >
      <path
        ref={path}
        d="M26.5 25.5C19.0043 33.3697 0 34 0 34C0 34 19.1013 35.3684 26.5 43.5C33.7994 51.8369 34 68 34 68C34 68 35.6482 51.9197 43.5 43.5C51.6996 34.7567 68 34 68 34C68 34 51.6996 33.5 43.5 25.5C35.3004 17.5 34 0 34 0C34 0 33.7994 17.5 26.5 25.5Z"
        fill={color}
      />
    </motion.svg>
  );
};

interface SparklesCoreProps {
  background?: string;
  minSize?: number;
  maxSize?: number;
  particleDensity?: number;
  particleColor?: string;
  className?: string;
}

export const SparklesCore = ({
  background = "transparent",
  minSize = 0.4,
  maxSize = 1,
  particleDensity = 100,
  particleColor = "#fff",
  className = "",
}: SparklesCoreProps) => {
  const containerRef = useRef<HTMLDivElement>(null);
  const [sparkles, setSparkles] = useState<Array<{ id: number; size: number; style: any }>>([]);

  useEffect(() => {
    const container = containerRef.current;
    if (!container) return;

    const { width, height } = container.getBoundingClientRect();
    const sparkleCount = Math.floor((width * height) / particleDensity);

    const newSparkles = Array.from({ length: sparkleCount }, (_, i) => ({
      id: i,
      size: Math.random() * (maxSize - minSize) + minSize,
      style: {
        position: "absolute",
        left: `${Math.random() * 100}%`,
        top: `${Math.random() * 100}%`,
      },
    }));

    setSparkles(newSparkles);
  }, [minSize, maxSize, particleDensity]);

  return (
    <div
      ref={containerRef}
      className={className}
      style={{
        position: "relative",
        width: "100%",
        height: "100%",
        background,
        overflow: "hidden",
      }}
    >
      {sparkles.map((sparkle) => (
        <Sparkle
          key={sparkle.id}
          size={sparkle.size * 20}
          color={particleColor}
          style={sparkle.style}
        />
      ))}
    </div>
  );
}; 