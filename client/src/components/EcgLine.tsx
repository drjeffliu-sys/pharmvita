/*
 * Design: Clinical Pulse
 * - Animated ECG heartbeat line as decorative separator
 */
import { motion } from "framer-motion";

interface EcgLineProps {
  className?: string;
  color?: string;
}

export default function EcgLine({ className = "", color = "#059669" }: EcgLineProps) {
  return (
    <div className={`w-full overflow-hidden ${className}`}>
      <svg
        viewBox="0 0 1200 60"
        className="w-full h-8"
        preserveAspectRatio="none"
      >
        <motion.path
          d="M0,30 L200,30 L220,30 L240,10 L260,50 L280,5 L300,55 L320,30 L340,30 L600,30 L620,30 L640,10 L660,50 L680,5 L700,55 L720,30 L740,30 L1000,30 L1020,30 L1040,10 L1060,50 L1080,5 L1100,55 L1120,30 L1140,30 L1200,30"
          fill="none"
          stroke={color}
          strokeWidth="2.5"
          strokeLinecap="round"
          strokeLinejoin="round"
          initial={{ pathLength: 0, opacity: 0 }}
          animate={{ pathLength: 1, opacity: 1 }}
          transition={{ duration: 2, ease: "easeInOut" }}
        />
      </svg>
    </div>
  );
}
