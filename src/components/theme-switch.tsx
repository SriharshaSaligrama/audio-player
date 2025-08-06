'use client'

import { useTheme } from 'next-themes'
import { useEffect, useState } from 'react'
import { Moon, Sun } from 'lucide-react'

export function ThemeSwitch() {
    const [mounted, setMounted] = useState(false)
    const { theme, setTheme } = useTheme()

    // Prevent hydration mismatch by only rendering after mount
    useEffect(() => {
        setMounted(true)
    }, [])

    if (!mounted) {
        return null
    }

    return (
        <button
            onClick={() => setTheme(theme === 'dark' ? 'light' : 'dark')}
            className="rounded-full p-2 hover:bg-gray-100 dark:hover:bg-gray-300 cursor-pointer transition-colors"
            aria-label="Toggle theme"
        >
            {theme === 'dark' ? (
                <Sun className="h-5 w-5" />
            ) : (
                <Moon className="h-5 w-5" />
            )}
        </button>
    )
}
