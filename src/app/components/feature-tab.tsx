'use client';

import { motion } from 'framer-motion';
import type React from 'react';

interface FeatureTabProps {
  feature: {
    title: string;
    description: string;
    icon: React.ReactNode;
    color: string;
  };
  isActive: boolean;
  onClick: () => void;
}

export default function FeatureTab({
  feature,
  isActive,
  onClick,
}: FeatureTabProps) {
  return (
    <motion.div
      className={`p-6 rounded-xl cursor-pointer transition-all duration-300 ${
        isActive
          ? `bg-gradient-to-r ${feature.color} shadow-lg`
          : 'bg-white/5 hover:bg-white/10'
      }`}
      onClick={onClick}
      whileHover={{ x: isActive ? 0 : 5 }}
    >
      <div className="flex items-start gap-4">
        <div
          className={`p-3 rounded-lg ${
            isActive ? 'bg-white/20' : `bg-gradient-to-r ${feature.color}`
          }`}
        >
          {feature.icon}
        </div>
        <div>
          <h3 className="text-xl font-bold mb-2">{feature.title}</h3>
          <p className={`${isActive ? 'text-white' : 'text-gray-400'}`}>
            {feature.description}
          </p>
        </div>
      </div>
    </motion.div>
  );
}
