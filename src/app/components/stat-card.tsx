'use client';

import { motion } from 'framer-motion';
import React from 'react';

interface StatCardProps {
  value: string;
  label: string;
  icon: React.ReactNode;
  color: string;
}

export default function StatCard({ value, label, icon, color }: StatCardProps) {
  return (
    <motion.div
      className="bg-white/5 backdrop-blur-sm rounded-xl p-6 text-center"
      initial={{ y: 50, opacity: 0 }}
      whileInView={{ y: 0, opacity: 1 }}
      viewport={{ once: true, margin: '-100px' }}
      transition={{ duration: 0.8 }}
      whileHover={{ y: -5, transition: { duration: 0.2 } }}
    >
      <motion.div
        className={`w-12 h-12 mx-auto mb-4 rounded-full bg-gradient-to-r ${color} flex items-center justify-center`}
        animate={{ scale: [1, 1.05, 1] }}
        transition={{ duration: 3, repeat: Number.POSITIVE_INFINITY }}
      >
        {React.cloneElement(icon as React.ReactElement, {
          className: 'h-6 w-6',
        })}
      </motion.div>
      <div
        className={`text-4xl font-bold bg-clip-text text-transparent bg-gradient-to-r ${color} mb-2`}
      >
        {value}
      </div>
      <p className="text-gray-400">{label}</p>
    </motion.div>
  );
}
