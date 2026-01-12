'use client'

import { useState, useEffect } from 'react'

interface SpaceWeatherData {
    kpIndex: number
    risk: string
    timestamp: string
    loading: boolean
    error: string | null
}

export function useSpaceWeather() {
    const [data, setData] = useState<SpaceWeatherData>({
        kpIndex: 0,
        risk: 'LOADING...',
        timestamp: '',
        loading: true,
        error: null
    })

    useEffect(() => {
        async function fetchSpaceWeather() {
            try {
                // Call YOUR MCP server instead of NOAA directly
                const response = await fetch('http://localhost:8000/api/space-weather')
                const result = await response.json()

                setData({
                    kpIndex: result.kp_index,
                    risk: result.risk,
                    timestamp: result.timestamp_utc,
                    loading: false,
                    error: null
                })
            } catch (error) {
                console.error('Error fetching space weather:', error)
                setData({
                    kpIndex: 3,
                    risk: 'UNKNOWN',
                    timestamp: '',
                    loading: false,
                    error: 'Failed to fetch data'
                })
            }
        }

        // Fetch immediately
        fetchSpaceWeather()

        // Refresh every 5 minutes
        const interval = setInterval(fetchSpaceWeather, 5 * 60 * 1000)

        return () => clearInterval(interval)
    }, [])

    return data
}