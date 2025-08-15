"use client";

import { useState, useRef, useEffect } from 'react';
import { Calendar, ChevronLeft, ChevronRight, ChevronDown } from 'lucide-react';
import { formatDate, formatDateForInput } from '@/lib/utils/date';

type CalendarInputProps = {
    name: string;
    value?: string;
    onChange?: (value: string) => void;
    placeholder?: string;
    required?: boolean;
    disabled?: boolean;
    readOnly?: boolean;
    className?: string;
    error?: string;
    label?: string;
    onClearError?: () => void;
};

export function CalendarInput({
    name,
    value = '',
    onChange,
    placeholder = 'Select date',
    required = false,
    disabled = false,
    readOnly = false,
    className = '',
    error,
    label,
    onClearError
}: CalendarInputProps) {
    const [isOpen, setIsOpen] = useState(false);
    const [selectedDate, setSelectedDate] = useState<Date | null>(
        value ? new Date(value) : null
    );
    const [viewDate, setViewDate] = useState<Date>(
        value ? new Date(value) : new Date()
    );
    const [showMonthYearPicker, setShowMonthYearPicker] = useState(false);

    const containerRef = useRef<HTMLDivElement>(null);
    const inputRef = useRef<HTMLInputElement>(null);

    useEffect(() => {
        const handleClickOutside = (event: MouseEvent) => {
            if (containerRef.current && !containerRef.current.contains(event.target as Node)) {
                setIsOpen(false);
            }
        };

        document.addEventListener('mousedown', handleClickOutside);
        return () => document.removeEventListener('mousedown', handleClickOutside);
    }, []);

    useEffect(() => {
        if (value) {
            const date = new Date(value);
            if (!isNaN(date.getTime())) {
                setSelectedDate(date);
                setViewDate(date);
            }
        }
    }, [value]);

    const handleDateSelect = (date: Date) => {
        setSelectedDate(date);
        const isoString = date.toISOString();
        onChange?.(isoString);
        onClearError?.();
        setIsOpen(false);
    };

    const handleInputClick = () => {
        if (!disabled && !readOnly) {
            setIsOpen(!isOpen);
            onClearError?.();
        }
    };

    const navigateMonth = (direction: 'prev' | 'next') => {
        const newDate = new Date(viewDate);
        if (direction === 'prev') {
            newDate.setMonth(newDate.getMonth() - 1);
        } else {
            newDate.setMonth(newDate.getMonth() + 1);
        }
        setViewDate(newDate);
    };

    const handleMonthYearChange = (month: number, year: number) => {
        const newDate = new Date(year, month, 1);
        setViewDate(newDate);
        setShowMonthYearPicker(false);
    };

    const toggleMonthYearPicker = () => {
        setShowMonthYearPicker(!showMonthYearPicker);
    };

    const getDaysInMonth = (date: Date) => {
        const year = date.getFullYear();
        const month = date.getMonth();
        const firstDay = new Date(year, month, 1);
        const lastDay = new Date(year, month + 1, 0);
        const daysInMonth = lastDay.getDate();
        const startingDayOfWeek = firstDay.getDay();

        const days = [];

        // Add empty cells for days before the first day of the month
        for (let i = 0; i < startingDayOfWeek; i++) {
            days.push(null);
        }

        // Add days of the month
        for (let day = 1; day <= daysInMonth; day++) {
            days.push(new Date(year, month, day));
        }

        return days;
    };

    const isToday = (date: Date) => {
        const today = new Date();
        return date.toDateString() === today.toDateString();
    };

    const isSameDay = (date1: Date | null, date2: Date | null) => {
        if (!date1 || !date2) return false;
        return date1.toDateString() === date2.toDateString();
    };

    const monthNames = [
        'January', 'February', 'March', 'April', 'May', 'June',
        'July', 'August', 'September', 'October', 'November', 'December'
    ];

    const dayNames = ['Sun', 'Mon', 'Tue', 'Wed', 'Thu', 'Fri', 'Sat'];

    return (
        <div className={className}>
            {label && (
                <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
                    {label} {required && '*'}
                </label>
            )}

            <div ref={containerRef} className="relative">
                {/* Hidden input for form submission */}
                <input
                    type="hidden"
                    name={name}
                    value={selectedDate ? formatDateForInput(selectedDate) : ''}
                />

                {/* Display input */}
                <div
                    ref={inputRef}
                    onClick={handleInputClick}
                    className={`relative w-full px-4 py-3 rounded-xl border transition-all duration-200 cursor-pointer group ${disabled || readOnly
                        ? 'border-gray-200 dark:border-gray-600 bg-gray-50 dark:bg-gray-700/50 cursor-not-allowed'
                        : error
                            ? 'border-red-300 dark:border-red-600 bg-white dark:bg-gray-700 hover:border-red-400 dark:hover:border-red-500 shadow-sm hover:shadow-md'
                            : isOpen
                                ? 'border-blue-500 dark:border-blue-400 bg-white dark:bg-gray-700 ring-2 ring-blue-500/20 dark:ring-blue-400/20 shadow-lg'
                                : 'border-gray-300 dark:border-gray-600 bg-white dark:bg-gray-700 hover:border-blue-300 dark:hover:border-blue-500 shadow-sm hover:shadow-md'
                        } text-gray-900 dark:text-white`}
                >
                    <div className="flex items-center justify-between">
                        <span className={`text-base font-medium transition-colors duration-200 ${selectedDate
                            ? 'text-gray-900 dark:text-white'
                            : 'text-gray-500 dark:text-gray-400'
                            }`}>
                            {selectedDate ? formatDate(selectedDate) : placeholder}
                        </span>
                        <div className={`transition-all duration-200 ${isOpen ? 'rotate-180 scale-110' : 'group-hover:scale-110'
                            }`}>
                            <Calendar className={`h-5 w-5 transition-colors duration-200 ${disabled || readOnly
                                ? 'text-gray-400'
                                : isOpen
                                    ? 'text-blue-500 dark:text-blue-400'
                                    : 'text-gray-500 dark:text-gray-400 group-hover:text-blue-500 dark:group-hover:text-blue-400'
                                }`} />
                        </div>
                    </div>

                    {/* Subtle gradient overlay on hover */}
                    {!disabled && !readOnly && (
                        <div className="absolute inset-0 rounded-xl bg-gradient-to-r from-blue-500/5 to-purple-500/5 opacity-0 group-hover:opacity-100 transition-opacity duration-200 pointer-events-none"></div>
                    )}
                </div>

                {/* Calendar Dropdown */}
                {isOpen && !disabled && !readOnly && (
                    <div className="absolute z-50 w-full mt-2 bg-white dark:bg-gray-800 border border-gray-200 dark:border-gray-700 rounded-2xl shadow-2xl overflow-hidden">
                        {/* Header with Month/Year Selector */}
                        <div className="bg-gradient-to-r from-blue-600 to-purple-600 px-4 py-3">
                            <div className="flex items-center justify-between">
                                <button
                                    type="button"
                                    onClick={() => navigateMonth('prev')}
                                    className="p-2 rounded-full hover:bg-white/20 transition-all duration-200 group"
                                >
                                    <ChevronLeft className="h-4 w-4 text-white group-hover:scale-110 transition-transform" />
                                </button>

                                <button
                                    type="button"
                                    onClick={toggleMonthYearPicker}
                                    className="flex items-center gap-2 px-4 py-2 rounded-full hover:bg-white/20 transition-all duration-200 group"
                                >
                                    <span className="text-lg font-semibold text-white">
                                        {monthNames[viewDate.getMonth()]} {viewDate.getFullYear()}
                                    </span>
                                    <ChevronDown className={`h-4 w-4 text-white transition-transform duration-200 ${showMonthYearPicker ? 'rotate-180' : ''}`} />
                                </button>

                                <button
                                    type="button"
                                    onClick={() => navigateMonth('next')}
                                    className="p-2 rounded-full hover:bg-white/20 transition-all duration-200 group"
                                >
                                    <ChevronRight className="h-4 w-4 text-white group-hover:scale-110 transition-transform" />
                                </button>
                            </div>
                        </div>

                        {/* Month/Year Picker */}
                        {showMonthYearPicker && (
                            <div className="p-4 border-b border-gray-200 dark:border-gray-700 bg-gray-50 dark:bg-gray-700/50">
                                <div className="grid grid-cols-2 gap-4">
                                    {/* Month Selector */}
                                    <div>
                                        <label className="block text-xs font-medium text-gray-700 dark:text-gray-300 mb-2">Month</label>
                                        <div className="grid grid-cols-3 gap-1 max-h-32 overflow-y-auto">
                                            {monthNames.map((month, index) => (
                                                <button
                                                    key={month}
                                                    type="button"
                                                    onClick={() => handleMonthYearChange(index, viewDate.getFullYear())}
                                                    className={`px-2 py-1 text-xs rounded-lg transition-all duration-200 ${index === viewDate.getMonth()
                                                        ? 'bg-blue-600 text-white shadow-md'
                                                        : 'text-gray-700 dark:text-gray-300 hover:bg-blue-100 dark:hover:bg-blue-900/30'
                                                        }`}
                                                >
                                                    {month.slice(0, 3)}
                                                </button>
                                            ))}
                                        </div>
                                    </div>

                                    {/* Year Selector */}
                                    <div>
                                        <label className="block text-xs font-medium text-gray-700 dark:text-gray-300 mb-2">Year</label>
                                        <div className="grid grid-cols-2 gap-1 max-h-32 overflow-y-auto">
                                            {Array.from({ length: 21 }, (_, i) => {
                                                const year = new Date().getFullYear() - 20 + i;
                                                return (
                                                    <button
                                                        key={year}
                                                        type="button"
                                                        onClick={() => handleMonthYearChange(viewDate.getMonth(), year)}
                                                        className={`px-2 py-1 text-xs rounded-lg transition-all duration-200 ${year === viewDate.getFullYear()
                                                            ? 'bg-blue-600 text-white shadow-md'
                                                            : 'text-gray-700 dark:text-gray-300 hover:bg-blue-100 dark:hover:bg-blue-900/30'
                                                            }`}
                                                    >
                                                        {year}
                                                    </button>
                                                );
                                            })}
                                        </div>
                                    </div>
                                </div>
                            </div>
                        )}

                        {/* Calendar Body */}
                        <div className="p-4">
                            {/* Day Names */}
                            <div className="grid grid-cols-7 gap-1 mb-3">
                                {dayNames.map((day) => (
                                    <div
                                        key={day}
                                        className="text-center text-xs font-semibold text-gray-500 dark:text-gray-400 py-2"
                                    >
                                        {day}
                                    </div>
                                ))}
                            </div>

                            {/* Calendar Days */}
                            <div className="grid grid-cols-7 gap-1">
                                {getDaysInMonth(viewDate).map((date, index) => (
                                    <button
                                        key={index}
                                        type="button"
                                        onClick={() => date && handleDateSelect(date)}
                                        disabled={!date}
                                        className={`
                                            h-10 w-10 text-sm rounded-xl transition-all duration-200 flex items-center justify-center font-medium relative group
                                            ${!date
                                                ? 'cursor-default'
                                                : isSameDay(date, selectedDate)
                                                    ? 'bg-gradient-to-br from-blue-600 to-purple-600 text-white shadow-lg scale-105 z-10'
                                                    : isToday(date)
                                                        ? 'bg-blue-100 dark:bg-blue-900/30 text-blue-600 dark:text-blue-400 font-semibold ring-2 ring-blue-200 dark:ring-blue-800'
                                                        : 'text-gray-700 dark:text-gray-300 hover:bg-gray-100 dark:hover:bg-gray-700 hover:scale-105'
                                            }
                                        `}
                                    >
                                        {date?.getDate()}
                                        {isSameDay(date, selectedDate) && (
                                            <div className="absolute inset-0 rounded-xl bg-gradient-to-br from-blue-600 to-purple-600 opacity-20 animate-pulse"></div>
                                        )}
                                    </button>
                                ))}
                            </div>
                        </div>

                        {/* Footer with Today Button */}
                        <div className="px-4 py-3 bg-gray-50 dark:bg-gray-700/50 border-t border-gray-200 dark:border-gray-600">
                            <button
                                type="button"
                                onClick={() => handleDateSelect(new Date())}
                                className="w-full px-4 py-2 text-sm font-medium text-blue-600 dark:text-blue-400 hover:bg-blue-50 dark:hover:bg-blue-900/20 rounded-xl transition-all duration-200 border border-blue-200 dark:border-blue-800 hover:border-blue-300 dark:hover:border-blue-700"
                            >
                                Today ({formatDate(new Date())})
                            </button>
                        </div>
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
        </div>
    );
}