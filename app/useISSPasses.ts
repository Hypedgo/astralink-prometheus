'use client'

import { useState, useEffect } from 'react'

interface ISSPass {
    start_local: string
    duration_seconds: number
    max_elevation_deg: number
    visibility: string
}

interface ISSPassesData {
    passes: ISSPass[]
    loading: boolean
    error: string | null
}

export function useISSPasses(latitude: number, longitude: number) {
    const [data, setData] = useState<ISSPassesData>({
        passes: [],
        loading: true,
        error: null
    })

    useEffect(() => {
        async function fetchPasses() {
            try {
                const url = `http://localhost:8000/api/iss-passes?lat=${latitude}&lon=${longitude}&days=3`

                const response = await fetch(url)
                const result = await response.json()

                if (result.error) {
                    throw new Error(result.error)
                }

                setData({
                    passes: result.passes || [],
                    loading: false,
                    error: null
                })
            } catch (error) {
                console.error('Error fetching ISS passes:', error)
                setData({
                    passes: [],
                    loading: false,
                    error: 'Failed to fetch ISS passes'
                })
            }
        }

        fetchPasses()

        // Refresh every 30 minutes
        const interval = setInterval(fetchPasses, 30 * 60 * 1000)

        return () => clearInterval(interval)
    }, [latitude, longitude])

    return data
}