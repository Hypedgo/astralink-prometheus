'use client'

import { useState } from 'react'

interface BriefData {
    brief: string
    location: {
        name: string
        latitude: number
        longitude: number
    }
}

export function useBriefGenerator() {
    const [isGenerating, setIsGenerating] = useState(false)
    const [error, setError] = useState<string | null>(null)

    const generateBrief = async (latitude: number, longitude: number, locationName: string) => {
        setIsGenerating(true)
        setError(null)

        try {
            const url = `http://localhost:8000/api/generate-brief?lat=${latitude}&lon=${longitude}&location_name=${encodeURIComponent(locationName)}`

            const response = await fetch(url)
            const data: BriefData = await response.json()

            if (!data.brief) {
                throw new Error('No brief data received')
            }

            // Create downloadable text file
            const blob = new Blob([data.brief], { type: 'text/plain' })
            const downloadUrl = window.URL.createObjectURL(blob)
            const link = document.createElement('a')
            link.href = downloadUrl
            link.download = `mission_brief_${locationName.replace(/[^a-z0-9]/gi, '_')}_${new Date().toISOString().split('T')[0]}.txt`
            document.body.appendChild(link)
            link.click()
            document.body.removeChild(link)
            window.URL.revokeObjectURL(downloadUrl)

            setIsGenerating(false)
            return true
        } catch (err) {
            console.error('Error generating brief:', err)
            setError('Failed to generate mission brief')
            setIsGenerating(false)
            return false
        }
    }

    return { generateBrief, isGenerating, error }
}