"use client";

import { useState, useRef, useEffect } from 'react';
import { X, Plus, Music, Disc } from 'lucide-react';

type GenreTagInputProps = {
    name: string;
    value?: string[];
    onChange?: (genres: string[]) => void;
    placeholder?: string;
    required?: boolean;
    disabled?: boolean;
    readOnly?: boolean;
    className?: string;
    error?: string;
    label?: string;
    onClearError?: () => void;
    maxTags?: number;
};

const POPULAR_GENRES = [
    // Main genres
    'Rock', 'Pop', 'Hip-Hop', 'Electronic', 'Jazz', 'Classical', 'Country', 'R&B',
    'Folk', 'Blues', 'Reggae', 'Punk', 'Metal', 'Indie', 'Alternative',

    // Electronic subgenres
    'House', 'Techno', 'Trance', 'Dubstep', 'Drum & Bass', 'Ambient', 'Synthwave',
    'EDM', 'Electro', 'Breakbeat',

    // Rock subgenres
    'Hard Rock', 'Soft Rock', 'Progressive Rock', 'Psychedelic Rock', 'Garage Rock',
    'Post-Rock', 'Art Rock',

    // Hip-Hop subgenres
    'Rap', 'Trap', 'Boom Bap', 'Conscious Hip-Hop', 'Gangsta Rap',

    // Other popular genres
    'Soul', 'Funk', 'Disco', 'Gospel', 'World', 'Latin', 'Afrobeat', 'K-Pop',
    'Experimental', 'Noise', 'Shoegaze', 'Dream Pop', 'Lo-Fi', 'Chillout',
    'New Age', 'Soundtrack', 'Score', 'Musical Theatre'
];

