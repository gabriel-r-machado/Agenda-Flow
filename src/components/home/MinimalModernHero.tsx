'use client';

import { motion, useScroll, useTransform } from 'framer-motion';
import React, { useRef } from 'react';

interface MinimalModernHeroProps {
  logo: React.ReactNode;
  badge?: string;
  title: string;
  subtitle?: string;
  description: string;
  primaryButton?: {
    label: string;
    onClick: () => void;
  };
  secondaryButton?: {
    label: string;
    onClick: () => void;
  };
  stats?: Array<{
    value: string;
    label: string;
  }>;
  accentColor?: string;
  className?: string;
  customTitle?: React.ReactNode;
}

export default function MinimalModernHero({
  logo,
  badge,
  title,
  subtitle,
  description,
  primaryButton,
  secondaryButton,
  stats = [],
  accentColor = 'var(--primary)',
  className = '',
  customTitle,
}: MinimalModernHeroProps) {
  const heroRef = useRef<HTMLElement>(null);
  const { scrollYProgress } = useScroll({
    target: heroRef,
    offset: ["start start", "end start"]
  });

  // Parallax effects for hero mockup
  const heroMockupY = useTransform(scrollYProgress, [0, 1], [0, 200]);
  const heroMockupRotate = useTransform(scrollYProgress, [0, 1], [10, 25]);
  const heroMockupScale = useTransform(scrollYProgress, [0, 1], [1, 0.9]);

  return (
    <section
      id="hero"
      ref={heroRef}
      className={`relative min-h-screen w-full overflow-hidden ${className}`}
      style={{
        background: '#FFFFFF',
      }}
    >
      {/* Subtle Grid */}
      <div
        className="absolute inset-0"
        style={{
          backgroundImage: `
            linear-gradient(rgba(0, 0, 0, 0.03) 1px, transparent 1px),
            linear-gradient(90deg, rgba(0, 0, 0, 0.03) 1px, transparent 1px)
          `,
          backgroundSize: '100px 100px',
        }}
      />

      {/* Accent Line Top */}
      <motion.div
        className="absolute top-0 left-0 h-1"
        style={{
          background: `linear-gradient(90deg, ${accentColor}, transparent)`,
        }}
        initial={{ width: '0%' }}
        animate={{ width: '50%' }}
        transition={{ duration: 1.5, ease: 'easeOut' }}
      />

      {/* Floating Accent Circle */}
      <motion.div
        className="absolute rounded-full"
        style={{
          top: '20%',
          right: '10%',
          width: '400px',
          height: '400px',
          border: `2px solid ${accentColor}20`,
        }}
        animate={{
          scale: [1, 1.1, 1],
          rotate: [0, 90, 0],
        }}
        transition={{
          duration: 20,
          repeat: Infinity,
          ease: 'linear',
        }}
      />

      {/* Small Accent Dot */}
      <motion.div
        className="absolute rounded-full"
        style={{
          bottom: '30%',
          right: '15%',
          width: '80px',
          height: '80px',
          background: accentColor,
          opacity: 0.2,
        }}
        animate={{
          y: [0, -30, 0],
          scale: [1, 1.2, 1],
        }}
        transition={{
          duration: 8,
          repeat: Infinity,
        }}
      />

      {/* Content Container */}
      <div className="relative z-10 min-h-screen flex items-center px-6 py-20">
        <div className="max-w-7xl mx-auto w-full">
          {/* Logo */}
          <motion.div
            initial={{ opacity: 0, y: -20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.6 }}
            className="mb-16"
          >
            {logo}
          </motion.div>

          <div className="max-w-4xl">
            {/* Badge */}
            {badge && (
              <motion.div
                initial={{ opacity: 0, x: -20 }}
                animate={{ opacity: 1, x: 0 }}
                transition={{ duration: 0.6, delay: 0.2 }}
                className="inline-flex items-center gap-2 mb-8 px-4 py-2 rounded-full"
                style={{
                  background: `${accentColor}15`,
                  border: `1px solid ${accentColor}40`,
                }}
              >
                <motion.div
                  className="w-2 h-2 rounded-full"
                  style={{
                    background: accentColor,
                  }}
                  animate={{
                    scale: [1, 1.3, 1],
                  }}
                  transition={{
                    duration: 2,
                    repeat: Infinity,
                  }}
                />
                <span
                  className="text-sm font-bold uppercase tracking-wider"
                  style={{
                    color: '#000000',
                    fontFamily: 'Inter, sans-serif',
                  }}
                >
                  {badge}
                </span>
              </motion.div>
            )}

            {/* Title */}
            <motion.h1
              initial={{ opacity: 0, y: 30 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.8, delay: 0.3 }}
              className="text-4xl sm:text-5xl md:text-7xl lg:text-8xl font-black leading-tight mb-6"
              style={{
                fontFamily: 'Inter, sans-serif',
                color: '#000000',
                letterSpacing: '-0.04em',
              }}
            >
              {customTitle ? (
                customTitle
              ) : (
                title.split(' ').map((word, index) => (
                  <React.Fragment key={index}>
                    {index === Math.floor(title.split(' ').length / 2) ? (
                      <span style={{ color: accentColor }}>{word} </span>
                    ) : (
                      <span>{word} </span>
                    )}
                  </React.Fragment>
                ))
              )}
            </motion.h1>

            {/* Subtitle */}
            {subtitle && (
              <motion.h2
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ duration: 0.6, delay: 0.5 }}
                className="text-2xl md:text-3xl font-semibold mb-6"
                style={{
                  fontFamily: 'Inter, sans-serif',
                  color: '#666666',
                }}
              >
                {subtitle}
              </motion.h2>
            )}

            {/* Description */}
            <motion.p
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.6, delay: 0.7 }}
              className="text-base sm:text-lg md:text-2xl mb-12"
              style={{
                fontFamily: 'Inter, sans-serif',
                color: '#555555',
                lineHeight: '1.6',
                maxWidth: '700px',
              }}
            >
              {description}
            </motion.p>

            {/* Buttons */}
            <motion.div
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.6, delay: 0.9 }}
              className="flex flex-col sm:flex-row items-start gap-4 mb-16"
            >
              {primaryButton && (
                <motion.button
                  whileHover={{
                    scale: 1.05,
                    boxShadow: `0 20px 50px ${accentColor}40`,
                  }}
                  whileTap={{ scale: 0.95 }}
                  onClick={primaryButton.onClick}
                  className="px-8 py-3 sm:px-10 sm:py-5 rounded-2xl font-bold text-base sm:text-lg bg-gradient-to-r from-green-500 to-green-600"
                  style={{
                    color: '#FFFFFF',
                    fontFamily: 'Inter, sans-serif',
                  }}
                >
                  {primaryButton.label}
                </motion.button>
              )}

              {secondaryButton && (
                <motion.button
                  whileHover={{
                    scale: 1.05,
                    background: '#F5F5F5',
                  }}
                  whileTap={{ scale: 0.95 }}
                  onClick={secondaryButton.onClick}
                  className="px-8 py-3 sm:px-10 sm:py-5 rounded-2xl font-bold text-base sm:text-lg"
                  style={{
                    background: 'transparent',
                    color: '#000000',
                    fontFamily: 'Inter, sans-serif',
                    border: '2px solid #E0E0E0',
                  }}
                >
                  {secondaryButton.label}
                </motion.button>
              )}
            </motion.div>

            {/* Stats */}
            {stats.length > 0 && (
              <motion.div
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ duration: 0.6, delay: 1.1 }}
                className="grid grid-cols-2 md:grid-cols-4 gap-8"
              >
                {stats.map((stat, index) => (
                  <motion.div key={index} whileHover={{ y: -5 }} className="relative">
                    <div className="absolute top-0 left-0 w-8 h-1 mb-2" style={{ background: accentColor }} />
                    <div className="pt-4">
                      <div className="text-4xl md:text-5xl font-black mb-2" style={{ fontFamily: 'Inter, sans-serif', color: '#000000' }}>
                        {stat.value}
                      </div>
                      <div className="text-sm font-semibold uppercase tracking-wide" style={{ fontFamily: 'Inter, sans-serif', color: '#888888' }}>
                        {stat.label}
                      </div>
                    </div>
                  </motion.div>
                ))}
              </motion.div>
            )}
          </div>
        </div>
      </div>

      {/* Right-side mockup image (tilted and large, visible only on lg+) with scroll effects */}
      <motion.div
        className="hidden lg:block absolute top-[30%] z-0 pointer-events-none -translate-y-1/2 transform lg:right-[-500px] xl:right-[-260px]"
        style={{
          y: heroMockupY,
          rotate: heroMockupRotate,
          scale: heroMockupScale,
        }}
      >
        <motion.div
          className="overflow-hidden rounded-3xl shadow-2xl bg-white w-[480px] lg:w-[720px] xl:w-[920px] h-[320px] lg:h-[480px] xl:h-[620px]"
          whileHover={{ scale: 1.02, transition: { duration: 0.3 } }}
        >
          <img
            src="/assets/hero-section.png"
            alt="Dashboard mockup"
            className="w-full h-full object-cover block"
          />
        </motion.div>
      </motion.div>

      {/* Decorative Elements */}
      <motion.div
        className="absolute"
        style={{
          bottom: '10%',
          right: '5%',
          width: '200px',
          height: '200px',
          border: `1px solid ${accentColor}30`,
          transform: 'rotate(45deg)',
        }}
        animate={{
          rotate: [45, 135, 45],
        }}
        transition={{
          duration: 15,
          repeat: Infinity,
        }}
      />

      {/* Bottom Accent Line */}
      <motion.div
        className="absolute bottom-0 right-0 h-1"
        style={{
          background: `linear-gradient(270deg, ${accentColor}, transparent)`,
        }}
        initial={{ width: '0%' }}
        animate={{ width: '40%' }}
        transition={{ duration: 1.5, delay: 0.5, ease: 'easeOut' }}
      />
    </section>
  );
}

