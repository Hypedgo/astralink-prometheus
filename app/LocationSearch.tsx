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

        if (!cityInput.trim()) {
            setError('Please enter a location')
            return
        }

        setIsSearching(true)
        setError('')

        try {
            const response = await fetch(
                `http://localhost:8000/api/geocode?location=${encodeURIComponent(cityInput)}`
            )
            const data = await response.json()

            if (data.error) {
                setError(`Location not found: ${cityInput}`)
                setIsSearching(false)
                return
            }

            onLocationSelect({
                name: cityInput,
                latitude: data.latitude,
                longitude: data.longitude,
                displayName: data.display_name
            })

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

        if (isNaN(lat) || isNaN(lon)) {
            setError('Please enter valid numbers')
            return
        }

        if (lat < -90 || lat > 90) {
            setError('Latitude must be between -90 and 90')
            return
        }

        if (lon < -180 || lon > 180) {
            setError('Longitude must be between -180 and 180')
            return
        }

        setError('')

        onLocationSelect({
            name: `Custom (${lat.toFixed(2)}°, ${lon.toFixed(2)}°)`,
            latitude: lat,
            longitude: lon,
            displayName: `Coordinates: ${lat.toFixed(4)}°, ${lon.toFixed(4)}°`
        })

        setLatInput('')
        setLonInput('')
    }

    return (
        <div className="absolute top-24 left-1/2 transform -translate-x-1/2 z-20 pointer-events-auto">
            {/* Mode Toggle */}
            <div className="flex gap-2 mb-2 justify-center">
                <button
                    onClick={() => setSearchMode('city')}
                    className={`px-4 py-1 rounded-lg text-sm font-bold transition-all ${searchMode === 'city'
                            ? 'bg-cyan-500/30 text-cyan-400 border border-cyan-400'
                            : 'bg-black/50 text-gray-400 border border-gray-600 hover:border-gray-400'
                        }`}
                >
                    🏙️ Search by City
                </button>
                <button
                    onClick={() => setSearchMode('coords')}
                    className={`px-4 py-1 rounded-lg text-sm font-bold transition-all ${searchMode === 'coords'
                            ? 'bg-cyan-500/30 text-cyan-400 border border-cyan-400'
                            : 'bg-black/50 text-gray-400 border border-gray-600 hover:border-gray-400'
                        }`}
                >
                    📍 Search by Coordinates
                </button>
            </div>

            {/* City Search */}
            {searchMode === 'city' && (
                <form onSubmit={handleCitySearch} className="flex gap-2">
                    <input
                        type="text"
                        value={cityInput}
                        onChange={(e) => setCityInput(e.target.value)}
                        placeholder="Enter city name (e.g., Tokyo, Paris, New York)..."
                        className="px-4 py-2 w-96 bg-black/70 backdrop-blur-sm border border-cyan-500/30 rounded-lg text-white placeholder-gray-400 focus:outline-none focus:border-cyan-400"
                        disabled={isSearching}
                    />
                    <button
                        type="submit"
                        disabled={isSearching}
                        className="px-6 py-2 bg-cyan-500/20 hover:bg-cyan-500/30 border border-cyan-500/50 rounded-lg text-cyan-400 font-bold disabled:opacity-50 transition-colors"
                    >
                        {isSearching ? 'Searching...' : 'Search'}
                    </button>
                </form>
            )}

            {/* Coordinate Search */}
            {searchMode === 'coords' && (
                <form onSubmit={handleCoordSearch} className="flex gap-2">
                    <input
                        type="text"
                        value={latInput}
                        onChange={(e) => setLatInput(e.target.value)}
                        placeholder="Latitude (-90 to 90)"
                        className="px-4 py-2 w-44 bg-black/70 backdrop-blur-sm border border-cyan-500/30 rounded-lg text-white placeholder-gray-400 focus:outline-none focus:border-cyan-400"
                    />
                    <input
                        type="text"
                        value={lonInput}
                        onChange={(e) => setLonInput(e.target.value)}
                        placeholder="Longitude (-180 to 180)"
                        className="px-4 py-2 w-44 bg-black/70 backdrop-blur-sm border border-cyan-500/30 rounded-lg text-white placeholder-gray-400 focus:outline-none focus:border-cyan-400"
                    />
                    <button
                        type="submit"
                        className="px-6 py-2 bg-cyan-500/20 hover:bg-cyan-500/30 border border-cyan-500/50 rounded-lg text-cyan-400 font-bold transition-colors"
                    >
                        Go
                    </button>
                </form>
            )}

            {error && (
                <div className="mt-2 px-4 py-2 bg-red-500/20 border border-red-500/50 rounded-lg text-red-400 text-sm text-center">
                    {error}
                </div>
            )}
        </div>
    )
}