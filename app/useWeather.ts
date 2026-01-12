'use client'

import { useState, useEffect } from 'react'

interface WeatherData {
    cloudCover: number
    visibility: string
    loading: boolean
    error: string | null
}

export function useWeather(latitude: number, longitude: number) {
    const [data, setData] = useState<WeatherData>({
        cloudCover: 0,
        visibility: 'LOADING...',
        loading: true,
        error: null
    })

    useEffect(() => {
        async function fetchWeather() {
            try {
                // Call YOUR MCP server with the provided coordinates
                const url = `http://localhost:8000/api/earth-weather?lat=${latitude}&lon=${longitude}`

                const response = await fetch(url)
                const weatherData = await response.json()

                const cloudPercent = weatherData.cloud_cover_percent
                const visibility = weatherData.visibility

                setData({
                    cloudCover: cloudPercent,
                    visibility,
                    loading: false,
                    error: null
                })
            } catch (error) {
                console.error('Error fetching weather:', error)
                setData({
                    cloudCover: 0,
                    visibility: 'UNKNOWN',
                    loading: false,
                    error: 'Failed to fetch weather'
                })
            }
        }

        // Fetch immediately
        fetchWeather()

        // Refresh every 10 minutes
        const interval = setInterval(fetchWeather, 10 * 60 * 1000)

        return () => clearInterval(interval)
    }, [latitude, longitude]) // Re-fetch when coordinates change!

    return data
}