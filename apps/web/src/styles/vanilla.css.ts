// Vanilla Extract CSS Styles
// Type-safe CSS-in-JS me vanilla-extract

import { style, styleVariants, globalStyle, keyframes } from "@vanilla-extract/css";

// Global styles
globalStyle("html, body", {
  margin: 0,
  padding: 0,
  fontFamily: "'Segoe UI', Roboto, Arial, sans-serif",
});

// Keyframes për animacione
export const fadeIn = keyframes({
  "0%": { opacity: 0 },
  "100%": { opacity: 1 },
});

export const slideUp = keyframes({
  "0%": { 
    opacity: 0,
    transform: "translateY(20px)",
  },
  "100%": { 
    opacity: 1,
    transform: "translateY(0)",
  },
});

export const pulse = keyframes({
  "0%, 100%": { opacity: 1 },
  "50%": { opacity: 0.5 },
});

export const glow = keyframes({
  "0%, 100%": { boxShadow: "0 0 20px rgba(59, 130, 246, 0.5)" },
  "50%": { boxShadow: "0 0 30px rgba(59, 130, 246, 0.8)" },
});

// Base card style
export const card = style({
  background: "rgba(255, 255, 255, 0.05)",
  border: "1px solid rgba(255, 255, 255, 0.1)",
  borderRadius: "12px",
  padding: "24px",
  backdropFilter: "blur(10px)",
  WebkitBackdropFilter: "blur(10px)",
  animation: `${fadeIn} 0.5s ease-out`,
});

// Theme variants
export const themeVariants = styleVariants({
  albi: {
    background: "linear-gradient(180deg, #0b0f15 0%, #1a2740 100%)",
    color: "#e9f1f7",
  },
  jona: {
    background: "linear-gradient(180deg, #1a0b0b 0%, #2a1010 100%)",
    color: "#f7e9e9",
  },
  harmony: {
    background: "linear-gradient(135deg, #0b0f15 0%, #1b2333 40%, #3a1f2f 80%, #0b0f15 100%)",
    backgroundSize: "300% 300%",
    color: "#f0f0f0",
    animation: `${slideUp} 20s ease infinite`,
  },
});

// Button styles
export const button = style({
  display: "inline-flex",
  alignItems: "center",
  justifyContent: "center",
  borderRadius: "8px",
  padding: "12px 24px",
  fontSize: "14px",
  fontWeight: "600",
  cursor: "pointer",
  border: "none",
  transition: "all 0.3s ease",
  ":hover": {
    transform: "translateY(-2px)",
  },
  ":active": {
    transform: "translateY(0)",
  },
});

export const buttonVariants = styleVariants({
  primary: [button, {
    background: "#3b82f6",
    color: "white",
    ":hover": {
      background: "#2563eb",
      boxShadow: "0 8px 25px -8px rgba(59, 130, 246, 0.5)",
    },
  }],
  secondary: [button, {
    background: "rgba(255, 255, 255, 0.1)",
    color: "white",
    border: "1px solid rgba(255, 255, 255, 0.2)",
    ":hover": {
      background: "rgba(255, 255, 255, 0.2)",
    },
  }],
  alba: [button, {
    background: "#3b82f6",
    color: "white",
    animation: `${glow} 3s ease infinite`,
    ":hover": {
      background: "#2563eb",
      transform: "translateY(-2px) scale(1.02)",
    },
  }],
  jona: [button, {
    background: "#ef4444",
    color: "white",
    boxShadow: "0 0 20px rgba(239, 68, 68, 0.5)",
    ":hover": {
      background: "#dc2626",
      transform: "translateY(-2px) scale(1.02)",
      boxShadow: "0 0 30px rgba(239, 68, 68, 0.8)",
    },
  }],
});

// Health score circle
export const healthCircle = style({
  position: "relative",
  width: "120px",
  height: "120px",
  borderRadius: "50%",
  border: "4px solid #3b82f6",
  display: "flex",
  flexDirection: "column",
  alignItems: "center",
  justifyContent: "center",
  background: "rgba(255, 255, 255, 0.05)",
  animation: `${pulse} 2s ease infinite`,
});

export const healthVariants = styleVariants({
  excellent: [healthCircle, {
    borderColor: "#4ade80",
    boxShadow: "0 0 30px rgba(74, 222, 128, 0.3)",
  }],
  good: [healthCircle, {
    borderColor: "#fbbf24",
    boxShadow: "0 0 30px rgba(251, 191, 36, 0.3)",
  }],
  fair: [healthCircle, {
    borderColor: "#fb923c",
    boxShadow: "0 0 30px rgba(251, 146, 60, 0.3)",
  }],
  poor: [healthCircle, {
    borderColor: "#ef4444",
    boxShadow: "0 0 30px rgba(239, 68, 68, 0.3)",
  }],
});

// Stats grid
export const statsGrid = style({
  display: "grid",
  gridTemplateColumns: "repeat(auto-fit, minmax(200px, 1fr))",
  gap: "16px",
  marginTop: "24px",
});

export const statCard = style([card, {
  textAlign: "center",
  padding: "16px",
  ":hover": {
    transform: "translateY(-4px)",
    boxShadow: "0 8px 25px -8px rgba(0, 0, 0, 0.3)",
  },
}]);

// Loading animations
export const spinner = keyframes({
  "0%": { transform: "rotate(0deg)" },
  "100%": { transform: "rotate(360deg)" },
});

export const loading = style({
  width: "20px",
  height: "20px",
  border: "2px solid rgba(255, 255, 255, 0.3)",
  borderTop: "2px solid white",
  borderRadius: "50%",
  animation: `${spinner} 1s linear infinite`,
});

// Container styles
export const container = style({
  maxWidth: "1200px",
  margin: "0 auto",
  padding: "24px",
});

export const flexCenter = style({
  display: "flex",
  alignItems: "center",
  justifyContent: "center",
});

export const flexBetween = style({
  display: "flex",
  alignItems: "center",
  justifyContent: "space-between",
});

// Responsive utilities
export const hideOnMobile = style({
  "@media": {
    "screen and (max-width: 768px)": {
      display: "none",
    },
  },
});

export const showOnMobile = style({
  display: "none",
  "@media": {
    "screen and (max-width: 768px)": {
      display: "block",
    },
  },
});