export function GenreTagInput({
    name,
    value = [],
    onChange,
    placeholder = 'Type to add genres...',
    required = false,
    disabled = false,
    readOnly = false,
    className = '',
    error,
    label,
    onClearError,
    maxTags = 10
}: GenreTagInputProps) {
    const [selectedGenres, setSelectedGenres] = useState<string[]>(value);
    const [inputValue, setInputValue] = useState('');
    const [isOpen, setIsOpen] = useState(false);
    const [focusedIndex, setFocusedIndex] = useState(-1);

    const containerRef = useRef<HTMLDivElement>(null);
    const inputRef = useRef<HTMLInputElement>(null);

    // Filter genres based on input and exclude already selected ones
    const filteredGenres = POPULAR_GENRES.filter(genre =>
        genre.toLowerCase().includes(inputValue.toLowerCase()) &&
        !selectedGenres.includes(genre)
    )

    useEffect(() => {
        const handleClickOutside = (event: MouseEvent) => {
            if (containerRef.current && !containerRef.current.contains(event.target as Node)) {
                setIsOpen(false);
                setFocusedIndex(-1);
            }
        };

        document.addEventListener('mousedown', handleClickOutside);
        return () => document.removeEventListener('mousedown', handleClickOutside);
    }, []);

    useEffect(() => {
        setSelectedGenres(value);
    }, [value]);

    const addGenre = (genre: string) => {
        if (!genre.trim() || selectedGenres.includes(genre) || selectedGenres.length >= maxTags) return;

        const newGenres = [...selectedGenres, genre.trim()];
        setSelectedGenres(newGenres);
        onChange?.(newGenres);
        onClearError?.();
        setInputValue('');
        setIsOpen(false);
        setFocusedIndex(-1);
    };

    const removeGenre = (genreToRemove: string) => {
        if (readOnly || disabled) return;

        const newGenres = selectedGenres.filter(genre => genre !== genreToRemove);
        setSelectedGenres(newGenres);
        onChange?.(newGenres);
        onClearError?.();
    };

    const handleInputChange = (e: React.ChangeEvent<HTMLInputElement>) => {
        if (readOnly || disabled) return;

        const value = e.target.value;
        setInputValue(value);
        setIsOpen(value.length > 0);
        setFocusedIndex(-1);
        onClearError?.();
    };

    const handleInputKeyDown = (e: React.KeyboardEvent<HTMLInputElement>) => {
        if (readOnly || disabled) return;

        switch (e.key) {
            case 'Enter':
                e.preventDefault();
                if (focusedIndex >= 0 && filteredGenres[focusedIndex]) {
                    addGenre(filteredGenres[focusedIndex]);
                } else if (inputValue.trim()) {
                    addGenre(inputValue.trim());
                }
                break;

            case 'ArrowDown':
                e.preventDefault();
                setFocusedIndex(prev =>
                    prev < filteredGenres.length - 1 ? prev + 1 : prev
                );
                break;

            case 'ArrowUp':
                e.preventDefault();
                setFocusedIndex(prev => prev > 0 ? prev - 1 : -1);
                break;

            case 'Escape':
                setIsOpen(false);
                setFocusedIndex(-1);
                break;

            case 'Backspace':
                if (!inputValue && selectedGenres.length > 0) {
                    removeGenre(selectedGenres[selectedGenres.length - 1]);
                }
                break;

            case ',':
            case ';':
                e.preventDefault();
                if (inputValue.trim()) {
                    addGenre(inputValue.trim());
                }
                break;
        }
    };

    const handleInputFocus = () => {
        if (!readOnly && !disabled) {
            setIsOpen(inputValue.length > 0 || filteredGenres.length > 0);
            onClearError?.();
        }
    };

    return (
        <div className={className}>
            {label && (
                <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
                    {label} {required && '*'}
                    {maxTags && (
                        <span className="text-xs text-gray-500 dark:text-gray-400 font-normal ml-1">
                            ({selectedGenres.length}/{maxTags})
                        </span>
                    )}
                </label>
            )}

            <div ref={containerRef} className="relative">
                {/* Hidden inputs for form submission */}
                {selectedGenres.map((genre, index) => (
                    <input
                        key={`${name}-${index}`}
                        type="hidden"
                        name={name}
                        value={genre}
                    />
                ))}

                {/* Main input container */}
                <div
                    className={`relative w-full min-h-[48px] px-3 py-2 rounded-xl border transition-all duration-200 ${disabled || readOnly
                        ? 'border-gray-200 dark:border-gray-600 bg-gray-50 dark:bg-gray-700/50 cursor-not-allowed'
                        : error
                            ? 'border-red-300 dark:border-red-600 bg-white dark:bg-gray-700 focus-within:ring-2 focus-within:ring-red-500 focus-within:border-transparent'
                            : 'border-gray-300 dark:border-gray-600 bg-white dark:bg-gray-700 focus-within:ring-2 focus-within:ring-blue-500 focus-within:border-transparent hover:border-gray-400 dark:hover:border-gray-500'
                        } text-gray-900 dark:text-white`}
                >
                    <div className="flex flex-wrap items-center gap-1 min-h-[32px]">
                        {/* Selected genre tags */}
                        {selectedGenres.map((genre) => (
                            <div
                                key={genre}
                                className={`inline-flex items-center gap-1 px-2 py-1 rounded-lg text-sm font-medium transition-all duration-200 ${readOnly || disabled
                                    ? 'bg-gray-100 dark:bg-gray-600 text-gray-700 dark:text-gray-300'
                                    : 'bg-gradient-to-r from-blue-100 to-purple-100 dark:from-blue-900/50 dark:to-purple-900/50 text-blue-800 dark:text-blue-200 hover:from-blue-200 hover:to-purple-200 dark:hover:from-blue-800/50 dark:hover:to-purple-800/50'
                                    }`}
                            >
                                <span>{genre}</span>
                                {!readOnly && !disabled && (
                                    <button
                                        type="button"
                                        onClick={() => removeGenre(genre)}
                                        className="ml-1 hover:bg-red-200 dark:hover:bg-red-800 rounded-full p-0.5 transition-colors group"
                                    >
                                        <X className="h-3 w-3 text-gray-500 dark:text-gray-400 group-hover:text-red-600 dark:group-hover:text-red-400" />
                                    </button>
                                )}
                            </div>
                        ))}

                        {/* Input field */}
                        {!readOnly && !disabled && selectedGenres.length < maxTags && (
                            <input
                                ref={inputRef}
                                type="text"
                                value={inputValue}
                                onChange={handleInputChange}
                                onKeyDown={handleInputKeyDown}
                                onFocus={handleInputFocus}
                                placeholder={selectedGenres.length === 0 ? placeholder : ''}
                                className="flex-1 min-w-[120px] bg-transparent border-none outline-none placeholder-gray-500 dark:placeholder-gray-400 text-sm"
                            />
                        )}

                        {/* Add button for readonly state */}
                        {!readOnly && !disabled && selectedGenres.length < maxTags && (
                            <div className="flex items-center gap-1 text-gray-400 dark:text-gray-500">
                                <Plus className="h-4 w-4" />
                                <Music className="h-4 w-4" />
                            </div>
                        )}
                    </div>
                </div>

                {/* Dropdown suggestions */}
                {isOpen && !disabled && !readOnly && filteredGenres.length > 0 && (
                    <div className="absolute z-50 w-full mt-1 bg-white dark:bg-gray-800 border border-gray-200 dark:border-gray-700 rounded-xl shadow-lg max-h-48 overflow-auto">
                        <div className="p-2">
                            <div className="text-xs font-medium text-gray-500 dark:text-gray-400 px-2 py-1 mb-1">
                                Popular Genres
                            </div>
                            {filteredGenres.map((genre, index) => (
                                <button
                                    key={genre}
                                    type="button"
                                    onClick={() => addGenre(genre)}
                                    className={`w-full px-3 py-2 text-left text-sm rounded-lg transition-all duration-200 flex items-center gap-2 ${index === focusedIndex
                                        ? 'bg-blue-50 dark:bg-blue-900/20 text-blue-700 dark:text-blue-300'
                                        : 'text-gray-900 dark:text-white hover:bg-gray-50 dark:hover:bg-gray-700'
                                        }`}
                                >
                                    <Disc className="h-4 w-4 text-gray-400" />
                                    <span>{genre}</span>
                                </button>
                            ))}
                        </div>

                        {/* Custom genre hint */}
                        {inputValue && !filteredGenres.some(g => g.toLowerCase() === inputValue.toLowerCase()) && (
                            <div className="border-t border-gray-200 dark:border-gray-600 p-2">
                                <button
                                    type="button"
                                    onClick={() => addGenre(inputValue)}
                                    className="w-full px-3 py-2 text-left text-sm rounded-lg transition-colors hover:bg-gray-50 dark:hover:bg-gray-700 flex items-center gap-2"
                                >
                                    <Plus className="h-4 w-4 text-green-500" />
                                    <span className="text-gray-700 dark:text-gray-300">
                                        Add &quot;<span className="font-medium text-green-600 dark:text-green-400">{inputValue}</span>&quot;
                                    </span>
                                </button>
                            </div>
                        )}
                    </div>
                )}
            </div>

            {/* Error message */}
            {error && (
                <div className="mt-2 flex items-center gap-2 text-red-600 dark:text-red-400">
                    <div className="w-1 h-1 rounded-full bg-red-500"></div>
                    <p className="text-sm">{error}</p>
                </div>
            )}

            {/* Help text */}
            {!error && !readOnly && (
                <p className="mt-1 text-xs text-gray-500 dark:text-gray-400">
                    Type to search genres, press Enter or comma to add. Use backspace to remove the last tag.
                </p>
            )}
        </div>
    );
}