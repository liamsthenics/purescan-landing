"use client";

import { useRef } from "react";
import styles from "./Hero.module.css";
import { useScrollParallax } from "./useScrollParallax";

/** Fraction of the scroll distance the numeral drifts by: it lags the page slightly. */
const PARALLAX_RATE = 0.18;

interface HeroNumeralProps {
  score: number;
  /** CSS colour: the score's verdict colour. */
  color: string;
}

/** The colossal score behind the hero phone, in its verdict colour. Decorative. */
export function HeroNumeral({ score, color }: HeroNumeralProps) {
  const numeralRef = useRef<HTMLSpanElement>(null);
  useScrollParallax(numeralRef, PARALLAX_RATE);
  return (
    <span ref={numeralRef} className={styles.numeral} style={{ color }} aria-hidden="true">
      {score}
    </span>
  );
}
