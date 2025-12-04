'use client';

import { useState, useEffect, useCallback } from 'react';
import { motion, AnimatePresence } from 'framer-motion';

export interface SliderImage {
  id: string;
  url: string;
  title?: string;
  description?: string;
  order: number;
}

export interface ImageSliderProps {
  images: SliderImage[];
  autoPlay?: boolean;
  interval?: number;
  showIndicators?: boolean;
  showNavigation?: boolean;
  overlayGradient?: boolean;
  tenantName?: string;
  tenantLogo?: string;
}

// Default slider images when no tenant customization
export const DEFAULT_SLIDER_IMAGES: SliderImage[] = [
  {
    id: 'default-1',
    url: 'https://images.unsplash.com/photo-1551434678-e076c223a692?w=1920&q=80',
    title: 'Enterprise Security',
    description: 'Protect your organization with world-class identity management',
    order: 0,
  },
  {
    id: 'default-2',
    url: 'https://images.unsplash.com/photo-1460925895917-afdab827c52f?w=1920&q=80',
    title: 'Seamless Integration',
    description: 'Connect all your applications with single sign-on',
    order: 1,
  },
  {
    id: 'default-3',
    url: 'https://images.unsplash.com/photo-1504384308090-c894fdcc538d?w=1920&q=80',
    title: 'Global Access',
    description: 'Secure authentication from anywhere in the world',
    order: 2,
  },
];

