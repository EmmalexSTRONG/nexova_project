"use client";

import { useId } from "react";
import { motion, useReducedMotion } from "framer-motion";

// The Chat Mr President AI mark: a glowing neon head-profile "thinking",
// crowned, with a speech bubble standing in for the crown's usual jewel —
// the AI is always mid-conversation. Self-contained (bakes in its own dark
// backdrop) so it reads correctly on gold, ink, or white surfaces alike.
export function ChatLogo({ size = 32, className }: { size?: number; className?: string }) {
  const uid = useId();
  const reduceMotion = Boolean(useReducedMotion());
  const glowId = `${uid}-glow`;
  const goldId = `${uid}-gold`;

  return (
    <svg
      width={size}
      height={size}
      viewBox="0 0 64 64"
      className={className}
      aria-hidden="true"
    >
      <defs>
        <filter id={glowId} x="-60%" y="-60%" width="220%" height="220%">
          <feGaussianBlur stdDeviation="1.6" result="blur" />
          <feMerge>
            <feMergeNode in="blur" />
            <feMergeNode in="SourceGraphic" />
          </feMerge>
        </filter>
        <linearGradient id={goldId} x1="0" y1="0" x2="1" y2="1">
          <stop offset="0%" stopColor="#FFD98C" />
          <stop offset="50%" stopColor="#F0A93C" />
          <stop offset="100%" stopColor="#C97F1A" />
        </linearGradient>
      </defs>

      <circle cx="32" cy="32" r="31" fill="#0A0F1A" />
      <circle cx="32" cy="32" r="30.5" fill="none" stroke="#132038" strokeWidth="1" />

      {/* soft breathing halo behind the head outline */}
      <motion.circle
        cx="32"
        cy="33"
        r="19"
        fill="none"
        stroke="#3FB6FF"
        strokeWidth="3"
        opacity={0.35}
        filter={`url(#${glowId})`}
        animate={reduceMotion ? undefined : { opacity: [0.2, 0.45, 0.2] }}
        transition={{ duration: 2.6, repeat: Infinity, ease: "easeInOut" }}
      />

      {/* head profile, facing right */}
      <path
        d="M33 12
           C41 12, 47 18.5, 47 26.5
           C47 29.5, 45.7 31.5, 44.3 33
           C46 34.5, 45.6 37, 43 38.5
           C41 39.7, 38.5 40.5, 37 43.5
           L37 48
           L32.5 48
           L32.5 42.5
           C24.5 41, 19 34.5, 19 27
           C19 18.5, 25 12, 33 12 Z"
        fill="none"
        stroke="#5FD4FF"
        strokeWidth="2.1"
        strokeLinejoin="round"
        strokeLinecap="round"
        filter={`url(#${glowId})`}
      />

      {/* crown */}
      <path
        d="M21.5 18.5 L26 24.5 L32 15.5 L38 24.5 L42.5 18.5 L41 27.5 L23 27.5 Z"
        fill={`url(#${goldId})`}
        stroke="#8A5A12"
        strokeWidth="0.6"
        strokeLinejoin="round"
      />
      <circle cx="21.5" cy="18.5" r="1.6" fill={`url(#${goldId})`} />
      <circle cx="32" cy="15.5" r="1.8" fill={`url(#${goldId})`} />
      <circle cx="42.5" cy="18.5" r="1.6" fill={`url(#${goldId})`} />

      {/* speech bubble standing in for the crown's jewel — the AI, thinking */}
      <path
        d="M24 29.5 C24 27 26 25.5 28.5 25.5 L37 25.5 C39.5 25.5 41.5 27.3 41.5 29.7 C41.5 32.1 39.5 34 37 34 L30.5 34 L26.5 37 L27.3 33.7 C25.3 33.1 24 31.5 24 29.5 Z"
        fill="#F7F9FC"
      />
      <TypingDot cx={28.6} cy={29.7} delay={0} reduceMotion={reduceMotion} />
      <TypingDot cx={32.7} cy={29.7} delay={0.15} reduceMotion={reduceMotion} />
      <TypingDot cx={36.8} cy={29.7} delay={0.3} reduceMotion={reduceMotion} />
    </svg>
  );
}

function TypingDot({
  cx,
  cy,
  delay,
  reduceMotion,
}: {
  cx: number;
  cy: number;
  delay: number;
  reduceMotion: boolean;
}) {
  return (
    <motion.circle
      cx={cx}
      cy={cy}
      r="1.3"
      fill="#16233B"
      animate={reduceMotion ? undefined : { cy: [cy, cy - 1.6, cy], opacity: [0.55, 1, 0.55] }}
      transition={{ duration: 1.1, repeat: Infinity, ease: "easeInOut", delay }}
    />
  );
}
