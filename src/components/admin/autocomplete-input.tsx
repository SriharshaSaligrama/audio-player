"use client";

import { useState, useRef, useEffect } from 'react';
import { ChevronDown, X, Check } from 'lucide-react';
import type { Option } from '@/types/common';

type Props = {
    name: string;
    options: Option[];
    value?: string[];
    onChange?: (value: string[]) => void;
    placeholder?: string;
    multiple?: boolean;
    required?: boolean;
    className?: string;
    icon?: React.ReactNode;
    label?: string;
    error?: string;
    onClearError?: () => void;
};

export function AutocompleteInput({
    name,
    options,
    value = [],
    onChange,
    placeholder = "Search and select...",
    multiple = false,
    required = false,
    className = "",
    icon,
    label,
    error,
    onClearError
}: Props) {
    const [isOpen, setIsOpen] = useState(false);
    const [searchTerm, setSearchTerm] = useState('');
    const [selectedValues, setSelectedValues] = useState<string[]>(value);
    const containerRef = useRef<HTMLDivElement>(null);
    const inputRef = useRef<HTMLInputElement>(null);

    const filteredOptions = options.filter(option =>
        option.label.toLowerCase().includes(searchTerm.toLowerCase())
    );

    const selectedOptions = options.filter(option => selectedValues.includes(option.value));

    useEffect(() => {
        const handleClickOutside = (event: MouseEvent) => {
            if (containerRef.current && !containerRef.current.contains(event.target as Node)) {
                setIsOpen(false);
                setSearchTerm('');
            }
        };

        document.addEventListener('mousedown', handleClickOutside);
        return () => document.removeEventListener('mousedown', handleClickOutside);
    }, []);

    const handleSelect = (option: Option) => {
        let newValues: string[];

        if (multiple) {
            if (selectedValues.includes(option.value)) {
                newValues = selectedValues.filter(v => v !== option.value);
            } else {
                newValues = [...selectedValues, option.value];
            }
        } else {
            newValues = selectedValues.includes(option.value) ? [] : [option.value];
            setIsOpen(false);
            setSearchTerm('');
        }

        setSelectedValues(newValues);
        onChange?.(newValues);
        onClearError?.();

        if (multiple) {
            setSearchTerm('');
        }
    };

    const handleRemove = (valueToRemove: string) => {
        const newValues = selectedValues.filter(v => v !== valueToRemove);
        setSelectedValues(newValues);
        onChange?.(newValues);
        onClearError?.();
    };

    const handleInputFocus = () => {
        setIsOpen(true);
        onClearError?.();
    };

    const handleInputChange = (e: React.ChangeEvent<HTMLInputElement>) => {
        setSearchTerm(e.target.value);
        if (!isOpen) setIsOpen(true);
    };

    return (
        <div className={className}>
            {label && (
                <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
                    {label} {required && '*'}
                </label>
            )}

            <div ref={containerRef} className="relative">
                {/* Hidden inputs for form submission */}
                {multiple ? (
                    selectedValues.map((value, index) => (
                        <input
                            key={`${name}-${index}`}
                            type="hidden"
                            name={name}
                            value={value}
                        />
                    ))
                ) : (
                    <input
                        type="hidden"
                        name={name}
                        value={selectedValues[0] || ''}
                    />
                )}

                {/* Main input container */}
                <div
                    className={`relative w-full min-h-[48px] px-4 py-3 rounded-xl border ${error
                        ? 'border-red-300 dark:border-red-600'
                        : 'border-gray-300 dark:border-gray-600'
                        } bg-white dark:bg-gray-700 text-gray-900 dark:text-white focus-within:ring-2 focus-within:ring-blue-500 focus-within:border-transparent transition-all duration-200 cursor-text`}
                    onClick={() => inputRef.current?.focus()}
                >
                    <div className="flex flex-wrap items-center gap-2 min-h-[24px]">
                        {/* Selected items */}
                        {selectedOptions.map((option) => (
                            <div
                                key={option.value}
                                className="inline-flex items-center gap-1 px-2 py-1 bg-blue-100 dark:bg-blue-900/50 text-blue-800 dark:text-blue-200 rounded-lg text-sm font-medium"
                            >
                                <span>{option.label}</span>
                                <button
                                    type="button"
                                    onClick={(e) => {
                                        e.stopPropagation();
                                        handleRemove(option.value);
                                    }}
                                    className="ml-1 hover:bg-blue-200 dark:hover:bg-blue-800 rounded-full p-0.5 transition-colors"
                                >
                                    <X className="h-3 w-3" />
                                </button>
                            </div>
                        ))}

                        {/* Search input */}
                        <input
                            ref={inputRef}
                            type="text"
                            value={searchTerm}
                            onChange={handleInputChange}
                            onFocus={handleInputFocus}
                            placeholder={selectedValues.length === 0 ? placeholder : (multiple ? '' : 'Search to change selection...')}
                            className="flex-1 min-w-[120px] bg-transparent border-none outline-none placeholder-gray-500 dark:placeholder-gray-400 text-sm"
                        />
                    </div>

                    {/* Icon and dropdown arrow */}
                    <div className="absolute inset-y-0 right-0 flex items-center pr-3 pointer-events-none">
                        {icon && <div className="mr-2">{icon}</div>}
                        <ChevronDown
                            className={`h-4 w-4 text-gray-400 transition-transform duration-200 ${isOpen ? 'rotate-180' : ''
                                }`}
                        />
                    </div>
                </div>

                {/* Dropdown */}
                {isOpen && (
                    <div className="absolute z-50 w-full mt-1 bg-white dark:bg-gray-800 border border-gray-200 dark:border-gray-700 rounded-xl shadow-lg max-h-60 overflow-auto">
                        {filteredOptions.length === 0 ? (
                            <div className="px-4 py-3 text-sm text-gray-500 dark:text-gray-400 text-center">
                                {searchTerm ? 'No results found' : 'No options available'}
                            </div>
                        ) : (
                            filteredOptions.map((option) => {
                                const isSelected = selectedValues.includes(option.value);
                                return (
                                    <button
                                        key={option.value}
                                        type="button"
                                        onClick={() => handleSelect(option)}
                                        className={`w-full px-4 py-3 text-left text-sm hover:bg-gray-50 dark:hover:bg-gray-700 transition-colors flex items-center justify-between ${isSelected
                                            ? 'bg-blue-50 dark:bg-blue-900/20 text-blue-700 dark:text-blue-300'
                                            : 'text-gray-900 dark:text-white'
                                            }`}
                                    >
                                        <span>{option.label}</span>
                                        {isSelected && (
                                            <Check className="h-4 w-4 text-blue-600 dark:text-blue-400" />
                                        )}
                                    </button>
                                );
                            })
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
            {!error && (
                <p className="mt-1 text-xs text-gray-500 dark:text-gray-400">
                    {multiple
                        ? 'Search and click to select multiple items'
                        : 'Search and click to select one item'
                    }
                </p>
            )}
        </div>
    );
}