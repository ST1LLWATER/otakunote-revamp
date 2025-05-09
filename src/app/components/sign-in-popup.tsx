'use client';

import { useState } from 'react';
import { motion } from 'framer-motion';
import { Sparkles, ArrowRight, Check } from 'lucide-react';
import { Button } from '@/components/ui/button';
import Image from 'next/image';
import { Dialog, DialogContent } from '@/components/ui/dialog';

interface SignInPopupProps {
  isOpen: boolean;
  onClose: () => void;
}

export function SignInPopup({ isOpen, onClose }: SignInPopupProps) {
  return (
    <Dialog open={isOpen} onOpenChange={onClose}>
      <DialogContent className="bg-gradient-to-br from-[#1A1A2E] to-[#0F0F1A] border-indigo-500/30 p-0 max-w-md">
        {/* Decorative elements */}
        <div className="absolute top-0 right-0 w-40 h-40 bg-indigo-500/10 rounded-full blur-3xl -z-10" />
        <div className="absolute bottom-0 left-0 w-40 h-40 bg-purple-500/10 rounded-full blur-3xl -z-10" />

        {/* Content */}
        <div className="p-6 relative">
          <div className="flex justify-center mb-4">
            <div className="h-12 w-12 rounded-full bg-gradient-to-r from-indigo-500 to-purple-500 flex items-center justify-center">
              <Sparkles className="h-6 w-6 text-white" />
            </div>
          </div>

          <h3 className="text-2xl font-bold text-center mb-2">
            No Sign-In Needed!
          </h3>

          <p className="text-gray-300 text-center mb-6">
            Why bother with accounts when you can enjoy all features right away?
            We've saved you from the hassle!
          </p>

          {/* Anime character */}
          <div className="relative h-40 mb-6">
            <Image
              src="/deku.png"
              alt="Anime character giving thumbs up"
              fill
              className="object-contain"
            />
          </div>

          {/* Features list */}
          <div className="bg-white/5 rounded-lg p-4 mb-6">
            <h4 className="font-medium text-indigo-300 mb-3">
              Enjoy without signing in:
            </h4>
            <ul className="space-y-2">
              {[
                'Track your favorite anime',
                'Manage your watchlist',
                'Get personalized recommendations',
                'Access all platform features',
              ].map((feature) => (
                <motion.li
                  key={feature}
                  className="flex items-center text-sm text-gray-300"
                  initial={{ opacity: 0, x: -10 }}
                  animate={{ opacity: 1, x: 0 }}
                  transition={{
                    delay:
                      0.1 *
                      [
                        'Track your favorite anime',
                        'Manage your watchlist',
                        'Get personalized recommendations',
                        'Access all platform features',
                      ].indexOf(feature),
                  }}
                >
                  <Check className="h-4 w-4 text-green-400 mr-2 flex-shrink-0" />
                  <span>{feature}</span>
                </motion.li>
              ))}
            </ul>
          </div>

          <div className="flex flex-col gap-3">
            <Button
              onClick={onClose}
              className="bg-gradient-to-r from-indigo-500 to-purple-500 border-none text-white hover:opacity-90"
            >
              Let's Go
              <ArrowRight className="ml-2 h-4 w-4" />
            </Button>
          </div>

          <p className="text-xs text-gray-400 text-center mt-4">
            OtakuNote: Making anime tracking seamless and hassle-free!
          </p>
        </div>
      </DialogContent>
    </Dialog>
  );
}
