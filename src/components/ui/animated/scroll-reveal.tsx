"use client";

import { motion } from "framer-motion";

import { defaultViewport, scrollRevealVariants } from "@/lib/animations";
import { cn } from "@/lib/utils";

type ScrollRevealProps = {
  children: React.ReactNode;
  className?: string;
  delay?: number;
};

export function ScrollReveal({ children, className, delay = 0 }: ScrollRevealProps) {
  return (
    <motion.div
      className={cn(className)}
      variants={scrollRevealVariants}
      initial="hidden"
      whileInView="visible"
      viewport={defaultViewport}
      transition={{ delay: delay / 1000 }}
    >
      {children}
    </motion.div>
  );
}
