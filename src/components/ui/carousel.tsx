"use client"

import { useState, useRef, useEffect, ReactNode } from 'react';
import { ChevronLeft, ChevronRight } from 'lucide-react';

type CarouselProps = {
    children: ReactNode;
    itemWidth: number;
    gap?: number;
    showArrows?: boolean;
    className?: string;
}

export function Carousel({
    children,
    itemWidth,
    gap = 24,
    showArrows = true,
    className = ""
}: CarouselProps) {
    const [canScrollLeft, setCanScrollLeft] = useState(false);
    const [canScrollRight, setCanScrollRight] = useState(true);
    const scrollContainerRef = useRef<HTMLDivElement>(null);

    const checkScrollability = () => {
        const container = scrollContainerRef.current;
        if (!container) return;

        const { scrollLeft, scrollWidth, clientWidth } = container;
        setCanScrollLeft(scrollLeft > 0);
        setCanScrollRight(scrollLeft < scrollWidth - clientWidth - 1);
    };

    useEffect(() => {
        checkScrollability();
        const container = scrollContainerRef.current;
        if (container) {
            container.addEventListener('scroll', checkScrollability);
            return () => container.removeEventListener('scroll', checkScrollability);
        }
    }, [children]);

    const scroll = (direction: 'left' | 'right') => {
        const container = scrollContainerRef.current;
        if (!container) return;

        const scrollAmount = itemWidth + gap;
        const targetScroll = direction === 'left'
            ? container.scrollLeft - scrollAmount * 2
            : container.scrollLeft + scrollAmount * 2;

        container.scrollTo({
            left: targetScroll,
            behavior: 'smooth'
        });
    };

    return (
        <div className={`relative carousel-wrapper ${className}`}>
            {/* Left Arrow */}
            {showArrows && canScrollLeft && (
                <button
                    onClick={() => scroll('left')}
                    className="absolute left-0 top-1/2 z-10 w-12 h-12 bg-white dark:bg-gray-800 hover:bg-gray-50 dark:hover:bg-gray-700 rounded-full shadow-lg border border-gray-200 dark:border-gray-600 flex items-center justify-center carousel-nav-button transition-all duration-300 hover:scale-110 -translate-x-6 hover:-translate-x-6"
                    aria-label="Scroll left"
                >
                    <ChevronLeft className="h-5 w-5 text-gray-700 dark:text-gray-300" />
                </button>
            )}

            {/* Right Arrow */}
            {showArrows && canScrollRight && (
                <button
                    onClick={() => scroll('right')}
                    className="absolute right-0 top-1/2 z-10 w-12 h-12 bg-white dark:bg-gray-800 hover:bg-gray-50 dark:hover:bg-gray-700 rounded-full shadow-lg border border-gray-200 dark:border-gray-600 flex items-center justify-center carousel-nav-button transition-all duration-300 hover:scale-110 translate-x-6 hover:translate-x-6"
                    aria-label="Scroll right"
                >
                    <ChevronRight className="h-5 w-5 text-gray-700 dark:text-gray-300" />
                </button>
            )}

            {/* Scrollable Container */}
            <div
                ref={scrollContainerRef}
                className="flex overflow-x-auto scrollbar-hide scroll-smooth"
                style={{
                    gap: `${gap}px`,
                    scrollbarWidth: 'none',
                    msOverflowStyle: 'none'
                }}
            >
                {children}
            </div>
        </div>
    );
}