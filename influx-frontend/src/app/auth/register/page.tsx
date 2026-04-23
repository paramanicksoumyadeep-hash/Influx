"use client";

import { motion } from 'framer-motion';
import Link from 'next/link';

export default function RegisterRoleSelection() {
  return (
    <div className="min-h-screen flex flex-col items-center justify-center p-4 bg-background relative overflow-hidden">
      <div className="absolute top-[10%] left-[-10%] w-[500px] h-[500px] rounded-full bg-accent/20 blur-[120px]" />
      
      <motion.div
        initial={{ opacity: 0, y: -20 }}
        animate={{ opacity: 1, y: 0 }}
        className="text-center z-10 mb-12"
      >
        <h1 className="text-4xl md:text-5xl font-bold mb-4">Join INFLUX</h1>
        <p className="text-text-secondary text-lg">Choose your journey and start collaborating.</p>
      </motion.div>

      <div className="grid md:grid-cols-2 gap-8 w-full max-w-4xl z-10">
        <Link href="/auth/register/influencer">
          <motion.div
            whileHover={{ scale: 1.02 }}
            whileTap={{ scale: 0.98 }}
            className="glassmorphism p-10 flex flex-col items-center justify-center rounded-3xl h-[300px] hover:border-primary cursor-pointer transition-all group"
          >
            <span className="text-6xl mb-6">🎯</span>
            <h2 className="text-2xl font-bold mb-2 group-hover:text-primary transition-colors">I am an Influencer</h2>
            <p className="text-text-secondary text-center">I want to apply to campaigns and monetize my audience.</p>
          </motion.div>
        </Link>
        
        <Link href="/auth/register/brand">
          <motion.div
            whileHover={{ scale: 1.02 }}
            whileTap={{ scale: 0.98 }}
            className="glassmorphism p-10 flex flex-col items-center justify-center rounded-3xl h-[300px] hover:border-accent cursor-pointer transition-all group"
          >
            <span className="text-6xl mb-6">🏢</span>
            <h2 className="text-2xl font-bold mb-2 group-hover:text-accent transition-colors">I am a Brand</h2>
            <p className="text-text-secondary text-center">I want to hire creators and post campaign openings.</p>
          </motion.div>
        </Link>
      </div>
      
      <p className="mt-12 text-center text-sm text-text-secondary z-10">
        Already have an account? <Link href="/auth/login" className="text-white hover:text-primary transition-colors">Sign In</Link>
      </p>
    </div>
  );
}
