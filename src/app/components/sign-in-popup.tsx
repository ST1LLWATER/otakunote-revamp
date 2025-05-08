'use client';

import { useState } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { X, Sparkles, ArrowRight, Check, LogIn } from 'lucide-react';
import { Button } from '@/components/ui/button';
import Image from 'next/image';

interface SignInPopupProps {
  isOpen: boolean;
  onClose: () => void;
  onSignIn: () => void;
  onContinueWithout: () => void;
}

export function SignInPopup({ isOpen, onClose }: SignInPopupProps) {
  return (
    <AnimatePresence>
      {isOpen && (
        <>
          {/* Backdrop */}
          <motion.div
            className="fixed inset-0 bg-black/60 backdrop-blur-sm z-50"
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            onClick={onClose}
          />

          {/* Modal */}
          <motion.div
            className="fixed w-screen h-screen flex items-center justify-center z-50"
            initial={{ scale: 0.9, opacity: 0 }}
            animate={{ scale: 1, opacity: 1 }}
            exit={{ scale: 0.9, opacity: 0 }}
            transition={{ type: 'spring', damping: 20, stiffness: 300 }}
          >
            <div className="bg-gradient-to-br from-[#1A1A2E] to-[#0F0F1A] rounded-xl overflow-hidden border border-indigo-500/30 shadow-xl">
              {/* Decorative elements */}
              <div className="absolute top-0 right-0 w-40 h-40 bg-indigo-500/10 rounded-full blur-3xl -z-10" />
              <div className="absolute bottom-0 left-0 w-40 h-40 bg-purple-500/10 rounded-full blur-3xl -z-10" />

              {/* Content */}
              <div className="p-6 max-w-md relative">
                {/* Close button */}
                <button
                  type="button"
                  onClick={onClose}
                  className="absolute top-2 right-2 text-gray-400 hover:text-white transition-colors"
                >
                  <X className="h-5 w-5" />
                </button>

                <div className="flex justify-center mb-4">
                  <div className="h-12 w-12 rounded-full bg-gradient-to-r from-indigo-500 to-purple-500 flex items-center justify-center">
                    <Sparkles className="h-6 w-6 text-white" />
                  </div>
                </div>

                <h3 className="text-2xl font-bold text-center mb-2">
                  No Sign-In Needed!
                </h3>

                <p className="text-gray-300 text-center mb-6">
                  Why bother with accounts when you can enjoy all features right
                  away? We've saved you from the hassle!
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
                    ].map((feature, i) => (
                      <motion.li
                        key={i}
                        className="flex items-center text-sm text-gray-300"
                        initial={{ opacity: 0, x: -10 }}
                        animate={{ opacity: 1, x: 0 }}
                        transition={{ delay: 0.1 * i }}
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
            </div>
          </motion.div>
        </>
      )}
    </AnimatePresence>
  );
}
