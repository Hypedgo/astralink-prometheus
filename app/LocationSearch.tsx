'use client'

import { useState } from 'react'

interface LocationSearchProps {
    onLocationSelect: (location: {
        name: string
        latitude: number
        longitude: number
        displayName: string
    }) => void
}

export default function LocationSearch({ onLocationSelect }: LocationSearchProps) {
    const [searchMode, setSearchMode] = useState<'city' | 'coords'>('city')
    const [cityInput, setCityInput] = useState('')
    const [latInput, setLatInput] = useState('')
    const [lonInput, setLonInput] = useState('')
    const [isSearching, setIsSearching] = useState(false)
    const [error, setError] = useState('')

    const handleCitySearch = async (e: React.FormEvent) => {
        e.preventDefault()
        if (!cityInput.trim()) { setError('Please enter a location'); return }
        setIsSearching(true)
        setError('')
        try {
            const response = await fetch(`https://astralink-prometheus-production.up.railway.app/api/geocode?location=${encodeURIComponent(cityInput)}`)
            const data = await response.json()
            if (data.error) { setError(`Location not found: ${cityInput}`); setIsSearching(false); return }
            onLocationSelect({ name: cityInput, latitude: data.latitude, longitude: data.longitude, displayName: data.display_name })
            setIsSearching(false)
            setCityInput('')
        } catch (err) {
            setError('Failed to search location')
            setIsSearching(false)
        }
    }

    const handleCoordSearch = async (e: React.FormEvent) => {
        e.preventDefault()
        const lat = parseFloat(latInput)
        const lon = parseFloat(lonInput)
        if (isNaN(lat) || isNaN(lon)) { setError('Please enter valid numbers'); return }
        if (lat < -90 || lat > 90) { setError('Latitude must be between -90 and 90'); return }
        if (lon < -180 || lon > 180) { setError('Longitude must be between -180 and 180'); return }
        setError('')
        onLocationSelect({ name: `Custom (${lat.toFixed(2)}°, ${lon.toFixed(2)}°)`, latitude: lat, longitude: lon, displayName: `Coordinates: ${lat.toFixed(4)}°, ${lon.toFixed(4)}°` })
        setLatInput('')
        setLonInput('')
    }

    return (
        <div style={{
            position: 'fixed',
            top: '30px',
            left: '50%',
            transform: 'translateX(-50%)',
            zIndex: 1000,
            pointerEvents: 'auto',
            display: 'flex',
            flexDirection: 'column',
            alignItems: 'center',
            gap: '8px'
        }}>
            {/* Mode Toggle */}
            <div style={{ display: 'flex', gap: '8px' }}>
                <button
                    onClick={() => setSearchMode('city')}
                    style={{
                        padding: '6px 16px',
                        borderRadius: '6px',
                        fontSize: '12px',
                        fontWeight: '600',
                        cursor: 'pointer',
                        border: searchMode === 'city' ? '1px solid #22d3ee' : '1px solid rgba(100,100,100,0.5)',
                        background: searchMode === 'city' ? 'rgba(34,211,238,0.15)' : 'rgba(0,0,0,0.5)',
                        color: searchMode === 'city' ? '#22d3ee' : '#888',
                        backdropFilter: 'blur(10px)',
                        transition: 'all 0.2s'
                    }}
                >
                    🏙️ Search by City
                </button>
                <button
                    onClick={() => setSearchMode('coords')}
                    style={{
                        padding: '6px 16px',
                        borderRadius: '6px',
                        fontSize: '12px',
                        fontWeight: '600',
                        cursor: 'pointer',
                        border: searchMode === 'coords' ? '1px solid #22d3ee' : '1px solid rgba(100,100,100,0.5)',
                        background: searchMode === 'coords' ? 'rgba(34,211,238,0.15)' : 'rgba(0,0,0,0.5)',
                        color: searchMode === 'coords' ? '#22d3ee' : '#888',
                        backdropFilter: 'blur(10px)',
                        transition: 'all 0.2s'
                    }}
                >
                    📍 Search by Coordinates
                </button>
            </div>

            {/* City Search */}
            {searchMode === 'city' && (
                <form onSubmit={handleCitySearch} style={{ display: 'flex', gap: '8px' }}>
                    <input
                        type="text"
                        value={cityInput}
                        onChange={(e) => setCityInput(e.target.value)}
                        placeholder="Enter city name (e.g., Tokyo, Paris, New York)..."
                        disabled={isSearching}
                        style={{
                            padding: '8px 16px',
                            width: '380px',
                            background: 'rgba(0,0,0,0.7)',
                            backdropFilter: 'blur(10px)',
                            border: '1px solid rgba(34,211,238,0.3)',
                            borderRadius: '6px',
                            color: '#ffffff',
                            fontSize: '13px',
                            outline: 'none',
                            fontFamily: 'monospace'
                        }}
                    />
                    <button
                        type="submit"
                        disabled={isSearching}
                        style={{
                            padding: '8px 20px',
                            background: 'rgba(34,211,238,0.15)',
                            border: '1px solid rgba(34,211,238,0.4)',
                            borderRadius: '6px',
                            color: '#22d3ee',
                            fontSize: '13px',
                            fontWeight: '600',
                            cursor: 'pointer',
                            fontFamily: 'monospace'
                        }}
                    >
                        {isSearching ? 'Searching...' : 'Search'}
                    </button>
                </form>
            )}

            {/* Coordinate Search */}
            {searchMode === 'coords' && (
                <form onSubmit={handleCoordSearch} style={{ display: 'flex', gap: '8px' }}>
                    <input
                        type="text"
                        value={latInput}
                        onChange={(e) => setLatInput(e.target.value)}
                        placeholder="Latitude (-90 to 90)"
                        style={{
                            padding: '8px 16px',
                            width: '180px',
                            background: 'rgba(0,0,0,0.7)',
                            backdropFilter: 'blur(10px)',
                            border: '1px solid rgba(34,211,238,0.3)',
                            borderRadius: '6px',
                            color: '#ffffff',
                            fontSize: '13px',
                            outline: 'none',
                            fontFamily: 'monospace'
                        }}
                    />
                    <input
                        type="text"
                        value={lonInput}
                        onChange={(e) => setLonInput(e.target.value)}
                        placeholder="Longitude (-180 to 180)"
                        style={{
                            padding: '8px 16px',
                            width: '180px',
                            background: 'rgba(0,0,0,0.7)',
                            backdropFilter: 'blur(10px)',
                            border: '1px solid rgba(34,211,238,0.3)',
                            borderRadius: '6px',
                            color: '#ffffff',
                            fontSize: '13px',
                            outline: 'none',
                            fontFamily: 'monospace'
                        }}
                    />
                    <button
                        type="submit"
                        style={{
                            padding: '8px 20px',
                            background: 'rgba(34,211,238,0.15)',
                            border: '1px solid rgba(34,211,238,0.4)',
                            borderRadius: '6px',
                            color: '#22d3ee',
                            fontSize: '13px',
                            fontWeight: '600',
                            cursor: 'pointer',
                            fontFamily: 'monospace'
                        }}
                    >
                        Go
                    </button>
                </form>
            )}

            {error && (
                <div style={{
                    padding: '6px 16px',
                    background: 'rgba(239,68,68,0.15)',
                    border: '1px solid rgba(239,68,68,0.4)',
                    borderRadius: '6px',
                    color: '#f87171',
                    fontSize: '12px',
                    fontFamily: 'monospace'
                }}>
                    {error}
                </div>
            )}
        </div>
    )
}