export default function ImageSlider({
  images = DEFAULT_SLIDER_IMAGES,
  autoPlay = true,
  interval = 5000,
  showIndicators = true,
  showNavigation = true,
  overlayGradient = true,
  tenantName,
  tenantLogo,
}: ImageSliderProps) {
  const [currentIndex, setCurrentIndex] = useState(0);
  const [isHovered, setIsHovered] = useState(false);

  const sortedImages = [...images].sort((a, b) => a.order - b.order);
  const displayImages = sortedImages.length > 0 ? sortedImages : DEFAULT_SLIDER_IMAGES;

  const nextSlide = useCallback(() => {
    setCurrentIndex((prev) => (prev + 1) % displayImages.length);
  }, [displayImages.length]);

  const prevSlide = useCallback(() => {
    setCurrentIndex((prev) => (prev - 1 + displayImages.length) % displayImages.length);
  }, [displayImages.length]);

  const goToSlide = (index: number) => {
    setCurrentIndex(index);
  };

  // Auto-play functionality
  useEffect(() => {
    if (!autoPlay || isHovered || displayImages.length <= 1) return;

    const timer = setInterval(nextSlide, interval);
    return () => clearInterval(timer);
  }, [autoPlay, interval, isHovered, nextSlide, displayImages.length]);

  // Animation variants
  const slideVariants = {
    enter: (direction: number) => ({
      x: direction > 0 ? '100%' : '-100%',
      opacity: 0,
      scale: 1.1,
    }),
    center: {
      x: 0,
      opacity: 1,
      scale: 1,
      transition: {
        duration: 0.8,
        ease: [0.25, 0.46, 0.45, 0.94],
      },
    },
    exit: (direction: number) => ({
      x: direction < 0 ? '100%' : '-100%',
      opacity: 0,
      scale: 0.95,
      transition: {
        duration: 0.6,
        ease: [0.25, 0.46, 0.45, 0.94],
      },
    }),
  };

  const textVariants = {
    hidden: { opacity: 0, y: 30 },
    visible: {
      opacity: 1,
      y: 0,
      transition: {
        duration: 0.6,
        delay: 0.3,
        ease: 'easeOut',
      },
    },
  };

  return (
    <div
      className="relative w-full h-full overflow-hidden bg-gradient-to-br from-slate-900 to-slate-800"
      onMouseEnter={() => setIsHovered(true)}
      onMouseLeave={() => setIsHovered(false)}
    >
      {/* Background Images */}
      <AnimatePresence initial={false} mode="wait">
        <motion.div
          key={currentIndex}
          custom={1}
          variants={slideVariants}
          initial="enter"
          animate="center"
          exit="exit"
          className="absolute inset-0"
        >
          <div
            className="absolute inset-0 bg-cover bg-center"
            style={{
              backgroundImage: `url(${displayImages[currentIndex]?.url})`,
            }}
          />
          {/* Dark Overlay */}
          <div className="absolute inset-0 bg-black/40" />
          {/* Gradient Overlay */}
          {overlayGradient && (
            <div className="absolute inset-0 bg-gradient-to-t from-black/80 via-black/20 to-transparent" />
          )}
        </motion.div>
      </AnimatePresence>

      {/* Content Overlay */}
      <div className="relative z-10 h-full flex flex-col justify-between p-8 lg:p-12">
        {/* Top Section - Logo & Branding */}
        <div className="flex items-center gap-4">
          {tenantLogo ? (
            <img
              src={tenantLogo}
              alt={tenantName || 'Logo'}
              className="h-10 lg:h-12 object-contain filter brightness-0 invert"
            />
          ) : (
            <div className="flex items-center gap-3">
              <div className="w-10 h-10 lg:w-12 lg:h-12 rounded-xl bg-white/20 backdrop-blur-sm flex items-center justify-center">
                <svg className="w-6 h-6 lg:w-7 lg:h-7 text-white" viewBox="0 0 24 24" fill="currentColor">
                  <path d="M12 2L2 7l10 5 10-5-10-5zM2 17l10 5 10-5M2 12l10 5 10-5" />
                </svg>
              </div>
              <span className="text-white text-xl lg:text-2xl font-bold tracking-tight">
                {tenantName || 'OneSign'}
              </span>
            </div>
          )}
        </div>

        {/* Middle Section - Slide Content */}
        <AnimatePresence mode="wait">
          <motion.div
            key={currentIndex}
            variants={textVariants}
            initial="hidden"
            animate="visible"
            exit="hidden"
            className="max-w-lg"
          >
            {displayImages[currentIndex]?.title && (
              <h2 className="text-3xl lg:text-5xl font-bold text-white mb-4 leading-tight">
                {displayImages[currentIndex].title}
              </h2>
            )}
            {displayImages[currentIndex]?.description && (
              <p className="text-lg lg:text-xl text-white/80 leading-relaxed">
                {displayImages[currentIndex].description}
              </p>
            )}
          </motion.div>
        </AnimatePresence>

        {/* Bottom Section - Indicators & Navigation */}
        <div className="flex items-center justify-between">
          {/* Slide Indicators */}
          {showIndicators && displayImages.length > 1 && (
            <div className="flex items-center gap-3">
              {displayImages.map((_, index) => (
                <button
                  key={index}
                  onClick={() => goToSlide(index)}
                  className={`transition-all duration-300 rounded-full ${
                    index === currentIndex
                      ? 'w-8 h-2 bg-white'
                      : 'w-2 h-2 bg-white/40 hover:bg-white/60'
                  }`}
                  aria-label={`Go to slide ${index + 1}`}
                />
              ))}
            </div>
          )}

          {/* Navigation Arrows */}
          {showNavigation && displayImages.length > 1 && (
            <div className="flex items-center gap-2">
              <button
                onClick={prevSlide}
                className="w-10 h-10 lg:w-12 lg:h-12 rounded-full bg-white/10 backdrop-blur-sm border border-white/20 flex items-center justify-center text-white hover:bg-white/20 transition-all duration-300 group"
                aria-label="Previous slide"
              >
                <svg
                  className="w-5 h-5 lg:w-6 lg:h-6 transform group-hover:-translate-x-0.5 transition-transform"
                  fill="none"
                  stroke="currentColor"
                  viewBox="0 0 24 24"
                >
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 19l-7-7 7-7" />
                </svg>
              </button>
              <button
                onClick={nextSlide}
                className="w-10 h-10 lg:w-12 lg:h-12 rounded-full bg-white/10 backdrop-blur-sm border border-white/20 flex items-center justify-center text-white hover:bg-white/20 transition-all duration-300 group"
                aria-label="Next slide"
              >
                <svg
                  className="w-5 h-5 lg:w-6 lg:h-6 transform group-hover:translate-x-0.5 transition-transform"
                  fill="none"
                  stroke="currentColor"
                  viewBox="0 0 24 24"
                >
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 5l7 7-7 7" />
                </svg>
              </button>
            </div>
          )}
        </div>
      </div>

      {/* Animated Background Particles */}
      <div className="absolute inset-0 overflow-hidden pointer-events-none">
        {[...Array(6)].map((_, i) => (
          <motion.div
            key={i}
            className="absolute w-2 h-2 bg-white/10 rounded-full"
            animate={{
              x: [0, Math.random() * 100 - 50],
              y: [0, Math.random() * 100 - 50],
              scale: [1, 1.5, 1],
              opacity: [0.3, 0.6, 0.3],
            }}
            transition={{
              duration: 4 + Math.random() * 2,
              repeat: Infinity,
              repeatType: 'reverse',
              ease: 'easeInOut',
              delay: i * 0.5,
            }}
            style={{
              left: `${10 + Math.random() * 80}%`,
              top: `${10 + Math.random() * 80}%`,
            }}
          />
        ))}
      </div>
    </div>
  );
}
