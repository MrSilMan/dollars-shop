"use client";
import { useEffect } from "react";
import confetti from "canvas-confetti";

export function ConfettiEffect() {
  useEffect(() => {
    confetti({
      particleCount: 140,
      spread: 90,
      origin: { y: 0.45 },
      colors: ["#1A4D3A", "#F5A623", "#22863A", "#ffffff", "#4ade80"],
    });
  }, []);
  return null;
}
