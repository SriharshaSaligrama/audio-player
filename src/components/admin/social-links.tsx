"use client";

import { MouseEvent } from 'react';

type SocialLinksProps = {
    socialLinks: {
        spotify?: string;
        twitter?: string;
        instagram?: string;
    };
}

export function SocialLinks({ socialLinks }: SocialLinksProps) {
    const handleSocialClick = (e: MouseEvent, url: string) => {
        e.preventDefault();
        e.stopPropagation();
        window.open(url, '_blank', 'noopener,noreferrer');
    };

    const hasAnyLinks = socialLinks && (socialLinks.spotify || socialLinks.twitter || socialLinks.instagram);

    return (
        <div className="mx-6 mb-4 bg-gradient-to-r from-gray-50 to-gray-100 dark:from-gray-700/30 dark:to-gray-800/30 rounded-2xl p-4 border border-gray-200/50 dark:border-gray-600/50">
            {hasAnyLinks ? (
                <div className="flex items-center justify-center gap-4">
                    {socialLinks.spotify && (
                        <button
                            onClick={(e) => handleSocialClick(e, socialLinks.spotify!)}
                            className="group/social relative p-3 rounded-xl bg-gradient-to-r from-emerald-500 to-green-500 text-white hover:from-emerald-600 hover:to-green-600 transition-all duration-300 hover:scale-110 hover:shadow-lg hover:shadow-emerald-500/25 transform"
                            title="Open Spotify Profile"
                            type="button"
                        >
                            {/* Spotify Icon */}
                            <svg className="h-5 w-5" viewBox="0 0 24 24" fill="currentColor">
                                <path d="M12 0C5.4 0 0 5.4 0 12s5.4 12 12 12 12-5.4 12-12S18.66 0 12 0zm5.521 17.34c-.24.359-.66.48-1.021.24-2.82-1.74-6.36-2.101-10.561-1.141-.418.122-.779-.179-.899-.539-.12-.421.18-.78.54-.9 4.56-1.021 8.52-.6 11.64 1.32.42.18.479.659.301 1.02zm1.44-3.3c-.301.42-.841.6-1.262.3-3.239-1.98-8.159-2.58-11.939-1.38-.479.12-1.02-.12-1.14-.6-.12-.48.12-1.021.6-1.141C9.6 9.9 15 10.561 18.72 12.84c.361.181.54.78.241 1.2zm.12-3.36C15.24 8.4 8.82 8.16 5.16 9.301c-.6.179-1.2-.181-1.38-.721-.18-.601.18-1.2.72-1.381 4.26-1.26 11.28-1.02 15.721 1.621.539.3.719 1.02.42 1.56-.299.421-1.02.599-1.559.3z" />
                            </svg>
                            {/* Glow effect */}
                            <div className="absolute inset-0 rounded-xl bg-emerald-400 opacity-0 group-hover/social:opacity-20 blur-lg transition-opacity duration-300" />
                        </button>
                    )}
                    {socialLinks.twitter && (
                        <button
                            onClick={(e) => handleSocialClick(e, socialLinks.twitter!)}
                            className="group/social relative p-3 rounded-xl bg-gradient-to-r from-blue-500 to-cyan-500 text-white hover:from-blue-600 hover:to-cyan-600 transition-all duration-300 hover:scale-110 hover:shadow-lg hover:shadow-blue-500/25 transform"
                            title="Open Twitter/X Profile"
                            type="button"
                        >
                            {/* Twitter/X Icon */}
                            <svg className="h-5 w-5" viewBox="0 0 24 24" fill="currentColor">
                                <path d="M18.244 2.25h3.308l-7.227 8.26 8.502 11.24H16.17l-5.214-6.817L4.99 21.75H1.68l7.73-8.835L1.254 2.25H8.08l4.713 6.231zm-1.161 17.52h1.833L7.084 4.126H5.117z" />
                            </svg>
                            {/* Glow effect */}
                            <div className="absolute inset-0 rounded-xl bg-blue-400 opacity-0 group-hover/social:opacity-20 blur-lg transition-opacity duration-300" />
                        </button>
                    )}
                    {socialLinks.instagram && (
                        <button
                            onClick={(e) => handleSocialClick(e, socialLinks.instagram!)}
                            className="group/social relative p-3 rounded-xl bg-gradient-to-r from-pink-500 to-purple-500 text-white hover:from-pink-600 hover:to-purple-600 transition-all duration-300 hover:scale-110 hover:shadow-lg hover:shadow-pink-500/25 transform"
                            title="Open Instagram Profile"
                            type="button"
                        >
                            {/* Instagram Icon */}
                            <svg className="h-5 w-5" viewBox="0 0 24 24" fill="currentColor">
                                <path d="M12 2.163c3.204 0 3.584.012 4.85.07 3.252.148 4.771 1.691 4.919 4.919.058 1.265.069 1.645.069 4.849 0 3.205-.012 3.584-.069 4.849-.149 3.225-1.664 4.771-4.919 4.919-1.266.058-1.644.07-4.85.07-3.204 0-3.584-.012-4.849-.07-3.26-.149-4.771-1.699-4.919-4.92-.058-1.265-.07-1.644-.07-4.849 0-3.204.013-3.583.07-4.849.149-3.227 1.664-4.771 4.919-4.919 1.266-.057 1.645-.069 4.849-.069zm0-2.163c-3.259 0-3.667.014-4.947.072-4.358.2-6.78 2.618-6.98 6.98-.059 1.281-.073 1.689-.073 4.948 0 3.259.014 3.668.072 4.948.2 4.358 2.618 6.78 6.98 6.98 1.281.058 1.689.072 4.948.072 3.259 0 3.668-.014 4.948-.072 4.354-.2 6.782-2.618 6.979-6.98.059-1.28.073-1.689.073-4.948 0-3.259-.014-3.667-.072-4.947-.196-4.354-2.617-6.78-6.979-6.98-1.281-.059-1.69-.073-4.949-.073zm0 5.838c-3.403 0-6.162 2.759-6.162 6.162s2.759 6.163 6.162 6.163 6.162-2.759 6.162-6.163c0-3.403-2.759-6.162-6.162-6.162zm0 10.162c-2.209 0-4-1.79-4-4 0-2.209 1.791-4 4-4s4 1.791 4 4c0 2.21-1.791 4-4 4zm6.406-11.845c-.796 0-1.441.645-1.441 1.44s.645 1.44 1.441 1.44c.795 0 1.439-.645 1.439-1.40s-.644-1.44-1.439-1.44z" />
                            </svg>
                            {/* Glow effect */}
                            <div className="absolute inset-0 rounded-xl bg-pink-400 opacity-0 group-hover/social:opacity-20 blur-lg transition-opacity duration-300" />
                        </button>
                    )}
                </div>
            ) : (
                <div className="flex items-center justify-center py-3">
                    <div className="flex items-center gap-3 text-gray-400 dark:text-gray-500">
                        <div className="w-8 h-8 bg-gray-200 dark:bg-gray-600 rounded-full flex items-center justify-center">
                            <svg className="h-4 w-4" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                                <path d="M10 13a5 5 0 0 0 7.54.54l3-3a5 5 0 0 0-7.07-7.07l-1.72 1.71" />
                                <path d="M14 11a5 5 0 0 0-7.54-.54l-3 3a5 5 0 0 0 7.07 7.07l1.71-1.71" />
                            </svg>
                        </div>
                        <span className="text-sm font-semibold">No social links available</span>
                    </div>
                </div>
            )}
        </div>
    );
}