'use client'

import React, { useState, useRef, useEffect } from 'react'

interface Option {
    id: string
    name: string
    [key: string]: any
}

interface SearchableSelectProps {
    options: Option[]
    value: string
    onChange: (id: string, option: Option | undefined) => void
    placeholder?: string
    disabled?: boolean
}

export default function SearchableSelect({
    options,
    value,
    onChange,
    placeholder = 'Search...',
    disabled = false
}: SearchableSelectProps) {
    const [isOpen, setIsOpen] = useState(false)
    const [searchTerm, setSearchTerm] = useState('')
    const [highlightedIndex, setHighlightedIndex] = useState(-1)
    const wrapperRef = useRef<HTMLDivElement>(null)
    const inputRef = useRef<HTMLInputElement>(null)
    const listRef = useRef<HTMLUListElement>(null)

    // Handle clicks outside to close the dropdown
    useEffect(() => {
        const handleClickOutside = (event: MouseEvent) => {
            if (wrapperRef.current && !wrapperRef.current.contains(event.target as Node)) {
                setIsOpen(false)
                setSearchTerm('')
            }
        }
        document.addEventListener('mousedown', handleClickOutside)
        return () => document.removeEventListener('mousedown', handleClickOutside)
    }, [])

    // Scroll to highlighted item
    useEffect(() => {
        if (isOpen && highlightedIndex >= 0 && listRef.current) {
            const listElement = listRef.current
            const itemElement = listElement.children[highlightedIndex] as HTMLElement
            if (itemElement) {
                const listRect = listElement.getBoundingClientRect()
                const itemRect = itemElement.getBoundingClientRect()

                if (itemRect.bottom > listRect.bottom) {
                    listElement.scrollTop += itemRect.bottom - listRect.bottom
                } else if (itemRect.top < listRect.top) {
                    listElement.scrollTop -= listRect.top - itemRect.top
                }
            }
        }
    }, [highlightedIndex, isOpen])

    // Find the currently selected option to display its name when closed
    const selectedOption = options.find(opt => opt.id === value)

    // Filter options based on search term
    const filteredOptions = options.filter(opt =>
        opt.name.toLowerCase().includes(searchTerm.toLowerCase())
    )

    const handleKeyDown = (e: React.KeyboardEvent) => {
        if (disabled) return

        switch (e.key) {
            case 'ArrowDown':
                e.preventDefault()
                if (!isOpen) {
                    setIsOpen(true)
                } else {
                    setHighlightedIndex(prev =>
                        prev < filteredOptions.length - 1 ? prev + 1 : prev
                    )
                }
                break
            case 'ArrowUp':
                e.preventDefault()
                setHighlightedIndex(prev => prev > 0 ? prev - 1 : 0)
                break
            case 'Enter':
                e.preventDefault()
                if (isOpen && highlightedIndex >= 0 && filteredOptions[highlightedIndex]) {
                    handleSelect(filteredOptions[highlightedIndex])
                } else if (!isOpen) {
                    setIsOpen(true)
                }
                break
            case 'Escape':
                setIsOpen(false)
                setSearchTerm('')
                inputRef.current?.blur()
                break
        }
    }

    const handleSelect = (option: Option) => {
        onChange(option.id, option)
        setIsOpen(false)
        setSearchTerm('')
        setHighlightedIndex(-1)
    }

    const displayValue = isOpen
        ? searchTerm
        : (selectedOption ? selectedOption.name : '')

    return (
        <div ref={wrapperRef} style={{ position: 'relative', width: '100%' }}>
            <div
                style={{
                    position: 'relative',
                    cursor: disabled ? 'not-allowed' : 'text'
                }}
            >
                <input
                    ref={inputRef}
                    type="text"
                    className="input"
                    value={displayValue}
                    onChange={(e) => {
                        if (!isOpen) setIsOpen(true)
                        setSearchTerm(e.target.value)
                        setHighlightedIndex(0)

                        // If user clears the input, clear the selection
                        if (e.target.value === '') {
                            onChange('', undefined)
                        }
                    }}
                    onFocus={() => {
                        if (!disabled) {
                            setIsOpen(true)
                            setSearchTerm('') // Reveal all options on focus by default
                        }
                    }}
                    onKeyDown={handleKeyDown}
                    placeholder={selectedOption ? selectedOption.name : placeholder}
                    disabled={disabled}
                    style={{
                        width: '100%',
                        paddingRight: '30px', // Space for dropdown arrow
                        textOverflow: 'ellipsis'
                    }}
                />
                <div
                    style={{
                        position: 'absolute',
                        right: '10px',
                        top: '50%',
                        transform: 'translateY(-50%)',
                        pointerEvents: 'none',
                        opacity: disabled ? 0.3 : 0.5
                    }}
                >
                    ▼
                </div>
            </div>

            {isOpen && (
                <ul
                    ref={listRef}
                    style={{
                        position: 'absolute',
                        top: '100%',
                        left: 0,
                        right: 0,
                        marginTop: '4px',
                        padding: '4px',
                        maxHeight: '250px',
                        overflowY: 'auto',
                        background: 'var(--surface)',
                        border: '1px solid var(--border)',
                        borderRadius: '8px',
                        boxShadow: 'var(--card-shadow)',
                        zIndex: 1000,
                        listStyle: 'none',
                    }}
                    className="scrollbar-hide"
                >
                    {filteredOptions.length === 0 ? (
                        <li style={{ padding: '0.5rem', opacity: 0.5, textAlign: 'center' }}>
                            No results found
                        </li>
                    ) : (
                        filteredOptions.map((option, index) => (
                            <li
                                key={option.id}
                                onClick={() => handleSelect(option)}
                                onMouseEnter={() => setHighlightedIndex(index)}
                                style={{
                                    padding: '0.5rem 0.75rem',
                                    cursor: 'pointer',
                                    borderRadius: '4px',
                                    background: index === highlightedIndex
                                        ? 'var(--hover-item-bg)'
                                        : option.id === value
                                            ? 'rgba(16, 185, 129, 0.1)' // subtle highlight if currently selected
                                            : 'transparent',
                                    display: 'flex',
                                    alignItems: 'center',
                                    justifyContent: 'space-between'
                                }}
                            >
                                <span style={{ overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap' }}>
                                    {option.name}
                                </span>
                                {option.id === value && (
                                    <span style={{ color: 'var(--success)', fontSize: '0.8rem' }}>✓</span>
                                )}
                            </li>
                        ))
                    )}
                </ul>
            )}
        </div>
    )
}
