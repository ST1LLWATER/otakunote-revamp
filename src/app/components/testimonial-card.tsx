'use client';

import { motion } from 'framer-motion';
import { Star } from 'lucide-react';

interface TestimonialCardProps {
  quote: string;
  author: string;
  role: string;
  rating: number;
}

export default function TestimonialCard({
  quote,
  author,
  role,
  rating,
}: TestimonialCardProps) {
  return (
    <motion.div
      className="bg-white/5 backdrop-blur-sm rounded-xl p-6 border border-indigo-500/10"
      initial={{ y: 30, opacity: 0 }}
      whileInView={{ y: 0, opacity: 1 }}
      viewport={{ once: true, margin: '-100px' }}
      transition={{ duration: 0.8 }}
      whileHover={{ y: -5, transition: { duration: 0.2 } }}
    >
      <div className="flex mb-4">
        {Array.from({ length: 5 }).map((_, i) => (
          <Star
            key={i}
            className={`h-4 w-4 ${
              i < rating ? 'text-yellow-400 fill-yellow-400' : 'text-gray-600'
            }`}
          />
        ))}
      </div>

      <p className="text-gray-300 mb-6 italic">"{quote}"</p>

      <div className="flex items-center">
        <div className="w-10 h-10 rounded-full bg-gradient-to-r from-indigo-500/30 to-purple-500/30 mr-3 flex-shrink-0"></div>
        <div>
          <div className="font-medium">{author}</div>
          <div className="text-sm text-gray-400">{role}</div>
        </div>
      </div>
    </motion.div>
  );
}
