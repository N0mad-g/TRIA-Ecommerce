"use client";

import { motion } from "framer-motion";

import { wordRevealVariants } from "@/lib/animations";
import { cn } from "@/lib/utils";

type Word = {
  text: string;
  className?: string;
};

type AnimatedHeadlineProps = {
  words: Word[];
  className?: string;
  delayStep?: number;
};

export function AnimatedHeadline({
  words,
  className,
  delayStep = 300,
}: AnimatedHeadlineProps) {
  return (
    <h1 className={cn("text-headline-hero", className)}>
      {words.map((word, index) => (
        <motion.span
          key={`${word.text}-${index}`}
          className={cn("mr-[0.3ch] inline-block", word.className)}
          variants={wordRevealVariants}
          initial="hidden"
          animate="visible"
          transition={{ delay: (index * delayStep) / 1000 }}
        >
          {word.text}
        </motion.span>
      ))}
    </h1>
  );
}
